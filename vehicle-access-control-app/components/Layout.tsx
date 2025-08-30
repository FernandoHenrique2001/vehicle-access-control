
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Adjust ml to match sidebar width */}
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Page content will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
