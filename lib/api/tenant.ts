// lib/api/tenant.ts
import { apiClient } from "@/lib/api-client"
import { TenantResponse, TenantFilters, TenantDetailResponse, AssignSubscriptionRequest } from "@/types/tenant"

export const tenantApi = {
  /**
   * Get all tenants with pagination and filters
   */
  getAllTenants: async (filters: TenantFilters = {}): Promise<TenantResponse> => {
    try {
      const params = new URLSearchParams()
      
      // Add pagination parameters
      if (filters.page !== undefined) params.append('page', filters.page.toString())
      if (filters.size !== undefined) params.append('size', filters.size.toString())
      
      // Add filter parameters
      if (filters.status) params.append('status', filters.status)
      if (filters.tenantName) params.append('tenantName', filters.tenantName)

      const url = `/api/tenants${params.toString() ? `?${params.toString()}` : ''}`
      console.log("🏢 Fetching tenants from:", url)

      const response = await apiClient.get(url)
      
      console.log("✅ Tenants fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch tenants:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  },

  /**
   * Get tenant details by ID
   */
  getTenantById: async (tenantId: string): Promise<TenantDetailResponse> => {
    try {
      console.log("🔍 Fetching tenant details for ID:", tenantId)

      const response = await apiClient.get(`/api/tenants/${tenantId}`)
      
      console.log("✅ Tenant details fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch tenant details:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  },

  /**
   * Check if tenant details are available (10 minutes rule)
   */
  isTenantDetailsAvailable: (createdAt: number): boolean => {
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000 // 10 minutes in milliseconds
    const timeSinceCreation = now - createdAt
    
    console.log("⏰ Checking tenant availability:", {
      createdAt: new Date(createdAt).toISOString(),
      now: new Date(now).toISOString(),
      timeSinceCreation: Math.floor(timeSinceCreation / 1000 / 60), // minutes
      isAvailable: timeSinceCreation >= tenMinutes
    })
    
    return timeSinceCreation >= tenMinutes
  },

  /**
   * Get remaining time until tenant details are available
   */
  getRemainingTime: (createdAt: number): number => {
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000
    const timeSinceCreation = now - createdAt
    const remainingTime = tenMinutes - timeSinceCreation
    
    return Math.max(0, remainingTime)
  },

  /**
   * Assign subscription to tenant
   */
  assignSubscription: async (request: AssignSubscriptionRequest): Promise<any> => {
    try {
      console.log("💳 Assigning subscription to tenant:", request.tenantId)
      
      const formData = new FormData()
      formData.append('planId', request.planId)
      formData.append('billingMethod', request.billingMethod)
      formData.append('autoRenew', request.autoRenew.toString())
      
      if (request.receiptFile) {
        formData.append('receiptFile', request.receiptFile)
      }
      
      if (request.customExpiryDate) {
        formData.append('customExpiryDate', request.customExpiryDate)
      }

      const response = await apiClient.post(
        `/api/tenants/${request.tenantId}/subscription`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      console.log("✅ Subscription assigned successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to assign subscription:", error)
      throw error
    }
  }
}