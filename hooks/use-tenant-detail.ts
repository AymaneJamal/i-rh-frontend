// hooks/use-tenant-detail.ts
import { useState, useEffect, useCallback } from "react"
import { TenantDetails, AdminUser } from "@/types/tenant"
import { tenantApi } from "@/lib/api/tenant"

export const useTenantDetail = (tenantId: string, createdAt?: number) => {
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Check availability and update remaining time
  useEffect(() => {
    if (createdAt) {
      const updateAvailability = () => {
        const available = tenantApi.isTenantDetailsAvailable(createdAt)
        const remaining = tenantApi.getRemainingTime(createdAt)
        
        setIsAvailable(available)
        setRemainingTime(remaining)
      }

      updateAvailability()
      
      // Update every second if not available
      let interval: NodeJS.Timeout | null = null
      if (!tenantApi.isTenantDetailsAvailable(createdAt)) {
        interval = setInterval(updateAvailability, 1000)
      }

      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [createdAt])

  const fetchTenantDetail = useCallback(async () => {
    if (!tenantId) {
      setError("Tenant ID is required")
      setLoading(false)
      return
    }

    // Check if details are available
    if (createdAt && !tenantApi.isTenantDetailsAvailable(createdAt)) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantApi.getTenantById(tenantId)
      
      if (response.success) {
        setTenant(response.data.tenant)
        setAdminUser(response.data.adminUser)
      } else {
        setError("Failed to fetch tenant details")
      }
    } catch (err: any) {
      console.error("Failed to fetch tenant details:", err)
      setError(err.message || "Failed to fetch tenant details")
    } finally {
      setLoading(false)
    }
  }, [tenantId, createdAt, refreshTrigger])

  // Fetch when available or when triggered
  useEffect(() => {
    if (isAvailable || !createdAt) {
      fetchTenantDetail()
    }
  }, [fetchTenantDetail, isAvailable])

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return {
    tenant,
    adminUser,
    loading,
    error,
    isAvailable,
    remainingTime,
    refresh
  }
}