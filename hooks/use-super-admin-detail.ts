// hooks/use-super-admin-detail.ts
import { useState, useEffect } from "react"
import { SuperAdminUser } from "@/types/super-admin"
import { superAdminApi } from "@/lib/api/super-admin"

export const useSuperAdminDetail = (email: string) => {
  const [user, setUser] = useState<SuperAdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuperAdmin = async () => {
      if (!email) {
        setError("Email is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await superAdminApi.getSuperAdminByEmail(email)
        
        if (response.success) {
          setUser(response.data)
        } else {
          setError("Failed to fetch super admin details")
        }
      } catch (err: any) {
        console.error("Failed to fetch super admin details:", err)
        setError(err.message || "Failed to fetch super admin details")
      } finally {
        setLoading(false)
      }
    }

    fetchSuperAdmin()
  }, [email])

  const refresh = () => {
    if (email) {
      setLoading(true)
      setError(null)
      // Re-trigger the effect
      setUser(null)
    }
  }

  return {
    user,
    loading,
    error,
    refresh
  }
}