# ADR 0003 — Firebase as the only persistence and identity platform

**Status:** accepted · supersedes the persistence part of ADR 0002

## Decision

- **Firebase Auth** signs users in. **Firestore** stores all data. **Cloud Storage for Firebase**
  stores files. PostgreSQL is removed. Redis stays for cache and queues.
- Clients never touch Firestore or Storage directly. Security rules deny everything; the API uses
  the Admin SDK and is the single place where authorization happens.
- Every vendor sits behind a port (`UserRepository`, `IdentityProvider`, `TemplateRepository`,
  `DocumentRepository`, `FileStorage`). Firebase code lives only in `infrastructure/` adapters and
  `src/infra/`.

## Authentication

Sign-in methods: **phone OTP (SMS)**, **Google**, **Apple**. Enable exactly these in
Firebase Console → Authentication, and allow the Armenia region for SMS.

1. Client signs in with the Firebase client SDK (`@pdas/firebase` on web/admin,
   `@react-native-firebase/auth` on mobile) and gets an ID token.
2. Every API call sends `Authorization: Bearer <ID token>`.
3. `AuthenticationGuard` (global) verifies the token, rejects any provider outside the three
   above, and attaches the `Principal` (`uid`, `role`, identity claims).
4. `GET /v1/me` registers the profile on the first call and links new providers afterwards.

Endpoints are private by default; `@Public()` opts out.

## Authorization (RBAC)

- Roles: `user`, `admin`, `super-admin`, stored as the `role` custom claim and mirrored on the profile.
- Permissions per role: `ROLE_PERMISSIONS` in `packages/core/src/identity/access.ts`, shared with
  web/admin/mobile so the UI hides what the API forbids.
- `@RequirePermissions([...])` + global `AuthorizationGuard` check the role.
- Ownership is checked in use cases (`DocumentAccess`): owners edit, `documents:read:any` reads.
  Others get `404`, so document IDs do not leak.
- `PATCH /v1/users/:id/role` sets the claim and revokes refresh tokens. The old role remains valid
  until the current ID token expires (≤ 1 h).
- The first admin is set once with the Admin SDK (`setCustomUserClaims(uid, { role: 'admin' })`).

## Data model (Firestore)

```
users/{uid}
  email, phoneNumber, displayName, photoUrl, role, locale, providers[], createdAt, updatedAt

templates/{templateId}                       templateId is a slug, e.g. power-of-attorney
  latestVersion, title{hy,en,ru}, updatedAt
templates/{templateId}/versions/{version}    immutable
  title{hy,en,ru}, blueprintJson, publishedAt, publishedBy

documents/{documentId}                       documentId is a UUID
  ownerId, templateId, templateVersion, title, locale, status(draft|ready), revision,
  content{…}                                 hierarchical JSON (the "jsonb" of the document)
  createdAt, updatedAt
documents/{documentId}/attachments/{attachmentId}
  fileName, contentType, size, storagePath, createdAt
```

- **Blueprint** (`packages/core/src/documents/blueprint.ts`) describes a document type as a tree:
  `object` and `list` nodes nest; leaves are `text`, `number`, `money`, `date`, `boolean`,
  `choice`, `email`, `phone`, `identifier` (Armenian passport, ID card, social card, TIN, postal
  code, vehicle plate, bank account). Nodes support `required` / `visibleWhen` conditions and
  group rules (`dateOrder`, `atLeastOne`). Depth is capped at 8 to stay under Firestore's
  20-level nesting limit.
- Blueprints are stored as a JSON string because their own nesting is deeper than the content
  they describe and they are never queried.
- `content` is a native Firestore map, capped at 512 KB, and excluded from indexing
  (`firestore.indexes.json`) so large documents do not create thousands of index entries.
- A document is pinned to a template version, so publishing a new version never breaks
  existing documents. Template versions are cached in memory because they never change.
- Updates use optimistic concurrency: the client sends the `revision` it edited; a mismatch is
  `409`.

## Validation service

`modules/validation` validates content against a blueprint and returns issues as
`{ path, code, params }` (codes in `packages/core/src/validation/issue.ts`, translated by clients).

- `draft` mode checks types and formats of what is filled in. It runs on every save.
- `complete` mode also enforces required fields, list minimums and `atLeastOne`. It decides
  `status: ready` and powers `GET /v1/documents/:id/validation`.
- Field validators are a registry keyed by node type; a new field type is one entry.
- Relative dates (`{ relativeTo: 'today', years: -18 }`) use the Asia/Yerevan calendar.

## Files (Cloud Storage)

One default bucket per environment (`FIREBASE_STORAGE_BUCKET`), organised by owner aggregate:

```
documents/{documentId}/attachments/{attachmentId}   user uploads (passport scans, …)
documents/{documentId}/renders/{revision}.pdf       generated PDFs (rendering context, next)
```

- Upload: `POST /v1/documents/:id/attachments` → signed `PUT` URL valid 15 min. The client
  must send the returned `uploadHeaders`; the size limit is enforced by Storage.
- Download: short-lived signed URL (5 min), issued only after the file exists.
- Deleting a document deletes its whole prefix and its Firestore subcollections.
- Separate buckets (e.g. with different retention) can be introduced later behind `FileStorage`
  without touching use cases.

## Configuration

- API env is validated at startup (`apps/api/src/config/env.ts`); the process exits with a list
  of missing or invalid variables.
- Rules and indexes: `infrastructure/firebase/`. Deploy with
  `firebase deploy --config infrastructure/firebase/firebase.json --only firestore,storage`.
- Backups: Firestore scheduled exports (managed), replacing the removed Postgres dump scripts.
