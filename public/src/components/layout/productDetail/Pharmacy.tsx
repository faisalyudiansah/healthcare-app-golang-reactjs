import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { AppDispatch } from "@/stores";
import { changeDetail } from "@/stores/slices/productDetailSlices";
import { IconArrowRightBar } from "@tabler/icons-react";
import { useDispatch } from "react-redux";

type Props = {
  pharmacyProductId?: number;
  id?: number;
  name?: string;
  address?: string;
  city?: string;
  stock?: number;
  price?: number | string;
  pharmacist?: {
    id: number;
    name: string;
    sipa_number: string;
  };
  loading?: boolean;
};

const PharmacySkeleton: React.FC = () => {
  return (
    <div className="w-full bg-gray-100 rounded-md flex flex-col gap-6 p-4">
      <div className="w-full bg-gray-300 h-20 rounded-md shadow-lg border relative animate-pulse"></div>
      <div className="w-full bg-gray-300 h-16 rounded-md shadow-lg border relative animate-pulse"></div>
      <div className="w-full bg-gray-300 h-12 rounded-md shadow-lg border relative animate-pulse"></div>
    </div>
  );
};

const Pharmacy: React.FC<Props> = ({
  pharmacyProductId,
  id,
  name,
  address,
  city,
  stock,
  price,
  pharmacist,
  loading,
}) => {
  const dispatch: AppDispatch = useDispatch();

  const handleChoosePharmacy = () => {
    dispatch(
      changeDetail({
        price: price,
        stock: stock,
        pharmacyProductId: pharmacyProductId,
        pharmacy: {
          id,
          name,
          address,
          pharmacist,
        },
      })
    );
  };

  if (loading) return <PharmacySkeleton />;

  return (
    <div className="w-full py-10 flex flex-col gap-4 border border-primarypink border-opacity-15 shadow-sm rounded-lg px-4">
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="">
            <p className="text-sm md:text-xl font-bold">{name}</p>
            <p className="text-sm md:text-xl">
              {address} <br />
              {city}
            </p>
          </div>

          <div className="text-primarypink border border-primarypink rounded-md text-center h-max py-1 px-6 md:px-12 text-nowrap">
            Stok {stock}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <img
              src="https://www.farmaku.com/assets/svg/original-product.png"
              alt="Original"
              className="h-6"
            />
            <p className="text-sm">Dijamin Ori</p>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="https://www.farmaku.com/assets/svg/guarantee.png"
              alt="Garansi"
              className="h-6"
            />
            <p className="text-sm">Garansi 7 Hari</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="">
            <p className="font-semibold text-primarypink text-lg">
              {formatPrice(price)}
            </p>
          </div>
          <div className="">
            <DialogClose asChild>
              <Button
                className="bg-primarypink text-sm flex gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink"
                onClick={handleChoosePharmacy}
              >
                <IconArrowRightBar /> Pilih Apotek
              </Button>
            </DialogClose>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
