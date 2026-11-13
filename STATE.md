# State — On-the-ledge

Handoff file for the next human or AI agent. Update this file after meaningful work. Do not mark work complete unless it exists in the repo.

## Project purpose

On-the-ledge is a purpose-based personal budgeting ledger. Users allocate monthly income into purpose categories and record expenses against those allocations. It is not a banking, UPI, payment, investment, or AI-advisor product.

## Current stage

Local Next.js site is connected to MySQL database `on_the_ledge` with email/password login. The visual source is `stitch-template/` (not deleted). Normalization demos stay in `on_the_ledge_normalization_demo` and are not used by the website.

## Work completed

- Five-table MySQL schema, full seed, Review 2 routines/triggers/view under `database/`
- Final-review SQL demos under `database/final_review/` (separate demo database)
- `users.password_hash` added in schema, seed, and `database/04_add_login_support.sql`
- Login, dashboard, budget planning, add expense, and transactions against the signed-in user
- HttpOnly session cookie signed with `AUTH_SECRET`
- Expenses go through `sp_add_transaction_safe` so trigger rejections are shown in the UI

## Current implementation

Session user id comes only from the cookie. Latest `budgets` row for that user is the current month (November 2026 in the seed).

Pages:

- `/login`
- `/` dashboard
- `/budget`
- `/add-expense`
- `/transactions`

Demo passwords: lowercase first name + `2026` (`aarav2026`, `riya2026`, `kabir2026`, `ananya2026`, `vihaan2026`).

## Database status

| Item | Status |
| --- | --- |
| Engine | MySQL 8.4 |
| App database | `on_the_ledge` only |
| Tables | users, budgets, categories, budget_allocations, transactions |
| `password_hash` | bcrypt, required |
| Remaining | Calculated by `v_budget_category_status` |
| Normalization demo DB | Not used by the website |

## Frontend status

| Item | Status |
| --- | --- |
| Stitch template | Kept at `stitch-template/` |
| Live MySQL UI | Yes |
| Auth | Local email/password only |
| Registration / OTP / payments | Not implemented |

## Known limitations

- One budget month per seeded user (November 2026). Expense dates must fall in that month.
- No registration, password reset, or profile switching.
- Budget save updates allocations and the monthly total. It does not create new categories.
- `sql/` still holds an older Review 1 copy. `database/` is the schema source of truth.

## Current next steps

1. Run `database/04_add_login_support.sql` on an existing database if `password_hash` is not there yet.
2. Set `AUTH_SECRET` and `DB_*` in `.env.local`, then `npm run dev`.

## Things future AI agents must NOT change without explicit instruction

- Do not connect the app to `on_the_ledge_normalization_demo`, Supabase, Firebase, MongoDB, or Postgres.
- Do not add a sixth business table.
- Do not store plain-text passwords or remaining balances as columns.
- Do not remove `transactions.budget_id` or the allocation/expense triggers.
- Do not delete `stitch-template/`.
- Do not expose database credentials or `mysql2` usage to client components.
- Do not trust a `user_id` sent from the browser.
- After meaningful work, update `STATE.md` and `CHECKLIST.md`.
