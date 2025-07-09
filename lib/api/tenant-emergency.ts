// lib/api/tenant-emergency.ts
import { apiClient } from "@/lib/api-client"

export interface TenantUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
  status: string
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
  requestId: string
  timestamp: number
  message: string
  success: boolean
}

export const tenantEmergencyApi = {
  /**
   * Get all users for a tenant
   */
  getTenantUsers: async (tenantId: string): Promise<TenantUsersResponse> => {
    try {
      console.log("👥 Fetching tenant users for:", tenantId)
      
      // Utiliser la configuration avec user email inclus
      const response = await apiClient.get(`/api/tenants/${tenantId}/users`, {
        includeUserEmail: true
      })
      
      console.log("✅ Tenant users fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch tenant users:", error)
      throw error
    }
  },

  /**
   * Set tenant to emergency access mode
   */
  setEmergencyAccess: async (
    tenantId: string,
    reason: string,
    userIds: string[]
  ) => {
    try {
      console.log("🚨 Setting emergency access for tenant:", tenantId)
      
      const queryParams = apiClient.buildQueryString({
        reason,
        userIds: userIds.join(',') // Convert array to comma-separated string
      })

      const response = await apiClient.postWithUserEmail(
        `/api/subscriptions/tenants/${tenantId}/emergency-access${queryParams}`
      )
      
      console.log("✅ Emergency access set successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to set emergency access:", error)
      throw error
    }
  },

  /**
   * Set tenant to read-only mode
   */
  setReadOnly: async (
    tenantId: string,
    reason: string,
    userIds: string[]
  ) => {
    try {
      console.log("👁️ Setting read-only access for tenant:", tenantId)
      
      const queryParams = apiClient.buildQueryString({
        reason,
        userIds: userIds.join(',') // Convert array to comma-separated string
      })

      const response = await apiClient.postWithUserEmail(
        `/api/subscriptions/tenants/${tenantId}/read-only${queryParams}`
      )
      
      console.log("✅ Read-only access set successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to set read-only access:", error)
      throw error
    }
  }
}