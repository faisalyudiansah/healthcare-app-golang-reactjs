import { SidebarCMS } from '@/components/organisms/Sidebar/index';
import { getAuthState } from '@/store/authentication/authSlice';
import { useSelector } from 'react-redux';

export const PharmacistPharmacies: React.FC = () => {
  const role = useSelector(getAuthState).user?.role

  return <div>
    <SidebarCMS role={role}/>
    
  </div>
};
