// hooks/use-tenant-detail.ts
import { useState, useEffect, useCallback } from "react"
import { TenantDetails, AdminUser } from "@/types/tenant"
import { tenantApi } from "@/lib/api/tenant"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { TenantUsageResponse, TenantStatusResponse } from "@/types/tenant-subscription"
import { createTenantStatusPolling, createUsageMonitoringPolling, PollingManager } from "@/lib/polling-config"

export const useTenantDetail = (tenantId: string, enablePolling: boolean = true) => {
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
  
  // Polling managers
  const [statusPollingManager, setStatusPollingManager] = useState<PollingManager | null>(null)
  const [usagePollingManager, setUsagePollingManager] = useState<PollingManager | null>(null)

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
  // FETCH SUBSCRIPTION STATUS
  // ===============================================================================
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!tenantId) return

    try {
      setStatusLoading(true)
      console.log("🔍 Checking tenant subscription status:", tenantId)
      
      const response = await tenantSubscriptionApi.checkTenantStatus(tenantId)
      
      if (response.success && response.data) {
        setSubscriptionStatus(response.data.status)
        console.log("✅ Subscription status updated:", response.data.status)
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch subscription status:", err)
      // Don't set main error state for status failures
    } finally {
      setStatusLoading(false)
    }
  }, [tenantId])

  // ===============================================================================
  // FETCH USAGE DATA
  // ===============================================================================
  const fetchUsageData = useCallback(async () => {
    if (!tenantId) return

    try {
      setUsageLoading(true)
      console.log("📊 Fetching tenant usage data:", tenantId)
      
      const response = await tenantSubscriptionApi.getTenantUsage(tenantId)
      
      if (response.success && response.data) {
        setUsageData(response.data)
        console.log("✅ Usage data updated")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch usage data:", err)
      // Don't set main error state for usage failures
    } finally {
      setUsageLoading(false)
    }
  }, [tenantId])

  // ===============================================================================
  // SETUP POLLING
  // ===============================================================================
  const setupPolling = useCallback(() => {
    if (!enablePolling || !tenantId) return

    // Stop existing polling
    statusPollingManager?.stop()
    usagePollingManager?.stop()

    // Create status polling
    const statusManager = createTenantStatusPolling(
      tenantId,
      tenantSubscriptionApi.checkTenantStatus,
      (newStatus) => {
        console.log(`🔄 Status changed for tenant ${tenantId}:`, newStatus)
        setSubscriptionStatus(newStatus)
        
        // Refresh tenant details if status changed significantly
        if (['SUSPENDED', 'ACTIVE'].includes(newStatus)) {
          refresh()
        }
      }
    )

    // Create usage polling
    const usageManager = createUsageMonitoringPolling(
      tenantId,
      tenantSubscriptionApi.getTenantUsage,
      (alerts) => {
        console.log(`⚠️ New usage alerts for tenant ${tenantId}:`, alerts)
        // Could trigger notifications here
      }
    )

    setStatusPollingManager(statusManager)
    setUsagePollingManager(usageManager)

    // Start polling
    statusManager.start()
    usageManager.start()

    console.log("🔄 Polling setup complete for tenant:", tenantId)
  }, [enablePolling, tenantId, statusPollingManager, usagePollingManager])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  
  // Fetch initial data
  useEffect(() => {
    fetchTenantDetail()
  }, [fetchTenantDetail])

  // Fetch subscription data when tenant is loaded
  useEffect(() => {
    if (tenant) {
      fetchSubscriptionStatus()
      fetchUsageData()
    }
  }, [tenant, fetchSubscriptionStatus, fetchUsageData])

  // Setup polling when tenant is loaded
  useEffect(() => {
    if (tenant && enablePolling) {
      setupPolling()
    }

    // Cleanup on unmount or tenant change
    return () => {
      statusPollingManager?.stop()
      usagePollingManager?.stop()
    }
  }, [tenant, setupPolling])

  // ===============================================================================
  // ACTIONS
  // ===============================================================================

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const refreshSubscriptionData = useCallback(() => {
    fetchSubscriptionStatus()
    fetchUsageData()
  }, [fetchSubscriptionStatus, fetchUsageData])

  const startPolling = useCallback(() => {
    statusPollingManager?.start()
    usagePollingManager?.start()
  }, [statusPollingManager, usagePollingManager])

  const stopPolling = useCallback(() => {
    statusPollingManager?.stop()
    usagePollingManager?.stop()
  }, [statusPollingManager, usagePollingManager])

  const isPollingActive = useCallback(() => {
    return statusPollingManager?.isRunning() || usagePollingManager?.isRunning()
  }, [statusPollingManager, usagePollingManager])

  // ===============================================================================
  // COMPUTED VALUES
  // ===============================================================================

  const isAvailable = true // Removed 10-minute restriction as requested
  const remainingTime = 0

  const hasSubscription = tenant?.plan !== null
  const hasUsageAlerts = usageData?.hasAlerts === 1
  const isInGracePeriod = tenant?.isInGracePeriod === 1
  const isSuspended = tenant?.status === 'SUSPENDED'
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
// TENANT STATUS MONITORING HOOK
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
          return { tenantId, status: response.data.status }
        } catch (error) {
          console.error(`Failed to check status for tenant ${tenantId}:`, error)
          return { tenantId, status: 'ERROR' }
        }
      })

      const results = await Promise.all(statusPromises)
      
      const statusMap: Record<string, string> = {}
      results.forEach(({ tenantId, status }) => {
        statusMap[tenantId] = status
      })
      
      setStatuses(statusMap)
    } catch (err: any) {
      console.error("❌ Error checking tenant statuses:", err)
      setError(err.message || "Failed to check tenant statuses")
    } finally {
      setLoading(false)
    }
  }, [tenantIds])

  useEffect(() => {
    checkAllStatuses()
  }, [checkAllStatuses])

  const getStatusForTenant = useCallback((tenantId: string): string | null => {
    return statuses[tenantId] || null
  }, [statuses])

  const getCriticalTenants = useCallback((): string[] => {
    return Object.entries(statuses)
      .filter(([_, status]) => ['CRITICAL', 'GRACE_PERIOD', 'SUSPENDED'].includes(status))
      .map(([tenantId, _]) => tenantId)
  }, [statuses])

  const refresh = useCallback(() => {
    checkAllStatuses()
  }, [checkAllStatuses])

  return {
    statuses,
    loading,
    error,
    getStatusForTenant,
    getCriticalTenants,
    refresh
  }
}

