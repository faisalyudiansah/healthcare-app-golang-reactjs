import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  updateCategory,
  getCurrentCategories,
  appendEmptyCategory,
  removeCategoryOnId,
} from '@/store/createProduct/createProductSlice';
import { MdDelete } from 'react-icons/md';
import { GoPlus } from 'react-icons/go';
import { setBoolStateToFalse, setBoolStateToTrue } from '@/utils/UI/DropDown';
import useAxiosInfiniteScroll from '@/hooks/useAxiosInfiniteScroll';
import { ISearchData } from '@/models/Products';
import { useDebounce } from '@uidotdev/usehooks';

const CatgSearcher: React.FC<{ explicitKey: number; ctgId?: number }> = ({
  explicitKey,
  ctgId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentCategories = useSelector(getCurrentCategories) ?? [];
  const [shouldShow, setShouldShow] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);

  const handleClickACategory =
    (id: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const currInnerText = e.currentTarget?.innerText ?? '';
      if (ref.current) {
        ref.current.innerText = currInnerText;
      }

      dispatch(
        updateCategory({
          onIdx: explicitKey,
          category: {
            id: id,
            name: e.currentTarget.innerText,
          },
        }),
      );

      setShouldShow(false);
    };
  const { fetchData, data, loading, hasMore } =
    useAxiosInfiniteScroll<ISearchData>('/products/categories');
  const [searchedResult, setSearchedResult] = useState<ISearchData[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  // MARK: HANDLE SEARCH

  const [value, setValue] = useState('');
  // const [value, setValue] = useState(
  //   currentCategories[explicitKey]?.name ?? ""
  // );
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

  // useEffect(() => {
  //   if (!shouldShow) {
  //     return;
  //   }

  //   if (value) {
  //     fetchMore();
  //   }
  // }, [pageNumber, value]);

  useEffect(() => {
    if (ctgId) {
      currentCategories.forEach((c) => {
        if (c.id === ctgId && c.name) {
          // setValue(c.name);
          if (!ref.current) return;
          ref.current.value = c.name;
          return;
        }
      });
    } else {
      if (!ref.current) return;
      ref.current.value = '';
    }
  }, [ctgId]);

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

  let resultDropDown: ReactNode;
  if (searchedResult.length > 0 && shouldShow) {
    resultDropDown = (
      <>
        <div className="w-full dropdown-result">
          {searchedResult.map((d, idx) => {
            const uId = String(d.id) + d.name; // for react key only

            const TWStyle =
              'pt-4 pb-2 pl-4 hover:bg-slate-50 hover: cursor-pointer';

            if (idx === searchedResult.length - 1) {
              return (
                <div
                  className={TWStyle}
                  ref={lastItemElementRef} // JUST ATTACH OBSERVER!
                  key={uId}
                  onClick={handleClickACategory(d.id)}
                  id={String(d.id)}
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
                id={String(d.id)}
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

  // MARK: ADD BUTTON
  const shouldRenderAddBtn = () => {
    const isCurrentCatgFilled =
      currentCategories[explicitKey]?.id !== undefined;
    const isNextCtgCreated = currentCategories[explicitKey + 1] === undefined;

    return (
      isCurrentCatgFilled && isNextCtgCreated && currentCategories.length !== 3
    );
  };

  const handleAddThenDispatch = () => {
    /** Append empty category to render new Searcher in the Form */
    dispatch(appendEmptyCategory());
  };

  // MARK: DELETE BUTTON
  const handleDeleteThenDispatch = () => {
    dispatch(removeCategoryOnId(explicitKey));
  };

  const shouldRenderDeleteBtn = () => {
    return currentCategories[0]?.id;
  };

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex justify-start items-start w-full h-full">
        {/* MARK: SEARCHER 1 */}
        <div className="h-full  w-[100%] relative">
          <input
            ref={ref}
            type="text"
            className="form-input-text"
            placeholder="Search up for drug categories"
            onChange={handleCurrentSearch}
            onBlur={() => {
              if (isBlurring) {
                setShouldShow(false);
              }
            }}
            onMouseEnter={setBoolStateToFalse(setIsBlurring)}
            onMouseLeave={setBoolStateToTrue(setIsBlurring)}
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

          {shouldRenderAddBtn() && (
            <div
              className="mt-4 flex justify-start items-center gap-2 py-2 px-4 border-2 border-slate-400 rounded-lg w-fit text-slate-700 hover:cursor-pointer hover:bg-slate-400 hover:text-brand-white"
              onClick={handleAddThenDispatch}
            >
              <GoPlus size={20} />
              <div className="font-medium ">Category</div>
            </div>
          )}
        </div>

        {shouldRenderDeleteBtn() && (
          <div
            className="ml-4 bg-red-500 text-white rounded-lg h-12 w-14 flex justify-center items-center hover:cursor-pointer hover:bg-red-600"
            onClick={handleDeleteThenDispatch}
          >
            <MdDelete size={28} />
          </div>
        )}
      </div>
    </>
  );
};

export default CatgSearcher;
