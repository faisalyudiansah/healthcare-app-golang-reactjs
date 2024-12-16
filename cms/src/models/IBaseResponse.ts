export default interface IBaseResponse<T> {
  message: string;
  data: T;
  paging: {
    total_page: number;
    links: {
      next: string;
      last: string;
    };
  };
  errors: unknown[];
}
