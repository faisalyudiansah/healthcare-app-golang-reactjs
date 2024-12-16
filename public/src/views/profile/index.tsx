import { AppDispatch, RootState } from "@/stores";
import { CircleUser } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PencilSvg } from "@/assets/svg/profile/PencilSvg";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL, TOKEN_TYPE } from "@/constants/api.contant";
import { SuccessGetMeAPI } from "@/@types/auth/response";
import { useMutation } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { FaCheck, FaExclamation } from "react-icons/fa";
import { showErrorToast, showSuccessToast } from "@/components/template/toastify/Toast";
import { useCookies } from "react-cookie";
import { getMe } from "@/stores/slices/authSlices/authSlice";
import { ErrorRequestBody, ErrorRequestInvalid } from "@/@types/errorResponse";
import { ERROR_DEFAULT_MSG, ERROR_UNKNOWN_MSG } from "@/constants/error.contant";
import ModalForgetPasswordProfile from "@/components/template/modal/auth/ModalForgetPasswordProfile";

const whatsappValidationRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

const MyProfile = ({ titlePage }: { titlePage: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(['access_token']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [getData, setGetData] = useState({
    email: "",
    full_name: "",
    whatsapp_number: "",
    image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isErr, setIsErr] = useState<boolean>(false);
  const [errMsgWa, setErrMsgWa] = useState<string | null>(null);
  const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
  const [newForgetPassword, setNewForgetPassword] = useState(true)
  const [, setIsLoginOpen] = useState(false);

  const { dataUser } = useSelector((state: RootState) => state.authReducer);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (dataUser?.data) {
      setGetData({
        email: dataUser.data.email || "",
        full_name: dataUser.data.user_detail?.full_name || "",
        whatsapp_number: dataUser.data.user_detail?.whatsapp_number || "",
        image_url: dataUser.data.user_detail?.image_url || "",
      });
    }
  }, [dataUser]);

  useEffect(() => {
    const isChanged =
      getData.full_name !== dataUser?.data?.user_detail?.full_name ||
      getData.whatsapp_number !== dataUser?.data?.user_detail?.whatsapp_number ||
      !!selectedImage;
    setHasChanged(isChanged);
  }, [getData, selectedImage, dataUser]);

  const saveUpdateProfile = async (dataBody: FormData): Promise<SuccessGetMeAPI | undefined> => {
    try {
      const { data }: { data: SuccessGetMeAPI } = await axios.put(`${BASE_URL}/users/me`, dataBody, {
        headers: {
          Authorization: `${TOKEN_TYPE} ${cookies.access_token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      await dispatch(getMe(cookies.access_token));
      showSuccessToast("Profile updated successfully");
      setHasChanged(false)
      setSelectedImage(null)
      return data;
    } catch (error) {
      setIsErr(true);
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        if ('errors' in errorResponse && Array.isArray(errorResponse.errors)) {
          const errorMsg: ErrorRequestBody = errorResponse;
          showErrorToast(errorMsg?.errors[0]?.message || ERROR_DEFAULT_MSG);
        } else if ('message' in errorResponse) {
          const errorMsg: ErrorRequestInvalid = errorResponse;
          showErrorToast(errorMsg?.message || ERROR_DEFAULT_MSG);
        } else {
          showErrorToast(ERROR_DEFAULT_MSG);
        }
      } else if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast(ERROR_UNKNOWN_MSG);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: saveUpdateProfile,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('full_name', getData.full_name);
    formData.append('whatsapp_number', getData.whatsapp_number);
    if (selectedImage) {
      formData.append('profile_image', selectedImage);
    }
    mutation.mutate(formData);
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showErrorToast("File size exceeds 500KB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setGetData({ ...getData, image_url: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsAppBlur = () => {
    if (!whatsappValidationRegex.test(getData.whatsapp_number)) {
      setIsErr(true)
      setErrMsgWa("Invalid WhatsApp number.");
    } else {
      setErrMsgWa(null);
    }
  };

  return (
    <>
      <div className="bg-background w-full h-full p-5 rounded-2xl">
        <span className="text-3xl font-Poppins font-semibold text-foreground">{titlePage}</span>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row">
            <div className="flex flex-col gap-5">
              <div className="w-64 md:w-96 flex flex-col gap-5 mt-10">
                <div>
                  <Label className="text-muted-foreground" htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={getData.email}
                    placeholder="Email"
                    disabled
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground" htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={getData.full_name}
                    onChange={(e) => setGetData({ ...getData, full_name: e.target.value })}
                    placeholder="Full Name"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground" htmlFor="whatsapp_number">Whatsapp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={getData.whatsapp_number}
                    onChange={(e) => setGetData({ ...getData, whatsapp_number: e.target.value })}
                    onBlur={handleWhatsAppBlur}
                    placeholder="Whatsapp Number"
                    required
                    className="rounded-xl"
                  />
                  {errMsgWa ? <p className="text-primarypink text-sm">{errMsgWa}</p> : null}
                </div>
              </div>

            </div>
            <div className="flex justify-center mt-6 items-center w-full">
              <div className="bg-primarypink w-64 h-64 md:w-96 md:h-96 rounded-full flex items-center justify-center relative">
                {getData.image_url ? (
                  <div className="relative w-[230px] h-[230px] md:w-[340px] md:h-[340px] cursor-pointer group">
                    <img
                      src={selectedImage ? URL.createObjectURL(selectedImage) : `${dataUser?.data.user_detail?.image_url}?t=${new Date().getTime()}`}
                      alt={`photo_from_${getData.email}`}
                      onClick={handleProfileImageClick}
                      className="w-full h-full rounded-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-95 group-hover:brightness-50"
                    />
                    <div
                      role="presentation"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={handleProfileImageClick}
                    >
                      <span className="text-white text-md font-semibold">Change Profile Picture</span>
                    </div>
                    <input
                      type="file"
                      name="profile_image"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      role="presentation"
                      className="hidden cursor-pointer top-[100px] md:flex items-center justify-center"
                      onClick={handleProfileImageClick}
                    >
                      <PencilSvg className="absolute top-[260px] right-1 hover:scale-125 transition-transform duration-300 ease-in-out" />
                    </div>
                  </div>
                ) : (
                  <CircleUser className="h-full w-full" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button type="button" disabled={mutation.isPending} className='w-32 text-white bg-secondarypink hover:bg-thirdpink' onClick={() => {
              setIsLoginOpen(false);
              setIsForgetPasswordOpen(true);
              setNewForgetPassword(true)
            }}>
              Forget Password
            </Button>
            <Button variant="outline" type="button" disabled={!hasChanged || mutation.isPending}>Cancel</Button>
            <Button type="submit" className="bg-primarypink hover:bg-secondarypink text-white" disabled={!hasChanged || mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
        <ToastContainer icon={isErr ? <FaExclamation /> : <FaCheck />} />
      </div>
      <ModalForgetPasswordProfile
        isForgetPasswordOpen={isForgetPasswordOpen}
        setIsForgetPasswordOpen={setIsForgetPasswordOpen}
        setIsLoginOpen={setIsLoginOpen}
        newForgetPassword={newForgetPassword}
        setNewForgetPassword={setNewForgetPassword}
        showDesc={false}
        targetEmail={dataUser?.data.email}
      />
    </>
  );
};

export default MyProfile;
