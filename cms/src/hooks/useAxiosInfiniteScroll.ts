import axios from "axios";
import { useState } from "react";
import IBaseResponse from "../models/IBaseResponse";

const jwtKey = import.meta.env.VITE_JWT_KEY_DELETE_LATER;

const useAxiosInfiniteScroll = <T>(url: string, limit: number = 8) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = (pageNumber: number, q: string = "") => {
    setLoading(true);

    axios
      .get<IBaseResponse<T[]>>(url, {
        headers: {
          Authorization: `Bearer ${jwtKey}`,
        },
        params: {
          limit: limit,
          page: pageNumber,
          q: q,
        },
      })
      .then((res) => {
        setData(res.data.data);

        const next = res.data.paging.links.next;
        const last = res.data.paging.links.last;
        setHasMore(next !== last);
      })
      .catch((e) => {
        setError((e as Error).message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { fetchData, data, error, loading, hasMore };
};

export default useAxiosInfiniteScroll;
