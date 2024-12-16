import { IoReceipt } from 'react-icons/io5';
import { Link, NavLink, NavLinkRenderProps } from 'react-router-dom';
import pathosafeIconImg from '../../../assets/icons/pathosafe.svg';
import { MdDashboard } from 'react-icons/md';
import { GiMedicines } from 'react-icons/gi';
import { FaUserDoctor } from 'react-icons/fa6';
import { RiHospitalFill } from 'react-icons/ri';
import { ReactNode } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from '@/models/Users';
import { FaHandshakeSimple } from 'react-icons/fa6';

const shouldActive = ({ isActive }: NavLinkRenderProps) => {
  const baseStyle =
    'flex justify-start items-center gap-3  w-full py-4 rounded-md pl-4 text-base font-medium ';

  if (isActive) return baseStyle + ' bg-primary text-brand-white ';
  return baseStyle + ' text-slate-700 ';
};

const Sidebar = () => {
  const user = useAuthUser<IUser>();
  const userRole: 'pharmacist' | 'admin' = user?.role ?? 'admin';

  let links: ReactNode;
  if (userRole === 'admin') {
    links = (
      <>
        {/* DASHBOARD */}
        <NavLink to={'/dashboard'} className={shouldActive}>
          <MdDashboard size={20} />
          <div>Dashboard</div>
        </NavLink>

        {/* PRODUCTS */}
        <NavLink to={'/products'} className={shouldActive}>
          <GiMedicines size={23} />
          <div>Products</div>
        </NavLink>

        {/* PHARMACISTS */}
        <NavLink to={'/pharmacists'} className={shouldActive}>
          <FaUserDoctor size={23} />
          <div>Pharmacists</div>
        </NavLink>

        {/* PHARMACIES */}
        <NavLink to={'/pharmacies'} className={shouldActive}>
          <RiHospitalFill size={23} />
          <div>Pharmacies</div>
        </NavLink>

        {/* PARTNERS */}
        <NavLink to={'/partners'} className={shouldActive}>
          <FaHandshakeSimple size={23} />
          <div>Partners</div>
        </NavLink>

        {/* ORDERS */}
        <NavLink to={'/orders'} className={shouldActive}>
          <IoReceipt size={23} />
          <div>Orders</div>
        </NavLink>
      </>
    );
  } else {
    // PHARMACIST - ORDERS
    links = (
      <>
        {/* PRODUCTS */}
        <NavLink to={'/products'} className={shouldActive}>
          <GiMedicines size={23} />
          <div>Products</div>
        </NavLink>

        {/* ORDERS */}
        <NavLink to={'/orders'} className={shouldActive}>
          <IoReceipt size={23} />
          <div>Orders</div>
        </NavLink>

        {/* PHARMACIES */}
        <NavLink to={'/pharmacies'} className={shouldActive}>
          <RiHospitalFill size={23} />
          <div>Pharmacies</div>
        </NavLink>
      </>
    );
  }

  return (
    // <div className="bg-brand-gray-2 min-w-[350px] absolute h-full min-h-[1000px] border-r-[1px] border-[#d3d3cc] overflow-hidden">
    <div className="bg-brand-gray-2  border-r-[1px] border-[#d3d3cc] w-[350px] min-h-full">
      {/* MARK: HEAD */}
      <div className="pt-5 pl-6 mb-11 cursor-default">
        <Link to="/" className="flex justify-start items-center gap-4">
          <img className="size-10" src={pathosafeIconImg} alt="" />
          <div className=" text-2xl font-comfortaa font-semibold tracking-wider text-slate-600">
            Pathosafe
          </div>
        </Link>
      </div>

      {/* MARK: LINKS */}
      <div className="pr-8 pl-6 flex flex-col justify-start items-start gap-6 ">
        {links}
      </div>
    </div>
  );
};

export default Sidebar;
