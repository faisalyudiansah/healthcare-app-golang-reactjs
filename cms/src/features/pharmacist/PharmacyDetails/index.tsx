import SegmentedControl, {
  Segment,
} from '@/components/organisms/SegmentedControl';
import { IPharmacyProduct } from '@/models/Pharmacies';
import { toRpFormattedShort } from '@/utils/CurrencyFormatter';
import { TWCenterize, TWColCenterize } from '@/utils/UI/TWStrings';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EditPharmacyProduct from './EditPharmacyProduct';
import DeletePharmacyProduct from './DeletePharmacyProduct';
import { IoArrowBackOutline } from 'react-icons/io5';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import PaginationButtons from '@/components/ui/PaginationButtons';
import FilterByText from '@/components/ui/FilterByText';
import FilterCapsule from './FilterCapsule';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFilterParams,
  updateFilterParams,
} from '@/store/filterProduct/filterProductsSlice';
import { ISortingPayload } from '@/store/filterProduct/filterProductsType';
import FilterSortBy from '@/features/admin/Products/FilterSortBy';
import DrugClfCheckboxBtn from '@/components/ui/DrugClfCheckboxBtn';
import drugClassifications from '@/models/DrugClassifications';
import FVPFilterSearcher from '@/components/ui/FVPFilterSearcher';
import { AppDispatch } from '@/store';
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import UpdatePharmacies from '@/features/admin/UpdatePharmacies';

export type TPharmacyDetailsSegment = 'pharmacy' | 'products';

const PharmacyDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const { pharmacyId } = useParams<{ pharmacyId: string }>();

  // GET PHARMACY'S PRODUCTS
  const [pageNumber, setPageNumber] = useState(1);
  const params = new URLSearchParams();
  params.append('limit', '25');
  params.append('page', String(pageNumber));

  const { fetchData, data, loading, error } = useAxios<
    IBaseResponse<IPharmacyProduct[]>
  >(`/pharmacists/pharmacies/${pharmacyId}/products`);

  useEffect(() => {
    fetchData({ params });
  }, [pageNumber]);

  // PHARMACY NAME
  const pharmacyName: string = decodeURIComponent(
    searchParams.get('name') ?? 'Pharmacy',
  );

  // SHOULDREFETCH
  const [shouldRefetch, setShouldRefetch] = useState(false);
  useEffect(() => {
    if (shouldRefetch) {
      // FETCH AGAIN
      console.log(shouldRefetch);
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const toSegment: TPharmacyDetailsSegment | null = searchParams.get(
    'segment',
  ) as TPharmacyDetailsSegment | null;

  const segments: Segment<TPharmacyDetailsSegment>[] = [
    {
      label: 'Pharmacy',
      value: 'pharmacy',
      ref: useRef<HTMLDivElement>(null),
    },
    {
      label: 'Products',
      value: 'products',
      ref: useRef<HTMLDivElement>(null),
    },
  ];

  const [selectedSegment, setSelectedSegment] =
    useState<TPharmacyDetailsSegment>(toSegment ?? 'pharmacy');
  const [shouldResetDialog, setShouldResetDialog] = useState(false);

  const editOrDeleteNode = (
    product: IPharmacyProduct,
    index: number,
  ): ReactNode => {
    return (
      <>
        <Dialog
          onOpenChange={(isOpen) => {
            setShouldResetDialog(!isOpen);
          }}
        >
          <DialogTrigger asChild>
            <div
              className={`table-tools-icon-2 relative ${TWCenterize} opacity-85 `}
            >
              <Button variant="link" className="px-0 py-0">
                <BsPencilSquare className="size-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
              </Button>
              <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
                Edit
              </div>
            </div>
          </DialogTrigger>

          {/* MARK: EDIT PRODUCT MODAL */}
          <EditPharmacyProduct
            shouldResetDialog={shouldResetDialog}
            setShouldRefetch={setShouldRefetch}
            product={product}
          />
        </Dialog>

        <Dialog
          onOpenChange={(isOpen) => {
            setShouldResetDialog(!isOpen);
          }}
        >
          <DialogTrigger asChild>
            <div
              className={`table-tools-icon-2 relative ${TWCenterize} opacity-85 `}
            >
              <Button variant="link" className="px-0 py-0">
                <FaTrashAlt className="size-5 text-red-700 hover:text-red-900 cursor-pointer" />
              </Button>
              <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
                Delete
              </div>
            </div>
          </DialogTrigger>

          {/* MARK: DELETE PRODUCT MODAL */}
          <DeletePharmacyProduct
            shouldResetDialog={shouldResetDialog}
            setShouldRefetch={setShouldRefetch}
            product={product}
          />
        </Dialog>
      </>
    );
  };

  // FILTERS

  // SELECTORS
  const getCurrFilterParams = useSelector(getFilterParams);
  const currSortByParams = getCurrFilterParams['sort-by'] ?? [];
  const currSortTypeParams = getCurrFilterParams.sort ?? [];

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

  // DEBOUNCE FILTER BUTTON
  const [enableFilterBtn, setEnableFilterBtn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setEnableFilterBtn(true);
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  }, [enableFilterBtn]);

  const handleExecuteFilter = () => {
    if (enableFilterBtn) {
      params.set('page', '1'); // reset to 1
      fetchData({ params });
      setEnableFilterBtn(false);
    }
  };

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

  return (
    <div className="container w-full min-h-[100vh] px-10 pt-3">
      <div className="flex justify-start items-center gap-5 mt-4 mb-6">
        <div
          className={`${TWCenterize} cursor-pointer  size-10 bg-white rounded-full`}
          onClick={() => navigate('/pharmacies')}
        >
          <IoArrowBackOutline className="text-slate-300 size-8 hover:text-slate-400 transition-colors" />
        </div>
        <div className="text-2xl font-semibold text-slate-600">
          {pharmacyName}
        </div>
      </div>

      <SegmentedControl<TPharmacyDetailsSegment>
        callback={(val) => setSelectedSegment(val)}
        name="hehe"
        controlRef={useRef<HTMLDivElement>(null)}
        segments={segments}
        defaultIndex={
          segments.indexOf(
            segments.filter((d) => d.value === selectedSegment)[0],
          ) ?? 0
        }
      />

      {/* MARK: SELECTED CONTENT */}
      <div
        className={`relative overflow-x-auto rounded-lg mt-[20px] ${TWCenterize}`}
      >
        {selectedSegment === 'pharmacy' ? (
          <div>
            <UpdatePharmacies />
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="flex flex-col justify-start items-center gap-5">
            <div className="w-full sm:hidden md:hidden lg:block bg-white rounded-lg min-h-56 p-2 shadow-md">
              <div className="relative flex flex-col justify-start w-full  items-start h-full pb-3 ">
                {/* MARK: WHOLE FILTER CONTAINER */}
                <div className=" flex justify-center items-center gap-12 w-full h-full px-2">
                  {/* MARK: INPUT-TEXT */}
                  <div className="  min-h-56 flex flex-col justify-start items-start gap-3">
                    <FilterByText
                      withName={'name'}
                      setStateHandler={setTextFormState}
                      placeholder={'Search for Name...'}
                      title={'Name'}
                    />
                    <FilterByText
                      withName={'generic-name'}
                      setStateHandler={setTextFormState}
                      placeholder={'Search for Generic Name...'}
                      title={'Generic Name'}
                    />
                    <FilterByText
                      withName={'description'}
                      setStateHandler={setTextFormState}
                      placeholder={'Search for Description...'}
                      title={'Description'}
                    />
                  </div>

                  <div className=" w-[320px]">
                    {/* MARK: SORTINGS */}
                    <div className="flex justify-start items-center gap-2 mb-3 hide-scroll">
                      {sortingResults.map((val) => (
                        <FilterCapsule
                          onName="sorting"
                          sortingResult={val}
                          key={val.sortBy + val.sort}
                        />
                      ))}
                    </div>
                    <div className="mb-1 flex justify-start items-center  w-full">
                      <div className="font-medium text-slate-800 w-14">
                        Sort
                      </div>
                      <FilterSortBy />
                    </div>

                    {/* MARK: DRUG CLASSIFICATION*/}
                    <div className="font-medium text-slate-800 mt-4 mb-2">
                      Drug Classifications
                    </div>
                    <div className="grid grid-cols-[repeat(2,148px)] grid-rows-[repeat(2,62px)] gap-4 justify-start">
                      {drugClassifications.map((drgClf, idx) => (
                        <DrugClfCheckboxBtn
                          onKeyName={'product-classification'}
                          drugClfItem={{
                            id: idx + 1,
                            name: drgClf,
                          }}
                          checkboxName="drugClfCheckbox"
                          key={drgClf}
                        />
                      ))}
                    </div>
                  </div>

                  {/* MARK: PRODUCT FORM */}
                  <div className=" w-80 min-h-56 pt-6">
                    <div className="font-medium text-slate-800">
                      Product Forms
                    </div>
                    <div className="w-full flex justify-start items-start flex-wrap gap-2 mb-1  max-h-[88px] overflow-scroll">
                      {getCurrFilterParams['product-form']?.map((result) => (
                        <FilterCapsule
                          thisResult={result}
                          onName="product-form"
                          key={String(result.id)}
                        />
                      ))}
                    </div>
                    <FVPFilterSearcher
                      endpoint="/products/forms"
                      placeholder="Search for Product Forms..."
                      keyName="product-form"
                    />
                  </div>

                  {/* MARK: MANUFACTURER */}
                  <div className=" w-80 min-h-56 pt-6">
                    <div className="font-medium text-slate-800">
                      Manufacturers
                    </div>
                    <div className="w-full flex justify-start items-start flex-wrap gap-2 mb-1  max-h-[88px] overflow-scroll">
                      {getCurrFilterParams.manufacture?.map((result) => (
                        <FilterCapsule
                          thisResult={result}
                          onName="manufacture"
                          key={String(result.id)}
                        />
                      ))}
                    </div>
                    <FVPFilterSearcher
                      endpoint="/products/manufactures"
                      placeholder="Search for Manufacturers..."
                      keyName="manufacture"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`${TWCenterize} absolute bottom-1 right-2 self-end gap-2 bg-brand-gray-2 px-6 py-3 rounded-lg text-xl text-primary `}
                  onClick={handleExecuteFilter}
                >
                  <HiMiniMagnifyingGlass className="size-6" />
                  <div className="font-semibold">Filter</div>
                </button>
              </div>
            </div>
            <div className="relative overflow-x-auto rounded-lg border-2 border-brand-gray-2 mt-2 w-[80%] mb-20">
              {/* MARK: FILTER */}
              <table className="w-full  text-center  text-slate-700 ">
                <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
                  <tr>
                    <th scope="col" className="px-6 w-[10%]">
                      ID
                    </th>

                    <th scope="col" className="px-6 text-left">
                      Name
                    </th>

                    <th scope="col" className="px-6 text-left">
                      Price
                    </th>

                    <th scope="col" className="px-6 w-[10%]">
                      Quantity
                    </th>

                    <th scope="col" className="w-[20%]">
                      Status
                    </th>

                    <th scope="col" className="px-6 w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {data && data.data.length > 0 ? (
                    data.data.map((d, idx) => (
                      <tr
                        className="bg-white border-b  hover:bg-slate-50"
                        key={idx}
                      >
                        <td className="px-6 py-4">{d.id}</td>
                        <td className="px-6 py-4 text-left">
                          {d.product.name}
                        </td>
                        <td className="px-6 py-4 text-left">
                          {toRpFormattedShort(Number(d.price))}
                        </td>
                        <td className="px-6 py-4">{d.stock_quantity}</td>
                        <td className={`px-6 py-4 w-[20%] `}>
                          <div className={`w-full ${TWCenterize}`}>
                            {d.is_active ? (
                              <div
                                className={`bg-green-200 text-green-600 px-4 py-0.5 font-semibold rounded-full text-center text-sm`}
                              >
                                Active
                              </div>
                            ) : (
                              <div className="bg-red-200 text-red-600 px-4 py-0.5 font-semibold rounded-full text-center text-sm">
                                Inactive
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td
                          className={`px-6 py-4 ${TWColCenterize} gap-5 border-l-2 border-slate-100`}
                        >
                          <div
                            className={` w-full h-full ${TWCenterize} gap-4`}
                          >
                            {editOrDeleteNode(d, idx)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <div>ok</div>
                  )}
                </tbody>
              </table>

              {/* MARK: PAGINATION */}
              <div className="mt-14 mb-6 flex justify-center items-center gap-8 w-fit mx-auto my-0">
                {data && (
                  <PaginationButtons
                    totalPage={data.paging.total_page}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>No products were enlisted in this Pharmacy</div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDetails;
