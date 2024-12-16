import emptyProductImg from "@/assets/svg/miscellaneous/empty-product.svg";
import notFoundImg from "@/assets/svg/miscellaneous/not-found.svg";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { ProductResponse } from "./MostBought";
import { useInView } from "react-intersection-observer";
import CardProduct from "@/components/organisms/product/CardProduct";
import { Button } from "@/components/ui/button";
import { IconAddressBook } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ProductCategory {
  id: number;
  name: string;
}

const fetchProducts = async (
  pageParam: number,
  categoryId: number
): Promise<ProductResponse> => {
  const link = `${
    import.meta.env.VITE_BASE_URL
  }/categories/${categoryId}/products?limit=10&page=${pageParam}`;

  const response = await axios.get(link);
  return response.data;
};

const ProductCategory: React.FC = () => {
  const [choosedCategory, setChoosedCategory] = useState<number>(1);

  const {
    isLoading: isProductLoading,
    data: dataProduct,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error: dataError,
  } = useInfiniteQuery({
    queryKey: ["productByCategory", choosedCategory],
    queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, choosedCategory),
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["productCategory"],
    queryFn: async (): Promise<ProductCategory[]> => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/products/categories?limit=20&page=1`
      );

      return response.data.data;
    },
  });

  const isEmpty = dataProduct?.pages.every((page) => page.data.length === 0);

  return (
    <div className="w-full flex justify-center items-center my-8">
      <div className="container w-[80%]">
        {error && (
          <div className="w-full flex justify-center items-center my-8">
            <div className="container border-t border-t-white p-4 flex flex-col justify-center items-center gap-8">
              <img src={notFoundImg} alt="Not Found" className="max-h-[40vh]" />
              <h2 className="font-bold text-primarypink text-lg md:text-2xl">
                Gak Ada Produk Kategori Nih!
              </h2>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoading &&
            Array.from({ length: 25 }).map(() => (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full bg-gray-200 h-12 rounded-md shadow-lg border relative animate-pulse"></div>
              </div>
            ))}

          {data?.map((category) => (
            <Badge
              key={category.id}
              className={cn(
                "w-full bg-transparent border border-fourthpink text-primarypink text-base text-ellipsis p-2 hover:bg-primarypink cursor-pointer hover:text-white",
                choosedCategory === category.id && "bg-primarypink text-white"
              )}
              onClick={() => setChoosedCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {!error && (
          <div>
            <h1 className="text-3xl text-foreground transition-colors font-bold mt-8 mb-4">
              Product per Category
            </h1>

            {dataError && (
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

            <ScrollArea className="w-full rounded-md">
              <div className="flex w-full gap-4">
                {isProductLoading &&
                  Array(10)
                    .fill(0)
                    .map((_, idx) => <CardProduct key={idx + 1} loading />)}

                {dataProduct?.pages.map((page, pageIndex) =>
                  page?.data.map((product, index) => {
                    const isLastItem =
                      pageIndex === dataProduct.pages.length - 1 &&
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
        )}
      </div>
    </div>
  );
};

export default ProductCategory;
