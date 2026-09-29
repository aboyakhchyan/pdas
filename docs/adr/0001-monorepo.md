# ADR 0001 — pnpm + Turborepo monorepo

**Status:** accepted

## Context
Web, admin, API and mobile share types, validation rules and release cadence. A small team needs
atomic cross-app changes and one CI pipeline.

## Decision
- One repo, pnpm 10 workspaces, Turborepo for task orchestration and caching.
- `apps/*` deployable units, `packages/*` shared libraries and tooling config.
- Shared dependency versions via pnpm `catalog:`.
- Flutter lives in `apps/mobile` with a thin package.json so it is visible to the workspace but
  built with its own toolchain.

## Consequences
- Contract changes are one PR across API and clients.
- CI must build only what changed (turbo cache / `--filter`) to stay fast as the repo grows.
