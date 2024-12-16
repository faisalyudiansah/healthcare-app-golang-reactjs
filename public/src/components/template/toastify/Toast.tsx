import { toast } from "react-toastify";
import { FaCheck, FaExclamation } from "react-icons/fa";

export const showSuccessToast = (bodyText: string | null) => {
    toast.success(`${bodyText}`, {
        position: "top-right",
        autoClose: 2400,
        icon: FaCheck
    });
};

export const showErrorToast = (bodyText: string | null) => {
    toast.error(`${bodyText}`, {
        position: "top-right",
        autoClose: 2400,
        icon: FaExclamation
    });
};
