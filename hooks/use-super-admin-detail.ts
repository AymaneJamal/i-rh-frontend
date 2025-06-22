// hooks/use-super-admin-detail.ts
import { useState, useEffect, useCallback } from "react"
import { SuperAdminUser } from "@/types/super-admin"
import { superAdminApi } from "@/lib/api/super-admin"

export const useSuperAdminDetail = (email: string) => {
  const [user, setUser] = useState<SuperAdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Use useCallback to memoize the fetch function
  const fetchSuperAdmin = useCallback(async () => {
    if (!email) {
      setError("Email is required")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching super admin details for:", email)
      const response = await superAdminApi.getSuperAdminByEmail(email)
      
      if (response.success) {
        console.log("✅ Successfully fetched super admin details:", response.data)
        setUser(response.data)
      } else {
        console.error("❌ API response not successful:", response)
        setError("Failed to fetch super admin details")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch super admin details:", err)
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("You don't have permission to view this user")
      } else if (err.response?.status === 404) {
        setError("Super admin user not found")
      } else if (err.response?.status === 403) {
        setError("Access denied - insufficient permissions")
      } else {
        setError(err.message || "Failed to fetch super admin details")
      }
    } finally {
      setLoading(false)
    }
  }, [email, refreshTrigger])

  // Effect that runs when email or refreshTrigger changes
  useEffect(() => {
    fetchSuperAdmin()
  }, [fetchSuperAdmin])

  // Refresh function that properly triggers a re-fetch
  const refresh = useCallback(() => {
    if (email) {
      console.log("🔄 Refreshing super admin details...")
      setRefreshTrigger(prev => prev + 1) // This will trigger useEffect
    }
  }, [email])

  return {
    user,
    loading,
    error,
    refresh
  }
}