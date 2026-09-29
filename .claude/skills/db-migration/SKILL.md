---
name: db-migration
description: Change the database schema safely (add tables/columns/indexes) with a migration.
---
1. Make sure local DB runs: `pnpm infra:up`.
2. Edit the schema in apps/api (ORM schema file once the ORM is set up).
3. Generate a named migration; never edit an already-applied migration.
4. Migrations must be backward compatible (expand → migrate data → contract in a later release):
   new columns nullable or with default, no renames/drops in the same release as code changes.
5. Add indexes for every foreign key and every column used in WHERE/ORDER BY of hot queries.
6. Run api tests.
