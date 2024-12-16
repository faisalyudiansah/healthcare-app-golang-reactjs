import { RootState } from "@/stores";
import { useSelector } from "react-redux";
import CheckoutItem from "./CheckoutItem";

const CheckoutItems: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);

  let orderIndex = 0;

  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      {cart.pharmacies &&
        Object.values(cart.pharmacies).map((item) => {
          const checkedProducts = Object.values(item.products).filter(
            (product) => product.checked
          );

          if (checkedProducts.length === 0) return null;
          orderIndex++;

          return (
            <CheckoutItem
              key={orderIndex}
              checkedProducts={checkedProducts}
              item={item}
              orderIndex={orderIndex}
            />
          );
        })}
    </div>
  );
};

export default CheckoutItems;
