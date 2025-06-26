// lib/polling-config.ts
import { POLLING_INTERVALS, USAGE_THRESHOLDS } from "@/lib/constants"

// ===============================================================================
// POLLING CONFIGURATION INTERFACES
// ===============================================================================

export interface PollingConfig {
  interval: number
  maxRetries: number
  retryDelay: number
  enabled: boolean
  onError?: (error: any) => void
  onSuccess?: (data: any) => void
}

export interface PollingManager {
  start: () => void
  stop: () => void
  isRunning: () => boolean
  updateInterval: (newInterval: number) => void
}

// ===============================================================================
// DEFAULT POLLING CONFIGURATIONS
// ===============================================================================

export const DEFAULT_POLLING_CONFIGS = {
  // Tenant status monitoring - every 5 minutes
  TENANT_STATUS: {
    interval: POLLING_INTERVALS.STATUS_CHECK,
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    enabled: true
  },

  // Usage monitoring - every 10 minutes
  USAGE_MONITOR: {
    interval: POLLING_INTERVALS.USAGE_MONITOR,
    maxRetries: 2,
    retryDelay: 10000, // 10 seconds
    enabled: true
  },

  // Financial stats - every 15 minutes
  FINANCIAL_STATS: {
    interval: POLLING_INTERVALS.FINANCIAL_STATS,
    maxRetries: 2,
    retryDelay: 15000, // 15 seconds
    enabled: true
  },

  // Critical alerts - every 2 minutes
  CRITICAL_ALERTS: {
    interval: 2 * 60 * 1000, // 2 minutes
    maxRetries: 5,
    retryDelay: 3000, // 3 seconds
    enabled: true
  }
} as const

// ===============================================================================
// POLLING FACTORY
// ===============================================================================

export const createPollingManager = (
  pollingFunction: () => Promise<any>,
  config: PollingConfig
): PollingManager => {
  let intervalId: NodeJS.Timeout | null = null
  let isPolling = false
  let retryCount = 0

  const executePolling = async () => {
    try {
      const result = await pollingFunction()
      retryCount = 0 // Reset retry count on success
      
      if (config.onSuccess) {
        config.onSuccess(result)
      }
    } catch (error) {
      console.error("Polling error:", error)
      retryCount++

      if (config.onError) {
        config.onError(error)
      }

      // If max retries reached, stop polling temporarily
      if (retryCount >= config.maxRetries) {
        console.warn(`Max retries (${config.maxRetries}) reached for polling. Stopping temporarily.`)
        stop()
        
        // Restart after retry delay
        setTimeout(() => {
          if (config.enabled) {
            retryCount = 0
            start()
          }
        }, config.retryDelay * 2) // Double delay for restart
      }
    }
  }

  const start = () => {
    if (!isPolling && config.enabled) {
      console.log(`🔄 Starting polling with interval: ${config.interval}ms`)
      isPolling = true
      
      // Execute immediately, then set interval
      executePolling()
      intervalId = setInterval(executePolling, config.interval)
    }
  }

  const stop = () => {
    if (intervalId) {
      console.log("⏹️ Stopping polling")
      clearInterval(intervalId)
      intervalId = null
      isPolling = false
    }
  }

  const isRunning = () => {
    return isPolling
  }

  const updateInterval = (newInterval: number) => {
    const wasRunning = isRunning()
    stop()
    config.interval = newInterval
    
    if (wasRunning) {
      start()
    }
  }

  return {
    start,
    stop,
    isRunning,
    updateInterval
  }
}

// ===============================================================================
// TENANT STATUS POLLING
// ===============================================================================

export const createTenantStatusPolling = (
  tenantId: string,
  statusCheckFunction: (id: string) => Promise<any>,
  onStatusChange?: (status: string) => void
): PollingManager => {
  let lastStatus: string | null = null

  return createPollingManager(
    async () => {
      const response = await statusCheckFunction(tenantId)
      const currentStatus = response?.data?.status

      // Only trigger callback if status changed
      if (currentStatus && currentStatus !== lastStatus) {
        lastStatus = currentStatus
        if (onStatusChange) {
          onStatusChange(currentStatus)
        }
      }

      return response
    },
    {
      ...DEFAULT_POLLING_CONFIGS.TENANT_STATUS,
      onError: (error) => {
        console.error(`Tenant ${tenantId} status check failed:`, error)
      },
      onSuccess: (data) => {
        console.log(`Tenant ${tenantId} status checked:`, data?.data?.status)
      }
    }
  )
}

// ===============================================================================
// USAGE MONITORING POLLING
// ===============================================================================

export const createUsageMonitoringPolling = (
  tenantId: string,
  usageCheckFunction: (id: string) => Promise<any>,
  onUsageAlert?: (alerts: string[]) => void
): PollingManager => {
  let lastAlerts: string[] = []

  return createPollingManager(
    async () => {
      const response = await usageCheckFunction(tenantId)
      const currentAlerts = response?.data?.activeWarnings || []

      // Check for new alerts
      const newAlerts = currentAlerts.filter((alert: string) => !lastAlerts.includes(alert))
      if (newAlerts.length > 0 && onUsageAlert) {
        onUsageAlert(newAlerts)
      }

      lastAlerts = currentAlerts
      return response
    },
    {
      ...DEFAULT_POLLING_CONFIGS.USAGE_MONITOR,
      onError: (error) => {
        console.error(`Tenant ${tenantId} usage check failed:`, error)
      }
    }
  )
}

