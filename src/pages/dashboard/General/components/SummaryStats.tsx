import { PackageCheck } from "lucide-react";

interface SummaryStatsProps {
  purchaseWeight: number;
  expenseWeight: number;
}

const kg = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;

function SummaryStats({ purchaseWeight, expenseWeight }: Readonly<SummaryStatsProps>) {
  const pct = purchaseWeight > 0 ? (expenseWeight / purchaseWeight) * 100 : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--view-accent-soft,var(--color-bg-subtle)) border border-(--view-accent-border,var(--color-border)) text-(--view-accent-text,var(--color-text-link)) text-sm font-semibold">
      <PackageCheck className="w-4 h-4 shrink-0" />
      <span>{pct.toFixed(1)}% entregado</span>
      <span className="text-[11px] font-normal opacity-70">
        {kg(expenseWeight)} de {kg(purchaseWeight)}
      </span>
    </div>
  );
}

export default SummaryStats;
