import Pharmacy from "./Pharmacy";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useEffect } from "react";
import { useIntersection } from "@mantine/hooks";
import { IconBuildingStore } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PharmacyResponse {
  message: string;
  data: PharmacyDetail[];
  paging: Paging;
}

interface PharmacyDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  pharmacist: Pharmacist;
  partner: Partner;
  is_active: boolean;
  product: Product;
}

interface Pharmacist {
  id: number;
  name: string;
  sipa_number: string;
}

interface Partner {
  id: number;
  name: string;
}

interface Product {
  id: number;
  stock_quantity: number;
  price: string;
}

interface Paging {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

const fetchProductPharmacy = async (
  pageParam: number,
  productId: string | undefined
): Promise<PharmacyResponse> => {
  const link = `${
    import.meta.env.VITE_BASE_URL
  }/pharmacies?limit=10&page=${pageParam}&product-id=${productId}`;
  const response = await axios.get(link);

  return response.data;
};

const PharmacyProducy: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { isLoading, data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["productPharmacy", productId],
      queryFn: ({ pageParam = 1 }) =>
        fetchProductPharmacy(pageParam, productId),
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

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primarypink text-white font-medium flex justify-center items-center gap-2 w-max border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 text-md py-6">
          <IconBuildingStore />
          <span className="text-center">Pilih Apotek Lainnya</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] md:max-w-[70%]">
        <DialogHeader>
          <DialogTitle>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Apotek Lainnya
            </h4>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-y-auto max-h-[70vh] w-full">
          <div className="w-full flex flex-col gap-8">
            {isLoading &&
              Array(5)
                .fill(0)
                .map((_, idx) => <Pharmacy key={idx + 1} loading />)}
            {data?.pages.map((page) =>
              page.data.map((pharmacy, i) => {
                const isLast = page.data.length - 1 === i;
                return (
                  <div key={pharmacy.id} ref={isLast ? ref : null}>
                    <Pharmacy
                      pharmacyProductId={pharmacy.product.id}
                      id={pharmacy.id}
                      name={pharmacy.name}
                      address={pharmacy.address}
                      city={pharmacy.city}
                      price={pharmacy.product.price}
                      stock={pharmacy.product.stock_quantity}
                      pharmacist={pharmacy.pharmacist}
                      loading={isLoading}
                    />
                  </div>
                );
              })
            )}
            {isFetchingNextPage &&
              Array(5)
                .fill(0)
                .map((_, idx) => <Pharmacy key={idx + 1} loading />)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyProducy;
