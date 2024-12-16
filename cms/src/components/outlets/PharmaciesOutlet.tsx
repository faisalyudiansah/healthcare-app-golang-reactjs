import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layouts/Navbar';

const PharmaciesOutlet = () => {
  return (
    // <div className="w-full pl-[350px] ">
    <div className="flex-1 overflow-y-auto">
      <Navbar />

      <Outlet />
    </div>
  );
};

export default PharmaciesOutlet;
