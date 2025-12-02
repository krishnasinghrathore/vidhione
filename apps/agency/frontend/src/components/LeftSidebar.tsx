import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  active?: boolean;
}

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: 'pi-home', path: '/' },
    { id: 'transactions', label: 'Transactions', icon: 'pi-list', path: '/agency/transactions' },
    { id: 'transport', label: 'Transport', icon: 'pi-car', path: '/fleet/vehicles' },
    { id: 'accounts', label: 'Accounts', icon: 'pi-users', path: '/accounts' },
    { id: 'reports', label: 'Reports', icon: 'pi-briefcase', path: '/reports' },
    { id: 'analytics', label: 'Analytics', icon: 'pi-chart-bar', path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: 'pi-cog', path: '/settings' }
  ];

  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeNavItem = navigationItems.find(item =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
    return activeNavItem ? activeNavItem.id : 'home';
  };

  const handleItemClick = (itemId: string) => {
    const navItem = navigationItems.find(item => item.id === itemId);
    if (navItem && navItem.path) {
      navigate(navItem.path);
    }
  };

  return (
    <div className="left-sidebar bg-blue-800 text-white transition-all duration-300 flex flex-column shadow-2 w-4rem">
      {/* Navigation Items */}
      <div className="flex flex-column flex-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            icon={`pi ${item.icon}`}
            className={`p-button-text w-full justify-content-center border-none p-2 text-white hover:bg-blue-700 transition-colors duration-200 ${
              getActiveItem() === item.id ? 'bg-blue-600 shadow-1' : 'bg-transparent'
            }`}
            onClick={() => handleItemClick(item.id)}
            title={item.label}
          />
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;