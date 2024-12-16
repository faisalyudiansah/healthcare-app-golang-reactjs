import IBaseResponse from "./IBaseResponse";

export interface ICredentials {
  email: string;
  password: string;
}

export type TSignInResponse = IBaseResponse<{ access_token: string }>;
