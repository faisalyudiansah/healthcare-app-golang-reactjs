import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FaDoorOpen, FaRegUser, FaRegBuilding } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/stores';
import { CircleUser } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { logout } from '@/stores/slices/authSlices/authSlice';
import Swal from 'sweetalert2';
import ReactDOMServer from "react-dom/server";
import FloatingCart from '../molecules/cart';

const ProfileMenuLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex justify-start items-center gap-2 sm:gap-5 transition-colors hover:bg-fourthpink p-3 md:p-5 rounded-xl hover:text-white 
            ${isActive ? 'text-white bg-thirdpink' : 'text-muted-foreground'}`}
            onClick={onClick}
        >
            <Icon size={30} />
            <span className='hidden sm:flex'>{label}</span>
        </Link>
    );
};


const ProfileLayout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [cookies, , removeCookie] = useCookies(['access_token']);
    const navigate = useNavigate()
    const { dataUser } = useSelector((state: RootState) => state.authReducer);
    const { email } = dataUser?.data || {};
    const { full_name, image_url } = dataUser?.data.user_detail || {};

    const handleLogout = () => {
        removeCookie('access_token', { path: '/' });
        dispatch(logout(cookies.access_token));
        navigate('/')
    };

    const titleSwalDelete = ReactDOMServer.renderToString(
        <span className="text-sm">Want to logout?</span>
    );

    const handleLogoutClick = () => {
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
            confirmButtonText: "Logout",
        }).then((result) => {
            if (result.isConfirmed) {
                handleLogout();
            }
        });
    };

    return (
        <>
            <div className="2xl:flex justify-between py-5 px-5 lg:px-12 gap-5">
                <div className="bg-thirdpink 2xl:w-[20%] 2xl:h-[455px] rounded-2xl p-2 flex flex-col gap-2">
                    <div className="flex justify-start items-center gap-2 bg-background rounded-xl p-5">
                        <Link to={'/profile'} className="bg-primarypink cursor-pointer min-w-16 min-h-16 rounded-full flex items-center justify-center">
                            {image_url ? (
                                <img
                                    src={`${image_url}?t=${new Date().getTime()}`}
                                    alt={`photo_from_${email}`}
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                            ) : (
                                <CircleUser className="h-14 w-14" />
                            )}
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-md font-semibold">{full_name || email}</span>
                            {full_name && <span className="text-sm text-muted-foreground">{email}</span>}
                        </div>
                    </div>
                    <div className="flex 2xl:flex-col gap-0 md:gap-2 bg-background p-5 py-2 md:py-10 rounded-xl">
                        <ProfileMenuLink to="/profile" icon={FaRegUser} label="Profile" />
                        <span className="w-full 2xl:border-b-2"></span>
                        <ProfileMenuLink to="/profile/address" icon={FaRegBuilding} label="Address" />
                        <span className="w-full 2xl:border-b-2"></span>
                        <ProfileMenuLink to="#" icon={FaDoorOpen} label="Logout" onClick={handleLogoutClick} />
                    </div>
                </div>
                <div className="2xl:w-[80%] 2xl:h-[100%] bg-thirdpink rounded-2xl p-2 mt-2 2xl:mt-0">
                    <Outlet />
                </div>
            </div>
            <FloatingCart />
        </>
    );
}

export default ProfileLayout