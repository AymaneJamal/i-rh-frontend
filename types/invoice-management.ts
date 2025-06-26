// types/invoice-management.ts
import { BillingType, InvoiceTemplate, InvoiceStatus, PaymentStatus, PaymentMethod, Currency } from "@/lib/constants"

// ===============================================================================
// CORE INVOICE INTERFACES
// ===============================================================================

export interface Invoice {
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  tenantName: string
  planId: string
  planName: string
  issueDate: number
  dueDate: number
  billingType: BillingType
  subtotalAmount: number
  taxAmount: number
  taxRate: number
  totalAmount: number
  currency: Currency
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  paidDate?: number
  paidAmount?: number
  remainingAmount?: number
  paymentMethod?: PaymentMethod
  paymentReference?: string
  pdfFileUrl: string
  invoiceTemplate: InvoiceTemplate
  remindersSent?: number
  lastReminderDate?: number
  generatedBy: string
  createdAt: number
  modifiedAt?: number
}

// ===============================================================================
// GENERATE INVOICE INTERFACES
// ===============================================================================

export interface GenerateInvoiceRequest {
  tenantId: string
  billingType?: BillingType
  template?: InvoiceTemplate
}

export interface GenerateInvoiceResponse {
  success: boolean
  data: Invoice
  message: string
  requestId: string
  timestamp: number
}

export interface GenerateMonthlyInvoicesResponse {
  success: boolean
  data: {
    message: string
    processedBy: string
    startedAt: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// INVOICE HISTORY INTERFACES
// ===============================================================================

export interface InvoiceHistoryItem {
  invoiceId: string
  invoiceNumber: string
  issueDate: number
  dueDate: number
  totalAmount: number
  currency: Currency
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  paidDate?: number
  paidAmount?: number
  paymentMethod?: PaymentMethod
  planName: string
}

export interface TenantInvoicesResponse {
  success: boolean
  data: InvoiceHistoryItem[]
  message: string
  requestId: string
  metadata: {
    tenantId: string
    count: number
  }
  timestamp: number
}

export interface PlanHistoryItem {
  planId: string
  planName: string
  startDate: number
  endDate: number | null
  price: number
}

export interface TenantPlansHistoryResponse {
  success: boolean
  data: PlanHistoryItem[]
  message: string
  requestId: string
  metadata: {
    tenantId: string
    plansCount: number
  }
  timestamp: number
}

// ===============================================================================
// RECEIPT UPLOAD INTERFACES
// ===============================================================================

export interface ReceiptUploadRequest {
  receipt: File
}

export interface ReceiptUploadResponse {
  success: boolean
  data: {
    fileName: string
    fileKey: string
    bucketName: string
    contentType: string
    size: string
    uploadDate: string
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// PAYMENT INTERFACES
// ===============================================================================

export interface MarkPaidRequest {
  amount: number
  paymentMethod: PaymentMethod
  paymentReference: string
}

export interface MarkPaidResponse {
  success: boolean
  data: {
    invoiceId: string
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    paymentStatus: PaymentStatus
    status: InvoiceStatus
    paymentMethod: PaymentMethod
    paymentReference: string
    paidDate: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// UNPAID & OVERDUE INTERFACES
// ===============================================================================

export interface UnpaidInvoice {
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  tenantName: string
  totalAmount: number
  currency: Currency
  issueDate: number
  dueDate: number
  paymentStatus: PaymentStatus
  daysPastDue: number
}

export interface OverdueInvoice extends UnpaidInvoice {
  remindersSent: number
  lastReminderDate?: number
}

export interface UnpaidInvoicesResponse {
  success: boolean
  data: UnpaidInvoice[]
  message: string
  requestId: string
  metadata: {
    count: number
    type: 'unpaid'
  }
  timestamp: number
}

export interface OverdueInvoicesResponse {
  success: boolean
  data: OverdueInvoice[]
  message: string
  requestId: string
  metadata: {
    count: number
    type: 'overdue'
  }
  timestamp: number
}

// ===============================================================================
// REMINDER INTERFACES
// ===============================================================================

export interface SendReminderResponse {
  success: boolean
  data: {
    invoiceId: string
    invoiceNumber: string
    remindersSent: number
    lastReminderDate: number
    emailSentTo: string
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// FINANCIAL DASHBOARD INTERFACES
// ===============================================================================

export interface FinancialStats {
  totalRevenue: number
  monthlyRevenue: number
  unpaidAmount: number
  overdueAmount: number
}

export interface CriticalTenants {
  expiringSoon: number
  inGracePeriod: number
  resourceAlerts: number
}

export interface RecentActivity {
  type: 'INVOICE_GENERATED' | 'PAYMENT_RECEIVED' | 'REMINDER_SENT'
  description: string
  timestamp: number
  tenantId: string
  amount?: number
}

export interface FinancialDashboardResponse {
  success: boolean
  data: {
    financialStats: FinancialStats
    criticalTenants: CriticalTenants
    recentActivity: RecentActivity[]
    generatedAt: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// DETAILED FINANCIAL STATS INTERFACES
// ===============================================================================

export interface BillingStats {
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
}

export interface MonthlyEvolution {
  [monthYear: string]: number
}

export interface FinancialStatsResponse {
  success: boolean
  data: {
    billing: BillingStats
    totalRevenue: number
    monthlyEvolution: MonthlyEvolution
    projectedRevenue: number
    period: string
    generatedAt: number
  }
  message: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// ERROR INTERFACES
// ===============================================================================

export interface InvoiceErrorResponse {
  success: false
  error: string
  requestId: string
  timestamp: number
}

// ===============================================================================
// UTILITY INTERFACES
// ===============================================================================

export interface InvoiceFilters {
  status?: InvoiceStatus
  paymentStatus?: PaymentStatus
  tenantId?: string
  dateFrom?: number
  dateTo?: number
}

export interface InvoiceMetrics {
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  overdueInvoices: number
  totalRevenue: number
  unpaidAmount: number
  overdueAmount: number
}

export interface PaymentSummary {
  method: PaymentMethod
  count: number
  totalAmount: number
}

// ===============================================================================
// FINANCIAL PERIODS
// ===============================================================================

export type FinancialPeriod = 'current_month' | 'last_month' | 'current_year' | 'last_year'