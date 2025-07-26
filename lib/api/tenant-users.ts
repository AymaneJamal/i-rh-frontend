// lib/api/tenant-users.ts
import { apiClient } from "@/lib/api-client"

export interface TenantUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "DELETED"
  createdAt: number
  isEmailVerified: number
  companyRole: string
  statusModifiedAt: number
  modifiedAt: number
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number
  isHelperOf: string | null
  isHelpingBy: string | null
}

export interface TenantUsersResponse {
  data: {
    count: number
    users: TenantUser[]
  }
  success: boolean
  message: string
  timestamp: number
  requestId: string
}

export interface UserActionResponse {
  success: boolean
  message: string
  timestamp: number
  requestId: string
}

export const tenantUsersApi = {
  /**
   * Get all users for a tenant
   */
  getAllTenantUsers: async (tenantId: string): Promise<TenantUsersResponse> => {
    const response = await apiClient.get(
      `/api/tenants/${tenantId}/users`,
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Suspend a tenant user
   */
  suspendTenantUser: async (tenantId: string, userId: string): Promise<UserActionResponse> => {
    const response = await apiClient.put(
      `/api/tenants/${tenantId}/users/${userId}/suspend`,
      {},
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Reactivate a tenant user
   */
  reactivateTenantUser: async (tenantId: string, userId: string): Promise<UserActionResponse> => {
    const response = await apiClient.put(
      `/api/tenants/${tenantId}/users/${userId}/reactive`,
      {},
      { includeUserEmail: true }
    )
    return response.data
  }
}