// ===============================================================================
// TENANT USAGE MONITORING HOOK
// ===============================================================================

export const useTenantUsageMonitoring = (tenantId: string) => {
  const [usageData, setUsageData] = useState<TenantUsageResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<string[]>([])

  const fetchUsage = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantSubscriptionApi.getTenantUsage(tenantId)
      
      if (response.success && response.data) {
        setUsageData(response.data)
        setAlerts(response.data.activeWarnings)
      }
    } catch (err: any) {
      console.error("❌ Error fetching usage data:", err)
      setError(err.message || "Failed to fetch usage data")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const hasAlerts = alerts.length > 0
  const hasNewAlerts = useCallback((previousAlerts: string[]): boolean => {
    return alerts.some(alert => !previousAlerts.includes(alert))
  }, [alerts])

  const getUsageLevel = useCallback((type: 'database' | 's3' | 'users' | 'employees'): 'normal' | 'warning' | 'critical' => {
    if (!usageData) return 'normal'

    const percentage = usageData.usagePercentages[`${type}Percent`]
    
    if (percentage >= 95) return 'critical'
    if (percentage >= 80) return 'warning'
    return 'normal'
  }, [usageData])

  const refresh = useCallback(() => {
    fetchUsage()
  }, [fetchUsage])

  return {
    usageData,
    loading,
    error,
    alerts,
    hasAlerts,
    hasNewAlerts,
    getUsageLevel,
    refresh
  }
}