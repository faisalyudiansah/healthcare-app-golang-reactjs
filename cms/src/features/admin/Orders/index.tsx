import useAxios from '@/hooks/useAxios';
import { IAdminOrder } from '@/models/AdminOrders';
import IBaseResponse from '@/models/IBaseResponse';
import { toRpFormattedShort } from '@/utils/CurrencyFormatter';
import {
  BrandPrimary,
  TWCenterize,
  TWColCenterize,
} from '@/utils/UI/TWStrings';
import { ReactNode, useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
import { useSelector } from 'react-redux';
import OrderDetails from '../OrderDetails';
import OrdersFilter from './OrdersFilter';
import { getFilterAdminOrders } from '@/store/filterAdminOrders/filterAdminOrdersSlice';
import OrdersFilterCell from './OrdersFilterCell';

const Orders = () => {
  const currFilter = useSelector(getFilterAdminOrders);

  const [pageNumber, setPageNumber] = useState(1);
  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  const { fetchData, data, loading, error } = useAxios<
    IBaseResponse<IAdminOrder[]>
  >('/admin/pharmacies/orders');
  const [showOrderDetails, setShowOrderDetails] = useState<{
    shouldShow: boolean;
    entity: IAdminOrder | null;
  }>({
    shouldShow: false,
    entity: null,
  });

  useEffect(() => {
    if (currFilter) {
      params.append('name', currFilter);
    }
    fetchData({ params });
  }, [currFilter]);

  let content: ReactNode;
  if (showOrderDetails.shouldShow && showOrderDetails.entity) {
    content = (
      <OrderDetails
        entity={showOrderDetails.entity}
        setShowOrderDetails={setShowOrderDetails}
      />
    );
  } else {
    content = (
      <div className="container py-6 px-20 w-full">
        {!loading && data ? (
          <>
            {data.data.length > 0 ? (
              <>
                <div className="text-2xl font-semibold mb-2">Orders</div>

                <div className="flex justify-start items-center gap-4">
                  <OrdersFilter />
                  {currFilter && <OrdersFilterCell object={currFilter} />}
                </div>

                <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2">
                  <table className="w-full  text-left  text-slate-700 ">
                    <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
                      <tr>
                        <th scope="col" className="px-6">
                          Invoice Number
                        </th>
                        <th scope="col" className="px-6">
                          Status
                        </th>
                        <th scope="col" className="px-6">
                          Total Price
                        </th>
                        <th scope="col" className="px-6">
                          Pharmacy
                        </th>
                        <th scope="col" className="px-6">
                          Action
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
                            <td className="px-6 py-4">{d.voice_number}</td>
                            <td className="px-6 py-4">{d.order_status}</td>
                            <td className="px-6 py-4">
                              {toRpFormattedShort(
                                Number(d.total_product_price),
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {d.detail.pharmacy.name}
                            </td>
                            <td
                              className="px-6 py-4 text-blue-600 font-medium cursor-pointer hover:text-blue-700 hover:underline"
                              onClick={() => {
                                setShowOrderDetails({
                                  shouldShow: true,
                                  entity: d,
                                });
                              }}
                            >
                              See details
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={`mt-20 ${TWColCenterize}`}>
                <div className="font-semibold text-3xl">No Orders Results</div>
                <div className="text-slate-600 w-[300px] break-words text-center">
                  Try reducing the filters to get more broad results...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`${TWCenterize} mt-20`}>
            <OrbitProgress
              color={BrandPrimary}
              size="large"
              text=""
              textColor=""
            />
          </div>
        )}
      </div>
    );
  }

  return content;
};

export default Orders;
