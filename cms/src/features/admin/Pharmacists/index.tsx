import { ReactNode, useEffect, useRef, useState } from 'react';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IFilteredUser } from '@/models/Users';
import {
  BrandPrimary,
  TWCenterize,
  TWColCenterize,
} from '@/utils/UI/TWStrings';
import { BsPencilSquare } from 'react-icons/bs';
import { FaTrashAlt } from 'react-icons/fa';
import { Replace62Code, ToLocaleDateFormatted } from '@/utils/StringFormatter';
import { FaCheck } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';
import { updateIsEditing } from './pharmacists_utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { showToastAsync } from '@/store/toast/toastSlice';
import axios from 'axios';
import { handleKeyDownInvalidNumber } from '@/utils/HandleKeys';
import {
  setShowCreatePharmacistModal,
  setShowDeletePharmacistConfirmationModal,
} from '@/store/modals/modalsSlice';
import {
  getDeletionState,
  setDeletionId,
} from '@/store/deletionSlice/deletionSlice';
import {
  TiArrowUnsorted,
  TiArrowSortedUp,
  TiArrowSortedDown,
} from 'react-icons/ti';
import PharmacistsFilter from './PharmacistsFilter';
import { CgMathPlus } from 'react-icons/cg';
import { getFilterPharmacists } from '@/store/filterPharmacists/filterPharmacistsSlice';
import PharmacistsFilterCell from './PharmacistsFilterCell';
import {
  IFilterPharmacistsText,
  IFilterPharmacistsYOERange,
} from '@/store/filterPharmacists/filterPharmacistsType';
import { OrbitProgress } from 'react-loading-indicators';
import PaginationButtons from '@/components/ui/PaginationButtons';

export type PharmacistDataWithActions = IFilteredUser & {
  isEditing: boolean;
  isLoading: boolean;
};

