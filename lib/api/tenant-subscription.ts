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

    const response = await apiClient.postFormData(
      `/api/subscriptions/tenants/${tenantId}/assign-plan`,
      formData
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

    const response = await apiClient.put(
      `/api/subscriptions/tenants/${tenantId}/change-plan${queryParams}`
    )
    
    return response.data
  },

  suspendTenant: async (tenantId: string, reason: string) => {
    const queryParams = apiClient.buildQueryString({ reason })

    const response = await apiClient.post(
      `/api/subscriptions/tenants/${tenantId}/suspend${queryParams}`
    )
    
    return response.data
  },

  reactivateTenant: async (tenantId: string, newPlanId?: string) => {
    const queryParams = apiClient.buildQueryString({
      newPlanId: newPlanId || undefined
    })

    const response = await apiClient.post(
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
    const response = await apiClient.post("/api/subscriptions/tenants/process-expiring")
    return response.data
  },

  searchTenants: async (filters: any) => {
    const queryParams = apiClient.buildQueryString({
      status: filters.status,
      country: filters.country,
      planId: filters.planId,
      city: filters.city,
      region: filters.region
    })

    const response = await apiClient.get(
      `/api/subscriptions/tenants/search${queryParams}`
    )
    
    return response.data
  },

  activateGracePeriod: async (tenantId: string, reason: string) => {
    const queryParams = apiClient.buildQueryString({ reason })

    const response = await apiClient.post(
      `/api/subscriptions/tenants/${tenantId}/grace-period${queryParams}`
    )
    
    return response.data
  },

  autoRenewTenant: async (tenantId: string) => {
    const response = await apiClient.post(
      `/api/subscriptions/tenants/${tenantId}/auto-renew`
    )
    
    return response.data
  }
}