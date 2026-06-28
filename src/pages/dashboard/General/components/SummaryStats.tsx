import { PackageCheck } from "lucide-react";

interface SummaryStatsProps {
  purchaseWeight: number;
  paymentWeight: number;
}

const kg = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;

function SummaryStats({ purchaseWeight, paymentWeight }: Readonly<SummaryStatsProps>) {
  const pct = purchaseWeight > 0 ? (paymentWeight / purchaseWeight) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1.5 rounded-2xl bg-(--view-accent-soft,var(--color-bg-subtle)) border border-(--view-accent-border,var(--color-border)) text-(--view-accent-text,var(--color-text-link)) text-sm font-semibold">
      <PackageCheck className="w-4 h-4 shrink-0" />
      <span>{pct.toFixed(1)}% entregado</span>
      <span className="text-xs font-normal opacity-70">
        {kg(paymentWeight)} de {kg(purchaseWeight)}
      </span>
    </div>
  );
}

export default SummaryStats;
