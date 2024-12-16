export type ErrorRequestBody = {
    message: string;
    errors: [
        {
            field: string;
            message: string;
        },
    ];
};

export type ErrorRequestInvalid = {
    message: string;
};
