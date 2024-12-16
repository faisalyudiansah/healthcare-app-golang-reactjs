import React, { useEffect } from "react";
import Detail from "@/components/layout/productDetail/ProductDetail";
import { Footer } from "@/components/layout/home/Footer";
import MostBought from "@/components/layout/home/MostBought";
import FloatingCart from "@/components/molecules/cart";

const ProductDetail: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []); 

  return (
    <>
      <Detail />
      <MostBought/>
      <Footer />
      <FloatingCart/>
    </>
  );
};

export default ProductDetail;
