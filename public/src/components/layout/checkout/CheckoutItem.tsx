import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { PharmacyInfo, ProductInfo } from "@/stores/slices/cartSlices";
import React, { useEffect, useState } from "react";
import Logistic from "./Logistic";
import { useDebounce } from "@uidotdev/usehooks";
import { useDispatch } from "react-redux";
import { addDescription } from "@/stores/slices/checkoutSlices";

type Props = {
  orderIndex: number;
  item: {
    checked: boolean;
    info: PharmacyInfo;
    products: {
      [productId: number]: {
        checked: boolean;
        quantity: number;
        info: ProductInfo;
      };
    };
  };
  checkedProducts: {
    checked: boolean;
    quantity: number;
    info: ProductInfo;
  }[];
};

const CheckoutItem: React.FC<Props> = ({
  orderIndex,
  item,
  checkedProducts,
}) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState("");
  const debouncedDescription = useDebounce(description, 500);

  const handleChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    if (debouncedDescription) {
      dispatch(
        addDescription({
          pharmacyId: item.info.id,
          description: debouncedDescription,
        })
      );
    }
  }, [debouncedDescription]);

  return (
    <Badge
      key={orderIndex}
      className="w-full container bg-white hover:bg-white py-4 text-black font-normal flex flex-col px-8 gap-6 mx-auto border items-start border-zinc-500 border-opacity-20"
    >
      <h2 className="text-zinc-600 font-medium text-lg">
        Pesanan {orderIndex}
      </h2>

      <div className="flex gap-4">
        <img
          src={item.info.partner.logo_url}
          alt={item.info.name}
          className="object-contain size-8"
        />
        <p className="font-bold text-sm md:text-base">{item.info.name}</p>
      </div>

      <div className="w-full flex flex-col gap-8">
        {checkedProducts.map((product) => (
          <div
            key={product.info.id}
            className="h-full w-full flex justify-between"
          >
            <div className="w-full flex gap-4">
              <img
                src={product.info.products.image_url}
                alt={product.info.products.name}
                className="object-contain size-24 rounded-lg border border-opacity-20 border-zinc-500"
              />
              <p className="text-md md:text-base text-wrap">
                {product.info.products.name}
              </p>
            </div>
            <div className="w-full h-full flex justify-end">
              <p className="font-bold text-md md:text-lg">
                {product.quantity} x {formatPrice(product.info.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Input
        type="text"
        placeholder="Description"
        className="border-primarypink focus-visible:border-zinc-500 border-opacity-60 focus-visible:border-opacity-40 focus-visible:ring-transparent placeholder:font-medium"
        onChange={handleChangeDescription}
      />

      <Logistic pharmacy={item.info} products={checkedProducts} />
    </Badge>
  );
};

export default CheckoutItem;
