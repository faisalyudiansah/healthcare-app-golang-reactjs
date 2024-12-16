import notFoundImg from "@/assets/svg/miscellaneous/not-found.svg";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { capitalizeFirstLetter, formatPrice } from "@/lib/format";
import ProductClassification from "@/components/atoms/product/ProductClassification";
import GalleryImages from "./GalleryImages";
import ProductPharmacy from "./ProductPharmacy";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import { changeDetail } from "@/stores/slices/productDetailSlices";
import { Button } from "@/components/ui/button";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { MdOutlineSell } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { useCookies } from "react-cookie";
import { useDebounce } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import { addToCart, removeFromCart } from "@/stores/slices/cartSlices";
import PharmacyDetail from "./PharmacyDetail";

interface Pharmacist {
  id: number;
  name: string;
  sipa_number: string;
}

interface Pharmacy {
  id: number;
  pharmacist: Pharmacist;
  name: string;
  address: string;
}

interface Manufacture {
  id: number;
  name: string;
}

interface ProductClassification {
  id: number;
  name:
    | "Obat Bebas"
    | "Obat Keras"
    | "Obat Bebas Terbatas"
    | "Non Obat"
    | undefined;
}

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  pharmacy_product_id: number;
  pharmacy: Pharmacy;
  manufacture: Manufacture;
  product_classification: ProductClassification;
  product_categories: ProductCategory[];
  name: string;
  generic_name: string;
  description: string;
  unit_in_pack: string;
  selling_unit: string;
  sold_amount: number;
  weight: string;
  height: string;
  length: string;
  width: string;
  price: string;
  stock_quantity: number;
  thumbnail_url: string;
  image_url: string;
  secondary_image_url?: string;
  tertiary_image_url?: string;
  is_active: boolean;
  created_at: string;
}

const fetchProduct = async (
  productId: string | undefined
): Promise<Product> => {
  const link = `${import.meta.env.VITE_BASE_URL}/products/${productId}`;
  const response = await axios.get(link);
  return response.data.data;
};

