// types/tenant-subscription.ts
import { PaymentMethod, SubscriptionStatus, Currency } from "@/lib/constants"

// ===============================================================================
// TENANT SUBSCRIPTION CORE INTERFACES
// ===============================================================================

export interface TenantSubscription {
  tenantId: string
  tenantName: string
  status: SubscriptionStatus
  plan: {
    id: string
    name: string
  }
  planStartDate: number
  planExpiryDate: number
  currentPlanPrice: number
  currency: Currency
  autoRenewalEnabled: number
  nextBillingDate: number
  isInGracePeriod: number
  gracePeriodStartDate: number | null
  gracePeriodEndDate: number | null
  suspensionDate: number | null
  suspensionReason: string | null
  planChangeReason: string | null
  planHistory: PlanHistoryItem[]
}

export interface PlanHistoryItem {
  planId: string
  planName: string
  startDate: number
  endDate: number
  price: number
}

// ===============================================================================
// ASSIGN PLAN INTERFACES
// ===============================================================================

export interface AssignPlanRequest {
  planId: string
  paymentMethod: PaymentMethod
  paymentReference: string
  startDate?: number
  endDate?: number
  receipt: File // Obligatoire
}

export interface AssignPlanResponse {
  success: boolean
  data: {
    tenant: TenantSubscription
    receiptUpload: ReceiptUpload
    paymentInfo: PaymentInfo
  }
  message: string
  requestId: string
  timestamp: number
}

export interface ReceiptUpload {
  fileName: string
  fileKey: string
  bucketName: string
  size: string
  uploadDate: string
}

export interface PaymentInfo {
  method: PaymentMethod
  reference: string
  receiptUrl: string
}

// ===============================================================================
// CHANGE PLAN INTERFACES
// ===============================================================================

export interface ChangePlanRequest {
  newPlanId: string
  changeReason: string
  paymentReference: string
}

export interface ChangePlanResponse {
  success: boolean
  data: TenantSubscription
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// SUSPEND/REACTIVATE INTERFACES
// ===============================================================================

export interface SuspendTenantRequest {
  reason: string
}

export interface ReactivateTenantRequest {
  newPlanId?: string
}

export interface TenantActionResponse {
  success: boolean
  data: {
    id: string
    name: string
    status: SubscriptionStatus
    suspensionDate: number | null
    suspensionReason: string | null
    isInGracePeriod: number
    plan: {
      id: string
      name: string
    }
    planExpiryDate: number | null
    nextBillingDate: number | null
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// STATUS CHECK INTERFACES
// ===============================================================================

export interface TenantStatusResponse {
  success: boolean
  data: {
    tenantId: string
    status: SubscriptionStatus
    checkedAt: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// USAGE MONITORING INTERFACES
// ===============================================================================

export interface TenantUsageResponse {
  success: boolean
  data: {
    currentDatabaseUsageMB: number
    currentS3UsageMB: number
    currentUsersCount: number
    currentEmployeesCount: number
    activeWarnings: string[]
    hasAlerts: number
    lastUpdated: number
    planLimits: {
      maxDatabaseStorageMB: number
      maxS3StorageMB: number
      maxUsers: number
      maxEmployees: number
    }
    usagePercentages: {
      databasePercent: number
      s3Percent: number
      usersPercent: number
      employeesPercent: number
    }
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// PROCESSING INTERFACES
// ===============================================================================

export interface ProcessExpiringResponse {
  success: boolean
  data: {
    processedTenants: string[]
    totalProcessed: number
    processedAt: number
    processedBy: string
  }
  message: string
  requestId: string
  timestamp: number
}

export interface AutoRenewResponse {
  success: boolean
  data: {
    tenantId: string
    renewalSuccess: boolean
    processedAt: number
    processedBy: string
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// SEARCH INTERFACES
// ===============================================================================

export interface TenantSearchFilters {
  status?: SubscriptionStatus
  country?: string
  planId?: string
  city?: string
  region?: string
}

export interface TenantSearchResult {
  id: string
  name: string
  status: SubscriptionStatus
  country: string
  plan: {
    id: string
    name: string
  }
  planExpiryDate: number
  currentPlanPrice: number
}

export interface TenantSearchResponse {
  success: boolean
  data: TenantSearchResult[]
  message: string
  requestId: string
  metadata: {
    count: number
    filters: TenantSearchFilters
  }
  timestamp: number
}

// ===============================================================================
// GRACE PERIOD INTERFACES
// ===============================================================================

export interface GracePeriodRequest {
  reason: string
}

export interface GracePeriodResponse {
  success: boolean
  data: {
    id: string
    status: SubscriptionStatus
    isInGracePeriod: number
    gracePeriodStartDate: number
    gracePeriodEndDate: number
    plan: {
      id: string
      name: string
    }
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// ERROR INTERFACES
// ===============================================================================

export interface SubscriptionErrorResponse {
  success: false
  error: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// UTILITY INTERFACES
// ===============================================================================

export interface SubscriptionMetrics {
  activeTenants: number
  suspendedTenants: number
  expiringTenants: number
  criticalTenants: number
  gracePeriodTenants: number
}

export interface UsageAlert {
  type: 'DATABASE' | 'S3' | 'USERS' | 'EMPLOYEES'
  currentValue: number
  limitValue: number
  percentage: number
  severity: 'WARNING' | 'CRITICAL'
}