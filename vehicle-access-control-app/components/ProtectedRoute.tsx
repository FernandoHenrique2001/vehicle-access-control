
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../viewModels/useAuthViewModel';
import { AppRoutes } from '../constants';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show a loading indicator or a blank screen while checking auth status initially
  // This basic version doesn't explicitly handle an initial loading state from useAuth for a brief moment
  // A more robust solution might involve a global loading state or a brief delay.
  // For this, if token check is async and isLoading reflects it, this is good.
  // If useAuth().isLoading is true while validating token initially, we can show a loader.
  // However, current useAuthViewModel sets isLoading mostly for login action.
  // So, this primarily checks current isAuthenticated status.

  if (isLoading) { // If login is in progress, or initial check is happening
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.LOGIN} replace />;
  }

  return <Outlet />; // Render child routes/components if authenticated
};

export default ProtectedRoute;
