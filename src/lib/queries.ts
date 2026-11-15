import { query } from "@/lib/db";

export type BudgetRow = {
  budget_id: number;
  user_id: number;
  budget_month: Date | string;
  total_amount: number;
};

export type EnvelopeRow = {
  budget_id: number;
  budget_month: Date | string;
  user_id: number;
  category_id: number;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
};

export type TransactionRow = {
  transaction_id: number;
  description: string | null;
  amount: number;
  category_id: number;
  category_name: string;
  transaction_date: Date | string;
};

export async function getCurrentBudget(userId: number): Promise<BudgetRow | null> {
  const rows = await query<BudgetRow>(
    `SELECT budget_id, user_id, budget_month, total_amount
     FROM budgets
     WHERE user_id = :userId
     ORDER BY budget_month DESC
     LIMIT 1`,
    { userId },
  );
  return rows[0] ?? null;
}

export async function getEnvelopes(userId: number, budgetId: number) {
  return query<EnvelopeRow>(
    `SELECT
        budget_id,
        budget_month,
        user_id,
        category_id,
        category_name,
        allocated_amount,
        spent_amount,
        remaining_amount
     FROM v_budget_category_status
     WHERE user_id = :userId
       AND budget_id = :budgetId
     ORDER BY category_name`,
    { userId, budgetId },
  );
}

export async function getTransactions(userId: number, budgetId: number) {
  return query<TransactionRow>(
    `SELECT
        t.transaction_id,
        t.description,
        t.amount,
        t.category_id,
        c.category_name,
        t.transaction_date
     FROM transactions t
     JOIN categories c ON c.category_id = t.category_id
     WHERE t.user_id = :userId
       AND t.budget_id = :budgetId
     ORDER BY t.transaction_date DESC, t.transaction_id DESC`,
     { userId, budgetId },
  );
}

export async function findUserByEmail(email: string) {
  const rows = await query<{ user_id: number; password_hash: string }>(
    `SELECT user_id, password_hash
     FROM users
     WHERE email = :email
     LIMIT 1`,
    { email },
  );
  return rows[0] ?? null;
}
