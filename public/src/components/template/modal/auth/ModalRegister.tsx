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
import { AppDispatch, RootState } from "@/stores";
import { register } from "@/stores/slices/authSlices/authSlice";
import { validateEmail, validatePassword } from "@/utils/FormValidator";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import emailSent from '@/assets/gif/send-email.gif'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import GoogleAuth from "./GoogleAuth";
import logoPathosafe from '@/assets/logo/newlogo.png'

function ModalRegister({
  isRegisterOpen,
  setIsRegisterOpen,
  setIsLoginOpen,
  newRegister,
  setNewRegister
}: {
  isRegisterOpen: boolean;
  setIsRegisterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newRegister: boolean;
  setNewRegister: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isRegisterError, errorRegisterMsg, isRegisterSuccess } = useSelector((state: RootState) => state.authReducer);
  const [dataBody, setDataBody] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (dataBody.password !== dataBody.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(null);
    }

    if (emailValidation === true && passwordValidation === true && dataBody.password === dataBody.confirmPassword) {
      try {
        await dispatch(register({
          email: dataBody.email,
          password: dataBody.password
        }));
        setDataBody({
          email: "",
          password: "",
          confirmPassword: ""
        })
      } catch (error) {
        console.log(error)
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

  const handleConfirmPasswordBlur = () => {
    const passwordValidation = validatePassword(dataBody.confirmPassword);
    if (passwordValidation !== true) {
      setConfirmPasswordError(passwordValidation as string);
    } else {
      if (dataBody.password !== dataBody.confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  useEffect(() => {
    if (isRegisterSuccess) {
      setVerificationMessage("A verification email has been sent to your email address.");
      setDataBody({ email: "", password: "", confirmPassword: "" });
      setNewRegister(false)
    }
  }, [isRegisterSuccess])

  return (
    <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {verificationMessage !== null && !newRegister ? (
          <div className="flex flex-col items-center text-center my-5 mb-10">
            <img src={emailSent} alt="Verification Icon" className="mb-4" />
            <p>{verificationMessage}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className='flex justify-center gap-2 my-5 mb-10 items-center'>
                <img src={logoPathosafe} alt="Logo" className='w-7' />
                <div className="font-comfortaa text-[23px] font-extrabold text-primarypink tracking-wider">
                  Pathosafe
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 justify-center ">
                <DialogTitle className="text-xl">Register</DialogTitle>
                <DialogDescription>
                  Already have an account?{" "}
                  <button className='font-medium hover:underline' onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true) }}>
                    Login
                  </button>
                </DialogDescription>
              </div>
            </DialogHeader>
            <form onSubmit={handleRegisterSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={dataBody.email}
                  onChange={(e) => setDataBody({ ...dataBody, email: e.target.value })}
                  onBlur={handleEmailBlur}
                  placeholder="Email"
                  required
                />
                {emailError && <p className="text-primarypink text-sm">{emailError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={dataBody.password}
                    onChange={(e) => setDataBody({ ...dataBody, password: e.target.value })}
                    onBlur={handlePasswordBlur}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEyeSlash className="text-gray-500" /> : <FaRegEye className="text-gray-500" />}
                  </button>
                </div>
                {passwordError && <p className="text-primarypink text-sm">{passwordError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={dataBody.confirmPassword}
                    onChange={(e) => setDataBody({ ...dataBody, confirmPassword: e.target.value })}
                    onBlur={handleConfirmPasswordBlur}
                    placeholder="Confirm Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaRegEyeSlash className="text-gray-500" /> : <FaRegEye className="text-gray-500" />}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-primarypink text-sm">{confirmPasswordError}</p>}
              </div>

              {isRegisterError && (
                <div className="text-primarypink text-center mb-4">
                  <p>{errorRegisterMsg}</p>
                </div>
              )}

              <div className="text-center justify-content-center text-bg-body-secondary">
                <p className="text-sm mb-5">OR</p>
                <div className='flex justify-center items-center'>
                  <GoogleAuth />
                </div>
              </div>

              <DialogFooter>
                <Button variant={"outline"} onClick={() => {
                  setIsRegisterOpen(false)
                  setNewRegister(false)
                }} type="button">Cancel</Button>
                <Button type="submit" className="bg-primarypink hover:bg-secondarypink">Register</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ModalRegister;
