import obatBebasImg from "@/assets/images/drug/obat-bebas.png";
import obatBebasTerbatasImg from "@/assets/images/drug/obat-bebas-terbatas.png";
import obatKerasImg from "@/assets/images/drug/obat-keras.png";
import { Input } from "@/components/ui/input";
import {
  addClassification,
  addSortOpt,
  changeQuery,
  removeClassification,
} from "@/stores/slices/productSlices";
import { useDebounce } from "@uidotdev/usehooks";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductClassification: React.FC<{ classification: number }> = ({
  classification,
}) => {
  const dispatch = useDispatch();
  const [isClicked, setIsClicked] = useState(false);
  const handleClicked = () => {
    setIsClicked((prevState) => !prevState);
    if (!isClicked) {
      dispatch(addClassification({ classification }));
    } else {
      dispatch(removeClassification({ classification }));
    }
  };

  let label;
  let src;
  switch (classification) {
    case 1:
      label = "Obat Bebas";
      src = obatBebasImg;
      break;
    case 2:
      label = "Obat Keras";
      src = obatKerasImg;
      break;
    case 3:
      label = "Obat Bebas Terbatas";
      src = obatBebasTerbatasImg;
      break;
    default:
      label = "Non Obat";
      break;
  }

  return (
    <button
      className={cn(
        "rounded-lg border border-zinc-500 border-opacity-40 p-4 transition-all ease-in-out",
        isClicked && "bg-primarypink bg-opacity-30"
      )}
      onClick={handleClicked}
    >
      <div className="flex items-center gap-4">
        <p>{label}</p>
        {classification === 4 ? (
          <div className="size-4 md:size-6 lg:size-8 border-2 border-black rounded-full" />
        ) : (
          <img src={src} alt={label} className="size-8" />
        )}
      </div>
    </button>
  );
};

const SearchBar: React.FC = () => {
  const [, setSortOpt] = useState("date desc");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 600);
  const dispatch = useDispatch();

  const handleChangeSortOpt = (value: string) => {
    setSortOpt(value);
    dispatch(addSortOpt({ sortOpt: value }));
  };

  useEffect(() => {
    dispatch(changeQuery({ query }));
  }, [debouncedQuery]);

  return (
    <div className="w-full flex justify-center items-start my-8">
      <div className="w-[80%] container p-4 shadow-lg border border-zinc-500 border-opacity-20 rounded-lg flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari produk..."
            className="rounded-lg bg-background pl-8 w-full text-lg focus-visible:ring-transparent focus-visible:border-primarypink"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-wrap gap-4">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <ProductClassification key={idx + 1} classification={idx + 1} />
            ))}
        </div>

        <div className="w-full">
          <Select onValueChange={handleChangeSortOpt}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urut Berdasarkan" />
            </SelectTrigger>
            <SelectContent className="focus:ring-transparent focus:outline-primarypink">
              <SelectGroup>
                <SelectItem value="price asc">
                  Harga <SortAsc className="inline size-4" />
                </SelectItem>
                <SelectItem value="price desc">
                  Harga <SortDesc className="inline size-4" />
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
