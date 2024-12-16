import { IFilteredProduct } from '@/models/Products';
import { TWColCenterize } from '@/utils/UI/TWStrings';
import React, { ReactNode } from 'react';
import obatBebasImg from '@/assets/images/drug-icons/obat-bebas.png';
import obatBebasTerbatasImg from '@/assets/images/drug-icons/obat-bebas-terbatas.png';
import obatKerasImg from '@/assets/images/drug-icons/obat-keras.png';
import { toRpFormattedShort } from '@/utils/CurrencyFormatter';

const ProductCard: React.FC<{ product: IFilteredProduct }> = ({ product }) => {
  let drugTypeImg: ReactNode;
  switch (product.product_classification.id) {
    case 1:
      drugTypeImg = (
        <img
          className="absolute right-2 bottom-3 size-6"
          src={obatBebasImg}
          alt=""
        />
      );
      break;
    case 2:
      drugTypeImg = (
        <img
          className="absolute right-2 bottom-3 size-6"
          src={obatKerasImg}
          alt=""
        />
      );
      break;
    case 3:
      drugTypeImg = (
        <img
          className="absolute right-2 bottom-3 size-6"
          src={obatBebasTerbatasImg}
          alt=""
        />
      );
      break;
    default:
      drugTypeImg = (
        <div className="absolute right-2 bottom-3 size-6">
          <div className="pl-2 bg-blue-200 text-blue-700"></div>
        </div>
      );
      break;
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[300px]">
      {/* MARK: IMAGE CONTAINER */}
      <div className={`h-[60%] ${TWColCenterize} relative`}>
        <img src={product.thumbnail_url} className="h-full" alt="" />
        {drugTypeImg}
      </div>

      {/* MARK: content */}
      <div className="px-3">
        <div className="text-slate-700 font-semibold line-clamp-2">
          {product.name}
        </div>
        <div className="text-slate-400 font-normal text-sm">
          {`Per ${product.selling_unit.toTitle()}`}
        </div>
        <div className="text-slate-400 font-semibold text-base mt-3">
          Sold Amount:{' '}
          <span className="font-normal text-black">{product.sold_amount}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
