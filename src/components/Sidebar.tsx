import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  User, 
  Scissors, 
  Clock, 
  Users, 
  MapPin, 
  ShoppingBag,
  Settings,
  BarChart,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarLink {
  to: string;
  icon: JSX.Element;
  label: string;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isBarber = user.role === 'barber';
  
  const barberLinks: SidebarLink[] = [
    { to: '/barber', icon: <Home size={20} />, label: 'Dashboard', roles: ['barber', 'admin'] },
    { to: '/barber/appointments', icon: <Calendar size={20} />, label: 'Appointments', roles: ['barber', 'admin'] },
    { to: '/barber/queue', icon: <Clock size={20} />, label: 'Queue', roles: ['barber', 'admin'] },
    { to: '/barber/services', icon: <Scissors size={20} />, label: 'Services', roles: ['barber', 'admin', 'customer'] },
    { to: '/barber/profile', icon: <User size={20} />, label: 'Profile', roles: ['barber', 'admin', 'customer'] },
  ];

  const customerLinks: SidebarLink[] = [
    { to: '/customer/top-barbers', icon: <Star size={20} />, label: 'Dashboard', roles: ['customer', 'admin'] },
    { to: '/customer/booking', icon: <Calendar size={20} />, label: 'Book Appointment', roles: ['customer', 'admin'] },
    { to: '/customer/appointments', icon: <Clock size={20} />, label: 'My Appointments', roles: ['customer', 'admin'] },
    { to: '/customer/queue', icon: <Users size={20} />, label: 'Queue Status', roles: ['customer', 'admin'] },
    { to: '/customer/profile', icon: <User size={20} />, label: 'Profile', roles: ['customer', 'admin'] },
  ];

  const businessLinks: SidebarLink[] = [
    { to: '/barber/team', icon: <Users size={20} />, label: 'Staff', roles: ['barber', 'admin'] },
    { to: '/barber/settings', icon: <Settings size={20} />, label: 'Shop Settings', roles: ['barber', 'admin'] },
  ];

  const links = isBarber ? barberLinks : customerLinks;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block">
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <Scissors size={18} className="rotate-45" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TRIMLY</span>
        </Link>
      </div>
      <nav className="flex flex-col p-4">
        <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          Main Menu
        </div>
        {links
          .filter(link => link.roles.includes(user.role))
          .map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mb-1 flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                location.pathname === link.to
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}

        {isBarber && (
          <>
            <div className="my-2 px-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Business
            </div>
            {businessLinks
              .filter(link => link.roles.includes(user.role))
              .map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`mb-1 flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                    location.pathname === link.to
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Users size={20} className="mr-3" />
                  {link.label}
                </Link>
              ))}
          </>
        )}

        {!isBarber && (
          <>
            <div className="my-2 px-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Discover
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;