import { TransactionLedger } from "@/components/TransactionLedger";
import { requireUser } from "@/lib/auth";
import { formatMonth } from "@/lib/format";
import { getCurrentBudget, getTransactions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  const rows = await getTransactions(user.user_id);
  const monthLabel = budget
    ? `${user.first_name} ${user.last_name} • ${formatMonth(budget.budget_month)}`
    : `${user.first_name} ${user.last_name}`;

  return <TransactionLedger rows={rows} monthLabel={monthLabel} />;
}
