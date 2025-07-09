// types/tenant.ts - MISE À JOUR POUR CORRESPONDRE AU BACKEND JAVA

import { Currency, SubscriptionStatus } from "@/lib/constants"

export interface Tenant {
  tenantId: string
  tenantName: string
  status: string
  adminId: string
  createdAt: number
  active: boolean
  subscriptionExpired: boolean
  subscriptionStatus: SubscriptionStatus
  isActive: boolean
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
// TYPES CORRESPONDANT AU MODÈLE JAVA TENANT
// ===============================================================================

export interface DatabaseCredentials {
  admin: string // Correspond au Map<String, String> du backend
  password: string
}

export interface PlanInfo {
  id: string // Correspond au Map<String, String> plan du backend  
  name: string
}

export interface TenantDetails {
  // Identifiants et informations de base (correspond au modèle Java)
  id: string
  name: string
  adminId: string
  linkLogo: string | null
  status: string // ACTIVE, PENDING, SUSPENDED, DELETED, TRIAL, EXPIRED
  createdAt: number
  modifiedAt: number
  createdBy: string
  
  // Informations de base de données
  databaseUrl: string
  databaseCredentials: DatabaseCredentials
  
  // ===== GESTION DES SUBSCRIPTIONS (du modèle Java) =====
  plan: PlanInfo | null
  
  // Gestion des périodes de grâce et suspensions
  isInGracePeriod: number // 0 = Non, 1 = En période de grâce
  suspensionDate: number | null // Date de suspension du tenant
  suspensionReason: string | null // Raison de la suspension
  
  // ===== CONSOMMATION DES RESSOURCES (du modèle Java) =====
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
  
  // ===== FACTURATION ET PAIEMENTS (du modèle Java) =====
  billingEmail: string
  currentPlanPrice: number
  currency: string
  totalAmount: number
  totalAmountPaid: number
  outstandingAmount: number
  invoiceIds: string[]
  
  // Informations de changement de plan
  pendingPlanChange: any | null
  planChangeEffectiveDate: number | null
  planChangeReason: string | null
  planHistory: any[]
  
  // ===== LOCALISATION ET CONFIGURATION =====
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
  
  // ===== AUDIT TRAIL =====
  statusHistory: any[] | null
  subscriptionHistory: any[] | null
  legalNumbers: any | null
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
    isActive: boolean
    subscriptionStatus: SubscriptionStatus
  }
}

// ===============================================================================
// TYPES POUR LES DONNÉES D'USAGE ET SUBSCRIPTION (correspond aux API responses)
// ===============================================================================

export interface TenantUsageData {
  // Utilisation actuelle
  currentDatabaseUsageMB: number
  currentS3UsageMB: number
  currentUsersCount: number
  currentEmployeesCount: number
  
  // Alertes
  activeWarnings: string[]
  hasAlerts: number
  lastUpdated: number
  
  // Limites du plan
  planLimits: {
    maxDatabaseStorageMB: number
    maxS3StorageMB: number
    maxUsers: number
    maxEmployees: number
  }
  
  // Pourcentages d'utilisation
  usagePercentages: {
    databasePercent: number
    s3Percent: number
    usersPercent: number
    employeesPercent: number
  }
  
  // Informations de facturation et de grâce (peuvent être présentes selon l'API)
  nextBillingDate?: number
  autoRenewalEnabled?: boolean
  isInGracePeriod?: number
  gracePeriodStartDate?: number
  gracePeriodEndDate?: number
  manualGracePeriodSetBy?: string
  manualGracePeriodSetAt?: number
}

// ===============================================================================
// INTERFACES POUR LA CRÉATION DE TENANT
// ===============================================================================

export interface CreateTenantRequest {
  // Tenant Information
  tenantName: string
  industry: string
  region: string
  country: string
  city: string
  address: string
  postalCode?: string
  phone: string
  billingEmail: string
  timeZone: string
  language: string
  legalNumbers?: Record<string, string>
  
  // Admin Information
  adminEmail: string
  adminFirstName: string
  adminLastName: string
  adminPassword: string
}

export interface TenantCreationResponse {
  success: boolean
  data: {
    success: boolean
    tenantId: string
    tenantName: string
    adminUserId: string
    adminEmail: string
    s3BucketName: string
    status: string
    message: string
    error: any
    createdAt: number
  }
  message: string
}

// ===============================================================================
// INTERFACES POUR LES STATUTS ÉTENDUS
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

export interface TenantAlert {
  type: 'EXPIRING' | 'OVERDUE' | 'USAGE_LIMIT' | 'PAYMENT_FAILED' | 'SUSPENDED'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
  timestamp: number
  acknowledged: boolean
}

export interface TenantSummary {
  tenantId: string
  tenantName: string
  status: string
  adminId: string
  createdAt: number
  active: boolean
  subscriptionExpired: boolean
  subscriptionStatus: SubscriptionStatus
  isActive: boolean
  // Extended fields
  plan: PlanInfo | null
  planExpiryDate: number | null
  suspensionReason: string | null
  usageAlerts: number
  daysUntilExpiry: number
}

// ===============================================================================
// INTERFACES POUR LES OPÉRATIONS EN BULK
// ===============================================================================

export interface BulkTenantOperation {
  tenantIds: string[]
  operation: 'SUSPEND' | 'REACTIVATE' | 'RENEW' | 'CHANGE_PLAN'
  reason?: string
  newPlanId?: string
}