const ProductDetail: React.FC = () => {
  const [cookie] = useCookies(["access_token"]);
  const state = useSelector((state: RootState) => state.productDetail);
  const dispatch: AppDispatch = useDispatch();
  const { productId } = useParams<{ productId: string }>();
  const [isAdded, setIsAdded] = useState(false);

  const addMutation = useMutation({
    mutationFn: (payload: {
      pharmacy_product_id: number | null;
      quantity: number;
    }) => {
      const link = `${import.meta.env.VITE_BASE_URL}/users/me/cart`;
      return axios.post(link, payload, {
        headers: {
          Authorization: `Bearer ${cookie.access_token}`,
        },
      });
    },
    onSuccess: () => {
      setIsAdded(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      pharmacy_product_id: number | null;
      quantity: number;
    }) => {
      const link = `${import.meta.env.VITE_BASE_URL}/users/me/cart`;
      return axios.put(link, payload, {
        headers: {
          Authorization: `Bearer ${cookie.access_token}`,
        },
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => {
      const link = `${import.meta.env.VITE_BASE_URL}/users/me/cart/${
        state.pharmacyProductId
      }`;
      return axios.delete(link, {
        headers: {
          Authorization: `Bearer ${cookie.access_token}`,
        },
      });
    },
    onSuccess: () => {
      setIsAdded(false);
    },
  });

  const { isLoading, data, error } = useQuery({
    queryKey: ["productDetail", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  });

  const [count, setCount] = useState(0);
  const debouncedCount = useDebounce(count, 1200);

  const handleIncrementCount = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (count < (data?.stock_quantity || 1)) {
      setCount((prevState) => prevState + 1);
      dispatch(addToCart());
    }
  };

  const handleDecrementCount = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (count > 0) {
      setCount((prevState) => prevState - 1);
      dispatch(removeFromCart());
    }
  };

  useEffect(() => {
    if (debouncedCount > 0) {
      if (!isAdded) {
        addMutation.mutate({
          pharmacy_product_id: state.pharmacyProductId,
          quantity: debouncedCount,
        });
      } else {
        updateMutation.mutate({
          pharmacy_product_id: state.pharmacyProductId,
          quantity: debouncedCount,
        });
      }
    } else if (debouncedCount === 0 && isAdded) {
      deleteMutation.mutate();
    }
  }, [debouncedCount]);

  useEffect(() => {
    dispatch(
      changeDetail({
        price: data?.price,
        stock: data?.stock_quantity,
        pharmacyProductId: data?.pharmacy_product_id,
        pharmacy: data?.pharmacy,
      })
    );
  }, [data, dispatch]);

  useEffect(() => {
    if (data) {
      document.title = `Pathosafe - ${data.name}`;
    }
    return () => {
      document.title = "Pathosafe";
    };
  }, [data]);

  if (error)
    return (
      <div className="w-full flex justify-center items-center my-8">
        <div className="container border-t border-t-white dark:border-t-primarypink p-4 flex flex-col justify-center items-center gap-8">
          <img src={notFoundImg} alt="Not Found" />
          <h2 className="font-bold text-primarypink text-3xl">
            Product Does Not Exists
          </h2>
        </div>
      </div>
    );

  const images = [
    {
      src: data?.thumbnail_url,
      alt: "Thumbnail",
    },
    {
      src: data?.image_url,
      alt: "Primary",
    },
    {
      src: data?.secondary_image_url,
      alt: "Secondary",
    },
    {
      src: data?.tertiary_image_url,
      alt: "Tertiary",
    },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center items-start my-8">
      <div className="container border-t border-t-white dark:border-t-primarypink p-4">
        <div className="grid md:grid-cols-[5fr_4fr] gap-12">
          <div className="flex flex-col gap-2">
            <GalleryImages images={images} loading={isLoading} />
          </div>

          {isLoading ? (
            <div className="w-full h-full flex flex-col gap-8">
              <div className="md:flex-[3] h-40 rounded-md shadow-lg border relative animate-pulse bg-gray-200"></div>
              <div className="md:flex-[2] h-24 rounded-md shadow-lg border relative animate-pulse bg-gray-200"></div>
              <div className="md:flex-[6] h-52 rounded-md shadow-lg border relative animate-pulse bg-gray-200"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <p className="text-3xl font-bold">{data?.name}</p>

                <div className="flex flex-col">
                  <p className="text-lg font-normal">
                    Dikirim dari
                    <span className="uppercase ml-1">
                      {state?.pharmacy?.name}
                    </span>
                    <PharmacyDetail pharmacy={state.pharmacy} />
                  </p>
                </div>

                <ProductPharmacy />

                <p className="text-primarypink text-2xl">
                  {formatPrice(state.price)}{" "}
                  <span className="text-foreground">
                    / {capitalizeFirstLetter(data?.selling_unit)}{" "}
                  </span>
                </p>

                {count === 0 ? (
                  <Button
                    className="flex items-center gap-2 bg-primarypink text-white border border-transparent px-4 py-2 rounded-md hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out w-52 text-md"
                    onClick={handleIncrementCount}
                  >
                    <IconPlus />
                    Tambah
                  </Button>
                ) : (
                  <div className="w-full flex justify-start items-center gap-6">
                    <IconMinus
                      onClick={handleDecrementCount}
                      className="rounded-full h-8 w-8 bg-gray-200 text-black hover:brightness-75 transition-all duration-300 ease-in-out"
                    />
                    <div className="w-24 flex items-center justify-center">
                      <p className="px-8 py-1 rounded-md border-2 border-zinc-300">
                        {count}
                      </p>
                    </div>
                    <button disabled={count == data?.stock_quantity}>
                      <IconPlus
                        onClick={handleIncrementCount}
                        className={cn(
                          `text-white bg-primarypink rounded-full h-8 w-8 hover:brightness-75 transition-all duration-300 ease-in-out`,
                          count === data?.stock_quantity &&
                            "cursor-not-allowed bg-gray-400"
                        )}
                      />
                    </button>
                  </div>
                )}

                <div className="text-zinc-500 font-medium flex items-center gap-2">
                  <MdOutlineSell />
                  <p>{data?.sold_amount} Terjual</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold">Informasi Produk</h3>

                <div className="flex flex-col gap-2">
                  <p>Golongan</p>
                  <div className="flex items-center gap-3">
                    <ProductClassification
                      classification={data?.product_classification.name}
                    />
                    <p>{data?.product_classification.name}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col gap-4">
                    <p className="">
                      <span className="font-bold">Weight:</span> {data?.weight}{" "}
                      g
                    </p>
                    <p className="">
                      <span className="font-bold">Height:</span> {data?.height}{" "}
                      cm
                    </p>
                    <p className="">
                      <span className="font-bold">Length:</span> {data?.length}{" "}
                      cm
                    </p>
                    <p className="">
                      <span className="font-bold">Width:</span> {data?.length}{" "}
                      cm
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">Kategori</h3>
                  <div className="flex flex-wrap gap-4">
                    {data?.product_categories.map((category) => (
                      <Badge
                        key={category.id}
                        className="bg-transparent border border-fourthpink text-primarypink text-base text-ellipsis w-max p-2 hover:bg-white"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="">
                  <h3 className="text-xl font-bold">Pabrik / Manufaktur</h3>
                  <p className="">{data?.manufacture.name}</p>
                </div>

                <div className="">
                  <h3 className="text-xl font-bold">Komposisi</h3>
                  <p>{data?.generic_name}</p>
                </div>

                <div className="">
                  <h3 className="text-xl font-bold">Deskripsi</h3>
                  <p>{data?.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