// ===============================================================================
// FINANCIAL STATS POLLING
// ===============================================================================

export const createFinancialStatsPolling = (
  statsFunction: () => Promise<any>,
  onStatsUpdate?: (stats: any) => void
): PollingManager => {
  return createPollingManager(
    async () => {
      const response = await statsFunction()
      
      if (onStatsUpdate) {
        onStatsUpdate(response?.data)
      }

      return response
    },
    {
      ...DEFAULT_POLLING_CONFIGS.FINANCIAL_STATS,
      onError: (error) => {
        console.error("Financial stats polling failed:", error)
      }
    }
  )
}

// ===============================================================================
// CRITICAL ALERTS POLLING
// ===============================================================================

export const createCriticalAlertsPolling = (
  alertsFunction: () => Promise<any>,
  onCriticalAlert?: (alerts: any[]) => void
): PollingManager => {
  return createPollingManager(
    async () => {
      const response = await alertsFunction()
      const alerts = response?.data?.criticalTenants

      if (alerts && onCriticalAlert) {
        const criticalCount = alerts.expiringSoon + alerts.inGracePeriod + alerts.resourceAlerts
        if (criticalCount > 0) {
          onCriticalAlert([alerts])
        }
      }

      return response
    },
    {
      ...DEFAULT_POLLING_CONFIGS.CRITICAL_ALERTS,
      onError: (error) => {
        console.error("Critical alerts polling failed:", error)
      }
    }
  )
}

// ===============================================================================
// POLLING MANAGER COLLECTION
// ===============================================================================

export class PollingManagerCollection {
  private managers: Map<string, PollingManager> = new Map()

  addManager(key: string, manager: PollingManager): void {
    // Stop existing manager if any
    if (this.managers.has(key)) {
      this.managers.get(key)?.stop()
    }
    
    this.managers.set(key, manager)
  }

  startManager(key: string): void {
    this.managers.get(key)?.start()
  }

  stopManager(key: string): void {
    this.managers.get(key)?.stop()
  }

  startAll(): void {
    console.log("🚀 Starting all polling managers")
    this.managers.forEach((manager, key) => {
      console.log(`Starting ${key}`)
      manager.start()
    })
  }

  stopAll(): void {
    console.log("🛑 Stopping all polling managers")
    this.managers.forEach((manager, key) => {
      console.log(`Stopping ${key}`)
      manager.stop()
    })
  }

  removeManager(key: string): void {
    this.managers.get(key)?.stop()
    this.managers.delete(key)
  }

  getManager(key: string): PollingManager | undefined {
    return this.managers.get(key)
  }

  isManagerRunning(key: string): boolean {
    return this.managers.get(key)?.isRunning() || false
  }

  getAllKeys(): string[] {
    return Array.from(this.managers.keys())
  }

  getRunningManagers(): string[] {
    return Array.from(this.managers.entries())
      .filter(([_, manager]) => manager.isRunning())
      .map(([key, _]) => key)
  }
}

// ===============================================================================
// USAGE THRESHOLD HELPERS
// ===============================================================================

export const shouldTriggerUsageAlert = (
  current: number,
  limit: number,
  threshold: number = USAGE_THRESHOLDS.WARNING
): boolean => {
  if (limit === 0) return false
  const percentage = (current / limit) * 100
  return percentage >= threshold
}

export const getUsageAlertLevel = (
  current: number,
  limit: number
): 'normal' | 'warning' | 'critical' => {
  if (limit === 0) return 'normal'
  
  const percentage = (current / limit) * 100
  
  if (percentage >= USAGE_THRESHOLDS.CRITICAL) return 'critical'
  if (percentage >= USAGE_THRESHOLDS.WARNING) return 'warning'
  return 'normal'
}

// ===============================================================================
// UTILITY FUNCTIONS
// ===============================================================================

export const getPollingHealthStatus = (managers: PollingManagerCollection): {
  total: number
  running: number
  stopped: number
  healthPercentage: number
} => {
  const allKeys = managers.getAllKeys()
  const runningKeys = managers.getRunningManagers()
  
  return {
    total: allKeys.length,
    running: runningKeys.length,
    stopped: allKeys.length - runningKeys.length,
    healthPercentage: allKeys.length > 0 ? (runningKeys.length / allKeys.length) * 100 : 100
  }
}

export const createPollingHealthCheck = (
  managers: PollingManagerCollection,
  onHealthChange?: (health: any) => void
): PollingManager => {
  return createPollingManager(
    async () => {
      const health = getPollingHealthStatus(managers)
      
      if (onHealthChange) {
        onHealthChange(health)
      }

      // Log warning if health is poor
      if (health.healthPercentage < 50) {
        console.warn("⚠️ Polling health is poor:", health)
      }

      return health
    },
    {
      interval: 60000, // Check every minute
      maxRetries: 1,
      retryDelay: 5000,
      enabled: true
    }
  )
}