import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useState, useCallback } from "react";
import { useCookies } from "react-cookie";

type Props = {
  orderId: number;
};

const UploadProof: React.FC<Props> = ({ orderId }) => {
  const [cookie] = useCookies(["access_token"]);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = useCallback((newFile: File | null) => {
    setFile(newFile);
    console.log(file);
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/orders/payment/${orderId}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${cookie.access_token}`,
          },
        }
      );

      return response.data;
    },
  });

  const handleUploadPayment = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("payment_proof", file);

    await mutation
      .mutateAsync(formData)
      .then(() => {
        toast({
          title: "Berhasil Mengupload Bukti Pembayaran!",
          description: "Silahkan menunggu 1 menit hingga pesanan diproses",
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
        setIsOpen(false);
      })
      .catch((error: AxiosError<{ message: string }>) => {
        if (error) {
          toast({
            title: "Gagal Mengupload Bukti Pembayaran!",
            description: error.response?.data.message,
            duration: 3000,
            type: "foreground",
            variant: "destructive",
          });
        }
      });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-max bg-primarypink dark:bg-primarypink text-white font-medium flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 px-10 text-lg">
          <span className="text-center">Bayar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[75%] md:max-w-[50%] pb-12">
        <DialogHeader>
          <DialogTitle>
            <h4 className="text-3xl font-bold text-center mb-8">
              Upload Bukti Pembayaran
            </h4>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-y-auto max-h-[70vh] w-full">
          <div className="flex flex-col gap-8">
            <div className="w-full flex flex-col gap-8">
              <FileUpload onChange={handleFileUpload} />
            </div>

            <DialogClose asChild>
              <Button
                className="w-full bg-primarypink dark:bg-white dark:text-black text-white font-medium flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 px-10 py-8 text-lg"
                onClick={handleUploadPayment}
                disabled={!file}
              >
                <span className="text-center">Bayar</span>
              </Button>
            </DialogClose>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UploadProof;
