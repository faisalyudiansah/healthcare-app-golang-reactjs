import heroImages from '@/assets/images/cartoon/image_5.png';
import { RequestVerifyAccount } from '@/@types/auth/request';
import { Input } from '@/components/ui/input';
import { AppDispatch } from '@/stores';
import { verificationAccount } from '@/stores/slices/authSlices/authSlice';
import { validatePassword } from '@/utils/FormValidator';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const FormVerifyAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [dataBody, setDataBody] = useState<RequestVerifyAccount>({
    verification_token: "",
    email: "",
    password: "",
  });

  const [debouncedPassword, setDebouncedPassword] = useState(dataBody.password);
  const [debouncedDataBody, setDebouncedDataBody] = useState(dataBody);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPassword(dataBody.password);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [dataBody.password]);

  useEffect(() => {
    const passwordValidation = validatePassword(debouncedPassword);
    if (passwordValidation !== true) {
      setPasswordError(passwordValidation as string);
    } else {
      setPasswordError(null);
    }
  }, [debouncedPassword]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!passwordError) {
        setDebouncedDataBody(dataBody);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [dataBody, passwordError]);

  useEffect(() => {
    if (debouncedDataBody.password && !passwordError) {
      const hitVerificationAPI = async () => {
        try {
          await dispatch(verificationAccount(debouncedDataBody));
          navigate('/');
        } catch (error) {
          console.log('Error during verification:', error);
        }
      };
      hitVerificationAPI();
    }
  }, [debouncedDataBody, dispatch, navigate, passwordError]);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    setDataBody((prevData) => ({
      ...prevData,
      verification_token: token,
      email: email,
    }));
  }, [searchParams]);

  return (
    <section className="min-h-[860px] lg:flex lg:justify-center lg:items-center px-4 md:px-6">
      <div className="flex flex-col lg:flex-row justify-center lg:gap-28 lg:mr-40 items-center">
        <img src={heroImages} className="lg:w-[800px] w-[380px] md:w-[650px] mr-10 md:mr-0 rounded-lg" />
        <div className='md:mt-0 mt-5 p-5 w-[350px] md:w-[530px] lg:w-[600px] text-black flex flex-col gap-8'>
          <div className='flex flex-col gap-2'>
            <h1 className="text-2xl lg:text-5xl text-foreground transition-colors font-bold">Enter Your Password</h1>
            <p className='text-sm text-foreground transition-colors'>Verify your account now!</p>
          </div>
          <form>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                onChange={(e) => setDataBody({ ...dataBody, password: e.target.value })}
                onBlur={() => {
                  const passwordValidation = validatePassword(dataBody.password);
                  if (passwordValidation !== true) {
                    setPasswordError(passwordValidation as string);
                  } else {
                    setPasswordError(null);
                  }
                }}
                placeholder="Password"
                required
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
            {passwordError && passwordError !== "Password is required" && <p className="text-primarypink text-sm">{passwordError}</p>}

          </form>
        </div>
      </div>
    </section>
  );
};

export default FormVerifyAccount;
