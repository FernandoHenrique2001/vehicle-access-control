
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppRoutes } from '../constants';
import { HomeIcon, UsersIcon, CarIcon, ListIcon, ScanLineIcon, BarcodeIcon } from './icons';

const navItems = [
  { path: AppRoutes.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { path: AppRoutes.USERS, label: 'Usuários', icon: UsersIcon },
  { path: AppRoutes.VEHICLES, label: 'Veículos', icon: CarIcon },
  { path: AppRoutes.ACCESS_LOG, label: 'Registros de Acesso', icon: ListIcon },
  { path: AppRoutes.GATEHOUSE, label: 'Portaria', icon: ScanLineIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed top-0 left-0">
      <div className="p-6 text-2xl font-semibold border-b border-gray-700">
        <NavLink to={AppRoutes.DASHBOARD} className="flex items-center space-x-2 hover:text-primary">
          <BarcodeIcon size={28} /> 
          <span>ControleAcesso</span>
        </NavLink>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-gray-700 hover:text-primary ${
                isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-300'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-500">
        © {new Date().getFullYear()} Vehicle Control
      </div>
    </div>
  );
};

export default Sidebar;
