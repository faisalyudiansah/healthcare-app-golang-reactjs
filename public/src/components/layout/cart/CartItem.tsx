import emptyCartImg from "@/assets/svg/cart/empty-cart.svg";
import {
  CartResponse,
  initCart,
  selectAll,
  unselectAll,
} from "@/stores/slices/cartSlices";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import Item from "./Item";
import { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useCookies } from "react-cookie";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores";

const fetchProductPharmacy = async (
  pageParam: number,
  accessToken: string
): Promise<CartResponse> => {
  const link = `${
    import.meta.env.VITE_BASE_URL
  }/users/me/cart?limit=25&page=${pageParam}`;
  const response = await axios.get(link, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};

const CartItems: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const [cookie] = useCookies(["access_token"]);
  const {
    isLoading,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["cartItem", cart.rerender],
    queryFn: ({ pageParam = 1 }) =>
      fetchProductPharmacy(pageParam, cookie.access_token),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.paging.total_page ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  const lastItemRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastItemRef.current,
    threshold: 1,
  });

  const handleSelectAll = () => {
    if (Object.values(cart.pharmacies).some((pharmacy) => !pharmacy.checked)) {
      dispatch(selectAll());
    } else {
      dispatch(unselectAll());
    }
  };

  useEffect(() => {
    dispatch(unselectAll());
  }, []);

  useEffect(() => {
    if (data?.pages[0]) {
      dispatch(initCart(data.pages[0]));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadComponent = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, idx) => <Item key={idx + 1} loading />);
    }

    const isEmpty = data?.pages.every((page) => page.data.length === 0);
    if (error || isEmpty) {
      return (
        <div className="w-full flex justify-center items-center my-8">
          <div className="container border-t border-t-primarypink p-4 flex flex-col justify-center items-center gap-8">
            <img src={emptyCartImg} alt="Not Found" className="max-h-[55vh]" />
            <h2 className="font-bold mt-10 font-poppins text-primarypink text-xl md:text-2xl">
              Keranjang Kamu Kosong, Belanja Dulu Yok!
            </h2>
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="overflow-y-auto max-h-[70vh] w-full border-none">
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col gap-4 border-2 border-zinc-200 dark:border-primarypink rounded-lg">
            <Badge className="bg-inherit hover:bg-inherit w-full py-4 text-foreground font-normal flex flex-col gap-6 mx-auto border">
              <div className="flex gap-4 items-center mr-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={cart.selectAll}
                    onClick={handleSelectAll}
                    className="border-primarypink checked:bg-primarypink data-[state=checked]:bg-primarypink data-[state=checked]:text-white transition-all ease-in-out size-6 text-lg"
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <p className="font-bold text-sm md:text-base">Pilih Semua</p>
                </div>
              </div>
            </Badge>
          </div>

          {data?.pages.map((page) =>
            page.data.map((item, i) => {
              const isLast = page.data.length - 1 === i;
              return (
                <div key={i + 1} ref={isLast ? ref : null}>
                  <Item cartItem={item} />
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="w-full flex justify-center items-start">
      <div className="w-[80%] container p-4 shadow-lg rounded-2xl border dark:border-primarypink">
        <div className="w-full flex flex-col gap-6">{loadComponent()}</div>
      </div>
    </div>
  );
};

export default CartItems;
