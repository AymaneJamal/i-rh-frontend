// types/plan.ts

export interface HRFeatures {
  payroll: boolean
  recruitment: boolean
  performance_management: boolean
  employee_onboarding: boolean
  time_tracking: boolean
  leave_management: boolean
  training_management: boolean
  document_management: boolean
  reporting_analytics: boolean
  employee_self_service: boolean
}

export interface HRLimits {
  max_payslips_per_month: number
  max_job_postings: number
  max_candidates_per_month: number
  max_performance_reviews: number
  max_training_sessions: number
  max_document_uploads_per_month: number
  max_custom_reports: number
  max_api_calls_per_day: number
}

export interface CustomAttributes {
  target_company_size: string
  industry_focus: string
  support_level: string
}

export interface Plan {
  planId: string
  planName: string
  description: string
  category: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  billingCycle: string | null
  trialPeriodDays: number | null
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  maxUsers: number
  maxEmployees: number
  maxDepartments: number
  maxProjects: number | null
  maxDocuments: number | null
  maxReports: number
  hrFeatures: HRFeatures
  hrLimits: HRLimits
  hasAdvancedReporting: boolean | null
  hasApiAccess: boolean | null
  hasCustomBranding: boolean | null
  hasMultiLanguage: boolean | null
  hasSsoIntegration: boolean | null
  hasBackupRestore: boolean | null
  hasPrioritySupport: boolean | null
  status: string
  version: string
  isPublic: number
  isRecommended: number
  createdAt: number
  modifiedAt: number | null
  createdBy: string
  modifiedBy: string | null
  autoRenewalDays: number | null
  gracePeriodDays: number
  includedModules: string[]
  customAttributes: CustomAttributes
  termsAndConditions: string
  upgradeableTo: string | null
  downgradeableTo: string | null
  requiresDataMigration: boolean | null
}

export interface PlanResponse {
  requestId: string
  data: Plan[]
  metadata: {
    count: number
    category: string
    publicOnly: boolean
  }
  timestamp: number
  message: string
  success: boolean
}

export interface PlanFilters {
  publicOnly?: boolean
  category?: string
}