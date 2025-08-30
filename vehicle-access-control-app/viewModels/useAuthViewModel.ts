
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../services/apiService';
import { AppRoutes, MOCK_TOKEN_KEY } from '../constants';
import { AuthResponse } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  error: string | null;
  login: (cpf: string, password_unused: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(MOCK_TOKEN_KEY));
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Initially false, true during login attempt
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkInitialAuth = useCallback(() => {
    const storedToken = localStorage.getItem(MOCK_TOKEN_KEY);
    if (storedToken) {
      // In a real app, you'd validate the token here or fetch user profile
      // For mock, just assume token means authenticated and try to parse stored user or set a mock one
      setToken(storedToken);
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) setUser(JSON.parse(storedUser));
        else setUser({id: 'admin-mock', cpf: '000.000.000-00', name: 'Mock Admin'}); // Fallback mock user
      } catch (e) {
        setUser({id: 'admin-mock-error', cpf: '000.000.000-00', name: 'Mock Admin (Error Parse)'});
      }
    }
  }, []);

  useEffect(() => {
    checkInitialAuth();
  }, [checkInitialAuth]);

  const login = async (cpf: string, password_unused: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(cpf, password_unused);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem(MOCK_TOKEN_KEY, response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user)); // Store user for persistence
      navigate(AppRoutes.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setToken(null); // Clear token on error
      setUser(null); // Clear user on error
      localStorage.removeItem(MOCK_TOKEN_KEY); // Ensure token is cleared from storage
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    apiLogout(); // Clears localStorage token
    setToken(null);
    setUser(null);
    localStorage.removeItem('authUser');
    navigate(AppRoutes.LOGIN);
  }, [navigate]);
  
  const clearError = () => {
    setError(null);
  };

  const providerValue: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    isLoading,
    error,
    login,
    logout,
    clearError
  };

  return React.createElement(AuthContext.Provider, { value: providerValue }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
