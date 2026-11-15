# On-the-Ledge

On-the-Ledge is a purpose-based personal budgeting application.

Instead of only recording where money was spent, the project helps users assign a monthly budget to categories such as Rent, Food, Travel, Shopping, Entertainment, and Savings. Expenses are then recorded against these allocations to show how much remains for each category.

## Status

Local website connected to MySQL `on_the_ledge`, with email-and-password login.

## Core Features

- Multiple users with separate budgets and transactions
- Email and password login (HttpOnly session cookie)
- Monthly budget and category allocations
- Expense logging through `transactions`
- Remaining balance derived from allocations minus expenses
- Database triggers reject expenses that exceed a category allocation

## Technology

- MySQL 8.4
- Next.js and TypeScript
- bcrypt password hashes

## Local Setup

### 1. Install dependencies

```
npm install
```

### 2. Configure local environment variables

Copy `.env.example` to `.env.local` and set the real MySQL password and a long `AUTH_SECRET`. Do not commit `.env.local`.

### 3. Set up MySQL

Fresh database, in order:

```
database/01_schema.sql
database/02_seed_data.sql
database/03_routines.sql
```

If `on_the_ledge` already exists, do not re-run the seed (it truncates data). Run only:

```
database/04_add_login_support.sql
```

If the existing app database has September 2026 budgets, also run
`database/05_migrate_budget_to_november_2026.sql`. This migration preserves
budget IDs, allocations, and expense amounts while moving September transaction
dates into November. It rolls back rather than merging data if a user already
has both a September and November budget.

The website must not be pointed at `on_the_ledge_normalization_demo`.

### 4. Run the application

```
npm run dev
```

Open `http://localhost:3000`.

Demo passwords are `lowercase first name + 2026` (for example `aarav2026`). The full list is in `database/README.md`.

## Database Structure

```
users
  ├── budgets
  │     └── budget_allocations ── categories
  └── transactions ────────────── categories
```

Each user’s budget and transaction data is tied to their own user ID. Categories are shared master entries, while allocations and expenses remain separate for every user.