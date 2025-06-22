// types/tenant.ts

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
  size: number
  hasNext: boolean
  totalElements: number
  page: number
  hasPrevious: boolean
  totalPages: number
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

// Detailed tenant interfaces
export interface DatabaseCredentials {
  password: string
  username: string
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
  plan: string | null
  planExpiryDate: number | null
  isAutoProlanged: number
  isManuallyProlanged: number
  prolongedBy: string | null
  region: string
  industry: string
  billingMethod: string | null
  billingEmail: string
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

// Subscription interfaces
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