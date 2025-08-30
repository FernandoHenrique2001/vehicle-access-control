import { API_BASE_URL, MOCK_TOKEN_KEY } from "../constants";
import {
  User,
  Vehicle,
  Barcode,
  Entry,
  AuthResponse,
  ApiError,
  SelectOption,
  CreateUserDto,
  UpdateUserDto,
  CreateVehicleDto,
  UpdateVehicleDto,
} from "../types";

// --- Helper Functions ---
const getAuthToken = (): string | null => localStorage.getItem(MOCK_TOKEN_KEY);

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || `HTTP error! status: ${response.status}`,
      statusCode: response.status,
    } as ApiError;
  }
  return response.json();
};

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
};

// --- API Functions ---

// Auth
export const login = async (
  cpf: string,
  password: string
): Promise<AuthResponse> => {
  console.log(`Attempting login for CPF: ${cpf}`);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cpf, password }),
  });

  if (!response.ok) {
    throw {
      message: "Credenciais inválidas",
      statusCode: response.status,
    } as ApiError;
  }

  const data = await response.json();
  const token = data.token;
  localStorage.setItem(MOCK_TOKEN_KEY, token);

  return {
    token,
    user: data.user,
  };
};

export const logout = (): void => {
  localStorage.removeItem(MOCK_TOKEN_KEY);
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  return makeRequest<User[]>("/users");
};

export const fetchUserById = async (userId: string): Promise<User> => {
  return makeRequest<User>(`/users/${userId}`);
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  return makeRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (
  userId: string,
  userData: UpdateUserDto
): Promise<User> => {
  return makeRequest<User>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  return makeRequest<void>(`/users/${userId}`, {
    method: "DELETE",
  });
};

// Vehicles
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  return makeRequest<Vehicle[]>("/vehicles");
};

export const fetchVehicleById = async (vehicleId: string): Promise<Vehicle> => {
  return makeRequest<Vehicle>(`/vehicles/${vehicleId}`);
};

export const createVehicle = async (
  vehicleData: CreateVehicleDto
): Promise<Vehicle> => {
  return makeRequest<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicleData),
  });
};

export const updateVehicle = async (
  vehicleId: string,
  vehicleData: UpdateVehicleDto
): Promise<Vehicle> => {
  return makeRequest<Vehicle>(`/vehicles/${vehicleId}`, {
    method: "PATCH",
    body: JSON.stringify(vehicleData),
  });
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  return makeRequest<void>(`/vehicles/${vehicleId}`, {
    method: "DELETE",
  });
};

// Barcodes
export const generateBarcodeForVehicle = async (
  vehicleId: string
): Promise<Barcode> => {
  return makeRequest<Barcode>(`/barcodes/generate/${vehicleId}`, {
    method: "POST",
  });
};

export const fetchBarcodeByVehicleId = async (
  vehicleId: string
): Promise<Barcode | null> => {
  try {
    return await makeRequest<Barcode>(`/barcodes/vehicle/${vehicleId}`);
  } catch (error) {
    if ((error as ApiError).statusCode === 404) {
      return null;
    }
    throw error;
  }
};

// Entries
export const fetchEntries = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Entry[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const endpoint = queryString ? `/entries?${queryString}` : "/entries";

  return makeRequest<Entry[]>(endpoint);
};

export const scanBarcodeAndCreateEntry = async (
  barcodeCode: string
): Promise<Entry> => {
  return makeRequest<Entry>(`/entries/scan/${barcodeCode}`, {
    method: "POST",
  });
};

// Dashboard
export const fetchDashboardData = async (dateRange?: {
  startDate: string;
  endDate: string;
}): Promise<{
  entries: Entry[];
  dailyAccessCounts: { date: string; count: number }[];
}> => {
  const params = new URLSearchParams();
  if (dateRange?.startDate) params.append("startDate", dateRange.startDate);
  if (dateRange?.endDate) params.append("endDate", dateRange.endDate);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/entries/dashboard?${queryString}`
    : "/entries/dashboard";

  return makeRequest<{
    entries: Entry[];
    dailyAccessCounts: { date: string; count: number }[];
  }>(endpoint);
};

export const fetchUserOptions = async (): Promise<SelectOption[]> => {
  return makeRequest<SelectOption[]>("/users/options");
};
