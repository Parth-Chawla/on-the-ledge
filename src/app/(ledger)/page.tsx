import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  categoryIcon,
  envelopeStatus,
  formatInr,
  formatMonth,
  formatShortDate,
} from "@/lib/format";
import { getCurrentBudget, getEnvelopes, getTransactions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  if (!budget) {
    return <p>No monthly budget is stored for this account.</p>;
  }

  const envelopes = await getEnvelopes(user.user_id, budget.budget_id);
  const transactions = (await getTransactions(user.user_id, budget.budget_id)).slice(0, 5);
  const allocated = envelopes.reduce((sum, row) => sum + Number(row.allocated_amount), 0);
  const spent = envelopes.reduce((sum, row) => sum + Number(row.spent_amount), 0);
  const remaining = allocated - spent;
  const total = Number(budget.total_amount);
  const spentPct = total > 0 ? (spent / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-outline">
            {formatMonth(budget.budget_month).toUpperCase()} BUDGET CYCLE
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Good to see you, {user.first_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Academic ledger synced from the local MySQL database.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/budget" className="rounded border border-line bg-card px-3 py-2 text-sm">
            Adjust allocations
          </Link>
          <Link href="/add-expense" className="rounded bg-primary px-3 py-2 text-sm text-white">
            Record expense
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total budget" value={formatInr(total)} note="Monthly ceiling" />
        <Stat
          label="Total allocated"
          value={formatInr(allocated)}
          note={`${total > 0 ? ((allocated / total) * 100).toFixed(1) : "0"}% assigned`}
        />
        <Stat
          label="Total spent"
          value={formatInr(spent)}
          note={`${spentPct.toFixed(1)}% utilized`}
        />
        <Stat label="Total remaining" value={formatInr(remaining)} note="Derived from expenses" />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Category envelopes</h2>
          <span className="text-sm text-muted">{envelopes.length} ledgers</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {envelopes.map((row) => {
            const allocatedAmount = Number(row.allocated_amount);
            const spentAmount = Number(row.spent_amount);
            const status = envelopeStatus(allocatedAmount, spentAmount);
            const width = allocatedAmount > 0 ? Math.min(100, (spentAmount / allocatedAmount) * 100) : 0;
            return (
              <article key={row.category_id} className="rounded border border-line bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    <span className="material-symbols-outlined mr-1 text-lg text-primary">
                      {categoryIcon(row.category_name)}
                    </span>
                    {row.category_name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      status.tone === "bad"
                        ? "bg-bad-bg text-bad"
                        : status.tone === "warn"
                          ? "bg-warn-bg text-warn"
                          : "bg-good-bg text-good"
                    }`}
                  >
                    {status.label}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Allocated</dt>
                    <dd className="num">{formatInr(allocatedAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Spent</dt>
                    <dd className="num">{formatInr(spentAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Remaining</dt>
                    <dd className="num">{formatInr(row.remaining_amount)}</dd>
                  </div>
                </dl>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-high">
                  <div className="h-full bg-primary" style={{ width: `${width}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded border border-line bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent activity</h2>
          <Link href="/transactions" className="text-sm text-primary">
            View all
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted">No expenses recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {transactions.map((row) => (
              <li key={row.transaction_id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="font-medium">{row.description || "Expense"}</span>
                  <span className="text-muted"> · {row.category_name} · {formatShortDate(row.transaction_date)}</span>
                </span>
                <span className="num">-{formatInr(row.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded border border-line bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-outline">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold num">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </article>
  );
}
