import { Order } from "@/stores/slices/orderSlices";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

type Props = {
  order?: Order;
};

const OrderDetail: React.FC<Props> = ({ order }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-max bg-white hover:bg-primarypink text-primarypink font-medium flex justify-center items-center gap-2 border border-primarypink hover:text-white transition-all ease-in-out duration-200 px-10 text-base">
          <span className="text-center">Lihat Detail</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%] md:max-w-[50%] pb-12">
        <DialogHeader>
          <DialogTitle>
            <h4 className="text-3xl font-bold text-center mb-8">
              Order Detail
            </h4>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-y-auto max-h-[70vh] w-full">
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-lg">Order Date</h3>
              <Badge className="w-max bg-white hover:bg-white text-md text-primarypink">
                {new Date(order?.updated_at || "").toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-lg">Invoice Number</h3>
              <Badge className="w-max bg-primarypink hover:bg-primarypink p-2 text-md">
                {order?.voice_number}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-lg">Status</h3>
              <Badge className="w-max bg-primarypink hover:bg-primarypink p-2 text-md">
                {order?.order_status}
              </Badge>
            </div>

            <ScrollArea className="w-full rounded-md">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-lg">Recipient Address</h3>

                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <div className="font-small text-base word">
                          {order?.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" className="mt-8" />
            </ScrollArea>

            <ScrollArea className="w-full rounded-md">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-lg">Pharmacy</h3>

                <div className="flex items-center w-max gap-2">
                  <img
                    src={order?.pharmacy_info.partner.logo_url}
                    alt={order?.pharmacy_info.partner.logo_url || "Pharmacy Partner's Logo"}
                    className="w-[50px] object-contain rounded-lg"
                  />
                  {order?.pharmacy_info.name}
                </div>

                <ScrollBar orientation="horizontal" className="mt-8" />
              </div>
            </ScrollArea>

            <ScrollArea className="w-full rounded-md">
              <div className="flex flex-col gap-4">
                <h3 className="font-medium text-lg">Product Detail</h3>

                {order?.product_info && order.product_info.length > 0 ? (
                  order.product_info.map((product) => {

                    return (
                      <div
                        key={product.id}
                        className="flex flex-col gap-2 mb-4"
                      >
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                          <div className="flex flex-col gap-2">
                            {product.product?.image_url && (
                              <div className="border border-zinc-500 rounded-lg border-opacity-40 w-max">
                                <img
                                  src={product.product.image_url}
                                  alt={product.product?.name || "Product image"}
                                  className="w-20 object-contain rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                            
                          <div className="flex flex-col w-full">
                            <div className="flex w-full justify-between">
                              <div className="w-full font-medium text-base">
                                {product.product?.name || "N/A"}
                              </div>
                              <div className="w-full font-small text-base text-end mr-4">
                                {formatPrice(
                                  parseFloat(product.price) || 0  
                                )}
                              </div>
                            </div>
                            <div className="flex w-full justify-between">
                              <div className="w-full font-small text-base">
                                    x{product.quantity || 0}
                              </div>
                              <div className="font-medium text-base text-end mr-4">
                                {formatPrice(
                                  (parseFloat(product.price) || 0) * product.quantity 
                                )}                   
                              </div>
                            </div>
                          </div>
                          {/* <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              <h4 className="font-medium text-base">Name</h4>
                              <div className="font-small text-base">
                                {product.product?.name || "N/A"}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <h4 className="font-medium text-base">
                                Quantity
                              </h4>
                              <div className="font-small text-base">
                                {product.quantity || 0}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <h4 className="font-medium text-base">
                                Price
                              </h4>
                              <div className="font-small text-base">
                                {formatPrice(
                                  parseFloat(product.price) || 0  
                                )}
                              </div>
                            </div>
                          </div> */}
                        </div>
                      </div>

                    );
                  })
                ) : (
                  <h1 className="text-primarypink text-lg">
                    No product information available
                  </h1>
                )}
              </div>

              <ScrollBar orientation="horizontal" className="mt-8" />
              <div className="flex flex-col gap-5 items-end mr-4">
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex w-full gap-5 justify-between">
                    <h3 className="font-medium text-base">Total Product Price</h3>
                    <div className="font-small text-base">
                      {formatPrice(order?.total_product_price || 0)}
                    </div>
                  </div>
                  <div className="flex w-full gap-5 justify-between">
                    <h3 className="font-medium text-base">Shipping Cost</h3>
                    <div className="font-small text-base">
                      {formatPrice(order?.ship_cost || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <ScrollArea>
              <div className="w-full flex gap-5 justify-end items-center">
                <h3 className="font-medium text-lg">Total Payment</h3>
                <Badge className="w-max bg-white hover:bg-white p-2 text-md text-primarypink border-zinc-500 border-opacity-20">
                    {formatPrice(order?.total_payment || 0)}
                </Badge>
              </div>
            </ScrollArea>


          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetail;
