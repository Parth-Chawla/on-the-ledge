"use client";

import { useActionState, useMemo, useState } from "react";
import { addExpense, type FormState } from "@/app/actions";
import { categoryIcon, formatInr } from "@/lib/format";
import type { EnvelopeRow } from "@/lib/queries";

const initial: FormState = {};

export function AddExpenseForm({
  envelopes,
  defaultDate,
  minDate,
  maxDate,
}: {
  envelopes: EnvelopeRow[];
  defaultDate: string;
  minDate: string;
  maxDate: string;
}) {
  const [state, action, pending] = useActionState(addExpense, initial);
  const [categoryId, setCategoryId] = useState(String(envelopes[0]?.category_id ?? ""));
  const [amount, setAmount] = useState("");

  const selected = envelopes.find((row) => String(row.category_id) === categoryId);
  const remaining = Number(selected?.remaining_amount ?? 0);
  const preview = useMemo(() => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return null;
    return remaining - value;
  }, [amount, remaining]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form action={action} className="rounded border border-line bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Record new expense</h1>
        <p className="mt-2 text-sm text-muted">
          The database checks that this category is allocated and that the amount
          does not exceed the remaining balance. Allocations are not reduced directly.
        </p>
        {state.error ? (
          <p className="mt-4 rounded bg-bad-bg px-3 py-2 text-sm text-bad">{state.error}</p>
        ) : null}
        <label className="mt-5 flex flex-col gap-1 text-sm font-medium">
          Category
          <select
            name="category_id"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded border border-line px-3 py-2 font-normal"
          >
            {envelopes.map((row) => (
              <option key={row.category_id} value={row.category_id}>
                {row.category_name} • {formatInr(row.remaining_amount)} remaining
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          Amount (INR)
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded border border-line px-3 py-2 font-normal num"
          />
          {selected ? (
            <span className="text-xs font-normal text-muted">
              Maximum remaining for {selected.category_name}: {formatInr(remaining)}
            </span>
          ) : null}
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          Description
          <input
            name="description"
            type="text"
            required
            maxLength={255}
            className="rounded border border-line px-3 py-2 font-normal"
          />
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          Transaction date
          <input
            name="transaction_date"
            type="date"
            required
            min={minDate}
            max={maxDate}
            defaultValue={defaultDate}
            className="rounded border border-line px-3 py-2 font-normal"
          />
          <span className="text-xs font-normal text-muted">
            Must fall inside this budget month ({minDate} to {maxDate}).
          </span>
        </label>
        {preview !== null && selected ? (
          <p className="mt-4 rounded bg-surface-low px-3 py-2 text-sm">
            Projected {selected.category_name} remaining: {formatInr(preview)}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || envelopes.length === 0}
          className="mt-5 rounded bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add expense"}
        </button>
      </form>
      <aside className="rounded border border-line bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Allocation ledger</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {envelopes.map((row) => (
            <li key={row.category_id} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="material-symbols-outlined mr-1 text-base text-primary">
                  {categoryIcon(row.category_name)}
                </span>
                {row.category_name}
              </span>
              <span className="num text-right">
                <span className="block font-medium">{formatInr(row.remaining_amount)}</span>
                <span className="text-xs text-muted">of {formatInr(row.allocated_amount)}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
