import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMe, login } from "@/stores/slices/authSlices/authSlice";
import { AppDispatch, RootState } from "@/stores";
import ModalRegister from "./ModalRegister";
import { useCookies } from "react-cookie";
import { validateEmail, validatePassword } from "@/utils/FormValidator";
import ModalForgetPassword from "./ModalForgetPassword";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import GoogleAuth from "./GoogleAuth";
import axios from 'axios';
import ModalResendVerify from './ModalResendVerify';
import logoPathosafe from '@/assets/logo/newlogo.png'

function ModalLogin({ titleButton = "Sign in" }: { titleButton: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies, setCookie] = useCookies(["access_token"]);
  const [newRegister, setNewRegister] = useState(true);
  const [newForgetPassword, setNewForgetPassword] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
  const [dataBody, setDataBody] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalResendVerifyOpen, setIsModalResendVerifyOpen] = useState(false);
  const [targetEmailVerify, setTargetEmailVerify] = useState("");

  const { isLoginError, errorLoginMsg } = useSelector(
    (state: RootState) => state.authReducer
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailValidation = validateEmail(dataBody.email);
      const passwordValidation = validatePassword(dataBody.password);

      if (emailValidation !== true) {
        setEmailError(emailValidation as string);
      } else {
        setEmailError(null);
      }

      if (passwordValidation !== true) {
        setPasswordError(passwordValidation as string);
      } else {
        setPasswordError(null);
      }

      if (emailValidation === true && passwordValidation === true) {
        await dispatch(login(dataBody, setCookie));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 403 && error.response?.data.message === "your account is not verified") {
          setTargetEmailVerify(dataBody.email)
          setIsLoginOpen(false);
          setIsModalResendVerifyOpen(true);
        }
      }
    }
  };

  const handleEmailBlur = () => {
    const emailValidation = validateEmail(dataBody.email);
    if (emailValidation !== true) {
      setEmailError(emailValidation as string);
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordBlur = () => {
    const passwordValidation = validatePassword(dataBody.password);
    if (passwordValidation !== true) {
      setPasswordError(passwordValidation as string);
    } else {
      setPasswordError(null);
    }
  };

  async function getDataMe(token: string) {
    await dispatch(getMe(token));
  }

  useEffect(() => {
    if (cookies.access_token) {
      getDataMe(cookies.access_token);
    }
  }, [cookies.access_token]);

  return (
    <>
      <Button
        onClick={() => setIsLoginOpen(true)}
        className={`bg-primarypink hover:bg-secondarypink ${
          titleButton === "Sign in" ? "" : "w-full"
        }`}
      >
        {titleButton}
      </Button>
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex justify-center gap-2 my-5 mb-10 items-center">
              <img src={logoPathosafe} alt="Logo" className="w-7" />
              <div className="font-comfortaa text-[23px] font-extrabold text-primarypink tracking-wider">
                Pathosafe
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 justify-center">
              <DialogTitle className="text-xl">Login</DialogTitle>
              <DialogDescription>
                Don't have an account?{" "}
                <button
                  className="font-medium hover:underline text-current"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                    setNewRegister(true);
                  }}
                >
                  Register
                </button>
              </DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={dataBody.email}
                onChange={(e) =>
                  setDataBody({ ...dataBody, email: e.target.value })
                }
                onBlur={handleEmailBlur}
                placeholder="Email"
                required
              />
              {emailError && (
                <p className="text-primarypink text-sm">{emailError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={dataBody.password}
                  onChange={(e) =>
                    setDataBody({ ...dataBody, password: e.target.value })
                  }
                  onBlur={handlePasswordBlur}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaRegEyeSlash className="text-gray-500" />
                  ) : (
                    <FaRegEye className="text-gray-500" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-primarypink text-sm">{passwordError}</p>
              )}
              <a
                className="text-sm text-end underline text-current cursor-pointer"
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsForgetPasswordOpen(true);
                  setNewForgetPassword(true);
                }}
              >
                Forget Password
              </a>
            </div>
            {isLoginError && (
              <div className="text-primarypink text-center mb-4">
                <p>{errorLoginMsg}</p>
              </div>
            )}
            <div className="text-center justify-content-center text-bg-body-secondary">
              <p className="text-sm mb-5">OR</p>
              <div className="flex justify-center items-center">
                <GoogleAuth />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant={"outline"}
                onClick={() => {
                  setIsLoginOpen(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primarypink hover:bg-secondarypink"
              >
                Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalRegister
        isRegisterOpen={isRegisterOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        setIsLoginOpen={setIsLoginOpen}
        newRegister={newRegister}
        setNewRegister={setNewRegister}
      />
      <ModalForgetPassword
        isForgetPasswordOpen={isForgetPasswordOpen}
        setIsForgetPasswordOpen={setIsForgetPasswordOpen}
        setIsLoginOpen={setIsLoginOpen}
        newForgetPassword={newForgetPassword}
        setNewForgetPassword={setNewForgetPassword}
        showDesc={true}
      />
      <ModalResendVerify
        isModalResendVerifyOpen={isModalResendVerifyOpen}
        setIsModalResendVerifyOpen={setIsModalResendVerifyOpen}
        setIsLoginOpen={setIsLoginOpen}
        targetEmailVerify={targetEmailVerify}
      />
    </>
  );
}

export default ModalLogin;
