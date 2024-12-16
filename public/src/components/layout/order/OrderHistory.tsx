import React, { useState, useEffect, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useIntersection } from "@mantine/hooks";
import axios from "axios";
import OrderItem from "./OrderItem";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { IconReceipt } from "@tabler/icons-react";
import emptyOrderImg from "@/assets/svg/order/empty-order.svg";
import { OrderResponse } from "@/stores/slices/orderSlices";

const fetchOrderHistory = async (
  pageParam: number,
  status: number = 0,
  q: string,
  sort: string,
  sortBy: string,
  accessToken: string
): Promise<OrderResponse> => {
  const link = `${import.meta.env.VITE_BASE_URL
    }/orders?limit=10&page=${pageParam}&status=${status}&q=${q}&sort=${sort}&sortBy=${sortBy}`;
  const response = await axios.get(link, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 1000,
  });
  return response.data;
};

const OrderState: React.FC<{ status: number; q: string; sortOpt: string }> = ({
  status,
  q,
  sortOpt,
}) => {
  const navigate = useNavigate();
  const [cookie] = useCookies(["access_token"]);
  const [sortBy, sort] = sortOpt.split(" ");

  const {
    isLoading,
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["orderHistory", status, q, sortOpt],
    queryFn: ({ pageParam = 1 }) =>
      fetchOrderHistory(
        pageParam,
        status,
        q,
        sort,
        sortBy,
        cookie.access_token
      ),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.paging.total_page ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  const lastItemRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastItemRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleChangeLocation = () => {
    navigate("/");
  };

  const isEmpty = data?.pages.every((page) => page.data.length === 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <OrderItem key={idx} isLoading />
          ))}
      </div>
    );
  }

  if (error || isEmpty) {
    return (
      <div className="w-full flex justify-center items-center h-full my-8">
        <div className="container border-t border-t-white dark:border-t-primarypink p-4 flex flex-col justify-center items-center gap-8">
          <img src={emptyOrderImg} alt="Not Found" className="max-h-[30vh]" />
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="font-bold text-primarypink text-xl">
              Oops, Nggak Ada Order Nih 😔
            </h2>
            <p className="text-zinc-500">Belanja Dulu Yuk!</p>
          </div>
          <Button
            className="w-[40%] bg-primarypink dark:bg-white dark:text-black text-white flex justify-center items-center gap-2 border border-transparent hover:bg-white hover:border-primarypink hover:text-primarypink transition-all ease-in-out duration-200 text-xl py-6 font-bold"
            onClick={handleChangeLocation}
          >
            <IconReceipt />
            <span className="text-center">Belanja</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full rounded-md">
      <div className="w-full flex flex-col gap-4 h-[65vh]">
        {data?.pages.map((page, pageIndex) =>
          page?.data.map((order, orderIndex) => {
            const isLast =
              pageIndex === data.pages.length - 1 &&
              orderIndex === page.data.length - 1;
            return (
              <div key={order.id} ref={isLast ? ref : null}>
                <OrderItem order={order} />
              </div>
            );
          })
        )}
        {isFetchingNextPage &&
          Array(5)
            .fill(0)
            .map((_, idx) => <OrderItem key={`loading-${idx}`} isLoading />)}
      </div>
    </ScrollArea>
  );
};

const OrderHistory = ({ width }: {
  width: string
}) => {
  const tabs = [
    { value: "semua", status: 0 },
    { value: "menunggu", status: 1 },
    { value: "diproses", status: 2 },
    { value: "dikirim", status: 3 },
    { value: "selesai", status: 4 },
    { value: "dibatalkan", status: 5 },
  ];

  const [sortOpt, setSortOpt] = useState("date desc");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const debounceQuery = useDebounce(query, 600);

  const handleChangeSortOpt = (value: string) => {
    setSortOpt(value);
  };

  return (
    <div className="w-full flex justify-center items-start my-8 h-full">
      <div className={`${width} container py-4 px-8 shadow-lg flex flex-col`}>
        <div className="flex flex-col gap-4 flex-grow">
          <ScrollArea className="w-full rounded-md">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari transaksimu disini"
                  className="rounded-lg bg-background pl-8 w-[300px] lg:w-[380px] text-sm md:text-base focus-visible:ring-transparent focus-visible:border-primarypink"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select onValueChange={handleChangeSortOpt}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Urut Berdasarkan" />
                </SelectTrigger>
                <SelectContent className="focus:ring-transparent focus:outline-primarypink">
                  <SelectGroup>
                    <SelectItem value="date asc">
                      Tanggal <SortAsc className="inline size-4" />
                    </SelectItem>
                    <SelectItem value="date desc">
                      Tanggal <SortDesc className="inline size-4" />
                    </SelectItem>
                    <SelectItem value="amount asc">
                      Jumlah <SortAsc className="inline size-4" />
                    </SelectItem>
                    <SelectItem value="amount desc">
                      Jumlah <SortDesc className="inline size-4" />
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <ScrollBar orientation="horizontal" className="mt-8" />
          </ScrollArea>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-grow"
          >
            <ScrollArea className="w-full rounded-md">
              <div className="flex gap-4 items-center">
                <h3 className="font-bold text-base md:text-lg">Status</h3>
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.value.charAt(0).toUpperCase() + tab.value.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <ScrollBar orientation="horizontal" className="mt-4" />
            </ScrollArea>

            <div className="flex-grow overflow-hidden">
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="h-full"
                >
                  <OrderState
                    status={tab.status}
                    sortOpt={sortOpt}
                    q={debounceQuery}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
