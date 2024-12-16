import FormVerifyAccount from "@/components/layout/auth/FormVerifyAccount"
import { showErrorToast } from "@/components/template/toastify/Toast";
import { AppDispatch, RootState } from "@/stores";
import { resetVerifyAccountError } from "@/stores/slices/authSlices/authSlice";
import { useEffect } from "react";
import { FaCheck, FaExclamation } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

const VerifyAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { errorVerifyAccountMsg, isVerifyAccountError } = useSelector((state: RootState) => state.authReducer);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isVerifyAccountError) {
      showErrorToast(errorVerifyAccountMsg);
      timerId = setTimeout(() => {
        dispatch(resetVerifyAccountError());
      }, 3000);
    }
    return () => clearTimeout(timerId);

  }, [errorVerifyAccountMsg, isVerifyAccountError]);

  return (
    <>
      <FormVerifyAccount />
      <ToastContainer icon={isVerifyAccountError ? <FaExclamation /> : <FaCheck />} />
    </>
  )
}

export default VerifyAccount