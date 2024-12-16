import { Navbar } from '@/components/layouts/Navbar';
import Pharmacy from './Pharmacy';
import { useCookies } from 'react-cookie';
import { ReportResponse } from '@/store/dashboardSlice';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useInView } from 'react-intersection-observer';
import { useCallback, useEffect } from 'react';
import AdminDashboard from './Dashboard';

const fetchReport = async (
  pageParam: number,
  pharmacy: { id: number; name: string }[],
  startDate: string,
  endDate: string,
  accessToken: string,
): Promise<ReportResponse> => {
  let link = `/admin/reports/sales?limit=10&page=${pageParam}`;

  if (pharmacy.length > 0) {
    pharmacy.forEach((item) => (link += `&pharmacy=${item.id}`));
  }

  link += `&start-date=${startDate}&end-date=${endDate}`;

  const response = await axios.get(link, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Pathosafe - Dashboard';
  }, []);

  const [cookie] = useCookies(['auth']);
  const state = useSelector((state: RootState) => state.dashboard);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: [
        'reports',
        JSON.stringify(state.pharmacy),
        state.startDate,
        state.endDate,
      ],
      queryFn: ({ pageParam = 1 }) =>
        fetchReport(
          pageParam,
          state.pharmacy,
          state.startDate,
          state.endDate,
          cookie.auth,
        ),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return nextPage <= lastPage.paging.total_page ? nextPage : undefined;
      },
      initialPageParam: 1,
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
    // <div className="w-full h-full  min-h-[100vh]">
    <div className="flex-1 overflow-y-auto">
      {/* <div className="w-full h-full pl-[350px] min-h-[100vh]"> */}
      <Navbar />

      <div className="container">
        <div className="px-8 mt-8 font-semibold text-2xl">Dashboard</div>
        <Pharmacy />

        <div className="flex flex-col gap-4">
          {data?.pages[0]?.data.length === 0 && (
            <>
              <div className="w-full text-center font-semibold text-2xl mt-2">
                No results...
              </div>

              <div className="w-full text-center mt-[-4px]">
                Please try adjusting the filters above
              </div>
            </>
          )}

          {data?.pages.map((page, pageIndex) =>
            page?.data.map((report, index) => {
              const isLastItem =
                pageIndex === data.pages.length - 1 &&
                index === page.data.length - 1;

              console.log(report);
              return (
                <div key={index + 1} ref={isLastItem ? lastItemRef : null}>
                  <AdminDashboard report={report} />
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
