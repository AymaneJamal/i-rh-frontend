// types/subscription-plans.ts
import { PlanCategory, Currency, PlanType } from "@/lib/constants"

// ===============================================================================
// BASE PLAN INTERFACES
// ===============================================================================

export interface SubscriptionPlan {
  planId: string
  planName: string
  description: string
  category: PlanCategory
  status: string
  isPublic: number // 1 for standard, 0 for custom
  monthlyPrice: number
  yearlyPrice: number
  currency: Currency
  maxUsers: number
  maxEmployees: number
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  hasAdvancedReporting: number
  hasApiAccess: number
  hasCustomBranding: number
  billingCycle: number
  autoRenewalDays: number
  gracePeriodDays: number
  isRecommended: number
  createdAt: number
  modifiedAt?: number
  createdBy: string
  modifiedBy?: string
}

// ===============================================================================
// REQUEST INTERFACES
// ===============================================================================

export interface CreatePlanRequest {
  planName: string
  description: string
  category: PlanCategory
  monthlyPrice: number
  yearlyPrice: number
  currency: Currency
  maxUsers: number
  maxEmployees: number
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  hasAdvancedReporting: number
  hasApiAccess: number
  hasCustomBranding?: number
  billingCycle: number
  autoRenewalDays: number
  gracePeriodDays: number
}

export interface UpdatePlanRequest {
  planName?: string
  description?: string
  monthlyPrice?: number
  yearlyPrice?: number
  maxUsers?: number
  maxEmployees?: number
  maxDatabaseStorageMB?: number
  maxS3StorageMB?: number
  hasAdvancedReporting?: number
  hasApiAccess?: number
  hasCustomBranding?: number
  autoRenewalDays?: number
  gracePeriodDays?: number
}

export interface CreatePlanParams {
  planType?: PlanType
  forTenantId?: string
}

// ===============================================================================
// RESPONSE INTERFACES
// ===============================================================================

export interface PlanResponse {
  success: boolean
  data: SubscriptionPlan
  message: string
  requestId: string
  timestamp: number
}

export interface PlansListResponse {
  success: boolean
  data: SubscriptionPlan[]
  message: string
  requestId: string
  metadata: {
    count: number
    publicOnly?: boolean
    category?: string
  }
  timestamp: number
}

export interface PlanDashboardResponse {
  success: boolean
  data: {
    planStatistics: {
      totalPlans: number
      activePlans: number
      inactivePlans: number
      draftPlans: number
      recommendedPlans: number
      timestamp: number
    }
    generatedAt: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// FILTER INTERFACES
// ===============================================================================

export interface PlanFilters {
  publicOnly?: boolean
  category?: PlanCategory
}

// ===============================================================================
// PLAN CREATION HELPERS
// ===============================================================================

export interface PlanFeatures {
  maxUsers: number
  maxEmployees: number
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  hasAdvancedReporting: boolean
  hasApiAccess: boolean
  hasCustomBranding: boolean
}

export interface PlanPricing {
  monthlyPrice: number
  yearlyPrice: number
  currency: Currency
}

export interface PlanBilling {
  billingCycle: number
  autoRenewalDays: number
  gracePeriodDays: number
}

// ===============================================================================
// PLAN VALIDATION
// ===============================================================================

export interface PlanValidationResult {
  isValid: boolean
  errors: string[]
}

// ===============================================================================
// PLAN COMPARISON
// ===============================================================================

export interface PlanComparison {
  planId: string
  planName: string
  features: PlanFeatures
  pricing: PlanPricing
  isRecommended: boolean
}

// ===============================================================================
// ERROR INTERFACES
// ===============================================================================

export interface PlanErrorResponse {
  success: false
  error: string
  requestId: string
  timestamp: number
}