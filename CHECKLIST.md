# Checklist — On-the-ledge

## PHASE 1 — DATABASE FOUNDATION

- [x] Choose the Review-1 table set: `users`, `budgets`, `categories`, `budget_allocations`, `transactions`
- [x] Document relationships (`users` 1:M `budgets`, `budgets` M:N `categories` through `budget_allocations`, `users`/`budgets`/`categories` → `transactions` with intentional `budget_id` FK)
- [x] MySQL 8.4 schema documented in `sql/01_schema.sql`
- [x] Sample data documented in `sql/02_seed.sql` (5 rows per table)
- [x] Live local MySQL database `on_the_ledge` created and seeded (outside this app; do not re-run casually)
- [x] Confirm app targets MySQL via `mysql2` (not Supabase / Postgres)

## PHASE 2 — DATABASE INTELLIGENCE (Review 2)

- [x] Package Review 2 SQL under `database/` (schema, seed, routines, demos, README)
- [x] Preserve exactly five tables; no audit/extra business tables
- [x] Experiment 4B demos: constraints + UNION / UNION ALL / INTERSECT / EXCEPT
- [x] Experiment 5 demos: subqueries, INNER/LEFT JOIN, remaining view
- [x] Experiment 6: function, procedures, cursor proc, BEFORE INSERT/UPDATE triggers
- [x] `sp_add_transaction_safe` with `DECLARE EXIT HANDLER FOR SQLEXCEPTION` + ROLLBACK
- [ ] Decide whether allocation totals must be constrained to `<= budgets.total_amount`
- [ ] Keep intelligence in SQL; do not move remaining balances into stored columns unless explicitly instructed

## PHASE 3 — APPLICATION / MVP

- [x] Initialize the Next.js application
- [x] Connect Next.js to local MySQL with server-side `mysql2/promise` pool + env vars
- [x] Dashboard: current budget + categories Allocated / Spent / Remaining (join query)
- [x] Transactions page: list only the signed-in user's expenses, with search and category filter
- [x] Add Expense form: insert into `transactions` (Server Action)
- [x] Remove in-memory / TypeScript seed demo path
- [x] Keep handoff docs accurate (`ARCHITECTURE.md`, `CHECKLIST.md`, `STATE.md`)
- [x] Add real email/password login with bcrypt hashes and an HttpOnly session cookie
- [x] Scope every read and write to the authenticated user
- [x] Dashboard, budget planning, add expense, and transactions use live MySQL data
- [x] Keep the supplied `stitch-template/` design as the visual source
- [x] Keep remaining balances calculated, not stored
- [x] Use November 2026 as the active budget cycle across dashboard, planning, expense entry, and transactions
- [x] Provide a transactional, non-destructive migration for existing September 2026 budgets
