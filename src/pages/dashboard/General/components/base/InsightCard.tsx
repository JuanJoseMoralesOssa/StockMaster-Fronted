// Base component for insight cards - Single Responsibility
interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  icon?: string;
  borderColor?: string;
  bgColor?: string;
}

function InsightCard({
  title,
  value,
  description,
  icon = "💡",
  borderColor = "border-blue-500",
  bgColor = "bg-white"
}: Readonly<InsightCardProps>) {
  return (
    <div className={`${bgColor} p-3 rounded border-l-4 ${borderColor}`}>
      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <p className="text-sm text-gray-600">
        <span className="font-bold">{value}</span>
      </p>
      <p className="text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default InsightCard;
