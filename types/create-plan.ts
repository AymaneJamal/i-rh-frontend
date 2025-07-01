// types/create-plan.ts

export interface CreatePlanRequest {
  // Informations de base
  planName: string
  description: string
  category: string
  
  // Informations de prix
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  
  // Limites de ressources
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  maxUsers: number
  maxEmployees: number
  maxDepartments: number
  maxReports: number
  
  // Fonctionnalités et limites RH
  hrFeatures: HRFeatures
  hrLimits: HRLimits
  
  // Gestion des états
  status: string
  version: string
  isPublic: number
  isRecommended: number
  
  // Configuration avancée
  gracePeriodDays: number
  includedModules: string[]
  customAttributes: Record<string, string>
  termsAndConditions: string
}

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

export interface CreatePlanResponse {
  success: boolean
  message: string
  data: any
  requestId: string
  timestamp: number
}

// Constants from backend enums
export const HR_FEATURES = [
  { key: "payroll", label: "Payroll" },
  { key: "recruitment", label: "Recruitment" },
  { key: "performance_management", label: "Performance Management" },
  { key: "employee_onboarding", label: "Employee Onboarding" },
  { key: "time_tracking", label: "Time Tracking" },
  { key: "leave_management", label: "Leave Management" },
  { key: "training_management", label: "Training Management" },
  { key: "document_management", label: "Document Management" },
  { key: "reporting_analytics", label: "Reporting Analytics" },
  { key: "employee_self_service", label: "Employee Self Service" }
] as const

export const HR_LIMITS = [
  { key: "max_payslips_per_month", label: "Max Payslips per Month" },
  { key: "max_job_postings", label: "Max Job Postings" },
  { key: "max_candidates_per_month", label: "Max Candidates per Month" },
  { key: "max_performance_reviews", label: "Max Performance Reviews" },
  { key: "max_training_sessions", label: "Max Training Sessions" },
  { key: "max_document_uploads_per_month", label: "Max Document Uploads per Month" },
  { key: "max_custom_reports", label: "Max Custom Reports" },
  { key: "max_api_calls_per_day", label: "Max API Calls per Day" }
] as const

export const HR_MODULES = [
  { value: "core_hr", label: "Core HR" },
  { value: "payroll", label: "Payroll" },
  { value: "recruitment", label: "Recruitment" },
  { value: "performance", label: "Performance" },
  { value: "training", label: "Training" },
  { value: "time_attendance", label: "Time Attendance" },
  { value: "leave_management", label: "Leave Management" },
  { value: "document_vault", label: "Document Vault" },
  { value: "analytics", label: "Analytics" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "api_access", label: "API Access" },
  { value: "advanced_reporting", label: "Advanced Reporting" }
] as const

export const PLAN_CATEGORIES = [
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" }
] as const

export const PLAN_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DRAFT", label: "Draft" }
] as const

export const CURRENCIES = [
  { value: "MAD", label: "MAD (Moroccan Dirham)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "USD", label: "USD (US Dollar)" }
] as const

export const PREDEFINED_CUSTOM_ATTRIBUTES = [
  { key: "target_company_size", label: "Target Company Size", options: ["small", "medium", "large", "enterprise"] },
  { key: "industry_focus", label: "Industry Focus", options: ["technology", "healthcare", "finance", "retail", "manufacturing", "education"] },
  { key: "support_level", label: "Support Level", options: ["basic", "standard", "priority", "premium"] },
  { key: "deployment_type", label: "Deployment Type", options: ["cloud", "on-premise", "hybrid"] },
  { key: "compliance_level", label: "Compliance Level", options: ["basic", "gdpr", "hipaa", "sox"] }
] as const