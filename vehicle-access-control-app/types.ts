
export interface User {
  id: string;
  name: string;
  cpf: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  license: string;
  userId: string; // Assuming a vehicle is linked to a user
  userName?: string; // For display purposes
  createdAt: string;
  barcode?: Barcode; // Optional, might be loaded separately
}

export interface Barcode {
  id: string;
  code: string; // The actual barcode string
  vehicleId: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  entryTime: string;
  exitTime?: string | null;
  vehicleId: string;
  vehicleLicense?: string; // For display
  barcodeId: string;
  barcodeCode?: string; // For display
}

export interface AuthResponse {
  token: string;
  user: { // Assuming admin user details are returned
    id: string;
    cpf: string;
    name?: string; // Optional name for admin
  };
}

// For dashboard charts
export interface AccessDataPoint {
  date: string;
  count: number;
}

// For API responses that might include pagination or other metadata
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// General API error structure
export interface ApiError {
  message: string;
  statusCode?: number;
}

export enum ModalAction {
  CREATE = "CREATE",
  EDIT = "EDIT",
  VIEW = "VIEW"
}

export interface SelectOption {
  value: string;
  label: string;
}
