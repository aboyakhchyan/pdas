---
paths:
    - '**/*.spec.ts'
    - '**/*.test.ts'
    - '**/*.test.tsx'
    - 'apps/api/src/testing/**/*.ts'
    - 'apps/api/src/modules/*/testing/**/*.ts'
---

# Testing

## API (Jest, `apps/api`)

- Unit tests sit next to the code: `create-document.use-case.ts` →
  `create-document.use-case.spec.ts`. Every use case and every pure domain module has one.
- Build the class under test with `new` and in-memory fakes — no `Test.createTestingModule`, no
  Firestore emulator, no network in unit tests.
- Fakes: `<context>/testing/in-memory-<name>.repository.ts` extends the port and stores
  `Entity.restore(entity.toProps())` copies so tests can't share mutable state. Shared fakes and
  helpers live in `src/testing/` (`principalOf`, `InMemoryFileStorage`).
- Ports with no fake worth writing are mocked inline as `jest.Mocked<Port>`:
  `identityProvider = { verifyAccessToken: jest.fn(), assignRole: jest.fn() }`.
- Contexts with many specs share a fixture `<context>/testing/<context>-fixture.ts` returning
  everything a test needs (`documentsFixture()`), plus named principals (`owner`, `stranger`,
  `admin`). Reuse it instead of re-wiring dependencies in every spec.
- `testing/` folders are excluded from the build — never import them from production code.

```ts
describe('AssignRole', () => {
    const admin = principalOf({ uid: 'admin-1', role: 'admin' });
    let users: InMemoryUserRepository;
    let assignRole: AssignRole;

    beforeEach(async () => {
        users = new InMemoryUserRepository();
        assignRole = new AssignRole(users, identityProvider);
    });

    it('forbids changing your own role', async () => {
        await expect(assignRole.execute(admin, 'admin-1', 'user')).rejects.toBeInstanceOf(
            AccessDeniedError,
        );
    });
});
```

- `describe` = class name; `it` = behaviour in plain English, present tense ("marks complete
  content as ready", "fails for an unknown template").
- Cover: happy path, each guard clause / `DomainError`, ownership (owner vs stranger vs role
  with `:any` permission), revision conflict where relevant.
- Assert errors by class: `rejects.toBeInstanceOf(NotFoundError)`. Assert state through
  `toProps()` with `toMatchObject`.
- Test data in Armenian where it is document content (`'Լիազորագիր'`); IDs readable
  (`'owner-1'`, `'admin-1'`).

Run: `pnpm --filter @pdas/api test` (Node 24 required).

## Web, admin, mobile

Test hooks, feature models and non-trivial components; don't snapshot whole pages. Run
`pnpm --filter @pdas/<pkg> test`.
