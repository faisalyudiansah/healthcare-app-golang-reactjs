import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { capitalizeFirstLetter, formatPrice } from "@/lib/format";
import ProductClassification from "@/components/atoms/product/ProductClassification";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { AppDispatch } from "@/stores";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "@/stores/slices/cartSlices";
import { useDebounce } from "@uidotdev/usehooks";
import { useMutation } from "@tanstack/react-query";
import { Cookies, useCookies } from "react-cookie";
import axios from "axios";
import ModalLogin from "@/components/template/modal/auth/ModalLogin";

type Props = {
  product?: Product;
  loading?: boolean;
  error?: boolean;
  className?: string;
};

type Product = {
  id: string | number;
  pharmacyProductId: string | number;
  name: string;
  thumbnail: string;
  price: number | string;
  soldAmount: number;
  stockQuantity: number;
  sellingUnit: string;
  productClassification:
    | "Obat Bebas"
    | "Obat Keras"
    | "Obat Bebas Terbatas"
    | "Non Obat";
};

const SkeletonProduct: React.FC = () => {
  return (
    <Card className="w-80 rounded-md shadow-lg border relative animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-md"></div>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
      </CardContent>
      <CardFooter className="p-4">
        <div className="h-10 bg-gray-200 rounded-md w-full"></div>
      </CardFooter>
    </Card>
  );
};

const CardProduct = React.forwardRef<HTMLDivElement, Props>(
  ({ product, loading, error, className }, ref) => {
    const cookies = new Cookies();
    const token = cookies.get("access_token");
    const [cookie] = useCookies(["access_token"]);
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const [isAdded, setIsAdded] = useState(false);

    const addMutation = useMutation({
      mutationFn: (payload: {
        pharmacy_product_id: string | number | undefined;
        quantity: number | undefined;
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
        pharmacy_product_id: string | number | undefined;
        quantity: number | undefined;
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
          product?.pharmacyProductId
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

    const handleClicked = () => {
      if (product) {
        navigate(`/product/${product?.id}`);
      }
    };

    const [count, setCount] = useState(0);
    const debouncedCount = useDebounce(count, 800);

    const handleIncrementCount = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (count < (product?.stockQuantity || 1)) {
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
            pharmacy_product_id: product?.pharmacyProductId,
            quantity: debouncedCount,
          });
        } else {
          updateMutation.mutate({
            pharmacy_product_id: product?.pharmacyProductId,
            quantity: debouncedCount,
          });
        }
      } else if (debouncedCount === 0 && isAdded) {
        deleteMutation.mutate();
      }
    }, [debouncedCount]);

    if (loading) {
      return <SkeletonProduct />;
    }

    if (error) {
      return (
        <Card className="rounded-md shadow-sm border text-center p-4">
          <p className="text-red-500 font-bold">Failed to load product.</p>
        </Card>
      );
    }

    if (!product) {
      return null;
    }

    return (
      <>
        <Card
          className={cn(
            "w-64 md:w-80 rounded-md shadow-sm border border-primarypink border-opacity-20 hover:shadow-xl transition-shadow duration-300 relative cursor-pointer flex flex-col",
            className
          )}
          ref={ref}
        >
          <div
            onClick={handleClicked}
            className="absolute top-2 right-2 text-xl"
          >
            <ProductClassification
              classification={product.productClassification}
            />
          </div>
          <CardHeader onClick={handleClicked} className="p-0">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full max-h-48 object-contain rounded-t-md"
              loading="lazy"
            />
          </CardHeader>
          <CardContent onClick={handleClicked} className="p-4">
            <CardTitle className="text-sm md:text-md lg:text-lg font-bold">
              {product.name}
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Per {capitalizeFirstLetter(product.sellingUnit)}
            </p>
            <div className="mt-2">
              <p className="text-red-500 font-bold text-lg">
                {formatPrice(product.price)}
              </p>
              <p className="text-gray-500 text-sm">
                {product.soldAmount} Terjual
              </p>
            </div>
          </CardContent>
          <CardFooter className="h-full w-full p-4 flex items-end">
            {count === 0 ? (
              <>
                {token ? (
                  <Button
                    className="bg-primarypink text-white border border-transparent px-4 py-2 rounded-md w-full hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out"
                    onClick={handleIncrementCount}
                  >
                    Tambah
                  </Button>
                ) : (
                  <ModalLogin titleButton="Tambah" />
                )}
              </>
            ) : (
              <div className="w-full flex justify-center items-center gap-6">
                <IconMinus
                  onClick={handleDecrementCount}
                  className="rounded-full h-8 w-8 bg-gray-200 text-black hover:brightness-75 transition-all duration-300 ease-in-out"
                />
                <div className="w-24 flex items-center justify-center">
                  <p className="px-8 py-1 rounded-md border-2 border-zinc-300">
                    {count}
                  </p>
                </div>
                <button disabled={count == product.stockQuantity}>
                  <IconPlus
                    onClick={handleIncrementCount}
                    className={cn(
                      `text-white bg-primarypink rounded-full h-8 w-8 hover:brightness-75 transition-all duration-300 ease-in-out`,
                      count === product.stockQuantity &&
                        "cursor-not-allowed bg-gray-400"
                    )}
                  />
                </button>
              </div>
            )}
          </CardFooter>
        </Card>
      </>
    );
  }
);

export default CardProduct;
