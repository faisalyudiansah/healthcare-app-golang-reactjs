import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { Order } from "@/stores/slices/orderSlices";
import { IconShoppingBag } from "@tabler/icons-react";
import UploadProof from "./UploadProof";
import OrderDetail from "./OrderDetail";
import ConfirmOrder from "./ConfirmOrder";

type Props = {
  order?: Order;
  isLoading?: boolean;
};

const OrderSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 h-32 rounded-md shadow-lg border relative animate-pulse"></div>
    </div>
  );
};

const OrderItem: React.FC<Props> = ({ order, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <OrderSkeleton />
      ) : (
        <Badge className="w-full bg-inherit hover:bg-inherit py-4 font-normal flex flex-col gap-2 border items-start shadow-md border-white dark:border-primarypink border-opacity-15 px-8">
          <p className="text-md text-muted-foreground">{order?.voice_number}</p>
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2 items-start justify-center">
              <IconShoppingBag className="text-primarypink" />
              <p className="font-bold text-base text-foreground">Belanja</p>
              <p className="text-muted-foreground text-base">
                {new Date(order?.created_at || "").toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex">
              <div className="w-max text-base font-bold p-2 text-primarypink border-slate-500">
                {order?.order_status}
              </div>
            </div>
          </div>

          <div className="w-full flex items-center gap-4 justify-between">
            <div className="flex gap-4 items-center">
              <img
                src={order?.pharmacy_info.partner.logo_url}
                alt={order?.pharmacy_info.name}
                className="object-contain size-24"
              />
              <h3 className="font-medium text-base text-foreground">
                {order?.pharmacy_info.name}
              </h3>
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground text-base">Total Pembayaran</p>
              <div className="font-bold text-base text-foreground">
                {formatPrice(order?.total_payment)}
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end gap-4">
            <OrderDetail order={order} />
            {order?.order_status === "SENT" && (
              <ConfirmOrder orderId={order.id} />
            )}
            {order?.order_status === "WAITING" && (
              <UploadProof orderId={order.id} />
            )}
          </div>
        </Badge>
      )}
    </>
  );
};

export default OrderItem;
