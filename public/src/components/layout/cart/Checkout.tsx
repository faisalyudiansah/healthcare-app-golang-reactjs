import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { RootState } from "@/stores";
import { changeLocation } from "@/stores/slices/cartSlices";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Checkout: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);

  const handleCheckout = () => {
    if (totalPrice) {
      dispatch(changeLocation({ location: "checkout" }));
    }
  };

  useEffect(() => {
    if (cart?.pharmacies) {
      const pharmacies = Object.values(cart.pharmacies);

      let sumPrice = 0;
      pharmacies.forEach((pharmacy) =>
        Object.values(pharmacy.products).map((product) => {
          if (product.checked) {
            sumPrice += parseFloat(product.info.price) * product.quantity;
          }
        })
      );

      setTotalPrice(sumPrice);
    }
  }, [cart]);

  return (
    <div className="w-full flex justify-center items-start my-8 ">
      <div className="w-[80%] container border-2 border-zinc-200 dark:border-primarypink rounded-2xl p-4">
        <Badge className="bg-inherit hover:bg-inherit py-4 px-8 text-foreground font-normal sm:text-md text-xl flex flex-col gap-6 mx-auto border">
          <div className="flex flex-col gap-4 border-b border-primarypink pb-4 w-[80%]">
            <h3 className="font-bold">Ringkasan Belanja</h3>

            <div className="flex justify-between items-center">
              <p>Total</p>
              <p className="font-bold">{formatPrice(totalPrice) ?? "-"}</p>
            </div>
          </div>

          <Button
            className="bg-primarypink hover:bg-thirdpink border border-transparent text-white hover:border-primarypink w-[80%] font-bold text-lg py-6"
            onClick={handleCheckout}
            disabled={totalPrice === 0}
          >
            Beli
          </Button>
        </Badge>
      </div>
    </div>
  );
};

export default Checkout;
