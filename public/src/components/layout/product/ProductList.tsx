import emptyProductImg from "@/assets/svg/miscellaneous/empty-product.svg";
import CardProduct from "@/components/organisms/product/CardProduct";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RootState } from "@/stores";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
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
interface ProductResponse {
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
  query: string,
  productClassification: number[],
  sort: string,
  sortBy: string
): Promise<ProductResponse> => {
  let link = `${
    import.meta.env.VITE_BASE_URL
  }/products?limit=24&page=${pageParam}&name=${query}&sort=${sort}&sort-by=${sortBy}`;

  productClassification.forEach(
    (classification) => (link += `&product-classification=${classification}`)
  );

  const response = await axios.get(link);

  return response.data;
};

const ProductList: React.FC = () => {
  const product = useSelector((state: RootState) => state.product);
  const {
    isLoading,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "products",
      product.query,
      product.productClassifications,
      product.sort,
      product.sortBy,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts(
        pageParam,
        product.query,
        product.productClassifications,
        product.sort,
        product.sortBy
      ),
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

  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const isEmpty = data?.pages.every((page) => page.data.length === 0);

  return (
    <div className="w-full flex justify-center items-start my-12">
      <div className="w-[80%] container p-4 shadow-lg border border-zinc-500 rounded-lg border-opacity-20">
        {isEmpty ||
          (error && (
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
          ))}

        <ScrollArea className="w-full rounded-md py-4">
          <div className="flex flex-wrap gap-10 justify-center">
            {isLoading &&
              Array(10)
                .fill(0)
                .map((_, idx) => <CardProduct key={idx + 1} loading />)}

            {data?.pages.map((page) =>
              page?.data.map((product, index) => {
                const isLastItem = index === page.data.length - 1;

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
                    ref={isLastItem ? ref : null}
                  />
                );
              })
            )}

            {isFetchingNextPage &&
              Array(10)
                .fill(0)
                .map((_, idx) => <CardProduct key={idx + 1} loading />)}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProductList;
