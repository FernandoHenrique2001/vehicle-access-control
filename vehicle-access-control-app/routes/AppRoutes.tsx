
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppRoutes as RoutePaths } from '../constants';

import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Import Pages (Views)
import LoginPage from '../views/LoginPage';
import DashboardPage from '../views/DashboardPage';
import UsersPage from '../views/UsersPage';
import VehiclesPage from '../views/VehiclesPage';
import VehicleBarcodePage from '../views/VehicleBarcodePage';
import AccessLogPage from '../views/AccessLogPage';
import GatehousePage from '../views/GatehousePage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path={RoutePaths.LOGIN} element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}> {/* Layout wraps all protected pages */}
          <Route path="/" element={<Navigate to={RoutePaths.DASHBOARD} replace />} />
          <Route path={RoutePaths.DASHBOARD} element={<DashboardPage />} />
          <Route path={RoutePaths.USERS} element={<UsersPage />} />
          {/* For user create/edit, assuming modal usage, so one route for UsersPage is enough.
              If separate pages:
              <Route path={RoutePaths.USER_CREATE} element={<UserFormPage mode="create" />} />
              <Route path={RoutePaths.USER_EDIT} element={<UserFormPage mode="edit" />} /> 
          */}
          <Route path={RoutePaths.VEHICLES} element={<VehiclesPage />} />
          <Route path={RoutePaths.VEHICLE_BARCODE} element={<VehicleBarcodePage />} />
          <Route path={RoutePaths.ACCESS_LOG} element={<AccessLogPage />} />
          <Route path={RoutePaths.GATEHOUSE} element={<GatehousePage />} />
        </Route>
      </Route>
      
      {/* Fallback for any other route */}
      <Route path="*" element={<Navigate to={RoutePaths.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRouter;
