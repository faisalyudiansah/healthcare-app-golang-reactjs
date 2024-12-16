import { BrandPrimary, TWCenterize } from '@/utils/UI/TWStrings';
import { IoArrowBackOutline } from 'react-icons/io5';
import heheimg from '@/assets/images/welcoming.png';
import { toRpFormattedShort } from '@/utils/CurrencyFormatter';
import React, { useEffect } from 'react';
import { IAdminOrder } from '@/models/AdminOrders';
import StatusCapsule from './StatusCapsule';
import useAxios from '@/hooks/useAxios';
import { OrbitProgress } from 'react-loading-indicators';
import IBaseResponse from '@/models/IBaseResponse';
import { ToLocaleDateFormattedSlash } from '@/utils/StringFormatter';

const labelNormal = 'text-slate-500';
const subHeader = 'text-lg font-semibold text-slate-600 mb-1';

const OrderDetails: React.FC<{
  entity: IAdminOrder;
  setShowOrderDetails: React.Dispatch<
    React.SetStateAction<{
      shouldShow: boolean;
      entity: IAdminOrder | null;
    }>
  >;
}> = ({ entity: orderDetails, setShowOrderDetails }) => {
  const { fetchData, data, loading } = useAxios<
    IBaseResponse<{
      name: string;
      address: string;
      city: string;
    }>
  >(`/admin/pharmacies/${orderDetails.detail.pharmacy.id}`);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container py-6 px-48 w-full">
      <div className="rounded-xl full w-full h-full pt-8 pb-40 px-10 bg-white  ">
        {/* MARK: HEADER */}
        <div className="flex justify-start items-center gap-3">
          <div
            className={`${TWCenterize} cursor-pointer  size-11`}
            onClick={() =>
              setShowOrderDetails({ shouldShow: false, entity: null })
            }
          >
            <IoArrowBackOutline className="text-slate-300 size-10" />
          </div>
          <div className="text-2xl font-semibold">Order Details</div>
        </div>

        {!loading && data ? (
          <div className="flex flex-col justify-start items-start gap-8 pl-14 mt-6">
            {/* MARK */}
            <div>
              <div className={labelNormal}>Invoice Number</div>
              <div>{orderDetails.voice_number}</div>
            </div>

            {/* MARK: STATUS */}
            <div>
              <div className={labelNormal + ' mb-1'}>Status</div>
              <StatusCapsule status={orderDetails.order_status} />
            </div>

            {/* MARK: Pharmacy details */}
            <div>
              <div className={subHeader}>Pharmacy Details</div>
              <div className="flex justify-start items-start gap-8">
                <div>
                  <div className={labelNormal}>Name</div>
                  <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                    {orderDetails.detail.pharmacy.name + ' ' + data.data.name}
                  </div>
                </div>

                <div>
                  <div className={labelNormal}>Address</div>
                  <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                    {data.data.address}
                  </div>
                </div>

                <div>
                  <div className={labelNormal}>City</div>
                  <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                    {data.data.city}
                  </div>
                </div>
              </div>
            </div>

            {/* MARK: customer details */}
            <div>
              <div className={subHeader}>Customer Details</div>

              <div className="flex justify-start items-start gap-10">
                {/* PAYMENT PROOF */}
                <div>
                  <div className={labelNormal + ' mb-1'}>Payment Image</div>
                  <img
                    className="w-[200px] h-[280px] object-contain border-2 border-slate-200 rounded-2xl "
                    src={heheimg}
                    alt=""
                  />
                  <div className="text-sm text-slate-500 mt-1 mb-[-3px]">
                    Updated at:
                  </div>
                  <div className="text-sm italic ">99/99/999</div>
                </div>

                {/* email-address */}
                <div className="flex flex-col justify-start items-start gap-4">
                  <div>
                    <div className={labelNormal}>Email</div>
                    <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                      asdasd@asda.com
                    </div>
                  </div>

                  <div>
                    <div className={labelNormal}>Address</div>
                    <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                      ansjkdnakjdnakjsndkjasjkd
                    </div>
                  </div>
                </div>

                {/* name-city */}
                <div className="flex flex-col justify-start items-start gap-4">
                  <div>
                    <div className={labelNormal}>Name</div>
                    <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                      asdas askdnasjd
                    </div>
                  </div>

                  <div>
                    <div className={labelNormal}>City</div>
                    <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                      ajsnddsjasnd
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <div className={subHeader}>Product Details</div>

              <div className="grid grid-cols-2 gap-y-10 gap-x-10">
                {orderDetails.detail.products.map((product) => (
                  <div className="flex justify-start items-start gap-10">
                    {/* PAYMENT PROOF */}
                    <div>
                      <div className={labelNormal + ' mb-1'}>
                        Thumbnail Image
                      </div>
                      <img
                        className="w-[200px] h-[280px] object-contain border-2 border-slate-200 rounded-2xl "
                        src={product.thumbnail_url}
                        alt=""
                      />
                    </div>

                    <div className="flex flex-col justify-start items-start gap-4">
                      <div>
                        <div className={labelNormal}>Name</div>
                        <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                          {product.name}
                        </div>
                      </div>

                      <div>
                        <div className={labelNormal}>Price</div>
                        <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                          {toRpFormattedShort(Number(product.price))}
                        </div>
                      </div>

                      <div>
                        <div className={labelNormal}>Quantity</div>
                        <div className="min-w-[160px] max-w-[260px] overflow-x-scroll  max-h-[50px]">
                          {product.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className={subHeader}>Pricing</div>

              <div className="flex flex-col justify-start items-start gap-3 border-2 border-slate-200 rounded-2xl px-6 py-4 ">
                <div className="w-full flex justify-between items-center gap-[140px]">
                  <div className={labelNormal}>Product Price</div>
                  <div>
                    {toRpFormattedShort(
                      orderDetails.detail.products.reduce((total, product) => {
                        return total + Number(product.price) * product.quantity;
                      }, 0),
                    )}
                  </div>
                </div>

                <div className="w-full flex justify-between items-center gap-[140px]">
                  <div className={labelNormal}>Shipping Cost</div>
                  <div>
                    {toRpFormattedShort(Number(orderDetails.ship_cost))}
                  </div>
                </div>

                <div className="w-full border-b-2  text-slate-100 my-1"></div>

                <div className="w-full flex justify-between items-center gap-[140px]">
                  <div className=" text-lg font-semibold">Product Price</div>
                  <div className="text-lg font-semibold">
                    {toRpFormattedShort(
                      Number(orderDetails.total_product_price),
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm mt-2 ml-2 text-slate-400">
                Created at:{' '}
                <span className="text-black  italic">
                  {ToLocaleDateFormattedSlash(orderDetails.created_at)}
                </span>
              </div>
            </div>
          </div>
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
        {/* DETAIL CONTENT STARTS HERE */}
      </div>
    </div>
  );
};

export default OrderDetails;
