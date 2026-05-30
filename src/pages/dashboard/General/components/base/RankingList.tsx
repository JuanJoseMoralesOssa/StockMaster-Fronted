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
  colorClass?: string;
  maxItems?: number;
  showNumbers?: boolean;
  valueFormatter?: (value: number) => string;
  /** Si se provee, el nombre de cada item se vuelve clicable. */
  onItemClick?: (item: RankingItem) => void;
}

function RankingList({
  title,
  items,
  colorClass = "bg-(--color-bg-subtle)",
  maxItems = 5,
  showNumbers = true,
  valueFormatter = (value) => value.toString(),
  onItemClick,
}: Readonly<RankingListProps>) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) return null;

  return (
    <div className={`${colorClass} p-4 rounded-lg border border-(--color-border)`}>
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-(--color-text-primary)">
        {title}
      </h3>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={item.id} className="flex justify-between items-center text-sm text-(--color-text-primary)">
            <span className="font-medium flex items-center gap-2">
              {showNumbers && (
                <span className="bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </span>
              )}
              {onItemClick ? (
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="hover:underline text-left text-(--view-accent-text,var(--color-text-link)) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-focus-ring) rounded"
                >
                  {item.name}
                </button>
              ) : (
                item.name
              )}
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
