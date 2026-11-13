"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  requireUser,
  setSessionCookie,
} from "@/lib/auth";
import { dbErrorMessage, getPool } from "@/lib/db";
import { monthBounds } from "@/lib/format";
import { findUserByEmail, getCurrentBudget, getEnvelopes } from "@/lib/queries";

export type FormState = { error?: string; ok?: string };

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Invalid email or password" };
  }

  const user = await findUserByEmail(email);
  const hash = user?.password_hash ?? "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const matches = await bcrypt.compare(password, hash);
  if (!user || !matches) {
    return { error: "Invalid email or password" };
  }

  await setSessionCookie(user.user_id);
  redirect("/");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}

export async function addExpense(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  if (!budget) return { error: "No monthly budget exists for this account." };

  const categoryId = Number(formData.get("category_id"));
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const transactionDate = String(formData.get("transaction_date") ?? "");
  const bounds = monthBounds(budget.budget_month);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Choose a category from your current budget." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }
  if (!description || description.length > 255) {
    return { error: "Description is required (255 characters max)." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    return { error: "Choose a valid date." };
  }
  if (transactionDate < bounds.start || transactionDate > bounds.end) {
    return {
      error: `This budget only covers ${bounds.start} to ${bounds.end}.`,
    };
  }

  const envelopes = await getEnvelopes(user.user_id, budget.budget_id);
  if (!envelopes.some((row) => row.category_id === categoryId)) {
    return { error: "That category is not allocated on your current budget." };
  }

  const connection = await getPool().getConnection();
  try {
    await connection.execute(
      `CALL sp_add_transaction_safe(?, ?, ?, ?, ?, ?, @otl_status)`,
      [
        user.user_id,
        budget.budget_id,
        categoryId,
        amount,
        description,
        transactionDate,
      ],
    );
    const [rows] = await connection.query(
      `SELECT @otl_status AS status`,
    );
    const status = String(
      (rows as { status: string }[])[0]?.status ?? "",
    );
    if (!status.startsWith("SUCCESS")) {
      return {
        error: status.replace(/^FAILED:\s*/, "") || "The expense was rejected.",
      };
    }
  } catch (error) {
    return { error: dbErrorMessage(error) };
  } finally {
    connection.release();
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/add-expense");
  revalidatePath("/budget");
  redirect("/");
}

export async function saveBudget(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  if (!budget) return { error: "No monthly budget exists for this account." };

  const total = Number(formData.get("total_amount"));
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Monthly budget must be greater than zero." };
  }

  const envelopes = await getEnvelopes(user.user_id, budget.budget_id);
  const updates = envelopes.map((row) => ({
    categoryId: row.category_id,
    name: row.category_name,
    spent: Number(row.spent_amount),
    amount: Number(formData.get(`alloc_${row.category_id}`)),
  }));

  for (const row of updates) {
    if (!Number.isFinite(row.amount) || row.amount < 0) {
      return { error: `${row.name} allocation must be zero or more.` };
    }
    if (row.amount + 0.001 < row.spent) {
      return {
        error: `${row.name} is already spent down to ₹${row.spent.toFixed(2)}. Allocation cannot go below that.`,
      };
    }
  }

  const allocated = updates.reduce((sum, row) => sum + row.amount, 0);
  if (allocated - total > 0.001) {
    return {
      error: "Category allocations cannot exceed the monthly budget.",
    };
  }

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [budgetResult] = await connection.execute(
      `UPDATE budgets
       SET total_amount = ?
       WHERE budget_id = ? AND user_id = ?`,
      [total, budget.budget_id, user.user_id],
    );
    if ((budgetResult as { affectedRows: number }).affectedRows !== 1) {
      throw new Error("Budget update was rejected.");
    }
    await connection.execute(
      `UPDATE users SET monthly_income = ? WHERE user_id = ?`,
      [total, user.user_id],
    );
    for (const row of updates) {
      await connection.execute(
        `UPDATE budget_allocations
         SET allocated_amount = ?
         WHERE budget_id = ? AND category_id = ?`,
        [row.amount, budget.budget_id, row.categoryId],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    return { error: dbErrorMessage(error) };
  } finally {
    connection.release();
  }

  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/add-expense");
  return { ok: "Allocations saved." };
}
