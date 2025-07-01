// hooks/use-plan-detail.ts
import { useState, useEffect, useCallback } from "react"
import { PlanDetail } from "@/types/plan-detail"
import { planApi } from "@/lib/api/plan"

export const usePlanDetail = (planId: string) => {
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchPlanDetail = useCallback(async () => {
    if (!planId) {
      setError("Plan ID is required")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching plan details for:", planId)
      const response = await planApi.getPlanById(planId)
      
      if (response.success) {
        console.log("✅ Successfully fetched plan details:", response.data)
        setPlan(response.data)
      } else {
        console.error("❌ API response not successful:", response)
        setError("Failed to fetch plan details")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch plan details:", err)
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("You don't have permission to view this plan")
      } else if (err.response?.status === 404) {
        setError("Plan not found")
      } else if (err.response?.status === 403) {
        setError("Access denied - insufficient permissions")
      } else {
        setError(err.message || "Failed to fetch plan details")
      }
    } finally {
      setLoading(false)
    }
  }, [planId, refreshTrigger])

  useEffect(() => {
    fetchPlanDetail()
  }, [fetchPlanDetail])

  const refresh = useCallback(() => {
    if (planId) {
      console.log("🔄 Refreshing plan details...")
      setRefreshTrigger(prev => prev + 1)
    }
  }, [planId])

  return {
    plan,
    loading,
    error,
    refresh
  }
}