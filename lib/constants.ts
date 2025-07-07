// lib/constants.ts

// ===============================================================================
// SUBSCRIPTION STATUSES
// ===============================================================================
export const SUBSCRIPTION_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  GRACE: 'GRACE'
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// ===============================================================================
// BILLING TYPES
// ===============================================================================
export const BILLING_TYPES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY', 
  PRORATA: 'PRORATA'
} as const

export type BillingType = typeof BILLING_TYPES[keyof typeof BILLING_TYPES]

// ===============================================================================
// PAYMENT METHODS
// ===============================================================================
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  CHECK: 'CHECK',
  CASH: 'CASH'
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// ===============================================================================
// INVOICE TEMPLATES
// ===============================================================================
export const INVOICE_TEMPLATES = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  CUSTOM: 'custom'
} as const

export type InvoiceTemplate = typeof INVOICE_TEMPLATES[keyof typeof INVOICE_TEMPLATES]

// ===============================================================================
// PLAN CATEGORIES
// ===============================================================================
export const PLAN_CATEGORIES = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
} as const

export type PlanCategory = typeof PLAN_CATEGORIES[keyof typeof PLAN_CATEGORIES]

// ===============================================================================
// PLAN TYPES
// ===============================================================================
export const PLAN_TYPES = {
  STANDARD: 'standard',
  CUSTOM: 'custom'
} as const

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES]

// ===============================================================================
// INVOICE STATUSES
// ===============================================================================
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
} as const

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS]

// ===============================================================================
// PAYMENT STATUSES
// ===============================================================================
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// ===============================================================================
// FILE UPLOAD CONSTANTS
// ===============================================================================
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    RECEIPT: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    DOCUMENT: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const

// ===============================================================================
// PLAN FEATURES FLAGS  
// ===============================================================================
export const PLAN_FEATURES = {
  ADVANCED_REPORTING: 'hasAdvancedReporting',
  API_ACCESS: 'hasApiAccess',
  CUSTOM_BRANDING: 'hasCustomBranding'
} as const

// ===============================================================================
// CURRENCY CODES
// ===============================================================================
export const CURRENCIES = {
  EUR: 'EUR',
  USD: 'USD',
  MAD: 'MAD'
} as const

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES]

// ===============================================================================
// STATUS COLORS FOR UI
// ===============================================================================
export const STATUS_COLORS = {
  // Subscription Status Colors
  SUBSCRIPTION: {
    PENDING: 'orange',
    ACTIVE: 'green',
    EXPIRED: 'red',
    GRACE: 'yellow'
  },
  // Invoice Status Colors
  INVOICE: {
    DRAFT: 'gray',
    SENT: 'blue',
    PAID: 'green',
    OVERDUE: 'red',
    CANCELLED: 'gray'
  },
  // Payment Status Colors
  PAYMENT: {
    PENDING: 'orange',
    PAID: 'green',
    FAILED: 'red',
    REFUNDED: 'yellow'
  }
} as const

// ===============================================================================
// USAGE ALERT THRESHOLDS
// ===============================================================================
export const USAGE_THRESHOLDS = {
  WARNING: 80, // 80%
  CRITICAL: 95, // 95%
  MAX: 100 // 100%
} as const

// ===============================================================================
// POLLING INTERVALS (in milliseconds)
// ===============================================================================
export const POLLING_INTERVALS = {
  STATUS_CHECK: 5 * 60 * 1000, // 5 minutes
  USAGE_MONITOR: 10 * 60 * 1000, // 10 minutes
  FINANCIAL_STATS: 15 * 60 * 1000 // 15 minutes
} as const

// ===============================================================================
// API HEADERS
// ===============================================================================
export const API_HEADERS = {
  USER_EMAIL: 'X-User-Email',
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
  CONTENT_TYPE_MULTIPART: 'multipart/form-data'
} as const