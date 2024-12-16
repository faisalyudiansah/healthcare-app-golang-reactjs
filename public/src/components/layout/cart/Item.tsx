import { CartItem } from "@/stores/slices/cartSlices";
import PharmacyProduct from './PharmacyProduct';

type Props = {
  cartItem?: CartItem;
  loading?: boolean;
};

const ItemSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-gray-200 h-12 rounded-md shadow-lg border relative animate-pulse"></div>
      <div className="flex flex-col gap-4">
        <div className="w-full bg-gray-200 h-24 rounded-md shadow-lg border relative animate-pulse"></div>
      </div>
    </div>
  );
};

const Item: React.FC<Props> = ({ cartItem, loading }) => {
  if (loading) return <ItemSkeleton />;

  return (
    <div className="w-full flex flex-col gap-4 border-2 border-zinc-200 dark:border-primarypink rounded-lg">
      <PharmacyProduct data={cartItem?.data_pharmacy_products}/>
    </div>
  );
};

export default Item;
