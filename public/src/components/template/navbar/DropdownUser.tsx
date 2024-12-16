import { useCookies } from 'react-cookie';
import {
  CircleUser,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logout } from '@/stores/slices/authSlices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/stores';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactDOMServer from "react-dom/server";

const DropdownUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const { dataUser } = useSelector((state: RootState) => state.authReducer);

  const [cookies, , removeCookie] = useCookies(['access_token']);

  const handleLogout = () => {
    removeCookie('access_token', { path: '/' });
    dispatch(logout(cookies.access_token));
    navigate("/")
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='bg-primarypink hover:bg-thirdpink'>
        <Button variant="secondary" size="icon" className="rounded-full">
          {dataUser?.data.user_detail?.image_url ? (
            <img
              src={`${dataUser?.data.user_detail?.image_url}?t=${new Date().getTime()}`}
              alt={`photo_from_${dataUser?.data.email}`}
              className='h-7 w-7 rounded-full'
            />
          ) : (
            <CircleUser className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{dataUser?.data?.user_detail?.full_name ? dataUser?.data?.user_detail?.full_name : dataUser?.data?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='flex flex-col text-sm'>
          <Link className='hover:bg-accent pl-2 py-1' to={"/profile"}>My Profile</Link>
          <Link className='hover:bg-accent pl-2 py-1' to={"/order"}>Orders</Link>
          <Link className='hover:bg-accent pl-2 py-1' to={"/about"}>About</Link>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer' onClick={handleLogoutClick}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropdownUser;
