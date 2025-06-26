import { ProductAnalytics } from '../../../../types/Analytics';
import RankingList from './base/RankingList';
import { productToRankingItems, formatWeight } from './adapters/analyticsAdapters';

interface ProductsCardProps {
  products: ProductAnalytics[];
  title: string;
  icon: string;
  colorClass: string;
}

function ProductsCard({ products, title, icon, colorClass }: Readonly<ProductsCardProps>) {
  if (products.length === 0) return null;

  const rankingItems = productToRankingItems(products);

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

export default ProductsCard;
