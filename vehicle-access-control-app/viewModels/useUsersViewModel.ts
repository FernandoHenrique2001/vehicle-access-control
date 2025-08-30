
import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import { fetchUsers as apiFetchUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, fetchUserById as apiFetchUserById } from '../services/apiService';

interface UsersViewModel {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User | null>;
  updateUser: (userId: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  clearError: () => void;
  setErrorManually: (message: string) => void;
}

export const useUsersViewModel = (): UsersViewModel => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const setErrorManually = useCallback((message: string) => setError(message), []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const data = await apiFetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar usuários.');
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);
  
  const fetchUserById = useCallback(async (id: string): Promise<User | null> => {
    setIsLoading(true);
    clearError();
    try {
      const user = await apiFetchUserById(id);
      return user;
    } catch (err: any) {
      setError(err.message || `Falha ao buscar usuário ${id}.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);


  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
    setIsLoading(true);
    clearError();
    try {
      const newUser = await apiCreateUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar usuário.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const updateUser = useCallback(async (userId: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> => {
    setIsLoading(true);
    clearError();
    try {
      const updatedUser = await apiUpdateUser(userId, userData);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar usuário.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    try {
      await apiDeleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      return true;
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar usuário.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);
  
  // useEffect(() => {
  // fetchUsers(); // Initial fetch (optional, can be triggered by view)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // This can cause issues if not intended. Better to call from view.

  return { users, isLoading, error, fetchUsers, fetchUserById, addUser, updateUser, deleteUser, clearError, setErrorManually };
};