const Pharmacists = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currFilter = useSelector(getFilterPharmacists);
  const deletionState = useSelector(getDeletionState);

  const [userId, setUserId] = useState<number | null>();

  const [pageNumber, setPageNumber] = useState(1);
  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  const { fetchData, data, loading, error } =
    useAxios<IBaseResponse<IFilteredUser[]>>('/admin/pharmacists');

  const [sortByCreatedAt, setSortByCreatedAt] = useState<
    'asc' | 'desc' | undefined
  >();
  const [sortByName, setSortByName] = useState<'asc' | 'desc' | undefined>();
  const [sortByAssigned, setSortByAssigned] = useState<
    'asc' | 'desc' | undefined
  >();

  const handleSortAssigned = () => {
    if (loading) return;

    if (!sortByAssigned) {
      setSortByAssigned('desc');
      return;
    }
    setSortByAssigned((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };
  const handleSortCreatedAt = () => {
    if (loading) return;

    if (!sortByCreatedAt) {
      setSortByCreatedAt('desc');
      return;
    }
    setSortByCreatedAt((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };
  const handleSortByName = () => {
    if (loading) return;

    if (!sortByName) {
      setSortByName('desc');
      return;
    }
    setSortByName((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const [dataWithActions, setDataWithActions] = useState<
    PharmacistDataWithActions[] | null
  >();

  // MARK: EDITINGS
  const whatsAppRef = useRef<HTMLInputElement>(null);
  const yoeRef = useRef<HTMLInputElement>(null);

  const handleClickEditBtn = (index: number) => {
    return () => {
      if (!dataWithActions) return;

      for (const action of dataWithActions) {
        if (action.isEditing) {
          dispatch(
            showToastAsync({
              message: 'Please save or cancel current Edit action first',
              type: 'warning',
            }),
          );
          return;
        }
      }

      updateIsEditing(setDataWithActions, index, true);
    };
  };

  const handleClickSaveBtn = (userId: number, index: number) => () => {
    if (!whatsAppRef.current) return;
    if (!yoeRef.current) return;
    if (!dataWithActions) return;

    const users = dataWithActions.filter((d) => d.id === userId);
    if (users.length === 0) return;
    const user = users[0];

    const waNum = whatsAppRef.current.value;
    const yoe = yoeRef.current.value;

    if (!waNum || !yoe) {
      dispatch(
        showToastAsync({
          message:
            'Please fill both valid WhatsApp Number & Years of Experience',
          type: 'warning',
        }),
      );
      return;
    }

    // WA Number
    if (!/^(\+62|62|08)[0-9]{8,12}$/.test(waNum)) {
      dispatch(
        showToastAsync({
          message: 'Please enter a valid phone number',
          type: 'warning',
        }),
      );
      return;
    }

    // YOE
    if (!/^[0-9]+$/.test(yoe)) {
      dispatch(
        showToastAsync({
          message: 'Please enter number only',
          type: 'warning',
        }),
      );
      return;
    }

    if (Number(yoe) < 0) {
      dispatch(
        showToastAsync({
          message: 'Please enter number larger than 0',
          type: 'warning',
        }),
      );
      return;
    }

    if (Number(yoe) > 70) {
      dispatch(
        showToastAsync({
          message: 'Please enter number no larger than 70',
          type: 'warning',
        }),
      );
      return;
    }

    if (
      user.years_of_experience === Number(yoe) &&
      user.whatsapp_number === waNum
    ) {
      dispatch(
        showToastAsync({
          message: 'You are not changing anything...',
          type: 'warning',
        }),
      );
      return;
    }

    // PROCEED API CALL
    axios
      .put(`/admin/pharmacists/${userId}`, {
        whatsapp_number: waNum,
        years_of_experience: Number(yoe),
      })
      .then(() => {
        setUserId(userId);
      })
      .catch((e) => console.log('ERROR ON (PUT) /admin/pharmacists/:id ', e))
      .finally(() => {
        updateIsEditing(setDataWithActions, index, false);
      });
  };

  const handleClickDeleteBtn = (userId: number, index: number) => {
    return async () => {
      if (!dataWithActions) return;

      for (const action of dataWithActions) {
        if (action.isEditing) {
          dispatch(
            showToastAsync({
              message: 'Please save or cancel current editing action first',
              type: 'warning',
            }),
          );
          return;
        }
      }

      // MARK: GET ASSIGNED PHARMACISTS
      if (!dataWithActions) return;
      console.log(dataWithActions[index].is_assigned);
      if (dataWithActions[index].is_assigned) {
        // abort on an assigned pharmacist
        dispatch(
          showToastAsync({
            message: "Can't delete an already assigned Pharmacist",
            type: 'warning',
          }),
        );
        return;
      }

      // MARK: PROCEED DELETE PHARMACIST
      dispatch(setShowDeletePharmacistConfirmationModal(true));
      dispatch(setDeletionId(userId)); // proceed to <DeletePharmacistConfirmation />
    };
  };

  const handleClickCancelBtn = (index: number) => {
    return () => {
      updateIsEditing(setDataWithActions, index, false);
    };
  };

  const editOrDeleteNode = (userId: number, index: number): ReactNode => {
    return (
      <>
        <div
          className={`table-tools-icon relative ${TWCenterize} opacity-85 `}
          onClick={handleClickEditBtn(index)}
        >
          <BsPencilSquare className="size-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Edit
          </div>
        </div>

        <div
          className={`table-tools-icon relative ${TWCenterize} opacity-85`}
          onClick={handleClickDeleteBtn(userId, index)}
        >
          <FaTrashAlt className="size-5 text-red-700 hover:text-red-900 cursor-pointer" />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Delete
          </div>
        </div>
      </>
    );
  };
  const saveOrCancelNode = (userId: number, index: number): ReactNode => {
    return (
      <>
        <div
          className={`table-tools-icon relative ${TWCenterize} opacity-85`}
          onClick={handleClickSaveBtn(userId, index)}
        >
          <FaCheck className="size-5 text-green-500 hover:text-green-700 cursor-pointer" />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Save
          </div>
        </div>

        <div
          className={`table-tools-icon relative ${TWCenterize} opacity-85`}
          onClick={handleClickCancelBtn(index)}
        >
          <ImCross className="size-5 text-red-700 hover:text-red-900 cursor-pointer" />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Cancel
          </div>
        </div>
      </>
    );
  };

  // MARK: USEEFFECTS()

  // APPEND TO QUERYPARAMS
  useEffect(() => {
    for (const filter of currFilter) {
      if (filter.type === 'textfield') {
        const thisFilter = filter.value as IFilterPharmacistsText;
        if (thisFilter.name === 'email') {
          params.append('email', thisFilter.value);
        }

        if (thisFilter.name === 'name') {
          params.append('name', thisFilter.value);
        }

        if (thisFilter.name === 'sipa') {
          params.append('sipa', thisFilter.value);
        }

        if (thisFilter.name === 'whatsapp') {
          params.append('whatsapp', thisFilter.value);
        }
      } else if (filter.type === 'yoe') {
        const thisFilter = filter.value as IFilterPharmacistsYOERange;
        params.append('min-yoe', String(thisFilter.minYoe));
        params.append('max-yoe', String(thisFilter.maxYoe));
      }
    }

    // proceed to fetch again
    fetchData({ params });
  }, [currFilter, sortByCreatedAt, sortByName, sortByAssigned, pageNumber]);

  useEffect(() => {
    // reset sort if any filter changes
    setSortByCreatedAt(undefined);
    setSortByName(undefined);
  }, [currFilter]);

  useEffect(() => {
    if (sortByCreatedAt) {
      params.append('sort-by', 'date');
      params.append('sort', sortByCreatedAt);
    }
    if (sortByName) {
      params.append('sort-by', 'name');
      params.append('sort', sortByName);
    }
    if (sortByAssigned) {
      params.append('sort-by', 'assign');
      params.append('sort', sortByAssigned);
    }
  }, [sortByCreatedAt, sortByName, sortByAssigned]);

  useEffect(() => {
    // put raw data with additional states
    if (data) {
      setDataWithActions(
        data.data.map((d) => ({
          ...d,
          whatsapp_number: Replace62Code(d.whatsapp_number),
          isEditing: false,
          isLoading: false,
        })),
      );
    }
  }, [data]);

  // PREFILL
  useEffect(() => {
    if (!dataWithActions) return;

    dataWithActions.forEach((d) => {
      if (!whatsAppRef.current) return;
      if (!yoeRef.current) return;

      if (d.isEditing) {
        const waNum = d.whatsapp_number;

        if (waNum.includes('+62')) {
          whatsAppRef.current.value = Replace62Code(waNum);
        } else {
          whatsAppRef.current.value = d.whatsapp_number;
        }

        yoeRef.current.value = String(d.years_of_experience);
        return;
      }
    });
  }, [dataWithActions]);

  useEffect(() => {
    if (deletionState.refetchCounter > 0) {
      fetchData({ params });
    }
  }, [deletionState.refetchCounter]);

  useEffect(() => {
    setSortByName(undefined);
    setSortByCreatedAt(undefined);
  }, [pageNumber]);

  return (
    // MARK: DIV GELONDONGAN
    <div className="container w-full h-full px-10">
      <div className="mt-6 mb-4 flex justify-between items-center h-12">
        <div className="text-2xl font-semibold">Pharmacists</div>

        {/* MARK: +CREATE PHARMACIST */}
        <button
          type="button"
          className="add-cta-navlink"
          onClick={() => {
            dispatch(setShowCreatePharmacistModal(true));
          }}
        >
          <CgMathPlus />
          Add Pharmacist
        </button>
      </div>

      {/* MARK: FILTERS */}
      <div className="flex justify-start items-center gap-4">
        <PharmacistsFilter />

        {currFilter.map((d) => (
          <PharmacistsFilterCell object={d} key={JSON.stringify(d)} />
        ))}
      </div>

      {/* TABLE STARTS HERE */}
      {!loading && dataWithActions && dataWithActions.length > 0 ? (
        <div>
          <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2">
            <table className="w-full  text-left  text-slate-700 ">
              <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
                <tr>
                  <th scope="col" className="px-6">
                    Email
                  </th>
                  <th scope="col" className="">
                    WhatsApp
                  </th>

                  <th scope="col" className="px-6">
                    SIPA
                  </th>
                  {/* SORT NAME */}
                  <th scope="col" className="px-6" onClick={handleSortByName}>
                    <div className="flex justify-start items-center gap-3 cursor-pointer">
                      <div className="select-none">Name</div>
                      {!sortByName && <TiArrowUnsorted className="size-5" />}
                      {sortByName === 'asc' && (
                        <TiArrowSortedUp className="size-5" />
                      )}
                      {sortByName === 'desc' && (
                        <TiArrowSortedDown className="size-5" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 w-[13%]">
                    Years of Experience
                  </th>

                  {/* SORT DATE */}
                  <th
                    scope="col"
                    className="px-6 w-[13%]"
                    onClick={handleSortCreatedAt}
                  >
                    <div className="flex justify-start items-center gap-3 cursor-pointer">
                      <div className="select-none">Date Created</div>
                      {!sortByCreatedAt && (
                        <TiArrowUnsorted className="size-5" />
                      )}
                      {sortByCreatedAt === 'asc' && (
                        <TiArrowSortedUp className="size-5" />
                      )}
                      {sortByCreatedAt === 'desc' && (
                        <TiArrowSortedDown className="size-5" />
                      )}
                    </div>
                  </th>

                  {/* SORT ASSIGNED */}
                  <th
                    scope="col"
                    className="px-6 w-[11%]"
                    onClick={handleSortAssigned}
                  >
                    <div className="flex justify-center items-center gap-3 cursor-pointer">
                      <div className="select-none">Assigned</div>
                      {!sortByAssigned && (
                        <TiArrowUnsorted className="size-5" />
                      )}
                      {sortByAssigned === 'asc' && (
                        <TiArrowSortedUp className="size-5" />
                      )}
                      {sortByAssigned === 'desc' && (
                        <TiArrowSortedDown className="size-5" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-8 w-[5%]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {dataWithActions &&
                  dataWithActions.map((d, idx) => (
                    <tr
                      className="bg-white border-b  hover:bg-slate-50"
                      key={idx}
                    >
                      <td className="px-6 max-w-[8%] overflow-x-scroll">
                        {d.email}
                      </td>
                      {/* MARK: WA Number */}
                      <td className="w-[12%]">
                        {!d.isEditing ? (
                          d.whatsapp_number
                        ) : (
                          <input
                            className="table-cell-input"
                            type="number"
                            placeholder="Phone number..."
                            ref={whatsAppRef}
                            onKeyDown={handleKeyDownInvalidNumber}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">{d.sipa_number}</td>

                      <td className="px-6 py-4 ">{d.name}</td>

                      {/* MARK: YoE */}
                      <td className="px-6 py-4 text-center">
                        {!d.isEditing ? (
                          d.years_of_experience
                        ) : (
                          <input
                            className="table-cell-input text-center !w-[50%] !pl-0" // override stylings for YoE
                            type="number"
                            placeholder="Number of years..."
                            ref={yoeRef}
                            onKeyDown={handleKeyDownInvalidNumber}
                          />
                        )}
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4">
                        {ToLocaleDateFormatted(d.created_at)}
                      </td>

                      {/* ASSIGNED */}
                      <td className="px-6 py-4 text-center">
                        {d.is_assigned ? (
                          <div className="px-1 py-0.5 font-semibold text-blue-600 bg-blue-100 rounded-full text-sm">
                            Assigned
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 font-semibold text-slate-500 bg-slate-100 rounded-full text-sm">
                            Not Assigned
                          </div>
                        )}
                      </td>

                      {/* MARK: TOOLS */}
                      <td
                        className={`px-6 py-4 ${TWCenterize} gap-5 border-slate-100`}
                      >
                        {d.isLoading ? (
                          <div>loading</div>
                        ) : !d.isEditing ? (
                          editOrDeleteNode(d.id, idx)
                        ) : (
                          saveOrCancelNode(d.id, idx)
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : loading ? (
        <div className={`${TWCenterize} mt-20`}>
          <OrbitProgress
            color={BrandPrimary}
            size="large"
            text=""
            textColor=""
          />
        </div>
      ) : (
        <div className={`mt-20 ${TWColCenterize}`}>
          <div className="font-semibold text-3xl">No Pharmacist Results</div>
          <div className="text-slate-600 w-[300px] break-words text-center">
            Try reducing the filters to get more broad results...
          </div>
        </div>
      )}
      <div
        className={`mt-10 pb-16 flex justify-center items-center gap-8 w-fit mx-auto my-0 ${
          loading && ' hidden'
        }`}
      >
        {data && data.data.length > 0 && (
          <PaginationButtons
            totalPage={data.paging.total_page}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        )}
      </div>
    </div>
  );
};

export default Pharmacists;

// Admin can only update whatsapp number and years of experience
