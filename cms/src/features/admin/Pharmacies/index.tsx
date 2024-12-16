import { PiExportBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import useAxios from '@/hooks/useAxios';
import IBaseResponse from '@/models/IBaseResponse';
import { PharmacyDetail } from '@/models/Pharmacies';
import { AppDispatch } from '@/store';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { BsPencilSquare } from 'react-icons/bs';
import { FaTrashAlt } from 'react-icons/fa';
import { ConvertActiveStatus } from '@/utils/StringFormatter';
import { CgMathPlus } from 'react-icons/cg';
import { BrandPrimary, TWCenterize } from '@/utils/UI/TWStrings';
import { OrbitProgress } from 'react-loading-indicators';
import {
  setShowCreatePharmaciesModal,
  setShowUpdatePharmaciesModal,
} from '@/store/modals/modalsSlice';
import {
  getFilterPharmacies,
  setSelectedPharmacy,
} from '@/store/pharmacies/pharmaciesSlice';
import ExportCSVModal from './ExportCSVModal';
import PharmaciesFilter from './PharmaciesFilter';
import PharmaciesFilterCell from './PharmaciesFilterCell';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';

export type PharmaciesDataWithActions = PharmacyDetail & {
  isEditing: boolean;
  isLoading: boolean;
};

const Pharmacies = () => {
  useEffect(() => {
    document.title = 'Pathosafe - Pharmacies';
  }, []);
  const dispatch = useDispatch<AppDispatch>();
  const currFilter = useSelector(getFilterPharmacies);
  const [pageNumber, setPageNumber] = useState(1);

  const params = new URLSearchParams();
  params.append('limit', '10');
  params.append('page', String(pageNumber));
  const [userId, setUserId] = useState<number | null>();

  const user = useAuthUser<IUser>();
  const role = user?.role === 'admin' ? 'admin' : 'pharmacists';

  const { fetchData, data, loading, error } = useAxios<
    IBaseResponse<PharmacyDetail[]>
  >(`/${role}/pharmacies`);

  const [dataWithActions, setDataWithActions] = useState<
    PharmaciesDataWithActions[] | null
  >();

  useEffect(() => {
    if (data) {
      setDataWithActions(
        data.data.map((d) => ({
          ...d,
          isEditing: false,
          isLoading: false,
        })),
      );
    }
  }, [data]);

  useEffect(() => {
    if (currFilter.name) {
      params.append('name', currFilter.name);
    }
    if (currFilter.partner.name) {
      params.append('partner', String(currFilter.partner.id));
    }
    if (currFilter.pharmacist.name) {
      params.append('pharmacist', String(currFilter.pharmacist.id));
    }
    fetchData({ params });
  }, [currFilter]);

  const columns: ColumnDef<PharmacyDetail>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name,
    },
    {
      id: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address,
    },
    {
      id: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city,
    },
    {
      id: 'partner.name',
      header: 'Partner',
      cell: ({ row }) => row.original.partner.name,
    },
    {
      id: 'pharmacist.name',
      header: 'Pharmacist',
      cell: ({ row }) => row.original.pharmacist.name,
    },
    {
      id: 'is_active',
      header: 'Status',
      cell: ({ row }) => ConvertActiveStatus(row.original.is_active),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => ActionColumn(row.original),
    },
  ];

  const table = useReactTable({
    data: dataWithActions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data?.paging.total_page || -1,
  });

  // RESET EXPORT MODAL
  const [shouldReset, setShouldReset] = useState(false);

  const ActionColumn = (data: PharmacyDetail): ReactNode => {
    return (
      <div className="flex items-center justify-center gap-4">
        <div className="table-tools-icon relative opacity-85">
          <BsPencilSquare
            className="size-5 text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => {
              dispatch(setShowUpdatePharmaciesModal(true));
              dispatch(setSelectedPharmacy(data.id));
              console.log('Edit clicked', data.id, data);
            }}
          />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Edit
          </div>
        </div>

        <div className="table-tools-icon relative opacity-85">
          <FaTrashAlt
            className="size-5 text-red-700 hover:text-red-900 cursor-pointer"
            onClick={() => {
              console.log('Delete clicked', data.id, data);
            }}
          />
          <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
            Delete
          </div>
        </div>

        <Dialog
          onOpenChange={(isOpen) => {
            // setShouldReset(!isOpen);
          }}
        >
          <DialogTrigger asChild className="h-0">
            <div
              className={`table-tools-icon relative ${TWCenterize} opacity-85 `}
            >
              <Button variant="link" className="px-0 py-0">
                <PiExportBold className="size-6 text-purple-500 hover:text-purple-700 cursor-pointer" />
              </Button>
              <div className="bg-slate-600 p-1 px-2 text-xs text-white absolute bottom-full opacity-0 rounded-md tracking-wider">
                CSV
              </div>
            </div>
          </DialogTrigger>

          <ExportCSVModal
            shouldReset={shouldReset}
            pharmacyId={data.id}
            onPharmacyName={data.name}
          />
        </Dialog>
      </div>
    );
  };

  return (
    <div>
      <div className="container w-full h-full px-10">
        <div className="mt-6 mb-4 flex justify-between items-center h-12">
          <div className="text-2xl font-semibold">Pharmacies</div>
          {role == 'admin' && (
            <button
              type="button"
              className="add-cta-navlink"
              onClick={() => dispatch(setShowCreatePharmaciesModal(true))}
            >
              <CgMathPlus />
              Add Pharmacies
            </button>
          )}
        </div>

        <div className="flex justify-start items-center gap-4 mb-5">
          <PharmaciesFilter />
          {currFilter.name && (
            <PharmaciesFilterCell field={'Pharmacy'} object={currFilter.name} />
          )}
          {currFilter.partner.name && (
            <PharmaciesFilterCell
              field={'Partner'}
              object={currFilter.partner.name}
            />
          )}
          {role === 'admin' && currFilter.pharmacist.name && (
            <PharmaciesFilterCell
              field={'Pharmacist'}
              object={currFilter.pharmacist.name}
            />
          )}
        </div>

        <div className="relative overflow-x-auto overflow-y-auto max-h-[75vh] rounded-lg border-2 border-brand-gray-2">
          <table className="w-full text-left text-slate-700">
            <thead className="h-12 text-sm font-bold text-brand-lightgreen bg-primary2">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="text-sm">
              {dataWithActions && dataWithActions.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    {loading ? (
                      <div className={`${TWCenterize} mt-20`}>
                        <OrbitProgress
                          color={BrandPrimary}
                          size="large"
                          text=""
                          textColor=""
                        />
                      </div>
                    ) : error ? (
                      <div>Something went wrong...</div>
                    ) : (
                      <div>No pharmacies found.</div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pharmacies;
