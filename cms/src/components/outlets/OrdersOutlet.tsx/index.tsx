import { Navbar } from '@/components/layouts/Navbar';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const OrdersOutlet = () => {
  useEffect(() => {
    document.title = 'Pathosafe - Pharmacists';
  }, []);

  return (
    // <div className="w-full pl-[350px] min-h-[100vh]">
    <div className="flex-1 overflow-y-auto">
      <Navbar />

      <Outlet />
    </div>
  );
};

export default OrdersOutlet;
