// hooks/use-tenant-users.ts
import { useState, useEffect, useCallback } from "react"
import { tenantUsersApi, TenantUser } from "@/lib/api/tenant-users"

export const useTenantUsers = (tenantId: string) => {
  const [users, setUsers] = useState<TenantUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ===============================================================================
  // FETCH USERS
  // ===============================================================================
  const fetchUsers = useCallback(async () => {
    if (!tenantId) {
      setUsers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("👥 Fetching users for tenant:", tenantId)
      const response = await tenantUsersApi.getAllTenantUsers(tenantId)
      
      if (response.success) {
        setUsers(response.data.users || [])
        console.log("✅ Users loaded:", response.data.users?.length || 0)
      } else {
        setError("Failed to fetch users")
      }
    } catch (err: any) {
      console.error("❌ Error fetching users:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [tenantId, refreshTrigger])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ===============================================================================
  // ACTIONS
  // ===============================================================================
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const suspendUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setError(null)
      console.log("⏸️ Suspending user:", userId)
      
      const response = await tenantUsersApi.suspendTenantUser(tenantId, userId)
      
      if (response.success) {
        refresh()
        return true
      } else {
        setError("Failed to suspend user")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error suspending user:", err)
      setError(err.response?.data?.error || err.message || "Failed to suspend user")
      return false
    }
  }, [tenantId, refresh])

  const reactivateUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setError(null)
      console.log("▶️ Reactivating user:", userId)
      
      const response = await tenantUsersApi.reactivateTenantUser(tenantId, userId)
      
      if (response.success) {
        refresh()
        return true
      } else {
        setError("Failed to reactivate user")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error reactivating user:", err)
      setError(err.response?.data?.error || err.message || "Failed to reactivate user")
      return false
    }
  }, [tenantId, refresh])

  // ===============================================================================
  // COMPUTED VALUES
  // ===============================================================================
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'ACTIVE').length
  const suspendedUsers = users.filter(user => user.status === 'SUSPENDED').length
  const pendingUsers = users.filter(user => user.status === 'PENDING').length

  // ===============================================================================
  // RETURN HOOK DATA
  // ===============================================================================
  return {
    // Core data
    users,
    loading,
    error,

    // Computed data
    totalUsers,
    activeUsers,
    suspendedUsers,
    pendingUsers,

    // Actions
    refresh,
    suspendUser,
    reactivateUser,

    // Individual fetch
    fetchUsers
  }
}