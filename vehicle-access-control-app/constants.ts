export const API_BASE_URL = "http://localhost:3000"; // API real do backend

export enum AppRoutes {
  LOGIN = "/login",
  DASHBOARD = "/dashboard",
  USERS = "/usuarios",
  USER_CREATE = "/usuarios/novo", // Example if using separate pages, or handle with modal
  USER_EDIT = "/usuarios/:id/editar",
  VEHICLES = "/veiculos",
  VEHICLE_CREATE = "/veiculos/novo",
  VEHICLE_EDIT = "/veiculos/:id/editar",
  VEHICLE_BARCODE = "/veiculos/:id/barcode",
  ACCESS_LOG = "/acessos",
  GATEHOUSE = "/portaria",
}

export const MOCK_TOKEN_KEY = "authToken";
