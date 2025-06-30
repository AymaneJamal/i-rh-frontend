// hooks/use-tenant-detail.ts
import { useState, useEffect, useCallback, useRef } from "react"
import { TenantDetails, AdminUser } from "@/types/tenant"
import { tenantApi } from "@/lib/api/tenant"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { TenantUsageResponse, TenantStatusResponse } from "@/types/tenant-subscription"

export const useTenantDetail = (tenantId: string, enablePolling: boolean = false) => {
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Subscription-related state
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [usageData, setUsageData] = useState<TenantUsageResponse['data'] | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [usageLoading, setUsageLoading] = useState(false)
  
  // Polling state
  const [isPollingActive, setIsPollingActive] = useState(false)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const usageIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // ===============================================================================
  // COMPUTED VALUES
  // ===============================================================================
  
  const isAvailable = tenant ? Date.now() > (tenant.createdAt + 10 * 60 * 1000) : true
  const remainingTime = tenant ? Math.max(0, (tenant.createdAt + 10 * 60 * 1000) - Date.now()) : 0
  
  // Subscription status
  const hasSubscription = Boolean(tenant?.plan?.id)
  const hasUsageAlerts = usageData?.hasAlerts === 1 && usageData?.activeWarnings?.length > 0
  const isInGracePeriod = tenant?.isInGracePeriod === 1
  const isSuspended = tenant?.status === "SUSPENDED"
  const isExpired = tenant?.planExpiryDate ? Date.now() > tenant.planExpiryDate : false

  // Usage percentages
  const usagePercentages = usageData ? {
    database: usageData.usagePercentages.databasePercent,
    s3: usageData.usagePercentages.s3Percent,
    users: usageData.usagePercentages.usersPercent,
    employees: usageData.usagePercentages.employeesPercent
  } : null

  // Days until expiry
  const daysUntilExpiry = tenant?.planExpiryDate ? 
    Math.floor((tenant.planExpiryDate - Date.now()) / (24 * 60 * 60 * 1000)) : null

  // ===============================================================================
  // FETCH TENANT DETAILS
  // ===============================================================================
  const fetchTenantDetail = useCallback(async () => {
    if (!tenantId) {
      setError("Tenant ID is required")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching tenant details for ID:", tenantId)
      const response = await tenantApi.getTenantById(tenantId)
      
      if (response.success && response.data) {
        console.log("✅ Tenant details loaded:", response.data)
        setTenant(response.data.tenant)
        setAdminUser(response.data.adminUser)
      } else {
        setError("Failed to fetch tenant details")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch tenant details:", err)
      setError(err.message || "Failed to fetch tenant details")
    } finally {
      setLoading(false)
    }
  }, [tenantId, refreshTrigger])

  // ===============================================================================
  // FETCH SUBSCRIPTION STATUS (with error handling)
  // ===============================================================================
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!tenantId || !mountedRef.current) return

    try {
      setStatusLoading(true)
      console.log("🔍 Checking tenant subscription status:", tenantId)
      
      const response = await tenantSubscriptionApi.checkTenantStatus(tenantId)
      
      if (response.success && response.data && mountedRef.current) {
        setSubscriptionStatus(response.data.status)
        console.log("✅ Subscription status updated:", response.data.status)
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch subscription status:", err)
      // Don't set main error state for status failures - just log
      if (mountedRef.current) {
        setSubscriptionStatus(null)
      }
    } finally {
      if (mountedRef.current) {
        setStatusLoading(false)
      }
    }
  }, [tenantId])

  // ===============================================================================
  // FETCH USAGE DATA (with error handling)
  // ===============================================================================
  const fetchUsageData = useCallback(async () => {
    if (!tenantId || !mountedRef.current) return

    try {
      setUsageLoading(true)
      console.log("📊 Fetching tenant usage data:", tenantId)
      
      const response = await tenantSubscriptionApi.getTenantUsage(tenantId)
      
      if (response.success && response.data && mountedRef.current) {
        setUsageData(response.data)
        console.log("✅ Usage data updated")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch usage data:", err)
      // Don't set main error state for usage failures - just log
      if (mountedRef.current) {
        setUsageData(null)
      }
    } finally {
      if (mountedRef.current) {
        setUsageLoading(false)
      }
    }
  }, [tenantId])

  // ===============================================================================
  // POLLING MANAGEMENT
  // ===============================================================================
  const startPolling = useCallback(() => {
    if (isPollingActive || !enablePolling || !tenantId) return

    console.log("🔄 Starting polling for tenant:", tenantId)
    setIsPollingActive(true)

    // Status polling every 10 minutes
    statusIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchSubscriptionStatus()
      }
    }, 10 * 60 * 1000) // 10 minutes

    // Usage polling every 15 minutes  
    usageIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchUsageData()
      }
    }, 15 * 60 * 1000) // 15 minutes

    // Initial fetch
    fetchSubscriptionStatus()
    fetchUsageData()
  }, [enablePolling, tenantId, isPollingActive, fetchSubscriptionStatus, fetchUsageData])

  const stopPolling = useCallback(() => {
    console.log("⏹️ Stopping polling")
    setIsPollingActive(false)
    
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current)
      statusIntervalRef.current = null
    }
    
    if (usageIntervalRef.current) {
      clearInterval(usageIntervalRef.current)
      usageIntervalRef.current = null
    }
  }, [])

  // ===============================================================================
  // REFRESH FUNCTIONS
  // ===============================================================================
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const refreshSubscriptionData = useCallback(() => {
    if (tenantId) {
      fetchSubscriptionStatus()
      // fetchUsageData()
    }
  }, [tenantId, fetchSubscriptionStatus, fetchUsageData])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  
  // Set mounted ref
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Fetch initial tenant data
  useEffect(() => {
    fetchTenantDetail()
  }, [fetchTenantDetail])

  // Setup polling when tenant is loaded and available
  useEffect(() => {
    if (tenant && isAvailable && enablePolling && !isPollingActive) {
      startPolling()
    } else if ((!tenant || !isAvailable || !enablePolling) && isPollingActive) {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [tenant, isAvailable, enablePolling, isPollingActive, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  // ===============================================================================
  // RETURN HOOK DATA
  // ===============================================================================

  return {
    // Core tenant data
    tenant,
    adminUser,
    loading,
    error,
    isAvailable,
    remainingTime,

    // Subscription data
    subscriptionStatus,
    usageData,
    statusLoading,
    usageLoading,

    // Computed values
    hasSubscription,
    hasUsageAlerts,
    isInGracePeriod,
    isSuspended,
    isExpired,
    usagePercentages,
    daysUntilExpiry,

    // Actions
    refresh,
    refreshSubscriptionData,
    startPolling,
    stopPolling,
    isPollingActive,

    // Individual fetch functions
    fetchTenantDetail,
    fetchSubscriptionStatus,
    fetchUsageData
  }
}

// ===============================================================================
// TENANT STATUS MONITORING HOOK (simplified)
// ===============================================================================

export const useTenantStatusMonitoring = (tenantIds: string[]) => {
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAllStatuses = useCallback(async () => {
    if (tenantIds.length === 0) return

    try {
      setLoading(true)
      setError(null)
      
      const statusPromises = tenantIds.map(async (tenantId) => {
        try {
          const response = await tenantSubscriptionApi.checkTenantStatus(tenantId)
          return { [tenantId]: response.data.status }
        } catch (error) {
          console.error(`Failed to check status for tenant ${tenantId}:`, error)
          return { [tenantId]: 'UNKNOWN' }
        }
      })

      const results = await Promise.all(statusPromises)
      const statusMap = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      
      setStatuses(statusMap)
    } catch (err: any) {
      setError(err.message || "Failed to check tenant statuses")
    } finally {
      setLoading(false)
    }
  }, [tenantIds])

  // Check statuses when tenantIds change
  useEffect(() => {
    if (tenantIds.length > 0) {
      checkAllStatuses()
    }
  }, [tenantIds, checkAllStatuses])

  return {
    statuses,
    loading,
    error,
    refresh: checkAllStatuses
  }
}