// hooks/use-plans.ts
import { useState, useEffect, useCallback } from "react"
import { Plan, PlanFilters } from "@/types/plan"
import { planApi } from "@/lib/api/plan"

export const usePlans = (initialFilters: PlanFilters = {}) => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PlanFilters>(initialFilters)
  const [metadata, setMetadata] = useState<{
    count: number
    category: string
    publicOnly: boolean
  } | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching plans with filters:", filters)
      const response = await planApi.getAllPlans(filters)
      
      if (response.success) {
        setPlans(response.data || [])
        setMetadata(response.metadata)
        console.log("✅ Plans loaded successfully:", response.data?.length || 0)
      } else {
        setError("Failed to fetch plans")
      }
    } catch (err: any) {
      console.error("❌ Error fetching plans:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch plans")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const updateFilters = useCallback((newFilters: Partial<PlanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const refresh = useCallback(() => {
    fetchPlans()
  }, [fetchPlans])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    plans,
    loading,
    error,
    metadata,
    filters,
    updateFilters,
    refresh,
    clearFilters
  }
}