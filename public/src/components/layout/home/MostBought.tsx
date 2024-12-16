import emptyProductImg from "@/assets/svg/miscellaneous/empty-product.svg";
import CardProduct from "@/components/organisms/product/CardProduct";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RootState } from "@/stores";
import { useInView } from "react-intersection-observer";
import { IconAddressBook } from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";

interface ProductClassification {
  id: number;
  name: "Obat Bebas" | "Obat Keras" | "Obat Bebas Terbatas" | "Non Obat";
}

interface Product {
  id: number | string;
  pharmacy_product_id: number | string;
  name: string;
  selling_unit: string;
  sold_amount: number;
  price: string;
  stock_quantity: number;
  thumbnail_url: string;
  product_classification: ProductClassification;
}
export interface ProductResponse {
  message: string;
  data: Product[];
  paging: Paging;
}

interface Paging {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

const fetchProducts = async (
  pageParam: number,
  accessToken: string | undefined | null
): Promise<ProductResponse> => {
  const link = `${
    import.meta.env.VITE_BASE_URL
  }/products/home?limit=10&page=${pageParam}`;
  if (accessToken) {
    const response = await axios.get(link, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 2000,
    });
    return response.data;
  }

  const response = await axios.get(link);
  return response.data;
};

const MostBought: React.FC = () => {
  const { dataUser } = useSelector((state: RootState) => state.authReducer);

  const [cookie] = useCookies(["access_token"]);
  const {
    isLoading,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["mostBoughtProducts", dataUser],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts(pageParam, cookie.access_token),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.paging.total_page ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        ref(node);
      }
    },
    [ref]
  );

  const isEmpty = data?.pages.every((page) => page.data.length === 0);

  return (
    <div className="w-full flex justify-center items-center my-8">
      <div className="container w-[80%]">
        <h1 className="text-3xl text-foreground transition-colors font-bold">
          Most Boughts
        </h1>
        {error && (
          <div className="w-full flex justify-center items-center my-8">
            <div className="container border-t border-t-white p-4 flex flex-col justify-center items-center gap-8">
              <img
                src={emptyProductImg}
                alt="Not Found"
                className="max-h-[40vh]"
              />
              <h2 className="font-bold text-primarypink text-lg md:text-2xl">
                Gak Ada Produk Di Dekat Lokasi Kamu Nih!
              </h2>
              <Button className="w-[40%] bg-primarypink dark:bg-white dark:text-black text-white flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 text-xl py-6 font-bold">
                <IconAddressBook />
                <span className="text-center">Ganti Alamat</span>
              </Button>
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="w-full flex justify-center items-center my-8">
            <div className="container border-t border-t-white p-4 flex flex-col justify-center items-center gap-8">
              <img
                src={emptyProductImg}
                alt="Not Found"
                className="max-h-[40vh]"
              />
              <h2 className="font-bold text-primarypink text-lg md:text-2xl">
                Gak Ada Produk Nih!
              </h2>
            </div>
          </div>
        )}
        <ScrollArea className="w-full rounded-md py-4">
          <div className="flex w-full gap-4">
            {isLoading &&
              Array(10)
                .fill(0)
                .map((_, idx) => <CardProduct key={idx + 1} loading />)}

            {data?.pages.map((page, pageIndex) =>
              page?.data.map((product, index) => {
                const isLastItem =
                  pageIndex === data.pages.length - 1 &&
                  index === page.data.length - 1;

                return (
                  <CardProduct
                    key={product.id}
                    product={{
                      id: product.id,
                      pharmacyProductId: product.pharmacy_product_id,
                      name: product.name,
                      price: product.price,
                      productClassification:
                        product.product_classification.name,
                      sellingUnit: product.selling_unit,
                      soldAmount: product.sold_amount,
                      stockQuantity: product.stock_quantity,
                      thumbnail: product.thumbnail_url,
                    }}
                    loading={isLoading}
                    ref={isLastItem ? lastItemRef : null}
                  />
                );
              })
            )}

            {isFetchingNextPage &&
              Array(10)
                .fill(0)
                .map((_, idx) => <CardProduct key={idx + 1} loading />)}
          </div>
          <ScrollBar orientation="horizontal" className="mt-8" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default MostBought;
