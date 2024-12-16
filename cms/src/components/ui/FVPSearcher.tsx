import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFormCreateProduct,
  updateCreateProductForm,
} from '@/store/createProduct/createProductSlice';
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
import { AppDispatch } from '@/store';
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
  withErrorStyle?: boolean;
  showErrorCallback?: React.Dispatch<React.SetStateAction<boolean>>;
  forReduxKeyName: ReduxStateKeyType;
}

type ReduxStateKeyType = 'manufacturer' | 'productForm';

/*
NOTE ON USE
-init the useForm on callsite, pass down to this searcher component!
 */
const FVPSearcher = <T extends FieldValues>({
  endpoint,
  placeholder,
  formHook,
  showErrorCallback,
  forReduxKeyName,
  withErrorStyle = false,
}: IThisProps<T>): React.ReactElement => {
  const dispatch = useDispatch<AppDispatch>();
  const currCreateProductForm = useSelector(getFormCreateProduct);

  const [shouldShow, setShouldShow] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);

  // MARK: HANDLE CLICK
  const handleClickACategory =
    (id: number, name: string) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const currInnerText = e.currentTarget?.innerText ?? '';
      if (ref.current) {
        ref.current.value = currInnerText;
      }

      dispatch(
        updateCreateProductForm({
          [forReduxKeyName]: {
            id: id,
            name: name,
          },
        }),
      );
      showErrorCallback?.(false);

      setShouldShow(false);
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

  // REF FOR INPUT
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = currCreateProductForm[forReduxKeyName]?.name ?? '';
    }
  }, [currCreateProductForm]);

  return (
    <>
      <div className="flex justify-start items-start w-full h-full">
        <div className="h-full  w-[100%] relative">
          <input
            {...formHook.register(formHook.label, {
              validate: () => {
                if (!ref.current?.value) {
                  return false;
                }
                return true;
              },
            })}
            ref={ref}
            type="text"
            className={`form-input-text ${
              (formHook.errors[formHook.label] || withErrorStyle) &&
              'form-input-text-invalid'
            }`}
            placeholder={placeholder}
            onChange={handleCurrentSearch}
            onBlur={() => {
              if (isBlurring) {
                setShouldShow(false);
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

export default FVPSearcher;
