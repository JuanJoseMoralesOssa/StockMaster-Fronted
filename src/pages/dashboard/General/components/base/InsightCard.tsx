import { Lightbulb } from "lucide-react";

// Base component for insight cards - Single Responsibility
interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
}

function InsightCard({
  title,
  value,
  description,
  icon = <Lightbulb className="w-4 h-4" />,
  borderColor = "border-(--view-accent,var(--color-action-bg))",
  bgColor = "bg-(--color-bg-surface)"
}: Readonly<InsightCardProps>) {
  return (
    <div className={`${bgColor} p-3 rounded border-l-4 ${borderColor}`}>
      <h4 className="font-semibold text-(--color-text-primary) flex items-center gap-2">
        <span className="text-(--view-accent-text,var(--color-text-link))">{icon}</span>
        {title}
      </h4>
      <p className="text-sm text-(--color-text-secondary)">
        <span className="font-bold">{value}</span>
      </p>
      <p className="text-xs text-(--color-text-muted)">
        {description}
      </p>
    </div>
  );
}

export default InsightCard;
