import sadImg from "@/assets/svg/miscellaneous/sad.svg";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RootState } from "@/stores";
import {
  addQuantity,
  minusQuantity,
  removeProduct,
  toggleProductCheck,
  toggleSelectAll,
} from "@/stores/slices/cartSlices";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

type Props = {
  id: number;
  pharmacyId: number;
  imageUrl: string;
  name: string;
  price: number | string;
  stockQuantity: number;
  cartQuantity: number;
};

const Product: React.FC<Props> = ({
  id,
  pharmacyId,
  imageUrl,
  name,
  price,
  stockQuantity,
  cartQuantity,
}) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const { toast } = useToast();
  const [cookie] = useCookies(["access_token"]);

  const [count, setCount] = useState(cartQuantity);
  const [productChecked, setProductChecked] = useState(false);
  const debouncedCount = useDebounce(count, 800);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/users/me/cart/${id}`,
        { headers: { Authorization: `Bearer ${cookie.access_token}` } }
      );

      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      pharmacy_product_id: number;
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

  const handleDeleteProduct = async () => {
    await deleteMutation
      .mutateAsync()
      .then(() => {
        toast({
          title: "Produk Berhasil Dihapus",
          duration: 3000,
          type: "foreground",
          className: "border-primarypink",
          action: (
            <ToastAction
              altText="Close"
              className="border-primarypink border-opacity-20"
            >
              Close
            </ToastAction>
          ),
        });
        dispatch(removeProduct({ pharmacyId: pharmacyId, productId: id }));
      })
      .catch((error: AxiosError<{ message: string }>) => {
        if (error) {
          toast({
            title: "Gagal Menghapus Produk",
            description: error.response?.data.message,
            duration: 3000,
            type: "foreground",
            variant: "destructive",
          });
        }
      });
  };

  const handleProductChecked = () => {
    setProductChecked((prevState) => !prevState);
    dispatch(toggleProductCheck({ pharmacyId, productId: id }));
    dispatch(toggleSelectAll());
  };

  const handleIncrementCount = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (count < stockQuantity) {
      setCount((prevState) => prevState + 1);
      dispatch(addQuantity({ pharmacyId, productId: id }));
    }
  };

  const handleDecrementCount = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (count > 1) {
      setCount((prevState) => prevState - 1);
      dispatch(minusQuantity({ pharmacyId, productId: id }));
    }
  };

  useEffect(() => {
    if (cart.pharmacies) {
      if (
        pharmacyId in cart.pharmacies &&
        id in cart.pharmacies[pharmacyId].products
      ) {
        setProductChecked(cart.pharmacies[pharmacyId].products[id].checked);
      }
    }
  }, [id, pharmacyId, cart]);

  useEffect(() => {
    if (debouncedCount) {
      updateMutation.mutate({
        pharmacy_product_id: id,
        quantity: debouncedCount,
      });
    }
  }, [debouncedCount]);

  return (
    <div
      key={id}
      className="h-full w-full flex justify-between gap-8 items-center md:items-start border-t border-t-zinc-500 border-opacity-15 pt-4"
    >
      <div className="flex md:gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={productChecked}
            onClick={handleProductChecked}
            className="border-primarypink checked:bg-primarypink data-[state=checked]:bg-primarypink data-[state=checked]:text-white transition-all ease-in-out size-6 text-lg"
          />
        </div>

        <img src={imageUrl} alt={name} className="object-contain size-24" />
        <p className="font-bold text-md md:text-xl text-wrap">{name}</p>
      </div>

      <div className="h-full flex flex-col items-end gap-8">
        <p className="font-bold text-md md:text-lg w-max mb-auto">
          {formatPrice(price)}
        </p>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <IconTrash className="size-4 md:size-7 hover:text-primarypink transition-all duration-300 ease-in-out cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent className="min-h-[30vh] flex flex-col gap-10">
              <AlertDialogHeader className="flex justify-center items-center flex-col gap-4">
                <img src={sadImg} alt="Sedih-Banget" className="w-96 flex justify-center items-center" />
                <AlertDialogTitle className="text-primarypink font-poppins text-xl text-center">
                  Yakin Mau Hapus Produk?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-end items-end w-full">
                <AlertDialogCancel className="inline-block border-opacity-10 border-zinc-500 hover:brightness-75 transition-all">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-primarypink text-white border border-transparent hover:border-primarypink hover:text-white hover:bg-thirdpink duration-300 ease-in-out inline-block"
                  onClick={handleDeleteProduct}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="w-full flex items-center justify-center md:gap-2">
            <button disabled={count === 1}>
              <IconMinus
                className={cn(
                  `rounded-full size-4 md:size-7 bg-gray-200 text-black hover:brightness-75 transition-all duration-300 ease-in-out cursor-pointer`,
                  count === 1 && "cursor-not-allowed brightness-75"
                )}
                onClick={handleDecrementCount}
              />
            </button>
            <div className="w-16 md:w-20 flex items-center justify-center">
              <p className="px-4 md:px-8 py-1 rounded-md border-2 border-zinc-300 text-md md:text-base">
                {count}
              </p>
            </div>
            <button disabled={count === stockQuantity}>
              <IconPlus
                className={cn(
                  `text-white bg-primarypink rounded-full size-4 md:size-7 hover:brightness-75 transition-all duration-300 ease-in-out`,
                  count === stockQuantity && "cursor-not-allowed bg-gray-400"
                )}
                onClick={handleIncrementCount}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
