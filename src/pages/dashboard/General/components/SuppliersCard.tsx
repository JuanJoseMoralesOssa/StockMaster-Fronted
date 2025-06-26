import { SupplierAnalytics } from '../../../../types/Analytics';
import RankingList from './base/RankingList';
import { supplierToRankingItems, formatWeight } from './adapters/analyticsAdapters';

interface SuppliersCardProps {
  suppliers: SupplierAnalytics[];
  title: string;
  icon: string;
  colorClass: string;
}

function SuppliersCard({ suppliers, title, icon, colorClass }: Readonly<SuppliersCardProps>) {
  if (suppliers.length === 0) return null;

  const rankingItems = supplierToRankingItems(suppliers);

  return (
    <RankingList
      title={title}
      items={rankingItems}
      icon={icon}
      colorClass={colorClass}
      maxItems={5}
      showNumbers={true}
      valueFormatter={formatWeight}
    />
  );
}

export default SuppliersCard;
