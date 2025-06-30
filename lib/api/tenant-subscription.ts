// lib/api/tenant-subscription.ts
import { apiClient } from "@/lib/api-client"
import { PaymentMethod } from "@/lib/constants"

export const tenantSubscriptionApi = {
  assignPlan: async (
  tenantId: string,
  planId: string,
  paymentMethod: PaymentMethod,
  paymentReference: string,
  receiptFile: File,
  startDate?: number,
  endDate?: number
) => {
  console.log("🔍 API assignPlan called with:", {
    tenantId,
    planId,
    paymentMethod,
    paymentReference,
    fileName: receiptFile?.name,
    fileSize: receiptFile?.size
  })

  const formData = new FormData()
  formData.append('planId', planId)
  formData.append('paymentMethod', paymentMethod)
  formData.append('paymentReference', paymentReference)
  formData.append('receipt', receiptFile)
  
  if (startDate) {
    formData.append('startDate', startDate.toString())
  }
  if (endDate) {
    formData.append('endDate', endDate.toString())
  }

  // Debug FormData
  console.log("🔍 FormData contents:")
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value)
  }

  const response = await apiClient.post(
    `/api/subscriptions/tenants/${tenantId}/assign-plan`,
    formData,
    { 
      includeUserEmail: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  
  return response.data
},

  changePlan: async (
    tenantId: string,
    newPlanId: string,
    changeReason: string,
    paymentReference: string
  ) => {
    const queryParams = apiClient.buildQueryString({
      newPlanId,
      changeReason,
      paymentReference
    })

    const response = await apiClient.putWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/change-plan${queryParams}`
    )
    
    return response.data
  },

  suspendTenant: async (tenantId: string, reason: string) => {
    const queryParams = apiClient.buildQueryString({ reason })

    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/suspend${queryParams}`
    )
    
    return response.data
  },

  reactivateTenant: async (tenantId: string, newPlanId?: string) => {
    const queryParams = newPlanId ? apiClient.buildQueryString({ newPlanId }) : ''

    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/reactivate${queryParams}`
    )
    
    return response.data
  },

  checkTenantStatus: async (tenantId: string) => {
    const response = await apiClient.get(
      `/api/subscriptions/tenants/${tenantId}/status`
    )
    
    return response.data
  },

  getTenantUsage: async (tenantId: string) => {
    const response = await apiClient.get(
      `/api/subscriptions/tenants/${tenantId}/usage`
    )
    
    return response.data
  },

  processExpiringTenants: async () => {
    const response = await apiClient.postWithUserEmail(
      '/api/subscriptions/process-expiring'
    )
    
    return response.data
  },

  autoRenewTenant: async (tenantId: string) => {
    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/auto-renew`
    )
    
    return response.data
  },

  // Nouvelles méthodes pour gestion avancée
  extendGracePeriod: async (tenantId: string, additionalDays: number, reason: string) => {
    const queryParams = apiClient.buildQueryString({ additionalDays, reason })

    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/extend-grace${queryParams}`
    )
    
    return response.data
  },

  forceBilling: async (tenantId: string, billingReason: string) => {
    const queryParams = apiClient.buildQueryString({ billingReason })

    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/force-billing${queryParams}`
    )
    
    return response.data
  },

  resetUsageCounters: async (tenantId: string, resetReason: string) => {
    const queryParams = apiClient.buildQueryString({ resetReason })

    const response = await apiClient.postWithUserEmail(
      `/api/subscriptions/tenants/${tenantId}/reset-usage${queryParams}`
    )
    
    return response.data
  },

  // Méthodes avec email personnalisé (pour les cas spéciaux)
  suspendTenantWithCustomUser: async (tenantId: string, reason: string, userEmail: string) => {
    const queryParams = apiClient.buildQueryString({ reason })

    const response = await apiClient.postWithCustomUserEmail(
      `/api/subscriptions/tenants/${tenantId}/suspend${queryParams}`,
      userEmail
    )
    
    return response.data
  },

  reactivateTenantWithCustomUser: async (tenantId: string, userEmail: string, newPlanId?: string) => {
    const queryParams = newPlanId ? apiClient.buildQueryString({ newPlanId }) : ''

    const response = await apiClient.postWithCustomUserEmail(
      `/api/subscriptions/tenants/${tenantId}/reactivate${queryParams}`,
      userEmail
    )
    
    return response.data
  }
}