import React from 'react';
import { NormalizeSnakeCase } from '@/utils/StringFormatter';

const DrugClfRadioBtn: React.FC<{
  radioName: string;
  drugClfName: string;
  // setStateHandler: React.Dispatch<React.SetStateAction<string>>;
  drugClfState: {
    currentDrugClf: string;
    setCurrentDrugClf: React.Dispatch<React.SetStateAction<string>>;
  };
}> = ({ radioName, drugClfName, drugClfState }) => {
  let drugTypeImg: string;

  const rootImg = '/assets/images/drug-icons';
  switch (drugClfName) {
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
  return (
    <label className="label_drugclf_radiobtn" htmlFor={drugClfName}>
      <input
        id={drugClfName}
        type="radio"
        name={radioName}
        onChange={() => {
          drugClfState.setCurrentDrugClf(drugClfName);
        }}
        checked={drugClfName === drugClfState.currentDrugClf}
      />
      <span>
        <img className="size-5" src={drugTypeImg} alt="" />
        {NormalizeSnakeCase(drugClfName)}
      </span>
    </label>
  );
};

export default DrugClfRadioBtn;
