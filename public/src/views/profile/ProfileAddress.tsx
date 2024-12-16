import { AppDispatch, RootState } from "@/stores";
import { useDispatch, useSelector } from "react-redux";
import { FaExclamation, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import ModalUpdateAddress from "@/components/template/modal/profile/ModalUpdateAddress";
import { Address } from "@/@types/profile/response";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import {
  deleteMyAddress,
  patchActiveAddress,
  resetAddMyAddressError,
  resetDeleteMyAddressError,
  resetPatchActiveAddressError,
  resetPutUpdateAddressError,
} from "@/stores/slices/addressSlices/addressSlice";
import { showErrorToast, showSuccessToast } from "@/components/template/toastify/Toast";
import { useCookies } from "react-cookie";
import { getMe } from "@/stores/slices/authSlices/authSlice";
import Swal from "sweetalert2";
import ReactDOMServer from "react-dom/server";
import ModalAddAddress from "@/components/template/modal/profile/ModalAddAddress";
import notFound from "@/assets/images/maps/not-found.png";

const ProfileAddress = ({ titlePage }: { titlePage: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(["access_token"]);
  const { dataUser } = useSelector((state: RootState) => state.authReducer);
  const {
    isUpdateAddressError,
    errorUpdateAddressMsg,
    isUpdateAddressSuccess,
    isActiveAddressError,
    errorActiveAddressMsg,
    isActiveAddressSuccess,
    isActiveAddressLoading,
    isDeleteMyAddressError,
    errorDeleteMyAddressMsg,
    isDeleteMyAddressSuccess,
    isDeleteMyAddressLoading,
    errorAddMyAddressMsg,
    isAddMyAddressSuccess,
    isAddMyAddressError,
  } = useSelector((state: RootState) => state.addressReducer);

  const addressKeys: { keyData: string; value: keyof Address }[] = [
    { keyData: "Address", value: "address" },
    { keyData: "Province", value: "province" },
    { keyData: "City", value: "city" },
    { keyData: "District", value: "district" },
    { keyData: "Sub District", value: "sub_district" },
  ];

  useEffect(() => {
    const handleToast = (
      condition: boolean,
      message: string | null,
      isError: boolean,
      resetAction: Function
    ) => {
      if (condition) {
        if (isError) {
          showErrorToast(message);
        } else {
          showSuccessToast(message);
        }
        const timerId = setTimeout(() => {
          dispatch(resetAction());
        }, 3000);
        return timerId;
      }
      return null;
    };

    const timers = [
      handleToast(isUpdateAddressError, errorUpdateAddressMsg, true, resetPutUpdateAddressError),
      handleToast(isUpdateAddressSuccess, "Update Address Successful!", false, resetPutUpdateAddressError),
      handleToast(isActiveAddressError, errorActiveAddressMsg, true, resetPatchActiveAddressError),
      handleToast(isActiveAddressSuccess, "Update Active Address Successful!", false, resetPatchActiveAddressError),
      handleToast(isDeleteMyAddressError, errorDeleteMyAddressMsg, true, resetDeleteMyAddressError),
      handleToast(isDeleteMyAddressSuccess, "Delete Address Successful!", false, resetDeleteMyAddressError),
      handleToast(isAddMyAddressError, errorAddMyAddressMsg, true, resetAddMyAddressError),
      handleToast(isAddMyAddressSuccess, "Success Add an Address Successful!", false, resetAddMyAddressError),
    ].filter(Boolean) as NodeJS.Timeout[];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [
    isUpdateAddressError,
    errorUpdateAddressMsg,
    isUpdateAddressSuccess,
    isActiveAddressError,
    errorActiveAddressMsg,
    isActiveAddressSuccess,
    isDeleteMyAddressError,
    errorDeleteMyAddressMsg,
    isDeleteMyAddressSuccess,
    isAddMyAddressError,
    errorAddMyAddressMsg,
    isAddMyAddressSuccess,
  ]);

  async function changeActiveAddress(idAddress: number) {
    try {
      await dispatch(patchActiveAddress(cookies.access_token, idAddress));
      if (!isActiveAddressError) {
        dispatch(getMe(cookies.access_token));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteMyAddressById(idAddress: number) {
    try {
      await dispatch(deleteMyAddress(cookies.access_token, idAddress));
      if (!isDeleteMyAddressError) {
        dispatch(getMe(cookies.access_token));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const titleSwalDelete = ReactDOMServer.renderToString(
    <span className="text-sm">Delete this address?</span>
  );

  return (
    <>
      <div className="relative">
        <div className="sticky top-0 z-10 bg-background p-5 rounded-t-2xl">
          <span className="text-3xl font-Poppins font-semibold text-foreground">
            {titlePage}
          </span>
        </div>

        <div className="bg-background w-full h-[704px] overflow-y-auto p-5 rounded-b-2xl">
          <div className="flex flex-col gap-5">
            {dataUser?.data.address && dataUser?.data.address.length <= 0 ? (
              <></>
            ) : (
              <>
                {dataUser?.data.address && dataUser?.data.address.length < 3 ? (
                  <ModalAddAddress />
                ) : null}
              </>
            )}

            {dataUser?.data.address && dataUser?.data.address.length <= 0 ? (
              <div className="flex justify-center items-center flex-col lg:flex-row mt-10 lg:mt-28 gap-10 lg:gap-20">
                <div className="flex flex-col gap-7">
                  <span className="font-semibold text-2xl lg:text-5xl w-full lg:w-[480px] text-thirdpink font-poppins">
                    You currently have no saved addresses.
                  </span>
                  <span className="text-fourthpink">
                    Please add a new address to proceed.
                  </span>
                  <ModalAddAddress />
                </div>
                <div className="relative">
                  <img src={notFound} className="w-56 lg:w-80" alt="not-found" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-900 opacity-30 rounded-full blur-md"></div>
                </div>
              </div>
            ) : (
              <>
                {dataUser?.data.address.map((data: Address, index: number) => (
                  <div key={index} className="flex flex-col lg:flex-row w-full justify-between text-white bg-thirdpink items-center border p-5 rounded-2xl">
                    <div className="w-[10%] flex justify-center items-center">
                      <FaMapMarkerAlt size={40} />
                    </div>
                    <div className="w-full lg:w-[67%] mt-4 lg:mt-0 flex flex-col justify-start">
                      {addressKeys.map(({ keyData, value }, i) => (
                        <div className="flex" key={i}>
                          <span className="w-1/4 text-left font-semibold">{keyData}</span>
                          <span className="flex-shrink-0 mx-2">:</span>
                          <span className="flex-grow text-left">{data[value]}</span>
                        </div>
                      ))}
                      <div className="bg-fourthpink rounded-xl p-5 mt-3">
                        {data.contact_name && (
                          <>
                            <div className="flex" >
                              <span className="lg:w-1/4 text-left font-semibold">{"Contact Name"}</span>
                              <span className="flex-shrink-0 mx-2">:</span>
                              <span className="hidden lg:flex flex-grow text-left">{data.contact_name}</span>
                            </div>
                            <span className="flex lg:hidden flex-grow text-left">{data.contact_name}</span>
                          </>
                        )}
                        {data.contact_phone_number && (
                          <>
                          <div className="flex" >
                              <span className="lg:w-1/4 text-left font-semibold">{"Contact Phone Number"}</span>
                              <span className="flex-shrink-0 mx-2">:</span>
                              <span className="hidden lg:flex flex-grow text-left">{data.contact_phone_number}</span>
                            </div>
                            <span className="flex lg:hidden flex-grow text-left">{data.contact_phone_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-full lg:w-[20%] flex flex-col gap-2 mt-4 lg:mt-0 justify-end items-center">
                      {data.is_active ? (
                        <div className="bg-primarypink w-full lg:w-44 h-8 flex justify-center items-center rounded-xl text-white">
                          <span className="flex items-center justify-center gap-2 font-semibold">{isActiveAddressLoading ? "Loading..." : (<><FaCheck /> Active</>)}</span>
                        </div>
                      ) : (
                        <div className="bg-white w-full lg:w-44 h-8 flex cursor-pointer justify-center items-center rounded-xl text-primarypink hover:bg-fourthpink hover:text-white">
                          <span onClick={() => changeActiveAddress(data.id)}>{isActiveAddressLoading ? "Loading..." : "Set as active address"}</span>
                        </div>
                      )}
                      <ModalUpdateAddress dataAddress={data} />
                      <div onClick={() => {
                        Swal.fire({
                          title: titleSwalDelete,
                          showCancelButton: true,
                          confirmButtonColor: "#f1205f",
                          icon: "warning",
                          iconColor: '#f1205f',
                          customClass: {
                            icon: 'text-sm -mb-4',
                            confirmButton: 'rounded-lg bg-primarypink border-none text-white px-4 py-2',
                            cancelButton: 'rounded-lg bg-gray-400 text-white px-4 py-2',
                            popup: 'rounded-3xl'
                          },
                          confirmButtonText: "Delete",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            deleteMyAddressById(data.id)
                          }
                        });
                      }} className="bg-white w-full lg:w-44 h-8 flex justify-center cursor-pointer items-center rounded-xl text-primarypink hover:bg-fourthpink hover:text-white">
                        <span>{isDeleteMyAddressLoading ? "Loading..." : "Delete"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        icon={
          isUpdateAddressError ||
            isActiveAddressError ||
            isDeleteMyAddressError ||
            isAddMyAddressError ? (
            <FaExclamation />
          ) : (
            <FaCheck />
          )
        }
      />
    </>
  );
};

export default ProfileAddress;
