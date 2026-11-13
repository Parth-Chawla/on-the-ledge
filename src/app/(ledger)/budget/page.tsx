import { BudgetPlanner } from "@/components/BudgetPlanner";
import { requireUser } from "@/lib/auth";
import { formatMonth } from "@/lib/format";
import { getCurrentBudget, getEnvelopes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  if (!budget) return <p>No monthly budget is stored for this account.</p>;
  const envelopes = await getEnvelopes(user.user_id, budget.budget_id);

  return (
    <BudgetPlanner
      monthLabel={formatMonth(budget.budget_month)}
      totalAmount={Number(budget.total_amount)}
      envelopes={envelopes}
    />
  );
}
