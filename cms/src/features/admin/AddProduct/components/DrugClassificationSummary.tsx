import React from 'react';
import { TWCenterize } from '@/utils/UI/TWStrings';

const DrugClassificationSummary: React.FC<{ drugClf: number }> = ({
  drugClf,
}) => {
  let imgString = '/assets/images/drug-icons';
  let drugClfString = '';
  switch (drugClf) {
    case 1:
      imgString += '/obat-bebas.png';
      drugClfString = 'Obat Bebas';
      break;
    case 2:
      imgString += '/obat-bebas-terbatas.png';
      drugClfString = 'Obat Bebas Terbatas';
      break;
    case 3:
      imgString += '/obat-keras.png';
      drugClfString = 'Obat Keras';
      break;
    case 4:
      imgString += '/obat-narkotika.png';
      drugClfString = 'Non Obat';
      break;
  }

  return (
    <div className={`${TWCenterize} gap-3 bg-slate-100 rounded-full px-4 py-1`}>
      <img className="size-4" src={imgString} alt="" />
      <div>{drugClfString}</div>
    </div>
  );
};

export default DrugClassificationSummary;
