import React, { ReactNode } from 'react';
import ObatBebasImg from '@/assets/images/drug-icons/obat-bebas.png';
import ObatKerasImg from '@/assets/images/drug-icons/obat-keras.png';
import ObatBebasTerbatasImg from '@/assets/images/drug-icons/obat-bebas-terbatas.png';

const ProductClfDisplay: React.FC<{ id: number }> = ({ id }) => {
  let imageNode: ReactNode;
  let text: string;
  switch (id) {
    case 1:
      imageNode = <img className="size-5" src={ObatBebasImg} alt="" />;
      text = 'Obat Bebas';
      break;
    case 2:
      imageNode = <img className="size-5" src={ObatKerasImg} alt="" />;
      text = 'Obat Keras';
      break;
    case 3:
      imageNode = <img className="size-5" src={ObatBebasTerbatasImg} alt="" />;
      text = 'Obat Bebas Terbatas';
      break;
    default:
      imageNode = <></>;
      text = 'Non Obat';
  }
  return (
    <div className="flex justify-start items-center gap-2">
      {imageNode}
      <div>{text}</div>
    </div>
  );
};

export default ProductClfDisplay;
