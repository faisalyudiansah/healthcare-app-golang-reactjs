import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconExclamationCircleFilled } from "@tabler/icons-react";

type Props = {
  pharmacy:
    | {
        id: number;
        pharmacist: {
          id: number;
          name: string;
          sipa_number: string;
        };
        name: string;
        address: string;
      }
    | null;
};

const PharmacyDetail: React.FC<Props> = ({ pharmacy }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="relative inline items-center h-max w-max">
          <IconExclamationCircleFilled className="text-primarypink size-5 ml-2 cursor-pointer absolute top-1/2 -translate-y-1/2 left-0" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-[60%] md:max-w-[40%] overflow-auto">
        <DialogHeader className="w-full">
          <DialogTitle>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-start mb-6">
              Informasi Apotek
            </h4>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col gap-4 justify-center px-4">
          <div className="flex flex-col flex-wrap text-wrap md:grid md:grid-cols-[1fr_3fr] gap-1 md:gap-4">
            <p className="font-bold">Nama Apotek</p>
            <p className="">{pharmacy?.name}</p>
          </div>
          <div className="flex flex-col flex-wrap text-wrap md:grid md:grid-cols-[1fr_3fr] gap-1 md:gap-4">
            <p className="font-bold">Alamat Apotek</p>
            <p className="">{pharmacy?.address}</p>
          </div>
          <div className="flex flex-col flex-wrap text-wrap md:grid md:grid-cols-[1fr_3fr] gap-1 md:gap-4">
            <p className="font-bold">Nama Apoteker</p>
            <p className="">{pharmacy?.pharmacist.name}</p>
          </div>
          <div className="flex flex-col flex-wrap text-wrap md:grid md:grid-cols-[1fr_3fr] gap-1 md:gap-4">
            <p className="font-bold">No SIPA</p>
            <p className="">{pharmacy?.pharmacist.sipa_number}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyDetail;
