import { IUser } from '@/models/Users';
import { AppDispatch } from '@/store';
import { showToastAsync } from '@/store/toast/toastSlice';
import { useEffect, useRef, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { FaUserTie } from 'react-icons/fa6';
import { MdPhone } from 'react-icons/md';
import { PiSignOutBold } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { reset as resetDashboard } from '@/store/dashboardSlice';
import { resetAuthState } from '@/store/authentication/authSlice';
import { reset as resetProductSlice } from '@/store/createProduct/createProductSlice';
import {
  reset as resetDeletionSlice,
  resetDeletionState,
} from '@/store/deletionSlice/deletionSlice';
import { reset as resetFilterAdminOrdersSlice } from '@/store/filterAdminOrders/filterAdminOrdersSlice';
import { reset as resetFilterPharmacistsSlice } from '@/store/filterPharmacists/filterPharmacistsSlice';
import { reset as resetFilterProductsSlice } from '@/store/filterProduct/filterProductsSlice';
import { reset as resetModalsSlice } from '@/store/modals/modalsSlice';
import { reset as resetPharmaciesSlice } from '@/store/pharmacies/pharmaciesSlice';

export const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useAuthUser<IUser>();

  const [shouldShow, setShouldShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const signOut = useSignOut();

  const handleClickOutside = (event: MouseEvent) => {
    if (!ref.current) return;
    if (!btnRef.current) return;

    if (
      !ref.current.contains(event.target as Node) &&
      !btnRef.current.contains(event.target as Node)
    ) {
      setShouldShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    signOut();
    dispatch(showToastAsync({ message: 'You logged out...', type: 'success' }));
    navigate('/login');

    dispatch((d) => {
      d(resetDashboard());
      d(resetAuthState());
      d(resetProductSlice());
      d(resetDeletionSlice());
      d(resetDeletionState());
      d(resetFilterAdminOrdersSlice());
      d(resetFilterPharmacistsSlice());
      d(resetFilterProductsSlice());
      d(resetModalsSlice());
      d(resetPharmaciesSlice());
    });
  };

  return (
    <div className="py-3 bg-white w-full shadow-sm flex justify-end items-center border-b-[1px] border-b-slate-200">
      {/* BUTTON */}
      <div
        className="flex flex-col justify-start items-end relative"
        ref={btnRef}
        onClick={() => {
          setShouldShow((prev) => !prev);
        }}
      >
        {/* BUTTON */}
        <div className="flex justify-start items-center gap-3 pr-5 cursor-pointer">
          <div className=" flex justify-center items-center size-10 rounded-full border-slate-300 border-[1px] overflow-hidden">
            {user?.user_detail.image_url ? (
              <img src={user?.user_detail.image_url} />
            ) : (
              <div className=" bg-slate-400 flex justify-center items-center size-10 rounded-full border-slate-400 border-2 overflow-hidden">
                <FaUserTie className="text-white bg-transparent w-[34px] h-[34px] mt-[2px]" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="font-semibold text-slate-500 text-sm">
              {user?.role === 'admin' ? 'Admin' : 'Pharmacist'}
            </div>
            <div className="text-black">{user?.user_detail.full_name}</div>
          </div>
        </div>

        {/* DROPDOWN */}
        <div
          ref={ref}
          className={`py-3 absolute top-[90%] bg-white shadow-lg dropdown-profile-default w-fit rounded-lg border-[1px] border-slate-200 ${
            shouldShow && 'dropdown-profile-active'
          }`}
        >
          <div className="font-semibold text-sm px-5 ">
            {user?.user_detail.full_name}
          </div>
          <div className="font-semibold text-slate-400 px-5">{user?.email}</div>
          <div className="flex justify-start items-center gap-2 px-5 mt-1">
            <MdPhone className="size-[18px] text-slate-500" />
            <div>{user?.user_detail.whatsapp_number}</div>
          </div>

          {user?.user_detail.sipa_number && (
            <div className="flex justify-start items-center gap-2 px-5 mt-2">
              <div className="text-sm font-semibold text-slate-500">
                {'SIPA: '}
                <span className="text-base font-medium text-black">
                  {user?.user_detail.sipa_number}
                </span>
              </div>
            </div>
          )}

          <div
            className="border-t-[1px] border-t-slate-200 flex justify-start items-center gap-2 px-5 pt-3 mt-3 cursor-pointer group"
            onClick={handleLogout}
          >
            <PiSignOutBold className="text-red-400 group-hover:text-red-700 size-7 transition-colors" />
            <div className="font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
