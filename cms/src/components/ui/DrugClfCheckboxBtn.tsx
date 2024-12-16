import React from 'react';
import { NormalizeSnakeCase } from '@/utils/StringFormatter';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  removeAnItemFromFilterParams,
  updateFilterParamsOnArray,
} from '@/store/filterProduct/filterProductsSlice';
import { INameAndId } from '@/models/Products';

const DrugClfCheckboxBtn: React.FC<{
  onKeyName: 'product-classification';
  checkboxName: string;
  drugClfItem: INameAndId;
}> = ({ onKeyName, checkboxName, drugClfItem }) => {
  const rootImg = '/assets/images/drug-icons';
  let drugTypeImg: string;
  switch (drugClfItem.name) {
    case 'obat-bebas':
      drugTypeImg = rootImg + '/obat-bebas.png';
      break;
    case 'obat-bebas-terbatas':
      drugTypeImg = rootImg + '/obat-bebas-terbatas.png';
      break;
    case 'obat-keras':
      drugTypeImg = rootImg + '/obat-keras.png';
      break;
    default:
      drugTypeImg = rootImg + '/obat-narkotika.png';
  }

  const dispatch = useDispatch<AppDispatch>();
  const handleOnCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      dispatch(
        updateFilterParamsOnArray({
          keyName: onKeyName,
          item: drugClfItem,
        }),
      );
    } else {
      dispatch(
        removeAnItemFromFilterParams({
          keyName: onKeyName,
          item: drugClfItem,
        }),
      );
    }
  };

  return (
    <label className={`label_drugclf_checkboxbtn`} htmlFor={drugClfItem.name}>
      <input
        type="checkbox"
        id={drugClfItem.name}
        name={checkboxName}
        onChange={handleOnCheck}
      />
      <span>
        <img
          className={`size-4 ${
            drugClfItem.name === 'obat-bebas-terbatas' && 'ml-[8px]'
          }`}
          src={drugTypeImg}
          alt=""
        />
        <div>{NormalizeSnakeCase(drugClfItem.name)}</div>
      </span>
    </label>
  );
};

export default DrugClfCheckboxBtn;
