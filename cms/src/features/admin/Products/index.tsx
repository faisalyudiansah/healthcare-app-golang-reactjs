import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { IFilteredProduct } from '@/models/Products';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFilterParams,
  updateFilterParams,
} from '@/store/filterProduct/filterProductsSlice';
import FVPFilterSearcher from '@/components/ui/FVPFilterSearcher';
import FilterCapsule from './FilterCapsule';
import drugClassifications from '@/models/DrugClassifications';
import DrugClfCheckboxBtn from '@/components/ui/DrugClfCheckboxBtn';
import FilterByText from '@/components/ui/FilterByText';
import { AppDispatch } from '@/store';
import FilterSortBy from './FilterSortBy';
import { ISortingPayload } from '@/store/filterProduct/filterProductsType';
import PaginationButtons from '../../../components/ui/PaginationButtons';
import { BrandPrimary, TWCenterize } from '@/utils/UI/TWStrings';
import { CgMathPlus } from 'react-icons/cg';
import { OrbitProgress } from 'react-loading-indicators';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';
import ProductCard from './ProductCard';

const Products = () => {
  useEffect(() => {
    document.title = 'Pathosafe - Products';
  }, []);

  const user = useAuthUser<IUser>();
  const userRole: 'pharmacist' | 'admin' = user?.role ?? 'admin';
  const dispatch = useDispatch<AppDispatch>();

  // DEBOUNCE FILTER BUTTON
  const [enableFilterBtn, setEnableFilterBtn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setEnableFilterBtn(true);
    }, 800);

    return () => {
      clearTimeout(id);
    };
  }, [enableFilterBtn]);

  // SELECTORS
  const getCurrFilterParams = useSelector(getFilterParams);
  const currSortByParams = getCurrFilterParams['sort-by'] ?? [];
  const currSortTypeParams = getCurrFilterParams.sort ?? [];

  const sortingResults: ISortingPayload[] = [];
  for (let i = 0; i < currSortByParams.length; i++) {
    if (!currSortTypeParams[i]) continue;

    sortingResults.push({
      sortBy: currSortByParams[i],
      sort: currSortTypeParams[i],
    });
  }

  // MARK: state for text inputs (name, generic-name, description)
  const [textFormState, setTextFormState] = useState<{
    name: string;
    'generic-name': string;
    description: string;
  }>({
    name: '',
    'generic-name': '',
    description: '',
  });

  // MARK: TO FETCHDATA
  const productsEndpoint =
    userRole === 'admin' ? '/admin/products' : '/pharmacists/products';
  const { fetchData, data, loading, error } =
    useAxios<IBaseResponse<IFilteredProduct[]>>(productsEndpoint);
  const [pageNumber, setPageNumber] = useState(1);

  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  if (getCurrFilterParams.name) {
    params.append('name', getCurrFilterParams.name);
  }

  if (getCurrFilterParams['generic-name']) {
    params.append('generic-name', getCurrFilterParams['generic-name']);
  }

  if (getCurrFilterParams.description) {
    params.append('description', getCurrFilterParams.description);
  }

  if (getCurrFilterParams['product-classification']) {
    for (const val of getCurrFilterParams['product-classification']) {
      params.append('product-classification', String(val.id));
    }
  }

  if (getCurrFilterParams['product-form']) {
    for (const val of getCurrFilterParams['product-form']) {
      params.append('product-form', String(val.id));
    }
  }

  if (getCurrFilterParams.manufacture) {
    for (const val of getCurrFilterParams.manufacture) {
      params.append('manufacture', String(val.id));
    }
  }

  if (getCurrFilterParams['sort-by']) {
    for (const val of getCurrFilterParams['sort-by']) {
      params.append('sort-by', val);
    }
  }

  if (getCurrFilterParams.sort) {
    for (const val of getCurrFilterParams.sort) {
      params.append('sort', val);
    }
  }

  const handleExecuteFilter = () => {
    if (enableFilterBtn) {
      params.set('page', '1'); // reset to 1
      fetchData({ params });
      setEnableFilterBtn(false);
    }
  };

  useEffect(() => {
    // update the textFormState into redux
    dispatch(
      updateFilterParams({
        name: textFormState.name,
        'generic-name': textFormState['generic-name'],
        description: textFormState.description,
      }),
    );
  }, [textFormState]);

  useEffect(() => {
    fetchData({
      params,
    });
  }, [pageNumber]);

  return (
    // prettier-ignore
    <div className="container w-full px-10"> {/* MARK: DIV GELONDONGAN */}

      <div className="w-full bg-transparent flex items-center justify-between h-20">
        <div className="font-semibold text-2xl">Products</div>

        <NavLink to={"/products/add"} className="add-cta-navlink">
          <CgMathPlus />
          <div>Add Product</div>
        </NavLink>
      </div>

      {/* MARK: FILTER */}
      <div className="w-full sm:hidden md:hidden lg:block bg-white rounded-lg min-h-56 p-2 shadow-md">

        <div className="relative flex flex-col justify-start w-full  items-start h-full pb-3">

          {/* MARK: WHOLE FILTER CONTAINER */}
          <div className=" flex justify-center items-center gap-12 w-full h-full">
          {/* MARK: INPUT-TEXT */}
          <div className="  min-h-56 flex flex-col justify-start items-start gap-3">
            <FilterByText withName={"name"} setStateHandler={setTextFormState} placeholder={"Search for Name..."} title={"Name"}/>
            <FilterByText withName={"generic-name"} setStateHandler={setTextFormState} placeholder={"Search for Generic Name..."} title={"Generic Name"}/>
            <FilterByText withName={"description"} setStateHandler={setTextFormState} placeholder={"Search for Description..."} title={"Description"}/>
          </div>

          <div className=" w-[320px]">
            {/* MARK: SORTINGS */}
            <div className="flex justify-start items-center gap-2 mb-3 hide-scroll">
              {sortingResults.map((val) => (
                <FilterCapsule onName="sorting" sortingResult={val} key={val.sortBy+val.sort}/>
              ))}
            </div>
            <div className="mb-1 flex justify-start items-center  w-full">
              <div className="font-medium text-slate-800 w-14">Sort</div>
              <FilterSortBy />
            </div>

          {/* MARK: DRUG CLASSIFICATION*/}
            <div className="font-medium text-slate-800 mt-4 mb-2">Drug Classifications</div>
            <div className="grid grid-cols-[repeat(2,148px)] grid-rows-[repeat(2,62px)] gap-4 justify-start">
            {drugClassifications.map((drgClf, idx) => (
              <DrugClfCheckboxBtn onKeyName={"product-classification"} drugClfItem={{
                id: idx + 1,
                name: drgClf
              }} checkboxName="drugClfCheckbox" key={drgClf} />
            ))}
            </div>

          </div>

          {/* MARK: PRODUCT FORM */}
          <div className=" w-80 min-h-56 pt-6">
            <div className="font-medium text-slate-800">Product Forms</div>
            <div className="w-full flex justify-start items-start flex-wrap gap-2 mb-1  max-h-[88px] overflow-scroll">
              {getCurrFilterParams["product-form"]?.map((result) => (<FilterCapsule thisResult={result} onName="product-form" key={String(result.id)} />))}
            </div>
            <FVPFilterSearcher endpoint="/products/forms" placeholder="Search for Product Forms..." keyName="product-form" />
          </div>

          {/* MARK: MANUFACTURER */}
          <div className=" w-80 min-h-56 pt-6">
            <div className="font-medium text-slate-800">Manufacturers</div>
            <div className="w-full flex justify-start items-start flex-wrap gap-2 mb-1  max-h-[88px] overflow-scroll">
              {getCurrFilterParams.manufacture?.map((result) => (<FilterCapsule thisResult={result} onName="manufacture" key={String(result.id)} />))}
            </div>
            <FVPFilterSearcher endpoint="/products/manufactures" placeholder="Search for Manufacturers..." keyName="manufacture" />
          </div>
          </div>

          <button
            type="submit"
            className={`${TWCenterize} absolute bottom-1 right-2 self-end gap-2  rounded-lg text-xl text-primary  border-2 border-brand-gray-2 px-4 py-1 hover:bg-brand-gray-2 transition-colors`}
            onClick={handleExecuteFilter}
          >
            <HiMiniMagnifyingGlass className="size-6"/>
          <div className="font-semibold">Filter</div>
          </button>
        </div>
      </div>

      {/* MARK: PRODUCT RESULTS */}
      <div className="mt-4 w-full  rounded-lg min-h-32 py-4">
        <div className="grid grid-cols-[repeat(auto-fit,267px)]  gap-9 justify-center pb-4  !w-full">
          {error && (<div>{"error!:" + error}</div>)}
          {!loading && data?.data.map((d) => {
            return (
            
            <Link to={`${d.id}`} key={`${d.id}${d.name}`} className='outline-none'>
            <ProductCard product={d} />
            </Link>
          )
          })}
        </div>

        {loading && (
          <div className="h-[624px] w-full p-4 flex justify-center  items-start">
            <div className={`flex justify-center items-start  mt-20`}>
              <OrbitProgress
                color={BrandPrimary}
                size="large"
                text=""
                textColor=""
              />
            </div> 
          </div>
        )}

        {/* NOT FOUND */}
        {data && data.data.length === 0 && (
            <>
              <div className="w-full text-center font-semibold text-2xl mt-2">
                No results...
              </div>

              <div className="w-full text-center mt-[-4px]">
                Please try adjusting the filters above
              </div>
            </>
        )}

        {/* MARK: PAGINATION */}
        <div className="mt-14 mb-6 flex justify-center items-center gap-8 w-fit mx-auto my-0">
          {data && data.data.length > 0 && <PaginationButtons totalPage={data.paging.total_page} pageNumber={pageNumber} setPageNumber={setPageNumber} />}
        </div>
      </div>
    </div>
  );
};

export default Products;
