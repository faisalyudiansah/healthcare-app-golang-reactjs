import heroImages from '@/assets/images/cartoon/image_6.png';
import { RequestResetPassword } from '@/@types/auth/request';
import { Input } from '@/components/ui/input';
import { AppDispatch } from '@/stores';
import { resetPassword } from '@/stores/slices/authSlices/authSlice';
import { validatePassword } from '@/utils/FormValidator';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const FormResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dataBody, setDataBody] = useState<RequestResetPassword>({
    reset_token: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    setDataBody((prevData) => ({
      ...prevData,
      reset_token: token,
      email: email,
    }));
  }, [searchParams]);

  const validatePasswords = () => {
    const passwordValidation = validatePassword(dataBody.password);
    if (passwordValidation !== true) {
      setPasswordError(passwordValidation as string);
      return false;
    } else {
      setPasswordError(null);
    }
    if (dataBody.password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return false;
    } else {
      setConfirmPasswordError(null);
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswords()) {
      try {
        await dispatch(resetPassword(dataBody));
        navigate('/');
      } catch (error) {
        console.log('Error during verification:', error);
      }
    }
  };

  return (
    <section className="min-h-[860px] lg:flex lg:justify-center lg:items-center px-4 md:px-6">
      <div className="flex flex-col lg:flex-row justify-center lg:gap-28 lg:mr-40 items-center">
        <img src={heroImages} className="lg:w-[800px] w-[380px] md:w-[650px] mr-10 md:mr-0 rounded-lg" />
        <div className='md:mt-0 mt-5 p-5 w-[350px] md:w-[530px] lg:w-[600px] text-black flex flex-col gap-8'>
          <div className='flex flex-col gap-2'>
            <h1 className="text-2xl lg:text-5xl text-foreground transition-colors font-bold">Enter Your New Password</h1>
            <p className='text-sm text-foreground transition-colors'>Please proceed with resetting your password.</p>
          </div>
          <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-5'>
              <div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setDataBody({ ...dataBody, password: e.target.value })}
                    placeholder="Password"
                    required
                    onBlur={() => {
                      const passwordValidation = validatePassword(dataBody.password);
                      if (passwordValidation !== true) {
                        setPasswordError(passwordValidation as string);
                      } else {
                        setPasswordError(null);
                      }
                    }}
                    className='text-foreground transition-colors'
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
              <div>
                <div className='relative'>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    onBlur={() => {
                      const passwordValidation = validatePassword(confirmPassword);
                      if (passwordValidation !== true) {
                        setConfirmPasswordError(passwordValidation as string);
                      } else {
                        setConfirmPasswordError(null);
                      }
                    }}
                    className='text-foreground transition-colors'
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
            </div>
            <div>
              <Button type='submit' className='bg-primarypink hover:bg-secondarypink'>Update</Button>
            </div>
            {errorMsg && <p className="text-primarypink text-sm">{errorMsg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default FormResetPassword;
