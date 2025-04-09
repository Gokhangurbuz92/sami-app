export interface RolePermissions {
  canAccessDashboard: boolean;
  canAccessAppointments: boolean;
  canAccessNotes: boolean;
  canAccessNotifications: boolean;
  canAccessMessaging: boolean;
  canAccessUserManagement: boolean;
}

export type Permission = keyof RolePermissions;

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Types pour les tests
export interface MockData {
  id: string;
  [key: string]: unknown;
}

export interface TestContext {
  cleanup: () => Promise<void>;
  setup: () => Promise<void>;
  data: MockData;
} 