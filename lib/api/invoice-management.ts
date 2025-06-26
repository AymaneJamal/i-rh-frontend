// lib/api/invoice-management.ts
import { apiClient } from "@/lib/api-client"
import { BillingType, InvoiceTemplate, PaymentMethod } from "@/lib/constants"

export const invoiceManagementApi = {
  generateInvoice: async (
    tenantId: string,
    billingType?: BillingType,
    template?: InvoiceTemplate
  ) => {
    const queryParams = apiClient.buildQueryString({
      tenantId,
      billingType,
      template
    })

    const response = await apiClient.post(
      `/api/subscriptions/invoices/generate${queryParams}`
    )
    
    return response.data
  },

  generateMonthlyInvoices: async () => {
    const response = await apiClient.post("/api/subscriptions/invoices/generate-monthly")
    return response.data
  },

  getTenantInvoices: async (tenantId: string) => {
    const response = await apiClient.get(`/api/subscriptions/invoices/tenant/${tenantId}`)
    return response.data
  },

  getTenantPlansHistory: async (tenantId: string) => {
    const response = await apiClient.get(
      `/api/subscriptions/invoices/tenant/${tenantId}/plans-history`
    )
    return response.data
  },

  uploadReceipt: async (invoiceId: string, receiptFile: File) => {
    const formData = new FormData()
    formData.append('receipt', receiptFile)

    const response = await apiClient.postFormData(
      `/api/subscriptions/invoices/${invoiceId}/receipt`,
      formData
    )
    
    return response.data
  },

  markInvoicePaid: async (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paymentReference: string
  ) => {
    const queryParams = apiClient.buildQueryString({
      amount,
      paymentMethod,
      paymentReference
    })

    const response = await apiClient.post(
      `/api/subscriptions/invoices/${invoiceId}/mark-paid${queryParams}`
    )
    
    return response.data
  },

  getUnpaidInvoices: async () => {
    const response = await apiClient.get("/api/subscriptions/invoices/unpaid")
    return response.data
  },

  getOverdueInvoices: async () => {
    const response = await apiClient.get("/api/subscriptions/invoices/overdue")
    return response.data
  },

  sendReminder: async (invoiceId: string) => {
    const response = await apiClient.post(
      `/api/subscriptions/invoices/${invoiceId}/reminder`
    )
    return response.data
  },

  getFinancialDashboard: async () => {
    const response = await apiClient.get("/api/subscriptions/invoices/dashboard")
    return response.data
  },

  getFinancialStats: async (period?: string) => {
    const queryParams = apiClient.buildQueryString({
      period: period || undefined
    })

    const response = await apiClient.get(
      `/api/subscriptions/invoices/financial-stats${queryParams}`
    )
    
    return response.data
  }
}