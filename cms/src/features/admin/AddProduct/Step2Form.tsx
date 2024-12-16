import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  getCurrentCategories,
  getFormCreateProduct,
  redoProgress,
  updateCreateProductForm,
  updateProgress,
} from '@/store/createProduct/createProductSlice';
import CatgSearcher from './CatgSearcher';
import DrugClfRadioBtn from '@/components/ui/DrugClfRadioBtn';
import { useEffect, useState } from 'react';
import drugClassifications from '@/models/DrugClassifications';

const Step2Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currCategories = useSelector(getCurrentCategories);
  const currCreateProductForm = useSelector(getFormCreateProduct);

  const [currentDrugClf, setCurrentDrugClf] = useState('');
  useEffect(() => {
    if (currCreateProductForm.classification) {
      setCurrentDrugClf(
        drugClassifications[currCreateProductForm.classification - 1], // prefill
      );
    }
  }, [currCreateProductForm]);

  const [showDrugClfErr, setShowDrugClfErr] = useState(false);
  const [showCtgErr, setShowCtgErr] = useState(false);
  const [showDuplicateCtgErr, setShowDuplicateCtgErr] = useState(false);

  useEffect(() => {
    if (currentDrugClf) {
      setShowDrugClfErr(false);
    }

    if (!currCategories) return;

    // show error on any empty categories
    let shouldShowCtgErr = false;
    for (const ctg of currCategories) {
      if (!ctg.id) {
        shouldShowCtgErr = true;
        return;
      }
    }
    setShowCtgErr(shouldShowCtgErr);
    setShowDuplicateCtgErr(false);
  }, [currentDrugClf, currCategories]);

  // BOTTOM BTNS
  const handleBack = () => {
    dispatch(redoProgress({ step: 2, status: 'none' }));
  };
  const handleNext = () => {
    if (!currCategories) return;
    if (!currCategories[0].id) {
      setShowCtgErr(true);
      return;
    }

    for (let i = 0; i < currCategories.length; i++) {
      for (let j = i + 1; j < currCategories.length; j++) {
        if (currCategories[i].id === currCategories[j].id) {
          setShowDuplicateCtgErr(true);
          return;
        }
      }
    }

    if (!currentDrugClf) {
      setShowDrugClfErr(true);
      return;
    }

    // proceed to step 3
    dispatch((d) => {
      d(updateProgress({ step: 2, status: 'completed' }));
      d(
        updateCreateProductForm({
          classification: drugClassifications.indexOf(currentDrugClf) + 1,
        }),
      );
    });
  };

  return (
    <>
      {/* MARK: DRUG CLF RADIO BUTTONS */}
      <div className="sub-form-heading mt-6 mb-2">Drug Classification</div>
      <div className="w-full flex justify-center items-center gap-12 mt-2 mb-2">
        {drugClassifications.map((drugClf) => (
          <DrugClfRadioBtn
            drugClfName={drugClf}
            radioName="drugClfs"
            key={drugClf}
            drugClfState={{ currentDrugClf, setCurrentDrugClf }}
          />
        ))}
      </div>
      {showDrugClfErr && (
        <div className="text-invalid-field mt-6 mb-2">
          Please choose a drug classification
        </div>
      )}

      {/* MARK: CATEGORIES SEARCHER */}
      <div className="sub-form-heading mt-8 mb-2">Categories</div>
      <div className="w-full h-full flex flex-col justify-start items-start gap-4">
        {currCategories?.map((c, idx) => (
          <CatgSearcher key={idx} explicitKey={idx} ctgId={c.id} />
        ))}
      </div>
      {showCtgErr && (
        <div className="text-invalid-field mt-2 mb-2">
          Please insert at least one category
        </div>
      )}
      {showDuplicateCtgErr && (
        <div className="text-invalid-field mt-2 mb-2">
          Please do not insert the same Product Category again
        </div>
      )}

      {/* BUTTONS */}
      <div className="self-end mt-16 flex justify-between items-center gap-4 mb-[31px]">
        <button className="form-pessimist-btn" onClick={handleBack}>
          BACK
        </button>
        <button className="form-optimist-btn" onClick={handleNext}>
          NEXT
        </button>
      </div>
    </>
  );
};

export default Step2Form;
