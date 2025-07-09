// hooks/use-tenant-emergency.ts
import { useState, useEffect, useCallback } from "react"
import { tenantEmergencyApi, TenantUser } from "@/lib/api/tenant-emergency"

export const useTenantEmergency = (tenantId: string) => {
  const [users, setUsers] = useState<TenantUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // ===============================================================================
  // FETCH TENANT USERS
  // ===============================================================================
  const fetchTenantUsers = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantEmergencyApi.getTenantUsers(tenantId)
      
      if (response.success) {
        setUsers(response.data.users)
        console.log("✅ Tenant users loaded:", response.data.count, "users")
      } else {
        setError("Failed to fetch tenant users")
      }
    } catch (err: any) {
      console.error("❌ Error fetching tenant users:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch tenant users")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  // ===============================================================================
  // EMERGENCY ACCESS
  // ===============================================================================
  const setEmergencyAccess = useCallback(async (
    reason: string,
    selectedUserIds: string[]
  ): Promise<boolean> => {
    if (!tenantId) return false

    try {
      setActionLoading(true)
      setError(null)
      
      const response = await tenantEmergencyApi.setEmergencyAccess(
        tenantId,
        reason,
        selectedUserIds
      )
      
      if (response.success) {
        console.log("✅ Emergency access set successfully")
        return true
      } else {
        setError("Failed to set emergency access")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error setting emergency access:", err)
      setError(err.response?.data?.error || err.message || "Failed to set emergency access")
      return false
    } finally {
      setActionLoading(false)
    }
  }, [tenantId])

  // ===============================================================================
  // READ-ONLY ACCESS
  // ===============================================================================
  const setReadOnlyAccess = useCallback(async (
    reason: string,
    selectedUserIds: string[]
  ): Promise<boolean> => {
    if (!tenantId) return false

    try {
      setActionLoading(true)
      setError(null)
      
      const response = await tenantEmergencyApi.setReadOnly(
        tenantId,
        reason,
        selectedUserIds
      )
      
      if (response.success) {
        console.log("✅ Read-only access set successfully")
        return true
      } else {
        setError("Failed to set read-only access")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error setting read-only access:", err)
      setError(err.response?.data?.error || err.message || "Failed to set read-only access")
      return false
    } finally {
      setActionLoading(false)
    }
  }, [tenantId])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  useEffect(() => {
    fetchTenantUsers()
  }, [fetchTenantUsers])

  return {
    users,
    loading,
    error,
    actionLoading,
    setEmergencyAccess,
    setReadOnlyAccess,
    refreshUsers: fetchTenantUsers
  }
}