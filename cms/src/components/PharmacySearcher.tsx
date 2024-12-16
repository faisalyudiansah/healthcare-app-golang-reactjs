import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { setBoolStateToFalse, setBoolStateToTrue } from '@/utils/UI/DropDown';
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';
import { useDebounce } from '@uidotdev/usehooks';
import useAxiosInfiniteScroll from '@/hooks/useAxiosInfiniteScroll';
import { ISearchData } from '@/models/Products';

interface IThisProps<T extends FieldValues> {
  endpoint: string;
  placeholder: string;
  formHook: {
    trigger: UseFormTrigger<T>;
    register: UseFormRegister<T>;
    label: Path<T>;
    errors: FieldErrors<T>;
    watch: UseFormWatch<T>;
  };
  withoutLabel?: boolean;
  defaultValue?: string;
  onBlurCallback?: () => void;
  onClickAValueCallback?: (id: number, name: string) => void;
  onChangeCallback?: (value: string) => void;
  withErrorStyle?: boolean;
  showErrorCallback?: React.Dispatch<React.SetStateAction<boolean>>;
}

/*
NOTE ON USE
-init the useForm on callsite, pass down to this searcher component!
 */
const PharmacySearcher = <T extends FieldValues>({
  defaultValue,
  endpoint,
  placeholder,
  withoutLabel,
  showErrorCallback,
  onBlurCallback,
  onClickAValueCallback,
  onChangeCallback,
}: IThisProps<T>): React.ReactElement => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);

  // REF FOR INPUT
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (defaultValue) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue]);

  // MARK: HANDLE CLICK
  const handleClickACategory =
    (id: number, name: string) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const currInnerText = e.currentTarget?.innerText ?? '';
      if (ref.current) {
        if (withoutLabel) {
          ref.current.value = '';
        } else {
          ref.current.value = currInnerText;
        }
      }

      showErrorCallback?.(false);

      setShouldShow(false);
      onClickAValueCallback?.(id, name);
    };

  // MARK: FETCHING
  const { fetchData, data, loading, hasMore } =
    useAxiosInfiniteScroll<ISearchData>(endpoint);
  const [searchedResult, setSearchedResult] = useState<ISearchData[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  // MARK: HANDLE SEARCH
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 300);
  const handleCurrentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChangeCallback?.(e.target.value);
  };

  useEffect(() => {
    if (debouncedValue) {
      setPageNumber(1);
      setSearchedResult([]);

      if (pageNumber === 1) {
        fetchData(1, value);
      }

      setShouldShow(true);
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (data.length > 0) {
      if (pageNumber === 1) {
        setSearchedResult(data);
      } else {
        setSearchedResult((prev) => {
          return [...prev, ...data];
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (value) {
      fetchData(pageNumber, value);
    }
  }, [pageNumber]);

  // MARK: ELEMENT-INTERSECT OBSERVER
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // MARK: DROPDOWN
  let resultDropDown: ReactNode;
  if (searchedResult.length > 0 && shouldShow) {
    resultDropDown = (
      <>
        <div className="w-full dropdown-result">
          {searchedResult.map((d, idx) => {
            const uId = String(d.id) + d.name;

            const TWStyle =
              'pt-4 pb-2 pl-4 hover:bg-slate-50 hover: cursor-pointer';

            if (idx === searchedResult.length - 1) {
              return (
                <div
                  className={TWStyle}
                  ref={lastItemElementRef} // JUST ATTACH OBSERVER!
                  key={uId}
                  onClick={handleClickACategory(d.id, d.name)}
                  id={uId}
                >
                  {d.name}
                </div>
              );
            }

            return (
              <div
                className={TWStyle}
                key={uId}
                onClick={handleClickACategory(d.id, d.name)}
                id={uId}
              >
                {d.name}
              </div>
            );
          })}

          {/* LOADER (DIFFERENT) FOR MORE RESULT */}
          {loading && (
            <div className="w-full flex justify-center items-center h-12">
              Loading more...
            </div>
          )}
        </div>
      </>
    );
  } else if (loading) {
    resultDropDown = (
      <div className="w-full dropdown-result">
        <div className="w-full flex justify-center items-center h-12">
          Loading...
        </div>
      </div>
    );
  }

  if (!shouldShow) {
    resultDropDown = <></>;
  }

  return (
    <>
      <div className="flex justify-start items-start w-full">
        <div className="h-full  w-[100%] relative">
          <input
            ref={ref}
            type="text"
            className=" border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-4 h-10  mt-1 font-normal w-full"
            placeholder={placeholder}
            onChange={handleCurrentSearch}
            onBlur={() => {
              if (isBlurring) {
                setShouldShow(false);
                onBlurCallback?.();
              }
            }}
            onMouseEnter={setBoolStateToFalse(setIsBlurring)}
            onMouseLeave={setBoolStateToTrue(setIsBlurring)}
            autoComplete="off"
            onFocus={(e) => {
              setIsBlurring(true);
              handleCurrentSearch(e);
            }}
          />

          {/* mark: DROPDOWN HERE */}
          {value !== '' && (
            <div
              onMouseEnter={setBoolStateToFalse(setIsBlurring)}
              onMouseLeave={setBoolStateToTrue(setIsBlurring)}
            >
              {resultDropDown}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PharmacySearcher;
