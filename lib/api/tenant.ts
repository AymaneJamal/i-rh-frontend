// lib/api/tenant.ts
import { apiClient } from "@/lib/api-client"
import { TenantResponse, TenantFilters, TenantDetailResponse, CreateTenantRequest, TenantCreationResponse } from "@/types/tenant"

// Interface correspondant exactement à votre AssignPlanRequest (sans receiptFile)
interface AssignSubscriptionRequest {
  tenantId: string
  planId: string
  startDate?: number
  endDate?: number
  autoRenewalEnabled: number
  billingMethod: string
  isAutoGracePeriod: number
  isManualGracePeriod: number
  manualGracePeriod?: number
  invoiceType: string
  isPrepayeInvoiceContab?: number
  isPrepayedInvoiceReason?: string
  isCustomPrize?: number
  taxeRate: number
  withRecus: number
  invoiceStatus?: string
  dueDate?: number
  paidAmount?: number
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: string
}

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
   * Create a new tenant
   */
  createTenant: async (tenantData: CreateTenantRequest): Promise<TenantCreationResponse> => {
    try {
      console.log("🆕 Creating tenant:", tenantData.tenantName)
      
      const response = await apiClient.post('/api/tenants', tenantData ,  {
          includeUserEmail: true
        })
      
      console.log("✅ Tenant created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to create tenant:", error)
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
   * Delete a tenant by ID
   */
  deleteTenant: async (tenantId: string): Promise<void> => {
    try {
      console.log("🗑️ Deleting tenant:", tenantId)
      
      await apiClient.delete(`/api/tenants/${tenantId}`)
      
      console.log("✅ Tenant deleted successfully")
    } catch (error: any) {
      console.error("❌ Failed to delete tenant:", error)
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
   * Assign a subscription plan to a tenant
   * receiptFile est envoyé séparément comme dans le backend Spring
   */
  assignSubscription: async (
    tenantId: string,
    subscriptionData: AssignSubscriptionRequest,
    receiptFile?: File
  ): Promise<void> => {
    try {
      console.log("📋 Assigning subscription to tenant:", tenantId)
      
      const formData = new FormData()
      
      // Ajouter le JSON request en tant que string (comme votre backend l'attend)
      formData.append('request', JSON.stringify(subscriptionData))
      
      // Ajouter le fichier séparément si présent (comme @RequestParam("receipt"))
      if (receiptFile) {
        formData.append('receipt', receiptFile)
      }

      const response = await apiClient.post(
        `/api/tenants/${tenantId}/subscription`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      console.log("✅ Subscription assigned successfully:", response.data)
    } catch (error: any) {
      console.error("❌ Failed to assign subscription:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  }
}