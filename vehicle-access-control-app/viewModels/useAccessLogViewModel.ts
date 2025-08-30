
import { useState, useCallback } from 'react';
import { Entry } from '../types';
import { 
  fetchEntries as apiFetchEntries, 
  scanBarcodeAndCreateEntry as apiScanBarcode 
} from '../services/apiService';

interface AccessLogViewModel {
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
  scanError: string | null; // Specific error for scan operation
  scanSuccessMessage: string | null;
  fetchEntries: (filters?: { startDate?: string, endDate?: string }) => Promise<void>;
  scanBarcode: (barcodeCode: string) => Promise<Entry | null>;
  clearMessages: () => void;
}

export const useAccessLogViewModel = (): AccessLogViewModel => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // For fetching entries
  const [scanError, setScanError] = useState<string | null>(null); // For scan operation
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setScanError(null);
    setScanSuccessMessage(null);
  }, []);

  const fetchEntries = useCallback(async (filters?: { startDate?: string, endDate?: string }) => {
    setIsLoading(true);
    clearMessages();
    try {
      const data = await apiFetchEntries(filters);
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar registros de acesso.');
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  const scanBarcode = useCallback(async (barcodeCode: string): Promise<Entry | null> => {
    setIsLoading(true); // Consider a specific loading state for scan if needed (e.g., isScanning)
    clearMessages();
    try {
      const entry = await apiScanBarcode(barcodeCode);
      const message = entry.exitTime 
        ? `Saída registrada para veículo ${entry.vehicleLicense} às ${new Date(entry.exitTime).toLocaleString()}.`
        : `Entrada registrada para veículo ${entry.vehicleLicense} às ${new Date(entry.entryTime).toLocaleString()}.`;
      setScanSuccessMessage(message);
      // Optionally, refetch entries if the gatehouse page also displays a log
      // fetchEntries(); 
      return entry;
    } catch (err: any) {
      setScanError(err.message || 'Falha ao processar código de barras.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  return { 
    entries, 
    isLoading, 
    error, 
    scanError,
    scanSuccessMessage,
    fetchEntries, 
    scanBarcode,
    clearMessages
  };
};
