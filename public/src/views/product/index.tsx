import ProductList from "@/components/layout/product/ProductList";
import SearchBar from "@/components/layout/product/SearchBar";
import FloatingCart from "@/components/molecules/cart";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const Product: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cookies] = useCookies(["access_token"]);

  useEffect(() => {
    document.title = `Pathosafe - Product`;
    return () => {
      document.title = "Pathosafe";
    };
  }, []);

  useEffect(() => {
    if (cookies.access_token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [cookies.access_token]);

  return (
    <>
      <SearchBar />
      <ProductList />
      {isLoggedIn && <FloatingCart />}
    </>
  );
};

export default Product;
