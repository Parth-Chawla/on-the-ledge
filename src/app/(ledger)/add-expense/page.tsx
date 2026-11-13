import { AddExpenseForm } from "@/components/AddExpenseForm";
import { requireUser } from "@/lib/auth";
import { monthBounds } from "@/lib/format";
import { getCurrentBudget, getEnvelopes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  const user = await requireUser();
  const budget = await getCurrentBudget(user.user_id);
  if (!budget) return <p>No monthly budget is stored for this account.</p>;
  const envelopes = await getEnvelopes(user.user_id, budget.budget_id);
  const bounds = monthBounds(budget.budget_month);

  return (
    <AddExpenseForm
      envelopes={envelopes}
      defaultDate={bounds.start}
      minDate={bounds.start}
      maxDate={bounds.end}
    />
  );
}
