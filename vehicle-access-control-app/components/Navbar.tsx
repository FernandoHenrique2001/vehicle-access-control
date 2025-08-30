
import React from 'react';
import { useAuth } from '../viewModels/useAuthViewModel';
import { LogOutIcon } from './icons';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        {/* Could add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          Olá, <span className="font-semibold">{user?.name || user?.cpf || 'Admin'}</span>
        </span>
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-md transition-colors duration-150"
          aria-label="Logout"
        >
          <LogOutIcon className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
