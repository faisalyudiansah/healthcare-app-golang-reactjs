import React, { ReactNode } from 'react';
import ObatBebasImg from '@/assets/images/drug-icons/obat-bebas.png';
import ObatKerasImg from '@/assets/images/drug-icons/obat-keras.png';
import ObatBebasTerbatasImg from '@/assets/images/drug-icons/obat-bebas-terbatas.png';
import drugClassifications from '@/models/DrugClassifications';
import { NormalizeSnakeCase } from '@/utils/StringFormatter';

const ProductClfUpdateCheckbox: React.FC<{
  id: number;
  chosenId: number;
  onChanceCb: (id: number) => void;
}> = ({ id, chosenId, onChanceCb }) => {
  let imageNode: ReactNode;
  switch (id) {
    case 1:
      imageNode = <img className="size-4" src={ObatBebasImg} alt="" />;
      break;
    case 2:
      imageNode = <img className="size-4" src={ObatKerasImg} alt="" />;
      break;
    case 3:
      imageNode = <img className="size-4" src={ObatBebasTerbatasImg} alt="" />;
      break;
    default:
      imageNode = <></>;
  }
  return (
    <label
      className={`label_drugclf_checkboxbtn`}
      htmlFor={drugClassifications[id - 1]}
    >
      <input
        type="radio"
        checked={chosenId === id}
        id={drugClassifications[id - 1]}
        name="update-product-clf"
        onChange={() => {
          onChanceCb(id);
        }}
      />
      <span>
        {imageNode}
        <div>{NormalizeSnakeCase(drugClassifications[id - 1])}</div>
      </span>
    </label>
  );
};

export default ProductClfUpdateCheckbox;
