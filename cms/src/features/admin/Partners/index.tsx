import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IPartners } from '@/models/Partners';
import { AppDispatch } from '@/store';
import {
  setShowCreatePartnerModal,
  setUpdatePartnerModal,
} from '@/store/modals/modalsSlice';
import { ConvertActiveStatus } from '@/utils/StringFormatter';
import { TWCenterize, TWColCenterize } from '@/utils/UI/TWStrings';
import axios, { AxiosError } from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { CgMathPlus } from 'react-icons/cg';
import { FaTrashAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { updateIsLoading } from './partners_utils';
import { showToastAsync } from '@/store/toast/toastSlice';
import PaginationButtons from '@/components/ui/PaginationButtons';
import moment from 'moment';

export type PartnersDataWithActions = IPartners & {
  isLoading: boolean;
};

const Partners = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [pageNumber, setPageNumber] = useState(1);
  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  const { fetchData, data, loading, error } =
    useAxios<IBaseResponse<IPartners[]>>('/admin/partners');
  const [dataWithActions, setDataWithActions] = useState<
    PartnersDataWithActions[]
  >([]);

  const handleClickEditBtn = (index: number) => () => {
    if (!data) return;

    // show UpdatePartner modal with the "Partner" entity
    dispatch(setUpdatePartnerModal(data.data[index]));
  };

  const handleClickDeleteBtn = (userId: number, index: number) => () => {
    updateIsLoading(setDataWithActions, index, true);
    axios
      .delete(`/admin/partners/${userId}`)
      .then()
      .catch((err) => {
        const e = err as AxiosError;
        const message = (
          e.response?.data as { message: string }
        ).message.toTitle();
        if (message) {
          dispatch(showToastAsync({ message: message, type: 'warning' }));
        }
      })
      .finally(() => {
        updateIsLoading(setDataWithActions, index, false);
      });
  };

  useEffect(() => {
    fetchData({ params });
  }, []);

  useEffect(() => {
    if (!data) return;
    setDataWithActions(
      data.data.map((d) => ({
        ...d,
        isLoading: false,
      })),
    );
  }, [data]);

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

  return (
    <div className="container w-full h-full px-10">
      <div className="mt-6 mb-4 flex justify-between items-center h-12">
        <div className="text-2xl font-semibold">Partners</div>

        {/* MARK: +CREATE PARTNER */}
        <button
          type="button"
          className="add-cta-navlink"
          onClick={() => {
            dispatch(setShowCreatePartnerModal(true));
          }}
        >
          <CgMathPlus />
          Add Partner
        </button>
      </div>

      {!loading && dataWithActions.length > 0 ? (
        <>
          <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2">
            <table className="w-full  text-left  text-slate-700 ">
              <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
                <tr>
                  <th scope="col" className="px-[76px]">
                    Logo
                  </th>

                  <th scope="col" className="px-6">
                    <div className="select-none">Name / Year</div>
                  </th>

                  <th scope="col" className="px-6 w-[40%]">
                    Active Days
                  </th>
                  <th scope="col" className="px-6 w-[10%]">
                    Operational Hours
                  </th>

                  <th scope="col" className="px-6 w-[10%]">
                    Active Status
                  </th>

                  <th scope="col" className="px-6 w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {dataWithActions.length > 0 &&
                  dataWithActions.map((d, idx) => (
                    <tr
                      className="bg-white border-b  hover:bg-slate-50"
                      key={idx}
                    >
                      <td className="px-12 py-4">
                        <div className={`${TWColCenterize} size-24 `}>
                          <img
                            className="object-cover"
                            src={d.logo_url}
                            alt=""
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-semibold">{d.name}</div>
                        <div className="font-semibold text-slate-400 italic">
                          {d.year_founded}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[400px]">
                        <div className="flex flex-wrap justify-start gap-2">
                          {d.active_days.split(',').map((d) => {
                            if (d === 'Sunday' || d === 'Saturday') {
                              return (
                                <div
                                  className="px-3 py-0.5 text-sm bg-yellow-100 text-yellow-600 rounded-full cursor-default"
                                  key={d}
                                >
                                  {d}
                                </div>
                              );
                            }
                            return (
                              <div
                                className="px-3 py-0.5 text-sm bg-blue-200 text-blue-600 rounded-full cursor-default"
                                key={d}
                              >
                                {d}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 ">
                        {`${moment(d.start_operation, 'HH:mm').format(
                          'HH:mm',
                        )} - ${moment(d.end_operation, 'HH:mm').format(
                          'HH:mm',
                        )}`}
                      </td>
                      <td className="px-6 py-4">
                        {d.is_active ? (
                          <span className="px-3 py-0.5 text-sm bg-red-200 text-red-600 rounded-full cursor-default">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-0.5 text-sm bg-red-200 text-red-600 rounded-full cursor-default">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td
                        className={`px-6 py-4 ${TWColCenterize} gap-5 border-l-2 border-slate-100 h-32`}
                      >
                        <div className={` w-full h-full ${TWCenterize} gap-3`}>
                          {d.isLoading ? (
                            <div>loading</div>
                          ) : (
                            editOrDeleteNode(d.id, idx)
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-14 mb-6 pb-16 flex justify-center items-center gap-8 w-fit mx-auto my-0">
            {data && data.data.length > 0 && (
              <PaginationButtons
                totalPage={data.paging.total_page}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
              />
            )}
          </div>
        </>
      ) : (
        <div>loading</div>
      )}
    </div>
  );
};

export default Partners;
