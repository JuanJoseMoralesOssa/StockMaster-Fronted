// Base component for ranking lists - Single Responsibility
interface RankingItem {
  id: number;
  name: string;
  primaryValue: number;
  secondaryValue?: number;
  primaryLabel: string;
  secondaryLabel?: string;
}

interface RankingListProps {
  title: string;
  items: RankingItem[];
  icon?: string;
  colorClass?: string;
  maxItems?: number;
  showNumbers?: boolean;
  valueFormatter?: (value: number) => string;
}

function RankingList({
  title,
  items,
  icon,
  colorClass = "bg-gray-50",
  maxItems = 5,
  showNumbers = true,
  valueFormatter = (value) => value.toString()
}: Readonly<RankingListProps>) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) return null;

  return (
    <div className={`${colorClass} p-4 rounded-lg border`}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="font-medium flex items-center gap-2">
              {showNumbers && (
                <span className="bg-white px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </span>
              )}
              {item.name}
            </span>
            <div className="text-right">
              <div className="font-bold">
                {valueFormatter(item.primaryValue)}
                <span className="text-xs ml-1 opacity-75">{item.primaryLabel}</span>
              </div>
              {item.secondaryValue !== undefined && item.secondaryLabel && (
                <div className="text-xs opacity-75">
                  {item.secondaryValue} {item.secondaryLabel}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingList;
