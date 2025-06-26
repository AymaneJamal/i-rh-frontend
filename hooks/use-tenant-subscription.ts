// hooks/use-tenant-subscription.ts
import { useState, useCallback } from "react"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { PaymentMethod } from "@/lib/constants"

export const useTenantSubscription = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===============================================================================
  // ASSIGN PLAN TO TENANT
  // ===============================================================================
  const assignPlan = useCallback(async (
    tenantId: string,
    planId: string,
    paymentMethod: PaymentMethod,
    paymentReference: string,
    receiptFile: File,
    startDate?: number,
    endDate?: number
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("📋 Assigning plan to tenant:", { tenantId, planId })
      
      const response = await tenantSubscriptionApi.assignPlan(
        tenantId,
        planId,
        paymentMethod,
        paymentReference,
        receiptFile,
        startDate,
        endDate
      )
      
      if (response.success) {
        console.log("✅ Plan assigned successfully")
        return true
      } else {
        setError("Failed to assign plan")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error assigning plan:", err)
      setError(err.response?.data?.error || err.message || "Failed to assign plan")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // CHANGE PLAN
  // ===============================================================================
  const changePlan = useCallback(async (
    tenantId: string,
    newPlanId: string,
    changeReason: string,
    paymentReference: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔄 Changing plan for tenant:", { tenantId, newPlanId })
      
      const response = await tenantSubscriptionApi.changePlan(
        tenantId,
        newPlanId,
        changeReason,
        paymentReference
      )
      
      if (response.success) {
        console.log("✅ Plan changed successfully")
        return true
      } else {
        setError("Failed to change plan")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error changing plan:", err)
      setError(err.response?.data?.error || err.message || "Failed to change plan")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // SUSPEND TENANT
  // ===============================================================================
  const suspendTenant = useCallback(async (
    tenantId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("⏸️ Suspending tenant:", { tenantId, reason })
      
      const response = await tenantSubscriptionApi.suspendTenant(tenantId, reason)
      
      if (response.success) {
        console.log("✅ Tenant suspended successfully")
        return true
      } else {
        setError("Failed to suspend tenant")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error suspending tenant:", err)
      setError(err.response?.data?.error || err.message || "Failed to suspend tenant")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // REACTIVATE TENANT
  // ===============================================================================
  const reactivateTenant = useCallback(async (
    tenantId: string,
    newPlanId?: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("▶️ Reactivating tenant:", { tenantId, newPlanId })
      
      const response = await tenantSubscriptionApi.reactivateTenant(tenantId, newPlanId)
      
      if (response.success) {
        console.log("✅ Tenant reactivated successfully")
        return true
      } else {
        setError("Failed to reactivate tenant")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error reactivating tenant:", err)
      setError(err.response?.data?.error || err.message || "Failed to reactivate tenant")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // ACTIVATE GRACE PERIOD
  // ===============================================================================
  const activateGracePeriod = useCallback(async (
    tenantId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("⏳ Activating grace period:", { tenantId, reason })
      
      const response = await tenantSubscriptionApi.activateGracePeriod(tenantId, reason)
      
      if (response.success) {
        console.log("✅ Grace period activated successfully")
        return true
      } else {
        setError("Failed to activate grace period")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error activating grace period:", err)
      setError(err.response?.data?.error || err.message || "Failed to activate grace period")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // AUTO RENEW TENANT
  // ===============================================================================
  const autoRenewTenant = useCallback(async (tenantId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔄 Auto renewing tenant:", tenantId)
      
      const response = await tenantSubscriptionApi.autoRenewTenant(tenantId)
      
      if (response.success) {
        console.log("✅ Tenant auto renewed successfully")
        return true
      } else {
        setError("Failed to auto renew tenant")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error auto renewing tenant:", err)
      setError(err.response?.data?.error || err.message || "Failed to auto renew tenant")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================================================================
  // PROCESS EXPIRING TENANTS
  // ===============================================================================
  const processExpiringTenants = useCallback(async (): Promise<any | null> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("⏰ Processing expiring tenants")
      
      const response = await tenantSubscriptionApi.processExpiringTenants()
      
      if (response.success) {
        console.log("✅ Expiring tenants processed successfully")
        return response
      } else {
        setError("Failed to process expiring tenants")
        return null
      }
    } catch (err: any) {
      console.error("❌ Error processing expiring tenants:", err)
      setError(err.response?.data?.error || err.message || "Failed to process expiring tenants")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    assignPlan,
    changePlan,
    suspendTenant,
    reactivateTenant,
    activateGracePeriod,
    autoRenewTenant,
    processExpiringTenants
  }
}

// ===============================================================================
// TENANT SEARCH HOOK
// ===============================================================================
export const useTenantSearch = () => {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const searchTenants = useCallback(async (filters: any) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Searching tenants with filters:", filters)
      
      const response = await tenantSubscriptionApi.searchTenants(filters)
      
      if (response.success) {
        setTenants(response.data || [])
        setTotalCount(response.metadata?.count || 0)
        console.log("✅ Tenant search completed:", response.data?.length || 0)
      } else {
        setError("Failed to search tenants")
      }
    } catch (err: any) {
      console.error("❌ Error searching tenants:", err)
      setError(err.response?.data?.error || err.message || "Failed to search tenants")
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setTenants([])
    setTotalCount(0)
    setError(null)
  }, [])

  return {
    tenants,
    loading,
    error,
    totalCount,
    searchTenants,
    clearResults
  }
}

// ===============================================================================
// TENANT STATUS MONITORING HOOK
// ===============================================================================
export const useTenantStatus = (tenantId: string | null) => {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantSubscriptionApi.checkTenantStatus(tenantId)
      
      if (response.success) {
        setStatus(response.data?.status || null)
      } else {
        setError("Failed to check tenant status")
      }
    } catch (err: any) {
      console.error("❌ Error checking tenant status:", err)
      setError(err.response?.data?.error || err.message || "Failed to check tenant status")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  return {
    status,
    loading,
    error,
    checkStatus
  }
}

// ===============================================================================
// TENANT USAGE HOOK
// ===============================================================================
export const useTenantUsage = (tenantId: string | null) => {
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantSubscriptionApi.getTenantUsage(tenantId)
      
      if (response.success) {
        setUsage(response.data)
      } else {
        setError("Failed to fetch tenant usage")
      }
    } catch (err: any) {
      console.error("❌ Error fetching tenant usage:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch tenant usage")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  const hasAlerts = usage?.hasAlerts === 1
  const activeWarnings = usage?.activeWarnings || []

  return {
    usage,
    loading,
    error,
    hasAlerts,
    activeWarnings,
    fetchUsage
  }
}