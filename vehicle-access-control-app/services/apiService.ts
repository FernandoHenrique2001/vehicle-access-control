
import { API_BASE_URL, MOCK_TOKEN_KEY } from '../constants';
import { User, Vehicle, Barcode, Entry, AuthResponse, ApiError, SelectOption } from '../types';

// --- Mock Data ---
let mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', cpf: '111.111.111-11', createdAt: new Date().toISOString() },
  { id: 'user2', name: 'Bob The Builder', cpf: '222.222.222-22', createdAt: new Date().toISOString() },
];

let mockVehicles: Vehicle[] = [
  { id: 'vehicle1', license: 'ABC-1234', userId: 'user1', userName: 'Alice Wonderland', createdAt: new Date().toISOString() },
  { id: 'vehicle2', license: 'XYZ-7890', userId: 'user2', userName: 'Bob The Builder', createdAt: new Date().toISOString() },
  { id: 'vehicle3', license: 'QWE-5678', userId: 'user1', userName: 'Alice Wonderland', createdAt: new Date().toISOString() },
];

let mockBarcodes: Barcode[] = [
  { id: 'barcode1', code: 'VEHICLE1BARCODE', vehicleId: 'vehicle1', createdAt: new Date().toISOString() },
];
mockVehicles[0].barcode = mockBarcodes[0];


let mockEntries: Entry[] = [
  { id: 'entry1', entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), vehicleId: 'vehicle1', vehicleLicense: 'ABC-1234', barcodeId: 'barcode1', barcodeCode: 'VEHICLE1BARCODE' },
  { id: 'entry2', entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), exitTime: null, vehicleId: 'vehicle2', vehicleLicense: 'XYZ-7890', barcodeId: 'barcodeGeneratedForVehicle2', barcodeCode: 'VEHICLE2BARCODE' },
];

// --- Helper Functions ---
const simulateDelay = <T,>(data: T, delay = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const simulateError = <T,>(message: string, statusCode = 500, delay = 500): Promise<T> =>
  new Promise((_, reject) => setTimeout(() => reject({ message, statusCode } as ApiError), delay));


const getAuthToken = (): string | null => localStorage.getItem(MOCK_TOKEN_KEY);

// --- API Functions ---

// Auth
export const login = async (cpf: string, password_unused: string): Promise<AuthResponse> => {
  console.log(`Attempting login for CPF: ${cpf}`);
  // Simulate backend validation. For this mock, any non-empty CPF/password is fine.
  // The `api.http` sample uses "701.226.686-42" and "123456".
  if (cpf === "701.226.686-42") {
    const token = `mock-jwt-token-${Date.now()}`;
    localStorage.setItem(MOCK_TOKEN_KEY, token);
    const response: AuthResponse = {
      token,
      user: { id: 'admin1', cpf: "701.226.686-42", name: 'Admin User' },
    };
    return simulateDelay(response);
  }
  return simulateError('Invalid credentials', 401);
};

export const logout = (): void => {
  localStorage.removeItem(MOCK_TOKEN_KEY);
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  return simulateDelay([...mockUsers]);
};

export const fetchUserById = async (userId: string): Promise<User> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const user = mockUsers.find(u => u.id === userId);
  if (user) return simulateDelay(user);
  return simulateError('User not found', 404);
}

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const newUser: User = { 
    id: `user${Date.now()}`, 
    ...userData, 
    createdAt: new Date().toISOString() 
  };
  mockUsers.push(newUser);
  return simulateDelay(newUser);
};

export const updateUser = async (userId: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return simulateDelay(mockUsers[userIndex]);
  }
  return simulateError('User not found', 404);
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  mockUsers = mockUsers.filter(u => u.id !== userId);
  // Also remove vehicles associated with this user for consistency in mock
  mockVehicles = mockVehicles.filter(v => v.userId !== userId);
  return simulateDelay(undefined);
};

// Vehicles
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const vehiclesWithUserNames = mockVehicles.map(v => {
    const user = mockUsers.find(u => u.id === v.userId);
    return { ...v, userName: user ? user.name : 'Unknown User', barcode: mockBarcodes.find(b => b.vehicleId === v.id) };
  });
  return simulateDelay(vehiclesWithUserNames);
};

export const fetchVehicleById = async (vehicleId: string): Promise<Vehicle> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const vehicle = mockVehicles.find(v => v.id === vehicleId);
  if (vehicle) {
    const user = mockUsers.find(u => u.id === vehicle.userId);
    const barcode = mockBarcodes.find(b => b.vehicleId === vehicle.id);
    return simulateDelay({ ...vehicle, userName: user?.name, barcode });
  }
  return simulateError('Vehicle not found', 404);
}

