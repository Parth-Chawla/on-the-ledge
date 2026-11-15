# On-the-Ledge — Review 2 MySQL Backend

Purpose-based personal budgeting ledger. **Review 2 is database-only** (no frontend work in this folder).

## Five tables only

| Table | Role |
| --- | --- |
| `users` | Strong entity |
| `budgets` | Each budget belongs to one user |
| `categories` | Shared master categories |
| `budget_allocations` | Resolves budgets M:N categories via `(budget_id, category_id)` |
| `transactions` | Belongs to user + budget + category (`budget_id` is intentional) |

Do **not** add business/audit tables for the trigger demo.

## Files

| File | Purpose |
| --- | --- |
| `01_schema.sql` | Create DB + five tables + constraints |
| `02_seed_data.sql` | Exactly 5 rows per table (trigger-safe) |
| `03_routines.sql` | View, function, procedures, triggers |
| `04_review2_demo_queries.sql` | Experiment 4B / 5 / 6 demos for Workbench |
| `05_migrate_budget_to_november_2026.sql` | Safe, transactional September-to-November budget migration |
| `README.md` | This guide |

Target engine: **MySQL 8.4** (MySQL 8.0.31+ required for `INTERSECT` / `EXCEPT`).

## Exact Workbench execution order

1. Open MySQL Workbench → connect to local MySQL 8.4.
2. Run **`01_schema.sql`** (whole file). Confirms five tables.
3. Run **`02_seed_data.sql`** (whole file). Confirms 5 rows each.
4. Run **`03_routines.sql`** (whole file).  
   - Uses `DELIMITER //` for routines/triggers.  
   - Workbench handles this; do not split mid-routine.
5. Open **`04_review2_demo_queries.sql`** and run **section by section** (highlight one block → Execute).  
   - Failed-trigger demos use `sp_add_transaction_safe` so seed stays at 5 transactions.
6. Optional clean rebuild later: re-run steps 2 → 3 → 4 (schema already present) or 1 → 4 from scratch.

Recommended first-load order:

```text
01_schema.sql  →  02_seed_data.sql  →  03_routines.sql  →  04_review2_demo_queries.sql
```

If you re-run seed **after** triggers exist, inserts still succeed because every seed expense is within an allocated category for that month.

## Objects created in Review 2

- **View:** `v_budget_category_status` — budget, user, category, allocated, spent, remaining  
- **Function:** `fn_remaining_allocation(budget_id, category_id)`  
- **Procedures:**  
  - `sp_add_transaction` — insert expense  
  - `sp_add_transaction_safe` — `DECLARE EXIT HANDLER FOR SQLEXCEPTION` + `ROLLBACK` + status message  
  - `sp_user_month_spending` — cursor totals a user’s spend for one budget month  
- **Triggers:** `trg_txn_before_insert`, `trg_txn_before_update`  
  Reject when: no monthly budget for user/date, category not allocated, or amount exceeds remaining allocation.

## Four-member demo division

### Member 1 — Constraints and set operations (Experiment 4B)

File section: **MEMBER 1** in `04_review2_demo_queries.sql`  
Show: PK / FK / NOT NULL / UNIQUE / CHECK / DEFAULT, then `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`.  
Talking points: Vihaan appears in `EXCEPT` (has budget, no expenses).

### Member 2 — Subqueries, joins, and view (Experiment 5)

File section: **MEMBER 2**  
Show: subquery in `WHERE`, subquery in `FROM`, `INNER JOIN`, `LEFT JOIN` (Vihaan NULL allocation), then `SELECT * FROM v_budget_category_status`.

### Member 3 — Function and procedure (Experiment 6 start)

File section: **MEMBER 3**  
Show: `fn_remaining_allocation(1,2) = 4250`, rent remaining `0`, then `sp_add_transaction` inside `START TRANSACTION` / `ROLLBACK`.

### Member 4 — Cursor, trigger, and exception handling (Experiment 6)

File section: **MEMBER 4**  
Show: `sp_user_month_spending` for Aarav (= 10750), three safe failed inserts via `sp_add_transaction_safe` (exceed / not allocated / no October budget), confirm `COUNT(*) = 5` still, mention BEFORE UPDATE rule.

## Seed snapshot (for viva)

- Users: Aarav, Riya, Kabir, Ananya, Vihaan
- Budgets: one November 2026 wallet each
- Categories: Rent, Food, Travel, Shopping, Entertainment, Savings
- Allocations: every user has all six categories, and each budget's allocations sum to its total
- Aarav Rent is fully spent, so an extra rent expense is rejected by the trigger

## Local demo login

Passwords are bcrypt hashes in `users.password_hash`. Plain demo passwords:

| Email | Password |
| --- | --- |
| aarav.sharma@example.com | aarav2026 |
| riya.mehta@example.com | riya2026 |
| kabir.shah@example.com | kabir2026 |
| ananya.rao@example.com | ananya2026 |
| vihaan.patel@example.com | vihaan2026 |

Existing databases: run `04_add_login_support.sql` once. It adds `password_hash` without dropping rows. Do not re-run `02_seed_data.sql` on a database you want to keep; that file truncates the five tables.

For an existing app database whose active budgets are dated `2026-09-01`, run
`05_migrate_budget_to_november_2026.sql` once. It updates those budget months to
`2026-11-01`, shifts their September transaction dates into November, and keeps
the existing budget IDs, allocations, and transaction amounts. The migration
uses a transaction and refuses to merge if a user already has a November budget;
resolve such duplicate-month data manually before retrying. It does not drop or
truncate tables or rerun seed data. It is safe to run on a database already at
November 2026 (no rows are changed).

## Out of scope

UPI, bank APIs, payments, AI, notifications, extra business tables. The website reads only `on_the_ledge`, not `on_the_ledge_normalization_demo`.
