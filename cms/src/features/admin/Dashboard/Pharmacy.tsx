import { Input } from '@/components/ui/input';
import { RootState } from '@/store';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  addEndDate,
  addPharmacy,
  addStartDate,
  removePharmacy,
} from '@/store/dashboardSlice';
import { IconX } from '@tabler/icons-react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate } from '@/lib/format';

interface Pharmacist {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

interface PharmacyData {
  id: number;
  name: string;
  address: string;
  city: string;
  pharmacist: Pharmacist;
  partner: Partner;
  is_active: boolean;
}

interface Paging {
  size: number;
  last: string;
  next: boolean;
}

interface PharmacyResponse {
  message: string;
  data: PharmacyData[];
  paging: Paging;
}

const fetchPharmacies = async (
  pageParam: number,
  query: string,
  accessToken: string,
): Promise<PharmacyResponse> => {
  const response = await axios.get(
    `/admin/pharmacies?name=${query}&limit=10&last=${pageParam}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

const Pharmacy: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.dashboard);
  const [cookie] = useCookies(['auth']);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 800);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['pharmacies', debouncedQuery],
      queryFn: ({ pageParam = 0 }) =>
        fetchPharmacies(pageParam, debouncedQuery, cookie.auth),
      getNextPageParam: (lastPage) => {
        return lastPage.paging.next
          ? parseInt(lastPage.paging.last) + 1
          : undefined;
      },
      initialPageParam: 0,
    });

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        ref(node);
      }
    },
    [ref],
  );

  return (
    <div className="relative m-8 h-52 shadow-lg rounded-lg bg-white p-4 flex flex-col gap-4">
      <div className="w-full flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !startDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, 'PPP')
              ) : (
                <span>Pick Start Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(e) => {
                setStartDate(e);
                if (e) {
                  dispatch(addStartDate({ date: formatDate(e) }));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !endDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'PPP') : <span>Pick End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(e) => {
                setEndDate(e);
                if (e) {
                  dispatch(addEndDate({ date: formatDate(e) }));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search pharmacy..."
          className="rounded-lg bg-background pl-8 w-full text-lg focus-visible:ring-transparent focus-visible:border-primarypink"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {debouncedQuery && (
        <div className="flex flex-col bg-white w-max rounded-lg shadow-xl absolute top-28 max-h-24 overflow-scroll z-10">
          {data?.pages.map((page, pageIndex) =>
            page?.data.map((pharmacy, index) => {
              const isLastItem =
                pageIndex === data.pages.length - 1 &&
                index === page.data.length - 1;

              return (
                <div
                  key={pharmacy.id}
                  className="hover:bg-gray-100 bg-opacity-20 transition-all ease-in-out p-4"
                  onClick={() => {
                    if (state.pharmacy.length < 5) {
                      dispatch(
                        addPharmacy({
                          pharmacyId: pharmacy.id,
                          name: pharmacy.name,
                        }),
                      );
                    }
                  }}
                  ref={isLastItem ? lastItemRef : null}
                >
                  {pharmacy.name}
                </div>
              );
            }),
          )}
        </div>
      )}

      <ScrollArea className="w-full rounded-md">
        <div className="flex flex-wrap gap-4 my-4">
          {state.pharmacy.length > 0 &&
            state.pharmacy.map((pharmacy) => (
              <div className="flex items-center w-max bg-blue-300 p-2 rounded-lg gap-2">
                <p>{pharmacy.name}</p>
                <IconX
                  className="text-red-500 cursor-pointer hover:text-red-300 transition-all"
                  onClick={() => {
                    console.log('click');
                    dispatch(removePharmacy({ pharmacyId: pharmacy.id }));
                  }}
                />
              </div>
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Pharmacy;
