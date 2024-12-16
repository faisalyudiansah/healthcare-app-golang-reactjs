import { RootState } from "@/stores";
import { initCartCount } from "@/stores/slices/cartSlices";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { HiShoppingCart } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

type CartCount = {
  count: number;
};

const fetchCartCount = async (accessToken: string): Promise<CartCount> => {
  const link = `${import.meta.env.VITE_BASE_URL}/users/me/cart/count`;
  const response = await axios.get(link, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data.data;
};

const FloatingCart: React.FC = () => {
  const [cookie] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const state = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const { data } = useQuery({
    queryKey: ["cartCount"],
    queryFn: () => fetchCartCount(cookie.access_token),
  });

  const handleCartNavigate = () => {
    navigate("/cart");
  };

  useEffect(() => {
    if (data) {
      dispatch(initCartCount({ count: data.count }));
    }
  }, [data, dispatch]);

  return (
    <div
      className="relative"
      onClick={handleCartNavigate}
      onKeyDown={handleCartNavigate}
      role="button"
      tabIndex={0}
    >
      <div className="bg-thirdpink rounded-lg fixed bottom-8 right-8 md:bottom-12 md:right-12 py-2 px-8 cursor-pointer">
        <div className="absolute -top-4 right-0 bg-secondarypink size-3 rounded-full flex items-center justify-center p-4">
          <p className="text-white text-md">{state.count}</p>
        </div>
        <HiShoppingCart className="text-white size-7" />
      </div>
    </div>
  );
};

export default FloatingCart;
