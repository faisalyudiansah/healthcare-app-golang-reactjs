export type RequestLogin = {
    email: string;
    password: string;
};

export type RequestRegister = {
    email: string;
    password: string;
};

export type RequestForgetPassword = {
    email: string;
};

export type RequestVerifyAccount = {
    verification_token: string | null;
    email: string | null;
    password: string;
};

export type RequestResetPassword = {
    reset_token: string | null;
    email: string | null;
    password: string;
};