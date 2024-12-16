import obatBebasImg from "@/assets/images/drug/obat-bebas.png";
import obatBebasTerbatasImg from "@/assets/images/drug/obat-bebas-terbatas.png";
import obatKerasImg from "@/assets/images/drug/obat-keras.png";

type Props = {
  classification:
    | "Obat Bebas"
    | "Obat Keras"
    | "Obat Bebas Terbatas"
    | "Non Obat"
    | string
    | undefined;
};

const ProductClassification: React.FC<Props> = ({ classification }) => {
  switch (classification) {
    case "Obat Bebas":
      return (
        <img
          src={obatBebasImg}
          alt="Obat Bebas"
          className="h-6 lg:h-8"
        />
      );
    case "Obat Keras":
      return (
        <img
          src={obatKerasImg}
          alt="Obat Keras"
          className="h-6 lg:h-8"
        />
      );
    case "Obat Bebas Terbatas":
      return (
        <img
          src={obatBebasTerbatasImg}
          alt="Obat Bebas Terbatas"
          className="h-6 lg:h-8"
        />
      );
    case "Non Obat":
    default:
      return (
        <div className="size-6 lg:size-8 border-2 border-black rounded-full" />
      );
  }
};

export default ProductClassification;
