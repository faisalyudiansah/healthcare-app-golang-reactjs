import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { pathosafeImg } from '@/const';
import { cn } from '@/lib/utils';
import {
  IconBrandTabler,
  IconBuildingStore,
  IconMedicineSyrup,
  IconNotes,
  IconPackage,
  IconUserBolt,
} from '@tabler/icons-react';
import { useState } from 'react';

type Props = {
  role: 'admin' | 'pharmacist' | undefined;
};

const adminLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Products',
    href: '/products',
    icon: (
      <IconPackage className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: (
      <IconNotes className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Pharmacies',
    href: '/pharmacies',
    icon: (
      <IconBuildingStore className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Users',
    href: '/users',
    icon: (
      <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Pharmacists',
    href: '/pharmacists',
    icon: (
      <IconMedicineSyrup className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

const pharmacistLinks = [
  {
    label: 'Pharmacies',
    href: '/pharmacies',
    icon: (
      <IconBuildingStore className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Products',
    href: '/products',
    icon: (
      <IconPackage className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: (
      <IconNotes className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export const SidebarCMS: React.FC<Props> = ({ role }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        'h-screen',
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center text-md font-bold gap-3 ">
              <img
                src={pathosafeImg}
                alt="Pathosafe Icon"
                className="h-4 lg:h-6 aspect-square"
              />
              <p className='text-sm lg:text-xl'>Pathosafe</p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {role === 'admin'
                ? adminLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))
                : pharmacistLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
};
