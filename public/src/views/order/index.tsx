import { Footer } from "@/components/layout/home/Footer";
import OrderHistory from "@/components/layout/order/OrderHistory";
import FloatingCart from "@/components/molecules/cart";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from "react";

const Order: React.FC = () => {

  useEffect(() => {
    document.title = `Pathosafe - Order`;
    return () => {
      document.title = "Pathosafe";
    };
  }, []);

  return (
    <>
      <OrderHistory width={"w-[90%]"} />
      <Toaster />
      <FloatingCart />
      <Footer />
    </>
  );
};

export default Order;
