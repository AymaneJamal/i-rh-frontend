// hooks/use-create-plan.ts
import { useState } from "react"
import { CreatePlanRequest } from "@/types/create-plan"
import { planApi } from "@/lib/api/plan"

export const useCreatePlan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createPlan = async (planData: CreatePlanRequest) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      console.log("🔍 Creating plan with data:", planData)
      const response = await planApi.createPlan(planData)
      
      if (response.success) {
        setSuccess(true)
        console.log("✅ Plan created successfully:", response.data)
        return response
      } else {
        setError("Failed to create plan")
        return null
      }
    } catch (err: any) {
      console.error("❌ Error creating plan:", err)
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid plan data")
      } else if (err.response?.status === 401) {
        setError("You don't have permission to create plans")
      } else if (err.response?.status === 409) {
        setError("A plan with this name already exists")
      } else {
        setError(err.response?.data?.message || err.message || "Failed to create plan")
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setSuccess(false)
  }

  return {
    createPlan,
    loading,
    error,
    success,
    reset
  }
}