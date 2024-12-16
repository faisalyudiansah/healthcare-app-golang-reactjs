import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/stores";
import { resetSendVerificationEmailError, sendVerificationEmail } from "@/stores/slices/authSlices/authSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import emailSent from '@/assets/gif/send-email.gif'
import sendingEmail from '@/assets/gif/sending-email.gif'
import { RESEND_TIMER_DURATION } from "@/constants/api.contant";
import logoPathosafe from '@/assets/logo/newlogo.png'

function ModalResendVerify({
  isModalResendVerifyOpen,
  setIsModalResendVerifyOpen,
  setIsLoginOpen,
  targetEmailVerify
}: {
  isModalResendVerifyOpen: boolean;
  setIsModalResendVerifyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
  targetEmailVerify: string
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isSendVerificationEmailError, errorSendVerificationEmailMsg, isSendVerificationEmailSuccess } = useSelector((state: RootState) => state.authReducer);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(RESEND_TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  const handleCloseModal = () => {
    setIsModalResendVerifyOpen(false);
    setIsLoginOpen(true);
    setVerificationMessage(null);
  };

  const resendVerification = () => {
    try {
      dispatch(sendVerificationEmail(targetEmailVerify))
      setTimer(RESEND_TIMER_DURATION);
      setIsTimerActive(true);
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    if (isSendVerificationEmailSuccess) {
      setVerificationMessage("Verification email has been sent to your registered email address.");
      setIsTimerActive(true);
      setTimer(RESEND_TIMER_DURATION);
    }
  }, [isSendVerificationEmailSuccess]);

  useEffect(() => {
    if (!isModalResendVerifyOpen) {
      setVerificationMessage(null);
    }
  }, [isModalResendVerifyOpen]);

  useEffect(() => {
    if (isModalResendVerifyOpen && targetEmailVerify !== "") {
      const verificationData = JSON.parse(localStorage.getItem('verificationData') || '[]');
      const emailEntry = verificationData.find((item: { email: string }) => item.email === targetEmailVerify);

      if (emailEntry) {
        const elapsedTime = Math.floor((Date.now() - emailEntry.timestamp) / 1000);
        const remainingTime = RESEND_TIMER_DURATION - elapsedTime;

        if (remainingTime > 0) {
          setTimer(remainingTime);
          setIsTimerActive(true);
        } else {
          setTimer(RESEND_TIMER_DURATION);
          dispatch(sendVerificationEmail(targetEmailVerify))
        }
      } else {
        setTimer(RESEND_TIMER_DURATION);
        dispatch(sendVerificationEmail(targetEmailVerify))
      }
    }
  }, [isModalResendVerifyOpen, targetEmailVerify]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  useEffect(() => {
    if (isSendVerificationEmailSuccess) {
      setTimeout(() => {
        dispatch(resetSendVerificationEmailError())
      }, 2500);
    }
  }, [isSendVerificationEmailSuccess])

  return (
    <Dialog open={isModalResendVerifyOpen} onOpenChange={setIsModalResendVerifyOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {isSendVerificationEmailSuccess ? (
          <div className="flex flex-col items-center text-center my-5 mb-5">
            <img src={sendingEmail} alt="Verification Icon" className="mb-4" />
            <p>{verificationMessage}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className='flex justify-center gap-2 my-5 items-center'>
                <img src={logoPathosafe} alt="Logo" className='w-7' />
                <div className="font-comfortaa text-[23px] font-extrabold text-primarypink tracking-wider">
                  Pathosafe
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 justify-center ">
                <div className="mb-4">
                  <img src={emailSent} className="w-32" alt="" />
                </div>
                <DialogTitle className="text-xl">Verify Account</DialogTitle>
                <DialogDescription className="text-center">
                  <p>Your account is not yet verified. </p>
                  <p>
                    Please check your inbox for the account verification email.
                  </p>
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="flex justify-center items-center">
              <Label className="border rounded-lg p-2 w-52 text-center">{targetEmailVerify}</Label>
            </div>

            {isSendVerificationEmailError && (
              <div className="text-primarypink text-center text-sm mb-4">
                <p>{errorSendVerificationEmailMsg}</p>
              </div>
            )}

            <DialogFooter>
              <Button variant={"outline"} onClick={handleCloseModal} type="button">Cancel</Button>
              <Button
                type="button"
                onClick={resendVerification}
                className="bg-primarypink hover:bg-secondarypink"
                disabled={timer > 0}
              >
                Resend {timer > 0 && `(${timer})`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ModalResendVerify;
