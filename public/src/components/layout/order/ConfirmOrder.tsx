import confirmImg from "@/assets/svg/order/confirm.svg"
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useCookies } from "react-cookie";

type Props = {
  orderId: number;
};

const ConfirmOrder: React.FC<Props> = ({ orderId }) => {
  const [cookie] = useCookies(["access_token"]);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/orders/confirm/${orderId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${cookie.access_token}`,
          },
        }
      );

      return response.data;
    },
  });

  const handleConfirmOrder = async () => {
    await mutation
      .mutateAsync()
      .then(() => {
        toast({
          title: "Berhasil Mengkonfirmasi Pesanan!",
          duration: 3000,
          type: "foreground",
          className: "border-primarypink",
          action: (
            <ToastAction
              altText="Close"
              className="border-primarypink border-opacity-20"
            >
              Close
            </ToastAction>
          ),
        });
      })
      .catch((error: AxiosError<{ message: string }>) => {
        if (error) {
          toast({
            title: "Gagal Mengkonfirmasi Pesanan!",
            description: error.response?.data.message,
            duration: 3000,
            type: "foreground",
            variant: "destructive",
          });
        }
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-max bg-primarypink dark:bg-white dark:text-black text-white font-medium flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 px-10 text-lg">
          <span className="text-center">Konfirmasi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[75%] md:max-w-[50%] pb-12">
        <DialogHeader className="flex flex-col gap-8 mb-8">
          <DialogTitle>
            <h2 className="text-3xl font-bold text-center mb-8">
              Konfirmasi Pesanan
            </h2>
            <div className="flex flex-col gap-4 justify-center items-center">
              <img src={confirmImg} alt="Konfirmasi" className="max-h-[30vh]"/>
              <h3 className="font-normal">Pesanan sudah diterima? Konfirmasi pesanan Anda</h3>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-y-auto max-h-[70vh] w-full">
          <div className="flex gap-8 justify-end">
            <DialogClose asChild>
              <Button
                className="w-max bg-primarypink dark:bg-white dark:text-black text-white font-medium flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 px-10 py-6 text-lg"
              >
                <span className="text-center">Cancel</span>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className="w-max text-primarypink border border-primarypink bg-white dark:bg-white dark:text-black font-medium flex justify-center items-center gap-2  hover:bg-primarypink hover:border-primarypink hover:text-white transition-all ease-in-out duration-200 px-10 py-6 text-lg"
                onClick={handleConfirmOrder}
              >
                <span className="text-center">Konfirmasi</span>
              </Button>
            </DialogClose>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrder;
