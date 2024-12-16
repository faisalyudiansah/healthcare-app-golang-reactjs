import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { PharmacyDetail } from '@/models/Pharmacies';
import { AppDispatch, RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PharmaciesDataWithActions } from '../Pharmacies';
import { selectedPharmacyStore } from '@/store/pharmacies/pharmaciesSlice';
import { RxCross1 } from 'react-icons/rx';
import { setShowUpdatePharmaciesModal } from '@/store/modals/modalsSlice';
import CreatePharmacyForm from '@/components/organisms/PharmacyForm';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';

const UpdatePharmacies = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedPharmacyID = useSelector((state: RootState) =>
    selectedPharmacyStore(state),
  );

  const [userId, setUserId] = useState<number | null>();

  const user = useAuthUser<IUser>();
  const role = user?.role === 'admin' ? 'admin' : 'pharmacists';

  const pageWidth = role === 'admin' ? 'w-[650px]' : 'w-[70vw]';

  const { fetchData, data, loading, error } = useAxios<
    IBaseResponse<PharmacyDetail>
  >(`/${role}/pharmacies/${selectedPharmacyID}`);

  const [dataWithActions, setDataWithActions] =
    useState<PharmaciesDataWithActions | null>();

  useEffect(() => {
    fetchData({});
  }, [selectedPharmacyID]);

  return (
    <div
      className={`relative bg-white ${pageWidth} h-[90%] max-h-[840px] overflow-y-scroll pt-10 flex flex-col justify-start items-center rounded-xl`}
    >
      <div className="text-2xl font-medium  self-center">Update Pharmacies</div>

      {/* CLOSE BTN */}
      {role === 'admin' && (
        <div
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => dispatch(setShowUpdatePharmaciesModal(false))}
        >
          <RxCross1 className="size-7 text-slate-500" />
        </div>
      )}

      <CreatePharmacyForm
        existingData={data}
        setModalAction={setShowUpdatePharmaciesModal}
      />
    </div>
  );
};
export default UpdatePharmacies;
