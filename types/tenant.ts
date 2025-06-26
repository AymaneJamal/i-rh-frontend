// types/tenant.ts

import { Currency, SubscriptionStatus } from "@/lib/constants"

export interface Tenant {
  tenantId: string
  tenantName: string
  status: string
  adminId: string
  createdAt: number
  active: boolean
  subscriptionExpired: boolean
}

export interface TenantPagination {
  page: number
  hasPrevious: boolean
  totalPages: number
  size: number
  hasNext: boolean
  totalElements: number
}

export interface TenantResponse {
  pagination: TenantPagination
  data: Tenant[]
  success: boolean
}

export interface TenantFilters {
  page?: number
  size?: number
  status?: string
  tenantName?: string
}

// ===============================================================================
// DETAILED TENANT INTERFACES - ÉTENDUES AVEC SUBSCRIPTION/BILLING/USAGE
// ===============================================================================

export interface DatabaseCredentials {
  password: string
  username: string
}

export interface PlanInfo {
  name: string
  id: string
}

export interface TenantDetails {
  id: string
  name: string
  adminId: string
  linkLogo: string | null
  status: string
  createdAt: number
  modifiedAt: number
  createdBy: string
  databaseUrl: string
  databaseCredentials: DatabaseCredentials
  
  // ===== SUBSCRIPTION FIELDS =====
  plan: PlanInfo | null
  planStartDate: number | null
  planExpiryDate: number | null
  isTrialActive: number
  trialExpiryDate: number | null
  isAutoProlanged: number
  isManuallyProlanged: number
  prolongedBy: string | null
  autoRenewalEnabled: number
  nextBillingDate: number | null
  isInGracePeriod: number
  gracePeriodStartDate: number | null
  gracePeriodEndDate: number | null
  suspensionDate: number | null
  suspensionReason: string | null
  
  // ===== USAGE FIELDS =====
  currentDatabaseUsageMB: number
  currentS3UsageMB: number
  currentUsersCount: number
  currentEmployeesCount: number
  currentDepartmentsCount: number
  currentProjectsCount: number
  currentDocumentsCount: number
  currentReportsCount: number
  resourcesLastUpdated: number
  resourceUsageHistory: any | null
  resourceAlertSent: number
  lastResourceAlertDate: number | null
  activeWarnings: string[]
  
  // ===== BILLING FIELDS =====
  billingMethod: string | null
  billingEmail: string
  currentPlanPrice: number | null
  currency: Currency
  totalAmountPaid: number | null
  outstandingAmount: number | null
  lastPaymentDate: number | null
  lastPaymentStatus: string | null
  invoiceIds: string[]
  pendingPlanChange: any | null
  planChangeEffectiveDate: number | null
  planChangeReason: string | null
  planHistory: any | null
  
  // ===== LOCATION & CONFIG FIELDS =====
  region: string
  industry: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string | null
  timeZone: string
  language: string
  isMultiTenant: number
  parentTenantId: string | null
  childTenantIds: string[]
  domains: string[]
  autoProlangedAt: number | null
  manuallyProlangedAt: number | null
}

export interface AdminUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
  status: string
  createdAt: number
  isEmailVerified: number
  companyRole: string
  statusModifiedAt: number
  modifiedAt: number
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number
}

export interface TenantDetailResponse {
  success: boolean
  data: {
    tenant: TenantDetails
    adminUser: AdminUser
    active: boolean
    subscriptionExpired: boolean
  }
}

// ===============================================================================
// TENANT CREATION INTERFACES
// ===============================================================================

export interface CreateTenantRequest {
  // Tenant Information
  tenantName: string
  industry?: string
  region?: string
  country?: string
  city?: string
  address?: string
  phone?: string
  billingEmail?: string
  timeZone?: string
  language?: string
  createdBy?: string
  
  // Admin Information
  adminEmail: string
  adminFirstName: string
  adminLastName: string
  adminPassword: string
}

export interface TenantCreationResponse {
  success: boolean
  tenantId: string
  tenantName: string
  adminUserId: string
  adminEmail: string
  databaseUrl: string
  s3BucketName: string
  status: string
  message: string
  error: string | null
  createdAt: number
}

// ===============================================================================
// SUBSCRIPTION INTERFACES - HÉRITÉS DES TYPES SUBSCRIPTION
// ===============================================================================

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: number // in months
  features: string[]
  maxUsers: number
  maxStorage: number // in GB
  support: string
}

export interface AssignSubscriptionRequest {
  tenantId: string
  planId: string
  billingMethod: string
  receiptFile?: File
  autoRenew: boolean
  customExpiryDate?: string
}

// ===============================================================================
// TENANT EXTENDED STATUS INTERFACES
// ===============================================================================

export interface TenantExtendedStatus {
  subscription: SubscriptionStatus
  billing: 'CURRENT' | 'OVERDUE' | 'PAID'
  usage: 'NORMAL' | 'WARNING' | 'CRITICAL'
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'SUSPENDED'
}

export interface TenantUsageMetrics {
  database: {
    current: number
    limit: number
    percentage: number
  }
  s3: {
    current: number
    limit: number
    percentage: number
  }
  users: {
    current: number
    limit: number
    percentage: number
  }
  employees: {
    current: number
    limit: number
    percentage: number
  }
}

export interface TenantBillingInfo {
  currentPlan: PlanInfo | null
  planPrice: number | null
  currency: Currency
  nextBilling: number | null
  autoRenewal: boolean
  outstandingAmount: number | null
  lastPayment: {
    date: number | null
    status: string | null
    amount: number | null
  }
}

// ===============================================================================
// TENANT MONITORING INTERFACES
// ===============================================================================

export interface TenantMonitoringData {
  tenantId: string
  tenantName: string
  status: TenantExtendedStatus
  subscription: {
    plan: PlanInfo | null
    expiryDate: number | null
    daysRemaining: number
    isInGracePeriod: boolean
  }
  usage: TenantUsageMetrics
  billing: TenantBillingInfo
  alerts: TenantAlert[]
  lastUpdated: number
}

export interface TenantAlert {
  type: 'EXPIRING' | 'OVERDUE' | 'USAGE_LIMIT' | 'PAYMENT_FAILED' | 'SUSPENDED'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
  timestamp: number
  acknowledged: boolean
}

// ===============================================================================
// TENANT SUMMARY FOR LISTS
// ===============================================================================

export interface TenantSummary {
  tenantId: string
  tenantName: string
  status: string
  adminId: string
  createdAt: number
  active: boolean
  subscriptionExpired: boolean
  // Extended fields
  plan: PlanInfo | null
  planExpiryDate: number | null
  currentPlanPrice: number | null
  currency: Currency
  suspensionReason: string | null
  usageAlerts: number
  daysUntilExpiry: number
}

// ===============================================================================
// TENANT BULK OPERATIONS
// ===============================================================================

export interface BulkTenantOperation {
  tenantIds: string[]
  operation: 'SUSPEND' | 'REACTIVATE' | 'RENEW' | 'CHANGE_PLAN'
  reason?: string
  newPlanId?: string
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  results: {
    tenantId: string
    success: boolean
    error?: string
  }[]
}