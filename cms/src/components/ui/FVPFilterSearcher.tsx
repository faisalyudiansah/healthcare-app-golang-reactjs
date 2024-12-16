import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBoolStateToFalse, setBoolStateToTrue } from '@/utils/UI/DropDown';
import { useDebounce } from '@uidotdev/usehooks';
import useAxiosInfiniteScroll from '@/hooks/useAxiosInfiniteScroll';
import { AppDispatch } from '@/store';
import { ISearchData } from '@/models/Products';
import {
  getFilterParams,
  updateFilterParamsOnArray,
} from '@/store/filterProduct/filterProductsSlice';
import { TKeysThatAreArray } from '@/store/filterProduct/filterProductsType';
import { showToastAsync } from '@/store/toast/toastSlice';

interface IThisProps {
  endpoint: string;
  placeholder: string;
  keyName: string;
}

const FVPFilterSearcher = ({
  endpoint,
  placeholder,
  keyName,
}: IThisProps): React.ReactElement => {
  const dispatch = useDispatch<AppDispatch>();

  const [shouldShow, setShouldShow] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);
  const currFilterParams = useSelector(getFilterParams);

  // MARK: HANDLE CLICK
  const handleClickACategory =
    (id: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const thisKey = currFilterParams[keyName as TKeysThatAreArray];

      if (thisKey && thisKey.length === 5) {
        dispatch(
          showToastAsync({ message: 'Can only add 5 items', type: 'warning' }),
        );
        setShouldShow(false);
        return;
      }

      const currInnerText = e.currentTarget?.innerText ?? '';
      if (ref.current) {
        ref.current.value = ''; // so it can show placeholder back...
      }

      dispatch(
        updateFilterParamsOnArray({
          keyName: keyName as TKeysThatAreArray,
          item: {
            id: id,
            name: currInnerText,
          },
        }),
      );

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
                  onClick={handleClickACategory(d.id)}
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
                onClick={handleClickACategory(d.id)}
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

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex justify-start items-start w-full h-full">
        <div className="h-full  w-[100%] relative">
          <input
            ref={ref}
            type="text"
            className="mt-1 bg-transparent pl-3 placeholder-slate-300 border-2 border-[#d1d1d1]  rounded-lg h-10 w-full font-normal outline-slate-400"
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

export default FVPFilterSearcher;
