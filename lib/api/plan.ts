// lib/api/plan.ts
import { apiClient } from "@/lib/api-client"
import { PlanResponse, PlanFilters } from "@/types/plan"
import { CreatePlanRequest, CreatePlanResponse } from "@/types/create-plan"
import { PlanDetailResponse } from "@/types/plan-detail"

export const planApi = {
  /**
   * Get all subscription plans with filters
   */
  getAllPlans: async (filters: PlanFilters = {}): Promise<PlanResponse> => {
    try {
      const params = new URLSearchParams()
      
      // Add filter parameters
      if (filters.publicOnly !== undefined) {
        params.append('publicOnly', filters.publicOnly.toString())
      }
      if (filters.category) {
        params.append('category', filters.category)
      }

      console.log("📋 Fetching subscription plans with filters:", filters)
      
      const response = await apiClient.get(`/api/subscriptions/plans?${params.toString()}`, {
        includeUserEmail: true
      })
      
      console.log("✅ Plans fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch plans:", error)
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
   * Get plan details by planId
   */
  getPlanById: async (planId: string): Promise<PlanDetailResponse> => {
    try {
      console.log("🔍 Fetching plan details for:", planId)
      
      const response = await apiClient.get(`/api/subscriptions/plans/${planId}`, {
        includeUserEmail: true
      })
      
      console.log("✅ Plan details fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch plan details:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        planId
      })
      throw error
    }
  },

  /**
   * Create a new subscription plan
   */
  createPlan: async (planData: CreatePlanRequest): Promise<CreatePlanResponse> => {
    try {
      console.log("🆕 Creating new plan:", planData.planName)
      console.log("🔍 Plan data:", planData)

      const response = await apiClient.post('/api/subscriptions/plans', planData, {
        includeUserEmail: true
      })
      
      console.log("✅ Plan created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to create plan:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        requestData: planData
      })
      throw error
    }
  }
}