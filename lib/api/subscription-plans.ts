// lib/api/subscription-plans.ts
import { apiClient } from "@/lib/api-client"

interface CreatePlanRequest {
  planName: string
  description: string
  category: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  maxUsers: number
  maxEmployees: number
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  hasAdvancedReporting: number
  hasApiAccess: number
  hasCustomBranding?: number
  billingCycle: number
  autoRenewalDays: number
  gracePeriodDays: number
}

interface UpdatePlanRequest {
  planName?: string
  description?: string
  monthlyPrice?: number
  yearlyPrice?: number
  maxUsers?: number
  maxEmployees?: number
  maxDatabaseStorageMB?: number
  maxS3StorageMB?: number
  hasAdvancedReporting?: number
  hasApiAccess?: number
  hasCustomBranding?: number
  autoRenewalDays?: number
  gracePeriodDays?: number
}

interface PlanFilters {
  publicOnly?: boolean
  category?: string
}

interface CreatePlanParams {
  planType?: string
  forTenantId?: string
}

export const subscriptionPlansApi = {
  createPlan: async (request: CreatePlanRequest, params?: CreatePlanParams) => {
    const queryParams = apiClient.buildQueryString({
      planType: params?.planType,
      forTenantId: params?.forTenantId
    })

    const response = await apiClient.post(
      `/api/subscriptions/plans${queryParams}`,
      request
    )
    
    return response.data
  },

  updatePlan: async (planId: string, updates: UpdatePlanRequest) => {
    const response = await apiClient.put(
      `/api/subscriptions/plans/${planId}`,
      updates
    )
    
    return response.data
  },

  deletePlan: async (planId: string) => {
    const response = await apiClient.delete(`/api/subscriptions/plans/${planId}`)
    return response.data
  },

  getAllPlans: async (filters?: PlanFilters) => {
    const queryParams = apiClient.buildQueryString({
      publicOnly: filters?.publicOnly,
      category: filters?.category
    })

    const response = await apiClient.get(`/api/subscriptions/plans${queryParams}`)
    return response.data
  },

  getPlanById: async (planId: string) => {
    const response = await apiClient.get(`/api/subscriptions/plans/${planId}`)
    return response.data
  },

  getPlansDashboard: async () => {
    const response = await apiClient.get("/api/subscriptions/plans/dashboard")
    return response.data
  },

  getPublicPlans: async () => {
    return subscriptionPlansApi.getAllPlans({ publicOnly: true })
  },

  getPlansByCategory: async (category: string) => {
    return subscriptionPlansApi.getAllPlans({ category })
  },

  isPlanNameAvailable: async (planName: string): Promise<boolean> => {
    try {
      const plans = await subscriptionPlansApi.getAllPlans()
      return !plans.data?.some((plan: any) => 
        plan.planName.toLowerCase() === planName.toLowerCase()
      )
    } catch (error) {
      return false
    }
  }
}