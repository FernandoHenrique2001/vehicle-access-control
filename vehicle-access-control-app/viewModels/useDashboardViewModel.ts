
import { useState, useCallback } from 'react';
import { Entry, AccessDataPoint } from '../types';
import { 
  fetchDashboardData as apiFetchDashboardData,
  fetchVehicles, 
  fetchUsers 
} from '../services/apiService';

interface VehicleAccess {
  name: string; // Vehicle license or "Outros"
  value: number; // Count of accesses
}

interface DashboardData {
  totalVehicles: number;
  totalUsers: number;
  currentEntries: number; // Vehicles currently inside
  recentEntriesToday: number;
  dailyAccessCounts: AccessDataPoint[]; // For existing bar chart

  // New KPIs & Chart Data
  totalAccessesInPeriod: number;
  lastAccess?: { vehicleLicense: string; time: string; type: 'Entrada' | 'Saída Registrada'; rawTime: Date };
  vehicleAccessDistribution: VehicleAccess[]; // For Pie chart
  accessHeatmapGrid: { 
    hours: string[]; 
    days: string[]; 
    data: number[][]; 
    maxValue: number; 
  };
}

interface DashboardViewModel extends DashboardData {
  isLoading: boolean;
  error: string | null;
  loadDashboardData: (filters?: { startDate?: string, endDate?: string }) => Promise<void>;
  clearError: () => void;
}

const initialDashboardData: DashboardData = {
  totalVehicles: 0,
  totalUsers: 0,
  currentEntries: 0,
  recentEntriesToday: 0,
  dailyAccessCounts: [],
  totalAccessesInPeriod: 0,
  lastAccess: undefined,
  vehicleAccessDistribution: [],
  accessHeatmapGrid: {
    hours: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    data: Array(7).fill(null).map(() => Array(24).fill(0)),
    maxValue: 0,
  },
};

const TOP_N_VEHICLES = 5; // For pie chart

export const useDashboardViewModel = (): DashboardViewModel => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadDashboardData = useCallback(async (filters?: { startDate?: string, endDate?: string }) => {
    setIsLoading(true);
    clearError();
    try {
      const dataForApi = (filters && filters.startDate && filters.endDate)
        ? { startDate: filters.startDate, endDate: filters.endDate }
        : undefined;

      const [vehicleData, userData, dashData] = await Promise.all([
        fetchVehicles(), 
        fetchUsers(), 
        apiFetchDashboardData(dataForApi) 
      ]);

      // Calculate total accesses in period
      const totalAccessesInPeriod = dashData.entries.length;

      // Calculate last access
      let latestAccess: DashboardData['lastAccess'] = undefined;
      if (dashData.entries.length > 0) {
        dashData.entries.forEach(entry => {
          const entryEventTime = new Date(entry.entryTime);
          if (!latestAccess || entryEventTime > latestAccess.rawTime) {
            latestAccess = {
              vehicleLicense: entry.vehicleLicense || 'N/A',
              time: entryEventTime.toLocaleString('pt-BR'),
              type: 'Entrada',
              rawTime: entryEventTime,
            };
          }
          if (entry.exitTime) {
            const exitEventTime = new Date(entry.exitTime);
            if (!latestAccess || exitEventTime > latestAccess.rawTime) {
              latestAccess = {
                vehicleLicense: entry.vehicleLicense || 'N/A',
                time: exitEventTime.toLocaleString('pt-BR'),
                type: 'Saída Registrada',
                rawTime: exitEventTime,
              };
            }
          }
        });
      }
      
      // Calculate vehicle access distribution for Pie Chart
      const vehicleCounts: { [key: string]: number } = {};
      dashData.entries.forEach(entry => {
        const license = entry.vehicleLicense || 'Desconhecido';
        vehicleCounts[license] = (vehicleCounts[license] || 0) + 1;
      });
      
      const sortedVehicles = Object.entries(vehicleCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      let vehicleAccessDistribution: VehicleAccess[] = [];
      if (sortedVehicles.length > TOP_N_VEHICLES) {
        vehicleAccessDistribution = sortedVehicles.slice(0, TOP_N_VEHICLES);
        const otherValue = sortedVehicles.slice(TOP_N_VEHICLES).reduce((sum, current) => sum + current.value, 0);
        if (otherValue > 0) {
          vehicleAccessDistribution.push({ name: 'Outros', value: otherValue });
        }
      } else {
        vehicleAccessDistribution = sortedVehicles;
      }

      // Calculate access heatmap data
      const heatmapDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const heatmapHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
      const heatmapMatrix: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
      let heatmapMaxValue = 0;

      dashData.entries.forEach(entry => {
        const date = new Date(entry.entryTime);
        const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const hour = date.getHours();
        heatmapMatrix[dayOfWeek][hour]++;
        if (heatmapMatrix[dayOfWeek][hour] > heatmapMaxValue) {
          heatmapMaxValue = heatmapMatrix[dayOfWeek][hour];
        }
      });
      
      const accessHeatmapGrid = {
        days: heatmapDays,
        hours: heatmapHours,
        data: heatmapMatrix,
        maxValue: heatmapMaxValue,
      };

      // Existing calculations
      const today = new Date().toISOString().split('T')[0];
      const entriesTodayCount = dashData.entries.filter(
        entry => new Date(entry.entryTime).toISOString().split('T')[0] === today
      ).length;
      const currentInsideCount = dashData.entries.filter(entry => !entry.exitTime).length;

      setDashboardData({
        totalVehicles: vehicleData.length,
        totalUsers: userData.length,
        currentEntries: currentInsideCount,
        recentEntriesToday: entriesTodayCount,
        dailyAccessCounts: dashData.dailyAccessCounts,
        totalAccessesInPeriod,
        lastAccess: latestAccess,
        vehicleAccessDistribution,
        accessHeatmapGrid,
      });

    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dados do dashboard.');
      setDashboardData(initialDashboardData); // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  return { 
    ...dashboardData,
    isLoading, 
    error, 
    loadDashboardData,
    clearError
  };
};
