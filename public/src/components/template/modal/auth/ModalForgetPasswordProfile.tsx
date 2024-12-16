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
import { forgetPassword } from "@/stores/slices/authSlices/authSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import emailSent from '@/assets/gif/send-email.gif'
import logoPathosafe from '@/assets/logo/newlogo.png'

function ModalForgetPasswordProfile({
    isForgetPasswordOpen,
    setIsForgetPasswordOpen,
    setIsLoginOpen,
    newForgetPassword,
    setNewForgetPassword,
    showDesc,
    targetEmail,
}: {
    isForgetPasswordOpen: boolean;
    setIsForgetPasswordOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newForgetPassword: boolean;
    setNewForgetPassword: React.Dispatch<React.SetStateAction<boolean>>;
    showDesc: boolean;
    targetEmail: string | undefined;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { isForgotPasswordError, errorForgotPasswordMsg, isForgotPasswordSuccess } = useSelector((state: RootState) => state.authReducer);
    const [dataBody, setDataBody] = useState({
        email: "",
    });
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await dispatch(forgetPassword({
                email: dataBody.email
            }));
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        if (targetEmail) {
            setDataBody({
                email: targetEmail
            })
        }
    }, [targetEmail])

    const handleCloseModal = () => {
        setIsForgetPasswordOpen(false);
        setIsLoginOpen(true);
        setDataBody({ email: "" });
        setNewForgetPassword(true);
        setVerificationMessage(null);
    };

    useEffect(() => {
        if (isForgotPasswordSuccess) {
            setVerificationMessage("A password reset email has been sent to your registered email address.");
            setNewForgetPassword(false);
            setDataBody({ email: "" });
        }
    }, [isForgotPasswordSuccess, setNewForgetPassword]);

    useEffect(() => {
        if (!isForgetPasswordOpen) {
            setNewForgetPassword(true);
            setVerificationMessage(null);
        }
    }, [isForgetPasswordOpen]);

    return (
        <Dialog open={isForgetPasswordOpen} onOpenChange={setIsForgetPasswordOpen}>
            <DialogContent className="sm:max-w-[425px]">
                {verificationMessage !== null && !newForgetPassword ? (
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
                                <DialogTitle className="text-xl">Forget Password</DialogTitle>
                                {showDesc && (
                                    <DialogDescription>
                                        Already have an account?{" "}
                                        <button className='font-medium hover:underline' onClick={() => { setIsForgetPasswordOpen(false); setIsLoginOpen(true) }}>
                                            Login
                                        </button>
                                    </DialogDescription>
                                )}
                            </div>
                        </DialogHeader>
                        <form onSubmit={handleForgotPasswordSubmit} className="grid gap-4">
                            <div className="font-semibold flex justify-center border p-2 rounded-xl items-center gap-2">
                                <Label htmlFor="email">Email :</Label>
                                <p>{dataBody.email}</p>
                            </div>

                            {isForgotPasswordError && (
                                <div className="text-primarypink text-center mb-4">
                                    <p>{errorForgotPasswordMsg}</p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button variant={"outline"} onClick={handleCloseModal} type="button">Cancel</Button>
                                <Button type="submit" className="bg-primarypink hover:bg-secondarypink">Submit</Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ModalForgetPasswordProfile;
