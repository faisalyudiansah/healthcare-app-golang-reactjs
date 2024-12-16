import Product from "./Product";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PharmacyProductData,
  togglePharmacyCheck,
  toggleSelectAll,
} from "@/stores/slices/cartSlices";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores/index";

type Props = {
  data?: PharmacyProductData;
};

const PharmacyProduct: React.FC<Props> = ({ data }) => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const handlePharmacyChecked = () => {
    dispatch(togglePharmacyCheck({ pharmacyId: data?.pharmacy_info.id || 0 }));
    dispatch(toggleSelectAll())
  };

  const [pharmacyChecked, setPharmacyChecked] = useState(false);
  useEffect(() => {
    if (data && cart.pharmacies) {
      if (data.pharmacy_info.id in cart.pharmacies) {
        setPharmacyChecked(cart.pharmacies[data.pharmacy_info.id].checked);
      }
    }
  }, [data, cart.pharmacies]);

  return (
    <Badge className="w-full bg-inherit hover:bg-inherit py-4 text-foreground font-normal flex flex-col gap-6 mx-auto border">
      <div className="flex gap-4 items-center mr-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={pharmacyChecked}
            onClick={handlePharmacyChecked}
            className="border-primarypink checked:bg-primarypink data-[state=checked]:bg-primarypink data-[state=checked]:text-white transition-all ease-in-out size-6 text-lg"
          />
        </div>
        <div className="flex gap-3 items-center">
          <img
            src={data?.pharmacy_info.partner.logo_url}
            alt="Partner Logo"
            className="object-contain size-8"
          />
          <p className="font-bold text-sm md:text-base">
            {data?.pharmacy_info.name}
          </p>
        </div>
      </div>

      {data?.products_info.map((product) => (
        <Product
          key={product.id}
          id={product.id}
          pharmacyId={data.pharmacy_info.id}
          imageUrl={product.products.image_url}
          name={product.products.name}
          price={product.price}
          cartQuantity={product.quantity_in_cart}
          stockQuantity={product.stock_quantity}
        />
      ))}
    </Badge>
  );
};

export default PharmacyProduct;
