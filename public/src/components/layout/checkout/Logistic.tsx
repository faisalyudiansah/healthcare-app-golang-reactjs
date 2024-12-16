import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PharmacyInfo, ProductInfo } from "@/stores/slices/cartSlices";
import { addShipCost, ShippingOption } from "@/stores/slices/checkoutSlices";
import { SelectLabel } from "@radix-ui/react-select";
import { IconPackageExport } from "@tabler/icons-react";
import axios from "axios";
import { ShippingRequest } from "../../../stores/slices/checkoutSlices/index";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores";
import {
  capitalizeFirstLetter,
  formatEstimation,
  formatPrice,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const fetchShippingCost = async (
  payload: ShippingRequest,
  accessToken: string
): Promise<ShippingOption[]> => {
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/pharmacies/cost`,
    payload,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.data;
};

type Props = {
  pharmacy: PharmacyInfo;
  products: { checked: boolean; quantity: number; info: ProductInfo }[];
};

const Logistic: React.FC<Props> = ({ pharmacy, products }) => {
  const [cookie] = useCookies(["access_token"]);
  const state = useSelector((state: RootState) => state.checkout);
  const dispatch = useDispatch();
  const totalWeight = products
    ?.map(
      (product) => product.quantity * parseFloat(product.info.products.weight)
    )
    .reduce((acc, weight) => acc + weight, 0);
  const totalWeightKg = (totalWeight / 1000).toFixed(2);
  const { isLoading, data, error } = useQuery({
    queryKey: ["pharmacyLogistic", state.address],
    queryFn: () =>
      fetchShippingCost(
        {
          pharmacy_id: pharmacy.id,
          address_id: state.address?.id,
          destination: pharmacy.city_id,
          origin: state.address?.city_id,
          weight: parseInt(totalWeight.toFixed(0)),
        },
        cookie.access_token
      ),
  });

  const handleChangeShipping = (value: string) => {
    const [, cost] = value.split("-");

    dispatch(addShipCost({ pharmacyId: pharmacy.id, cost: parseFloat(cost) }));
  };

  return (
    <Select onValueChange={handleChangeShipping}>
      <SelectTrigger className="h-max w-full border-primarypink border-opacity-40 text-md md:text-base font-bold p-6 rounded-lg">
        <SelectValue placeholder="Pilih Pengiriman" />
      </SelectTrigger>
      <SelectContent className={cn("border-primarypink", isLoading && "h-60")}>
        <SelectGroup>
          <SelectLabel className="flex text-zinc-500 border border-zinc-500 px-4 rounded-lg gap-4 py-1">
            <IconPackageExport />
            <p>
              Dikirim dari {pharmacy.city} • Berat {totalWeightKg} kg
            </p>
          </SelectLabel>

          {error && (
            <SelectItem
              value="error"
              disabled
              className="data-[disabled]:opacity-100"
            >
              <p className="text-primarypink font-bold text-xl">
                Belum Tersedia Opsi Pengiriman
              </p>
            </SelectItem>
          )}

          {isLoading && (
            <SelectItem value="loading" disabled className="w-full p-0">
              <div className="flex items-center justify-between w-full p-2">
                <div className="flex flex-col w-full gap-2">
                  <div className="h-12 absolute top-4 left-2 right-2 bg-gray-300 rounded-md animate-pulse"></div>
                  <div className="h-12 absolute top-20 left-2 right-2 bg-gray-300 rounded-md animate-pulse"></div>
                  <div className="h-12 absolute top-36 left-2 right-2 bg-gray-300 rounded-md animate-pulse"></div>
                </div>
              </div>
            </SelectItem>
          )}

          {data?.map((item, idx) => (
            <SelectItem
              key={idx + 1}
              value={`${item.code}/${item.service}-${item.ship_cost}`}
            >
              <div className="flex items-center gap-4 justify-between">
                <div className="flex flex-col">
                  <p className="font-bold text-start">
                    {capitalizeFirstLetter(item.code)} • {item.service}
                  </p>
                  <p className=" text-zinc-500 font-normal">
                    Estimasi tiba {formatEstimation(item.estimation)}
                  </p>
                  <p className="font-bold text-base text-start">
                    {formatPrice(item.ship_cost)}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Logistic;
