// lib/api/tenant-invoices.ts
import { apiClient } from "@/lib/api-client"

export interface BillingAddress {
  country: string
  rc: string
  address: string
  city: string
  phone: string
  cnss: string
  postalCode: string
  ice: string
  region: string
  patente: string
}

export interface AuditTrailItem {
  totalAmount: number
  remainingAmount: number
  paymentReference: string | null
  dueDate: number | null
  paymentMethod: string
  id: string
  paidAmount: number
  status: string
}

export interface TenantInvoice {
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  tenantName: string
  issueDate: number
  dueDate: number | null
  paidDate: number | null
  createdAt: number
  modifiedAt: number
  planId: string
  planName: string
  billingPeriodStart: number
  billingPeriodEnd: number
  billingType: string
  subtotalAmount: number
  taxAmount: number
  taxRate: number
  totalAmount: number
  currency: string | null
  discountAmount: number
  discountReason: string | null
  lineItems: any | null
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentReference: string | null
  paidAmount: number
  remainingAmount: number
  billingEmail: string
  billingName: string
  billingAddress: BillingAddress
  vatNumber: string | null
  pdfFileUrl: string | null
  s3BucketName: string | null
  s3Key: string | null
  attachments: any | null
  generatedBy: string
  sentDate: number | null
  emailSent: boolean | null
  emailSentTo: string | null
  remindersSent: number | null
  lastReminderDate: number | null
  fiscalYear: string | null
  legalEntity: string | null
  invoiceTemplate: string | null
  notes: string | null
  termsAndConditions: string | null
  auditTrail: AuditTrailItem[]
  parentInvoiceId: string | null
  invoiceType: string
  isPrepayedInvoiceReason: string | null
  isPrepayeInvoiceContab: number
  isRecurring: boolean | null
  recurringSchedule: string | null
  creditReason: string | null
  refundAmount: number | null
  refundDate: number | null
  refundReason: string | null
}

export interface TenantInvoicesResponse {
  data: TenantInvoice[]
  metadata: {
    count: number
    tenantId: string
  }
  timestamp: number
  message: string
  success: boolean
  requestId: string
}

export const tenantInvoicesApi = {
  /**
   * Get all invoices for a tenant
   */
  getTenantInvoices: async (tenantId: string): Promise<TenantInvoicesResponse> => {
    try {
      console.log("🧾 Fetching invoices for tenant:", tenantId)
      
      const response = await apiClient.get(`/api/subscriptions/invoices/tenant/${tenantId}`, {
        includeUserEmail: true
      })
      
      console.log("✅ Invoices fetched successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to fetch tenant invoices:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        tenantId
      })
      throw error
    }
  }
}