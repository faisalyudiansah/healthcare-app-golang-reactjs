import axios, { AxiosError, RawAxiosRequestHeaders } from "axios";
import { useState } from "react";
import { IErrorMessage } from "../models/ErrorMessage";

interface Props {
  url: string;
  method?: "post" | "get" | "put" | "delete";
  headers?: RawAxiosRequestHeaders;
}

function useAxiosForm<T>({ url, method = "post", headers }: Props) {
  const [data, setData] = useState<T>();
  const [error] = useState("");
  const [loading, setloading] = useState(false);

  const h: RawAxiosRequestHeaders = {
    ...headers,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const fetchData = async (
    body: unknown,
    completionHandler: (result: T | IErrorMessage) => void
  ) => {
    setloading(true);

    axios[method]<T>(url, body, {
      headers: h,
    })
      .then((res) => {
        setData(res.data);
        completionHandler(res.data);
      })
      .catch(function (error: AxiosError<{ message: string }>) {
        let err: IErrorMessage;
        if (error.status !== 500) {
          err = {
            message:
              error.response?.data.message ?? "Failed to send error message...",
          };
        } else {
          err = {
            message: "Sorry, please try again later... (CODE: 500)",
          };
        }
        completionHandler(err);
      })
      .finally(() => {
        setloading(false);
      });
  };

  return { data, error, loading, fetchData };
}

export default useAxiosForm;
