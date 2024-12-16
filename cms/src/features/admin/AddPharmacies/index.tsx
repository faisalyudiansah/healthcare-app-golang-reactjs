import CreatePharmacyForm from '@/components/organisms/PharmacyForm';
import { AppDispatch } from '@/store';
import { setShowCreatePharmaciesModal } from '@/store/modals/modalsSlice';
import { RxCross1 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';

const Addpharmacies = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div
      className={`relative bg-white w-[650px] h-[90%] max-h-[840px] overflow-y-scroll pt-10 flex flex-col justify-start items-center rounded-xl`}
    >
      <div className="text-2xl font-medium  self-center">Create Pharmacies</div>

      {/* CLOSE BTN */}
      <div
        className="absolute right-4 top-4 cursor-pointer"
        onClick={() => dispatch(setShowCreatePharmaciesModal(false))}
      >
        <RxCross1 className="size-7 text-slate-500" />
      </div>

      <CreatePharmacyForm setModalAction={setShowCreatePharmaciesModal} />
    </div>
  );
};

export default Addpharmacies;
