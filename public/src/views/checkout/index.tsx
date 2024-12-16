import UserAddress from "@/components/layout/checkout/UserAddress";
import Payment from "@/components/layout/checkout/Payment";
import CheckoutItems from "@/components/layout/checkout/CheckoutItems";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores";
import { useEffect } from "react";
import { initCheckoutItem, OrderProduct } from "@/stores/slices/checkoutSlices";
import { Toaster } from "@/components/ui/toaster";

const Checkout: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cart.pharmacies) {
      const checkedPharmacies = Object.values(cart.pharmacies).filter(
        (pharmacy) =>
          Object.values(pharmacy.products).some((product) => product.checked)
      );

      const checkoutItems: { [pharmacyId: number]: OrderProduct[] } = {};
      checkedPharmacies.flatMap((pharmacy) =>
        Object.values(pharmacy.products).map((product) => {
          if (product.checked) {
            if (!checkoutItems[pharmacy.info.id]) {
              checkoutItems[pharmacy.info.id] = [
                {
                  pharmacy_product_id: product.info.id,
                  price: parseInt(product.info.price),
                  quantity: product.quantity,
                },
              ];
              return;
            }

            checkoutItems[pharmacy.info.id].push({
              pharmacy_product_id: product.info.id,
              price: parseInt(product.info.price),
              quantity: product.quantity,
            });
          }
        })
      );

      dispatch(
        initCheckoutItem({
          checkoutItems: Object.entries(checkoutItems).map((items) => ({
            pharmacyId: parseInt(items[0]),
            products: items[1],
          })),
        })
      );
    }
  }, [cart.pharmacies]);

  return (
    <>
      <div className="w-full flex justify-center items-start my-6">
        <div className="w-[80%] container">
          <h1 className="font-bold text-4xl">Pengiriman</h1>
        </div>
      </div>

      <div className="w-full flex justify-center items-start my-6">
        <div className="w-[80%] container">
          <div className="flex flex-col gap-8 md:grid md:grid-cols-[7fr_3fr]">
            <div className="flex flex-col gap-8">
              <UserAddress />
              <CheckoutItems />
            </div>
            <div className="">
              <Payment />
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </>
  );
};

export default Checkout;
