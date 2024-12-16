import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IPharmacy } from '@/models/Pharmacies';
import { AppDispatch } from '@/store';
import { setSelectedPharmacy } from '@/store/pharmacies/pharmaciesSlice';
import { TWCenterize, TWColCenterize } from '@/utils/UI/TWStrings';
import React, { ReactNode, useEffect, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { FaGear } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';

const PharmacistPharmacies = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    document.title = 'Pathosafe - Pharmacies';
  }, []);

  const [pageNumber, setPageNumber] = useState(1);
  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  const { fetchData, data, loading, error } = useAxios<
    IBaseResponse<IPharmacy[]>
  >('/pharmacists/pharmacies');

  useEffect(() => {
    console.log('masuk');
    fetchData({ params });
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const handleClickEditBtn = (index: number) => () => {};

  const editOrManageNode = (pharmacyId: number, index: number): ReactNode => {
    return (
      <>
        {/* MARK: CLICK MANAGE PHARMACY WITH LINK */}
        <NavLink
          to={`${pharmacyId}?name=${data?.data[index].name}`}
          onClick={() => {
            dispatch(setSelectedPharmacy(data?.data[index].id));
          }}
        >
          <div
            className={`table-tools-icon relative ${TWCenterize} opacity-85 `}
          >
            <FaGear className="size-5 text-slate-500 hover:text-slate-700 cursor-pointer" />
            <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
              Manage
            </div>
          </div>
        </NavLink>
      </>
    );
  };

  return (
    <div className="container w-full min-h-[100vh] px-10">
      <div className="mt-6 mb-4 flex justify-between items-center h-12">
        <div className="text-2xl font-semibold">Pharmacies</div>
      </div>
      {!loading && data ? (
        <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2">
          <table className="w-full  text-left  text-slate-700 ">
            <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
              <tr>
                <th scope="col" className="px-6">
                  Name
                </th>

                <th scope="col" className="px-6">
                  Partner
                </th>

                <th scope="col" className="px-6">
                  City
                </th>

                <th scope="col" className="px-6">
                  Address
                </th>

                <th scope="col" className="px-6 text-center">
                  Status
                </th>

                <th scope="col" className="px-6">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {data &&
                data.data.map((d, idx) => (
                  <tr
                    className="bg-white border-b  hover:bg-slate-50"
                    key={idx}
                  >
                    <td className="px-6 py-4">{d.name}</td>
                    <td className="px-6 py-4">{d.partner.name}</td>
                    <td className="px-6 py-4">{d.city}</td>
                    <td className="px-6 py-4">{d.address}</td>
                    <td className="px-6 py-4">
                      {d.is_active ? (
                        <div className="bg-green-200 text-green-600 px-2 py-0.5 font-semibold rounded-full text-center text-sm">
                          Active
                        </div>
                      ) : (
                        <div className="bg-red-200 text-red-600 px-2 py-0.5 font-semibold rounded-full text-center text-sm">
                          Inactive
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td
                      className={`px-6 py-4 ${TWColCenterize} gap-5 border-l-2 border-slate-100`}
                    >
                      <div className={` w-full h-full ${TWCenterize} gap-4`}>
                        {editOrManageNode(d.id, idx)}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>loading</div>
      )}
    </div>
  );
};

export default PharmacistPharmacies;
