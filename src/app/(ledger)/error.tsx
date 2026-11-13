"use client";

export default function LedgerError({
  error,
}: {
  error: Error;
}) {
  return (
    <p className="rounded bg-bad-bg px-4 py-3 text-sm text-bad">
      Could not load ledger data. {error.message}
    </p>
  );
}
