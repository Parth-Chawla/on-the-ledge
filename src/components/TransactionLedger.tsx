"use client";

import { useMemo, useState } from "react";
import { categoryIcon, formatInr, formatShortDate } from "@/lib/format";
import type { TransactionRow } from "@/lib/queries";

export function TransactionLedger({
  rows,
  monthLabel,
}: {
  rows: TransactionRow[];
  monthLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.category_name)))],
    [rows],
  );
  const visible = rows.filter((row) => {
    const matchesCategory = category === "All" || row.category_name === category;
    const haystack = `${row.description ?? ""} ${row.category_name}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });
  const spent = visible.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Ledger transactions</h1>
          <p className="mt-1 text-sm text-muted">{monthLabel}</p>
        </div>
        <p className="font-display text-xl font-semibold num">{formatInr(spent)}</p>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search description or category"
          className="w-full rounded border border-line bg-card px-3 py-2 sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`rounded-full px-3 py-1 text-sm ${
                category === name ? "bg-primary text-white" : "bg-card text-muted border border-line"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="mt-6 rounded border border-dashed border-line bg-card p-8 text-center">
          <p className="font-medium">No recorded expenses found</p>
          <p className="mt-1 text-sm text-muted">
            Nothing matches this search in your ledger.
          </p>
          <button
            type="button"
            className="mt-3 text-sm text-primary"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded border border-line bg-card">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface-low text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.transaction_id} className="border-t border-line/70">
                  <td className="px-4 py-3">{formatShortDate(row.transaction_date)}</td>
                  <td className="px-4 py-3">
                    <span className="material-symbols-outlined mr-1 text-base text-primary">
                      {categoryIcon(row.category_name)}
                    </span>
                    {row.category_name}
                  </td>
                  <td className="px-4 py-3">{row.description || "—"}</td>
                  <td className="px-4 py-3 num">-{formatInr(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
