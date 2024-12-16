import CartItems from "@/components/layout/cart/CartItem";
import CheckoutPage from "@/views/checkout";
import { Toaster } from "@/components/ui/toaster";
import { RootState } from "@/stores";
import { changeLocation } from "@/stores/slices/cartSlices";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Checkout from "@/components/layout/cart/Checkout";
import { Footer } from "@/components/layout/home/Footer";

const Cart = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = `Pathosafe - Cart`;
    return () => {
      document.title = "Pathosafe";
    };
  }, []);

  useEffect(() => {
    dispatch(changeLocation({ location: "cart" }));
  }, []);

  return (
    <>
      <>
        {cart.location === "cart" ? (
          <>
            <div className="w-full flex justify-center items-start my-6">
              <div className="w-[80%] container">
                <h1 className="font-bold text-4xl">Keranjang Belanja</h1>
              </div>
            </div>
            <CartItems />
            <Checkout />
            <Toaster />
            <Footer/>
          </>
        ) : (
          <CheckoutPage />
        )}
      </>
    </>
  );
};
export default Cart;
