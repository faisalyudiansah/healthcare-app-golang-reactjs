import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { RootState } from "@/stores";
import React from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { CheckoutRequest, OrderProduct } from "@/stores/slices/checkoutSlices";
import { useToast } from "@/hooks/use-toast";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cookie] = useCookies(["access_token"]);
  const cart = useSelector((state: RootState) => state.cart);
  const checkout = useSelector((state: RootState) => state.checkout);
  const mutation = useMutation({
    mutationFn: async (payload: CheckoutRequest) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/orders/checkout`,
        payload,
        { headers: { Authorization: `Bearer ${cookie.access_token}` } }
      );

      return response.data;
    },
  });

  const handleCheckout = async () => {
    const orders = Object.entries(checkout.checkoutItems).map(
      (
        item: [
          pharmacy_id: string,
          value: {
            selected: boolean;
            cost: number;
            products: OrderProduct[];
            description?: string;
          }
        ]
      ) => {
        return {
          address_id: checkout.address?.id,
          pharmacy_id: parseInt(item[0]),
          description: item[1].description,
          order_products: item[1].products,
          ship_cost: item[1].cost,
        };
      }
    );

    Promise.all(orders.map((order) => mutation.mutateAsync(order)))
      .then(() => {
        navigate("/order");
      })
      .catch((error: AxiosError<{ message: string }>) => {
        toast({
          title: "Gagal Checkout! Tolong Lakukan Checkout Ulang!",
          description: error.response?.data.message,
          duration: 3000,
          type: "foreground",
          variant: "destructive",
        });
      });
  };

  const loadComponent = () => {
    if (!cart.pharmacies) {
      return;
    }

    const checkedPharmacies = Object.values(cart.pharmacies).filter(
      (pharmacy) =>
        Object.values(pharmacy.products).some((product) => product.checked)
    );

    const checkedProducts = checkedPharmacies.flatMap((pharmacy) =>
      Object.values(pharmacy.products).filter((product) => product.checked)
    );

    const totalProductPrice = checkedProducts.reduce(
      (total, product) =>
        total + product.quantity * parseFloat(product.info.price),
      0
    );

    const totalCost = Object.values(checkout.checkoutItems).reduce(
      (total, item) => total + item.cost,
      0
    );

    const totalPrice = totalProductPrice + totalCost;

    const isValid = Object.values(checkout.checkoutItems).every(
      (item) => item.selected
    );

    return (
      <div className="w-full flex justify-center items-start">
        <div className="w-full container rounded-lg">
          <Badge className="bg-inherit hover:bg-inherit py-4 px-8 text-foreground font-normal sm:text-md text-lg flex flex-col gap-6 mx-auto border border-zinc-500 border-opacity-20">
            <div className="w-full flex flex-col gap-2 border-b border-primarypink border-opacity-30 pb-4">
              <h3 className="font-bold">Ringkasan Belanja</h3>

              <div className="text-base flex gap-4 justify-between items-center text-zinc-500">
                <p className="">
                  Total Harga ({checkedProducts.length} Barang)
                </p>
                <p className="text-black">
                  {formatPrice(totalProductPrice) ?? "-"}
                </p>
              </div>

              <div className="text-base flex gap-4 justify-between items-center text-zinc-500">
                <p>Total Ongkir ({checkedPharmacies.length} Toko)</p>
                <p className="text-black">{formatPrice(totalCost) ?? "-"}</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4 border-b border-primarypink border-opacity-30 pb-4">
              <div className="flex justify-between items-center">
                <p>Total Belanja</p>
                <p className="text-black">{formatPrice(totalPrice) ?? "-"}</p>
              </div>
            </div>

            <Button
              className="bg-primarypink border border-transparent hover:bg-white text-white hover:text-primarypink hover:border-primarypink w-full font-bold text-lg py-6"
              onClick={handleCheckout}
              disabled={!isValid || checkout.address === null}
            >
              Checkout
            </Button>

            <div className="w-full text-zinc-500 text-sm">
              <span>Dengan melanjutkan, kamu menyetujui</span> {""}
              <span className="underline cursor-pointer hover:opacity-80 transition-all ease-in-out">
                S&K Asuransi & Proteksi.
              </span>
            </div>
          </Badge>
        </div>
      </div>
    );
  };

  return <>{loadComponent()}</>;
};

export default Payment;
