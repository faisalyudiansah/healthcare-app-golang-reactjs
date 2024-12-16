import addressImg from "@/assets/svg/address/delivery-address.svg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RootState } from "@/stores";
import {
  Address,
  initCheckoutItem,
  OrderProduct,
  setAddress,
} from "@/stores/slices/checkoutSlices";
import { IconCheck, IconMapPinFilled } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const fetchUserAddresses = async (accessToken: string): Promise<Address[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/users/me/addresses`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.data;
};

const AddressSkeleton: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-start">
      <Badge className="w-full container bg-white hover:bg-white py-4 text-black font-normal flex flex-col gap-6 mx-auto border">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-gray-200 h-12 rounded-md shadow-lg border relative animate-pulse"></div>
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-200 h-24 rounded-md shadow-lg border relative animate-pulse"></div>
          </div>
        </div>
      </Badge>
    </div>
  );
};

const UserAddress: React.FC = () => {
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart);
  const state = useSelector((state: RootState) => state.checkout);
  const dispatch = useDispatch();
  const [cookie] = useCookies(["access_token"]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["userAddress"],
    queryFn: () => fetchUserAddresses(cookie.access_token),
  });

  const handleChangeAddress = (address: Address) => {
    dispatch(setAddress({ address }));
  };

  useEffect(() => {
    if (cart.pharmacies) {
      const checkedPharmacies = Object.values(cart.pharmacies).filter(
        (pharmacy) =>
          Object.values(pharmacy.products).some((product) => product.checked)
      );

      const checkoutItems: { [pharmacyId: number]: OrderProduct[] } = {};
      checkedPharmacies.flatMap((pharmacy) =>
        Object.values(pharmacy.products).map((product) => {
          if (product.checked) {
            if (!checkoutItems[pharmacy.info.id]) {
              checkoutItems[pharmacy.info.id] = [
                {
                  pharmacy_product_id: product.info.id,
                  price: parseInt(product.info.price),
                  quantity: product.quantity,
                },
              ];
              return;
            }

            checkoutItems[pharmacy.info.id].push({
              pharmacy_product_id: product.info.id,
              price: parseInt(product.info.price),
              quantity: product.quantity,
            });
          }
        })
      );

      dispatch(
        initCheckoutItem({
          checkoutItems: Object.entries(checkoutItems).map((items) => ({
            pharmacyId: parseInt(items[0]),
            products: items[1],
          })),
        })
      );
    }
  }, [state.address]);

  useEffect(() => {
    if (data) {
      data.forEach((address) => {
        if (address.is_active) {
          dispatch(setAddress({ address }));
        }
      });
    }
  }, [data, dispatch]);

  const loadComponent = () => {
    if (isLoading) {
      return <AddressSkeleton />;
    }

    const isEmpty = data?.length === 0;
    if (error || isEmpty) {
      return (
        <div className="w-full flex justify-center items-center my-8">
          <Badge className="w-full container bg-white hover:bg-white py-4 text-black font-normal flex px-8 gap-6 mx-auto border border-zinc-500 border-opacity-20 items-center justify-center ">
            <img src={addressImg} alt="Not Found" className="max-w-[25%]" />
            <div className="flex flex-col gap-2">
              <h2 className="font-bold text-primarypink text-xl">
                Alamat Tidak Bisa Ditemukan!
              </h2>
              <Button
                className="bg-primarypink text-white border border-transparent p-4 rounded-md w-max hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out text-sm"
                onClick={() => navigate("/profile/address")}
              >
                Tambah Alamat Dulu Yuk!
              </Button>
            </div>
          </Badge>
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center items-start">
        <div className="w-full container">
          <Badge className="w-full bg-white hover:bg-white px-8 py-4 text-black font-normal flex flex-col gap-6 mx-auto border border-zinc-500 border-opacity-20 items-start">
            <h1 className="text-zinc-600 font-bold text-2xl">
              Alamat Pengiriman
            </h1>

            {state.address ? (
              <>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-2 items-center">
                    <IconMapPinFilled className="text-primarypink size-6" />
                    <p className="font-medium text-base">
                      {state.address?.contact_name}
                    </p>
                  </div>
                </div>
                <p className="text-base text-black ">
                  {state.address?.address}, {state.address?.district},{" "}
                  {state.address?.sub_district}, {state.address?.city},{" "}
                  {state.address?.province},{" "}
                  {state.address?.contact_phone_number}
                </p>
              </>
            ) : (
              <div className="w-full flex justify-center items-center my-8">
                <img src={addressImg} alt="Not Found" className="max-w-[25%]" />
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-primarypink text-xl">
                    Belum ada alamat aktif, pilih alamat dulu yuk!
                  </h2>
                </div>
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primarypink text-white border border-transparent p-4 rounded-md w-max hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out text-sm">
                  Ganti Alamat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[75%] md:max-w-[50%] pb-12">
                <DialogHeader>
                  <DialogTitle>
                    <h4 className="text-3xl font-bold text-center mb-8">
                      Daftar Alamat
                    </h4>
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className="overflow-y-auto max-h-[70vh] w-full">
                  <div className="w-full flex flex-col gap-8">
                    {isLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, idx) => <AddressSkeleton key={idx + 1} />)
                      : data?.map((item) => (
                          <Badge
                            key={item.id}
                            className={cn(
                              `relative w-full grid grid-cols-[13fr_2fr]  bg-white hover:bg-white px-8 py-4 text-black font-normal mx-auto items-start  border-2 border-zinc-200`,
                              state.address?.id === item.id &&
                                "border-primarypink"
                            )}
                          >
                            <div className="w-2 h-8 bg-primarypink rounded-lg absolute -left-1 top-[8%]"></div>
                            <div className="flex flex-col gap-2">
                              <p className="font-medium text-base">
                                {item.contact_name}
                              </p>
                              <p className="text-base">
                                {item.contact_phone_number}
                              </p>
                              <p className="text-base text-black ">
                                {item.address}, {item.district},{" "}
                                {item.sub_district}, {item.city},{" "}
                                {item.province}
                              </p>
                              {item.latitude && item.longitude && (
                                <div className="flex gap-2 items-center">
                                  <IconMapPinFilled className="text-primarypink" />
                                  <p className="text-base text-primarypink font-medium ">
                                    Sudah Pinpoint
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex h-full w-full items-center justify-center">
                              {state.address?.id === item.id ? (
                                <IconCheck className="text-primarypink size-8 cursor-default" />
                              ) : (
                                <DialogClose>
                                  <Button
                                    className="bg-primarypink text-white border border-transparent p-4 rounded-md w-max hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out text-sm px-8"
                                    onClick={() => handleChangeAddress(item)}
                                  >
                                    Pilih
                                  </Button>
                                </DialogClose>
                              )}
                            </div>
                          </Badge>
                        ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </Badge>
        </div>
      </div>
    );
  };

  return <>{loadComponent()}</>;
};

export default UserAddress;
