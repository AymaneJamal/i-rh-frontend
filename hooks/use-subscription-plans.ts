// hooks/use-subscription-plans.ts
import { useState, useEffect, useCallback } from "react"
import { subscriptionPlansApi } from "@/lib/api/subscription-plans"

interface SubscriptionPlan {
  planId: string
  planName: string
  description: string
  category: string
  status: string
  isPublic: number
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  maxUsers: number
  maxEmployees: number
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  hasAdvancedReporting: number
  hasApiAccess: number
  hasCustomBranding: number
  billingCycle: number
  autoRenewalDays: number
  gracePeriodDays: number
  isRecommended: number
  createdAt: number
  modifiedAt?: number
  createdBy: string
  modifiedBy?: string
}

interface PlanFilters {
  publicOnly?: boolean
  category?: string
}

export const useSubscriptionPlans = (initialFilters?: PlanFilters) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PlanFilters>(initialFilters || {})
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ===============================================================================
  // FETCH PLANS
  // ===============================================================================
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching plans with filters:", filters)
      const response = await subscriptionPlansApi.getAllPlans(filters)
      
      if (response.success) {
        setPlans(response.data || [])
        console.log("✅ Plans loaded:", response.data?.length || 0)
      } else {
        setError("Failed to fetch plans")
      }
    } catch (err: any) {
      console.error("❌ Error fetching plans:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch plans")
    } finally {
      setLoading(false)
    }
  }, [filters, refreshTrigger])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // ===============================================================================
  // ACTIONS
  // ===============================================================================
  const createPlan = useCallback(async (
    planData: any,
    params?: any
  ): Promise<boolean> => {
    try {
      setError(null)
      console.log("🆕 Creating plan:", planData.planName)
      
      const response = await subscriptionPlansApi.createPlan(planData, params)
      
      if (response.success) {
        console.log("✅ Plan created successfully")
        refresh()
        return true
      } else {
        setError("Failed to create plan")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error creating plan:", err)
      setError(err.response?.data?.error || err.message || "Failed to create plan")
      return false
    }
  }, [])

  const updatePlan = useCallback(async (
    planId: string,
    updates: any
  ): Promise<boolean> => {
    try {
      setError(null)
      console.log("🔄 Updating plan:", planId)
      
      const response = await subscriptionPlansApi.updatePlan(planId, updates)
      
      if (response.success) {
        console.log("✅ Plan updated successfully")
        refresh()
        return true
      } else {
        setError("Failed to update plan")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error updating plan:", err)
      setError(err.response?.data?.error || err.message || "Failed to update plan")
      return false
    }
  }, [])

  const deletePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setError(null)
      console.log("🗑️ Deleting plan:", planId)
      
      await subscriptionPlansApi.deletePlan(planId)
      
      console.log("✅ Plan deleted successfully")
      refresh()
      return true
    } catch (err: any) {
      console.error("❌ Error deleting plan:", err)
      setError(err.response?.data?.error || err.message || "Failed to delete plan")
      return false
    }
  }, [])

  const updateFilters = useCallback((newFilters: Partial<PlanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================
  const getPlanById = useCallback((planId: string): SubscriptionPlan | undefined => {
    return plans.find(plan => plan.planId === planId)
  }, [plans])

  const getPublicPlans = useCallback((): SubscriptionPlan[] => {
    return plans.filter(plan => plan.isPublic === 1)
  }, [plans])

  const getCustomPlans = useCallback((): SubscriptionPlan[] => {
    return plans.filter(plan => plan.isPublic === 0)
  }, [plans])

  const getPlansByCategory = useCallback((category: string): SubscriptionPlan[] => {
    return plans.filter(plan => plan.category === category)
  }, [plans])

  const getRecommendedPlans = useCallback((): SubscriptionPlan[] => {
    return plans.filter(plan => plan.isRecommended === 1)
  }, [plans])

  const getActivePlans = useCallback((): SubscriptionPlan[] => {
    return plans.filter(plan => plan.status === 'ACTIVE')
  }, [plans])

  return {
    // State
    plans,
    loading,
    error,
    filters,

    // Actions
    createPlan,
    updatePlan,
    deletePlan,
    updateFilters,
    refresh,

    // Utilities
    getPlanById,
    getPublicPlans,
    getCustomPlans,
    getPlansByCategory,
    getRecommendedPlans,
    getActivePlans
  }
}

// ===============================================================================
// SINGLE PLAN HOOK
// ===============================================================================
export const usePlanDetail = (planId: string | null) => {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlan = useCallback(async () => {
    if (!planId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching plan detail:", planId)
      const response = await subscriptionPlansApi.getPlanById(planId)
      
      if (response.success) {
        setPlan(response.data)
        console.log("✅ Plan detail loaded:", response.data?.planName)
      } else {
        setError("Failed to fetch plan details")
      }
    } catch (err: any) {
      console.error("❌ Error fetching plan detail:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch plan details")
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const refresh = useCallback(() => {
    fetchPlan()
  }, [fetchPlan])

  return {
    plan,
    loading,
    error,
    refresh
  }
}

// ===============================================================================
// PLANS DASHBOARD HOOK
// ===============================================================================
export const usePlansDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("📊 Fetching plans dashboard")
      const response = await subscriptionPlansApi.getPlansDashboard()
      
      if (response.success) {
        setDashboard(response.data)
        console.log("✅ Plans dashboard loaded")
      } else {
        setError("Failed to fetch plans dashboard")
      }
    } catch (err: any) {
      console.error("❌ Error fetching plans dashboard:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch plans dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const refresh = useCallback(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    dashboard,
    loading,
    error,
    refresh
  }
}