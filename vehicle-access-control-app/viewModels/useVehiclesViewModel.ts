
import { useState, useCallback, useEffect } from 'react';
import { Vehicle, Barcode, User, SelectOption } from '../types';
import { 
  fetchVehicles as apiFetchVehicles, 
  createVehicle as apiCreateVehicle, 
  updateVehicle as apiUpdateVehicle, 
  deleteVehicle as apiDeleteVehicle,
  fetchVehicleById as apiFetchVehicleById,
  generateBarcodeForVehicle as apiGenerateBarcode,
  fetchBarcodeByVehicleId as apiFetchBarcode,
  fetchUserOptions as apiFetchUserOptions,
} from '../services/apiService';

interface VehiclesViewModel {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  userOptions: SelectOption[];
  fetchVehicles: () => Promise<void>;
  fetchVehicleById: (id: string) => Promise<Vehicle | null>;
  addVehicle: (vehicleData: { userId: string; license: string }) => Promise<Vehicle | null>;
  updateVehicle: (vehicleId: string, vehicleData: Partial<{ userId: string; license: string }>) => Promise<Vehicle | null>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  generateBarcode: (vehicleId: string) => Promise<Barcode | null>;
  fetchBarcodeForVehicle: (vehicleId: string) => Promise<Barcode | null>;
  fetchUsersForSelect: () => Promise<void>;
  clearError: () => void;
  setErrorManually: (message: string) => void;
}

export const useVehiclesViewModel = (): VehiclesViewModel => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);

  const clearError = useCallback(() => setError(null), []);
  const setErrorManually = useCallback((message: string) => setError(message), []);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const data = await apiFetchVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar veículos.');
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);
  
  const fetchVehicleById = useCallback(async (id: string): Promise<Vehicle | null> => {
    setIsLoading(true);
    clearError();
    try {
      const vehicle = await apiFetchVehicleById(id);
      return vehicle;
    } catch (err: any) {
      setError(err.message || `Falha ao buscar veículo ${id}.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const addVehicle = useCallback(async (vehicleData: { userId: string; license: string }): Promise<Vehicle | null> => {
    setIsLoading(true);
    clearError();
    try {
      const newVehicle = await apiCreateVehicle(vehicleData);
      // Instead of directly adding, refetch to get all associated data correctly (like userName)
      await fetchVehicles(); 
      return newVehicle;
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar veículo.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, fetchVehicles]);

  const updateVehicle = useCallback(async (vehicleId: string, vehicleData: Partial<{ userId: string; license: string }>): Promise<Vehicle | null> => {
    setIsLoading(true);
    clearError();
    try {
      const updatedVehicle = await apiUpdateVehicle(vehicleId, vehicleData);
       // Instead of directly updating, refetch to get all associated data correctly
      await fetchVehicles();
      return updatedVehicle;
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar veículo.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, fetchVehicles]);

  const deleteVehicle = useCallback(async (vehicleId: string): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    try {
      await apiDeleteVehicle(vehicleId);
      setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleId));
      return true;
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar veículo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const generateBarcode = useCallback(async (vehicleId: string): Promise<Barcode | null> => {
    setIsLoading(true);
    clearError();
    try {
      const barcode = await apiGenerateBarcode(vehicleId);
      // Update the specific vehicle in the list with the new barcode info
      setVehicles(prev => prev.map(v => v.id === vehicleId ? {...v, barcode } : v));
      return barcode;
    } catch (err: any) {
      setError(err.message || 'Falha ao gerar código de barras.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);
  
  const fetchBarcodeForVehicle = useCallback(async (vehicleId: string): Promise<Barcode | null> => {
    setIsLoading(true);
    clearError();
    try {
      const barcode = await apiFetchBarcode(vehicleId);
      return barcode;
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar código de barras.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const fetchUsersForSelect = useCallback(async () => {
    // No loading state change here, can be background task or part of vehicle form loading
    try {
      const options = await apiFetchUserOptions();
      setUserOptions(options);
    } catch (err: any) {
      // Don't necessarily set global error, could be specific to dropdown
      console.error("Failed to fetch user options:", err);
      setUserOptions([]); // Set to empty on error
    }
  }, []);

  return { 
    vehicles, 
    isLoading, 
    error, 
    userOptions,
    fetchVehicles, 
    fetchVehicleById,
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    generateBarcode,
    fetchBarcodeForVehicle,
    fetchUsersForSelect,
    clearError,
    setErrorManually
  };
};
