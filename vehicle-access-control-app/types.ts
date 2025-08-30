export interface User {
  id: string;
  name: string;
  cpf: string;
  password?: string; // Opcional - apenas admins têm senha
  type?: string; // ADMIN ou USER
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  cpf: string;
  password?: string; // Opcional
  type?: string; // ADMIN ou USER
}

export interface UpdateUserDto {
  name?: string;
  cpf?: string;
  password?: string; // Opcional
  type?: string; // ADMIN ou USER
}

export interface Vehicle {
  id: string;
  license: string;
  userId: string; // Assuming a vehicle is linked to a user
  userName?: string; // For display purposes
  createdAt: string;
  barcode?: Barcode; // Optional, might be loaded separately
}

export interface CreateVehicleDto {
  userId: string;
  license: string;
}

export interface UpdateVehicleDto {
  userId?: string;
  license?: string;
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
  barcode: {
    code: string;
  };
  vehicle: {
    license: string;
  };
  exitTime?: string | null;
  vehicleId?: string;
  vehicleLicense?: string; // For display
  barcodeId?: string;
  barcodeCode?: string; // For display
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    cpf: string;
    name?: string; // Optional name for admin
    type?: string; // ADMIN or USER
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
  VIEW = "VIEW",
}

export interface SelectOption {
  value: string;
  label: string;
}
