// lib/api/tenant-status.ts
import { apiClient } from "@/lib/api-client"

export interface StatusHistoryItem {
  reason: string
  newStatus: string
  changedBy: string
  timestamp: string
  previousStatus: string
}

export interface TenantStatusResponse {
  timestamp: number
  message: string
  success: boolean
  data: {
    checkedAt: number
    tenantId: string
    status: StatusHistoryItem[]
  }
  requestId: string
}

export const tenantStatusApi = {
  /**
   * Get tenant status history
   */
  getStatusHistory: async (tenantId: string): Promise<TenantStatusResponse> => {
    try {
      console.log("📊 Fetching status history for tenant:", tenantId)
      
      const response = await apiClient.get(`/api/subscriptions/tenants/${tenantId}/status`, {
        includeUserEmail: true
      })
      
      console.log("✅ Status history fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch status history:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        tenantId
      })
      throw error
    }
  }
}