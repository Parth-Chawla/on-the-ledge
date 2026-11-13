"use client";

import { useActionState, useMemo, useState } from "react";
import { saveBudget, type FormState } from "@/app/actions";
import { formatInr } from "@/lib/format";
import type { EnvelopeRow } from "@/lib/queries";

const initial: FormState = {};

export function BudgetPlanner({
  monthLabel,
  totalAmount,
  envelopes,
}: {
  monthLabel: string;
  totalAmount: number;
  envelopes: EnvelopeRow[];
}) {
  const [state, action, pending] = useActionState(saveBudget, initial);
  const [total, setTotal] = useState(String(totalAmount));
  const [amounts, setAmounts] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      envelopes.map((row) => [row.category_id, String(row.allocated_amount)]),
    ),
  );

  const allocated = useMemo(
    () =>
      envelopes.reduce((sum, row) => sum + (Number(amounts[row.category_id]) || 0), 0),
    [amounts, envelopes],
  );
  const ceiling = Number(total) || 0;
  const unallocated = ceiling - allocated;
  const over = allocated - ceiling > 0.001;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="rounded border border-line bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-outline">Ledger cycle • {monthLabel}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Purpose-based budget allocations
        </h1>
        <p className="mt-2 text-sm text-muted">
          Assign this month&apos;s budget across categories. The total allocated
          cannot exceed the monthly budget, and an allocation cannot drop below
          money already spent.
        </p>
        {state.error ? (
          <p className="mt-4 rounded bg-bad-bg px-3 py-2 text-sm text-bad">{state.error}</p>
        ) : null}
        {state.ok ? (
          <p className="mt-4 rounded bg-good-bg px-3 py-2 text-sm text-good">{state.ok}</p>
        ) : null}
        <label className="mt-6 flex max-w-xs flex-col gap-1 text-sm font-medium">
          Monthly budget (INR)
          <input
            name="total_amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={total}
            onChange={(event) => setTotal(event.target.value)}
            className="rounded border border-line px-3 py-2 font-normal num"
          />
        </label>
        <ul className="mt-6 flex flex-col gap-4">
          {envelopes.map((row) => {
            const value = Number(amounts[row.category_id]) || 0;
            const share = ceiling > 0 ? (value / ceiling) * 100 : 0;
            return (
              <li key={row.category_id} className="grid gap-2 border-t border-line/70 pt-4 sm:grid-cols-[1fr_10rem_4rem]">
                <div>
                  <p className="font-medium">{row.category_name}</p>
                  <p className="text-xs text-muted">
                    Spent {formatInr(row.spent_amount)}
                  </p>
                </div>
                <input
                  name={`alloc_${row.category_id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amounts[row.category_id] ?? ""}
                  onChange={(event) =>
                    setAmounts((current) => ({
                      ...current,
                      [row.category_id]: event.target.value,
                    }))
                  }
                  className="rounded border border-line px-3 py-2 num"
                />
                <span className="self-center text-sm text-muted num">{share.toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 rounded bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save budget plan"}
        </button>
      </section>
      <aside className="h-fit rounded border border-line bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-outline">Plan status</p>
        <p className={`mt-2 font-display text-xl font-semibold ${over ? "text-bad" : "text-primary"}`}>
          {over ? "Over budget" : "Within budget"}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Allocated</dt>
            <dd className="num">{formatInr(allocated)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Budget</dt>
            <dd className="num">{formatInr(ceiling)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Unallocated</dt>
            <dd className="num">{formatInr(unallocated)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