export const createVehicle = async (vehicleData: { userId: string; license: string }): Promise<Vehicle> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const user = mockUsers.find(u => u.id === vehicleData.userId);
  if (!user) return simulateError('User not found for vehicle creation', 400);

  const newVehicle: Vehicle = { 
    id: `vehicle${Date.now()}`, 
    license: vehicleData.license, 
    userId: vehicleData.userId,
    userName: user.name,
    createdAt: new Date().toISOString(),
  };
  mockVehicles.push(newVehicle);
  return simulateDelay(newVehicle);
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<{ userId: string; license: string }>): Promise<Vehicle> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIndex > -1) {
    let updatedVehicle = { ...mockVehicles[vehicleIndex], ...vehicleData };
    if (vehicleData.userId) {
        const user = mockUsers.find(u => u.id === vehicleData.userId);
        updatedVehicle.userName = user ? user.name : 'Unknown User';
    }
    mockVehicles[vehicleIndex] = updatedVehicle;
    return simulateDelay(mockVehicles[vehicleIndex]);
  }
  return simulateError('Vehicle not found', 404);
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  mockVehicles = mockVehicles.filter(v => v.id !== vehicleId);
  mockBarcodes = mockBarcodes.filter(b => b.vehicleId !== vehicleId); // Cascade delete barcodes
  mockEntries = mockEntries.filter(e => e.vehicleId !== vehicleId); // Cascade delete entries
  return simulateDelay(undefined);
};

// Barcodes
export const generateBarcodeForVehicle = async (vehicleId: string): Promise<Barcode> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const vehicle = mockVehicles.find(v => v.id === vehicleId);
  if (!vehicle) return simulateError('Vehicle not found for barcode generation', 404);

  // Remove existing barcode for the vehicle if any
  mockBarcodes = mockBarcodes.filter(b => b.vehicleId !== vehicleId);
  
  const newBarcode: Barcode = {
    id: `barcode${Date.now()}`,
    code: `${vehicle.license.replace(/[^A-Z0-9]/g, '')}${Date.now()}`.toUpperCase(), // Simple unique code
    vehicleId,
    createdAt: new Date().toISOString(),
  };
  mockBarcodes.push(newBarcode);
  // Link barcode to vehicle in mockVehicles
  const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIndex > -1) {
      mockVehicles[vehicleIndex].barcode = newBarcode;
  }
  return simulateDelay(newBarcode);
};

export const fetchBarcodeByVehicleId = async (vehicleId: string): Promise<Barcode | null> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  const barcode = mockBarcodes.find(b => b.vehicleId === vehicleId);
  return simulateDelay(barcode || null);
}

// Entries
export const fetchEntries = async (filters?: { startDate?: string, endDate?: string }): Promise<Entry[]> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  let filteredEntries = [...mockEntries];
  if (filters?.startDate) {
    filteredEntries = filteredEntries.filter(e => new Date(e.entryTime) >= new Date(filters.startDate!));
  }
  if (filters?.endDate) {
    // Add 1 day to endDate to include entries from that day
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    filteredEntries = filteredEntries.filter(e => new Date(e.entryTime) < endDate);
  }

  const entriesWithDetails = filteredEntries.map(e => {
    const vehicle = mockVehicles.find(v => v.id === e.vehicleId);
    const barcode = mockBarcodes.find(b => b.id === e.barcodeId);
    return {
      ...e,
      vehicleLicense: vehicle ? vehicle.license : 'N/A',
      barcodeCode: barcode ? barcode.code : 'N/A',
    };
  }).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  return simulateDelay(entriesWithDetails);
};

export const scanBarcodeAndCreateEntry = async (barcodeCode: string): Promise<Entry> => {
  // This endpoint is public as per api.http (no Authorization header)
  const barcode = mockBarcodes.find(b => b.code === barcodeCode);
  if (!barcode) return simulateError('Barcode not found or invalid', 404);

  const vehicle = mockVehicles.find(v => v.id === barcode.vehicleId);
  if (!vehicle) return simulateError('Vehicle associated with barcode not found', 404);

  // Check if there's an existing open entry for this vehicle
  const existingOpenEntry = mockEntries.find(e => e.vehicleId === vehicle.id && !e.exitTime);

  if (existingOpenEntry) {
    // If exists, this is an exit
    existingOpenEntry.exitTime = new Date().toISOString();
    return simulateDelay(existingOpenEntry);
  } else {
    // If not, this is an entry
    const newEntry: Entry = {
      id: `entry${Date.now()}`,
      entryTime: new Date().toISOString(),
      exitTime: null,
      vehicleId: vehicle.id,
      vehicleLicense: vehicle.license,
      barcodeId: barcode.id,
      barcodeCode: barcode.code,
    };
    mockEntries.push(newEntry);
    return simulateDelay(newEntry);
  }
};

// Dashboard
export const fetchDashboardData = async (dateRange?: {startDate: string, endDate: string}): Promise<{ entries: Entry[], dailyAccessCounts: {date: string, count: number}[] }> => {
  if (!getAuthToken()) return simulateError('Unauthorized', 401);
  
  let relevantEntries = [...mockEntries];
  if (dateRange?.startDate && dateRange?.endDate) {
    relevantEntries = mockEntries.filter(entry => {
      const entryDate = new Date(entry.entryTime);
      return entryDate >= new Date(dateRange.startDate) && entryDate <= new Date(dateRange.endDate);
    });
  } else { // Default to last 7 days if no range
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    relevantEntries = mockEntries.filter(entry => new Date(entry.entryTime) >= sevenDaysAgo);
  }

  const dailyCounts: {[key: string]: number} = {};
  relevantEntries.forEach(entry => {
    const date = new Date(entry.entryTime).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const dailyAccessCounts = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return simulateDelay({ entries: relevantEntries, dailyAccessCounts });
};


export const fetchUserOptions = async (): Promise<SelectOption[]> => {
    if (!getAuthToken()) return simulateError('Unauthorized', 401);
    const options = mockUsers.map(user => ({ value: user.id, label: `${user.name} (${user.cpf})` }));
    return simulateDelay(options);
}
