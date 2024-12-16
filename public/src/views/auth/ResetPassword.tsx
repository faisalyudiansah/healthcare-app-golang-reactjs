import FormResetPassword from "@/components/layout/auth/FormResetPassword";
import { showErrorToast } from "@/components/template/toastify/Toast";
import { AppDispatch, RootState } from "@/stores";
import { resetResetPasswordError } from "@/stores/slices/authSlices/authSlice";
import { useEffect } from "react";
import { FaCheck, FaExclamation } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isResetPasswordError, errorResetPasswordMsg } = useSelector((state: RootState) => state.authReducer);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isResetPasswordError) {
      showErrorToast(errorResetPasswordMsg);
      timerId = setTimeout(() => {
        dispatch(resetResetPasswordError());
      }, 3000);
    }

    return () => clearTimeout(timerId);
  }, [errorResetPasswordMsg, isResetPasswordError]);

  return (
    <>
      <FormResetPassword />
      <ToastContainer icon={isResetPasswordError ? <FaExclamation /> : <FaCheck />} />
    </>
  )
}

export default ResetPassword