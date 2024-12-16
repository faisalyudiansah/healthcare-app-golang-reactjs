import { Checkbox } from '@/components/ui/checkbox';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IPharmacistOrders } from '@/models/Pharmacists';
import { AppDispatch } from '@/store';
import { setUpdatePharmacistOrderModal } from '@/store/modals/modalsSlice';
import { showToastAsync } from '@/store/toast/toastSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export type DataWithActions = IPharmacistOrders & {
  isChecked: boolean;
};

const PharmacistOrders = () => {
  const dispatch = useDispatch<AppDispatch>();

  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', '1');
  const { fetchData, data, loading } = useAxios<
    IBaseResponse<IPharmacistOrders[]>
  >('/pharmacists/pharmacies/orders');
  const [dataWithActions, setDataWithActions] = useState<DataWithActions[]>([]);

  useEffect(() => {
    fetchData({ params });
  }, []);

  useEffect(() => {
    if (data) {
      setDataWithActions(
        data.data.map((d) => ({
          ...d,
          isChecked: false,
        })),
      );
    }
  }, [data]);

  const [shouldRefetch, setShouldRefetch] = useState(false);
  useEffect(() => {
    if (shouldRefetch) {
      fetchData({ params });
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const [shouldCheckAll, setShouldCheckAll] = useState(false);
  useEffect(() => {
    for (const d of dataWithActions) {
      if (!d.isChecked) {
        setShouldCheckAll(false);
        return;
      }
    }

    let x = true;
    for (const d of dataWithActions) {
      if (!d.isChecked) {
        x = false;
      }
    }
    if (x) {
      setShouldCheckAll(true);
    }
  });

  // MARK: CLICK CANCEL
  const handleClickCANCEL = () => {
    const selectedOrders = dataWithActions
      .map((d) => {
        if (d.isChecked) {
          return d;
        }
      })
      .filter((d) => d !== undefined);

    const pharmacyIds = selectedOrders.map((d) => d.detail.pharmacy.id);

    // ABORT IF NOT THE SAME PHPARMACY
    const numOfUniqueId = new Set(pharmacyIds).size;
    if (numOfUniqueId === 0) {
      dispatch(
        showToastAsync({
          message: 'No order was selected',
          type: 'warning',
        }),
      );
      return;
    }
    if (numOfUniqueId > 1) {
      dispatch(
        showToastAsync({
          message: 'Can only Bulk Cancel orders from the same Pharmacy',
          type: 'warning',
        }),
      );
      return;
    }

    // ABORT IF NOT WAITING || PROCESSED
    for (const o of selectedOrders) {
      if (!(o.order_status === 'WAITING' || o.order_status === 'PROCESSED')) {
        dispatch(
          showToastAsync({
            message: 'Can only cancel order with WAITING or PROCESSED status',
            type: 'warning',
          }),
        );
        return;
      }
    }

    const pharmacyId = selectedOrders[0].detail.pharmacy.id;
    const orderIds = selectedOrders.map((d) => d.id);
    dispatch(
      setUpdatePharmacistOrderModal({
        actionType: 'CANCEL',
        orderIds,
        pharmacyId,
      }),
    );
  };

  const handleClickSENT = () => {
    const selectedOrders = dataWithActions
      .map((d) => {
        if (d.isChecked) {
          return d;
        }
      })
      .filter((d) => d !== undefined);

    const pharmacyIds = selectedOrders.map((d) => d.detail.pharmacy.id);

    // ABORT IF NOT THE SAME PHPARMACY
    const numOfUniqueId = new Set(pharmacyIds).size;
    if (numOfUniqueId === 0) {
      dispatch(
        showToastAsync({
          message: 'No order was selected',
          type: 'warning',
        }),
      );
      return;
    }
    if (numOfUniqueId > 1) {
      dispatch(
        showToastAsync({
          message: 'Can only Bulk Sent orders from the same Pharmacy',
          type: 'warning',
        }),
      );
      return;
    }

    // ABORT IF NOT WAITING || PROCESSED
    for (const o of selectedOrders) {
      if (!(o.order_status === 'PROCESSED')) {
        dispatch(
          showToastAsync({
            message: 'Can only set SENT to order with PROCESSED status',
            type: 'warning',
          }),
        );
        return;
      }
    }

    const pharmacyId = selectedOrders[0].detail.pharmacy.id;
    const orderIds = selectedOrders.map((d) => d.id);
    dispatch(
      setUpdatePharmacistOrderModal({
        actionType: 'SENT',
        orderIds,
        pharmacyId,
      }),
    );
  };

  return (
    <div className="container w-full h-full px-10">
      <div className="mt-6 mb-4 flex justify-between items-center h-12">
        <div className="text-2xl font-semibold">Orders</div>
      </div>

      {!loading && dataWithActions.length > 0 ? (
        <div className="w-full">
          <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2">
            <table className="w-full  text-left  text-slate-700 ">
              <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
                <tr>
                  <th scope="col" className="px-6">
                    <Checkbox
                      checked={shouldCheckAll}
                      onClick={() => {
                        setShouldCheckAll((prev) => !prev);
                        if (!shouldCheckAll) {
                          // old state xD
                          setDataWithActions((prev) => {
                            return prev.map((p) => ({
                              ...p,
                              isChecked: true,
                            }));
                          });
                        } else {
                          setDataWithActions((prev) => {
                            return prev.map((p) => ({
                              ...p,
                              isChecked: false,
                            }));
                          });
                        }
                      }}
                    />
                  </th>
                  <th scope="col" className="px-6">
                    Order Status
                  </th>

                  <th scope="col" className="px-6">
                    Invoice Number
                  </th>

                  <th scope="col" className="px-6">
                    Pharmacy
                  </th>

                  <th scope="col" className="px-6">
                    Customer
                  </th>

                  <th scope="col" className="px-6">
                    Total Price
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
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={d.isChecked}
                          onClick={() => {
                            setDataWithActions((prev) => {
                              return prev.map((p, i) => {
                                if (i === idx) {
                                  return {
                                    ...p,
                                    // isChecked: !prev[i].isChecked,
                                    // isChecked: prev[i].isChecked ? false : true,
                                    isChecked: !prev[i].isChecked,
                                  };
                                }
                                return p;
                              });
                            });
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        {d.order_status +
                          ' ' +
                          d.id +
                          ' ' +
                          d.detail.pharmacy.id}
                      </td>
                      <td className="px-6 py-4">{d.voice_number}</td>
                      <td className="px-6 py-4">{d.detail.pharmacy.name}</td>
                      <td className="px-6 py-4">oslow cobblepot</td>
                      <td className="px-6 py-4">{d.total_amount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="w-full flex justify-end items-center gap-6 mt-4 pr-4">
            <div
              className="rounded-md bg-red-500 text-white px-3 py-1 cursor-pointer hover:bg-red-600 font-semibold"
              onClick={handleClickCANCEL}
            >
              CANCEL ORDER
            </div>
            <div
              className="rounded-md bg-yellow-500 text-white px-3 py-1 cursor-pointer hover:bg-yellow-600 font-semibold"
              onClick={handleClickSENT}
            >
              SEND ORDER
            </div>
          </div>
        </div>
      ) : loading ? (
        <div>loading</div>
      ) : (
        <div>No Orders</div>
      )}
    </div>
  );
};

export default PharmacistOrders;
