// hooks/use-tenant-invoices.ts
import { useState, useEffect, useCallback } from "react"
import { invoiceManagementApi } from "@/lib/api/invoice-management"
import { BillingType, InvoiceTemplate } from "@/lib/constants"

interface Invoice {
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  tenantName: string
  planId: string
  planName: string
  issueDate: number
  dueDate: number
  billingType: string
  subtotalAmount: number
  taxAmount: number
  taxRate: number
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  paidDate?: number
  paidAmount?: number
  remainingAmount?: number
  paymentMethod?: string
  paymentReference?: string
  pdfFileUrl: string
  invoiceTemplate: string
  remindersSent?: number
  lastReminderDate?: number
  generatedBy: string
  createdAt: number
  modifiedAt?: number
}

export const useTenantInvoices = (tenantId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ===============================================================================
  // FETCH INVOICES
  // ===============================================================================
  const fetchInvoices = useCallback(async () => {
    if (!tenantId) {
      setInvoices([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("📄 Fetching invoices for tenant:", tenantId)
      const response = await invoiceManagementApi.getTenantInvoices(tenantId)
      
      if (response.success) {
        setInvoices(response.data || [])
        console.log("✅ Invoices loaded:", response.data?.length || 0)
      } else {
        setError("Failed to fetch invoices")
      }
    } catch (err: any) {
      console.error("❌ Error fetching invoices:", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }, [tenantId, refreshTrigger])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // ===============================================================================
  // ACTIONS
  // ===============================================================================
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const generateInvoice = useCallback(async (billingType?: BillingType, template?: InvoiceTemplate) => {
    try {
      setError(null)
      console.log("📄 Generating invoice for tenant:", tenantId)
      
      const response = await invoiceManagementApi.generateInvoice(tenantId, billingType, template)
      
      if (response.success) {
        refresh()
        return response.data
      } else {
        throw new Error("Failed to generate invoice")
      }
    } catch (err: any) {
      console.error("❌ Error generating invoice:", err)
      setError(err.response?.data?.error || err.message || "Failed to generate invoice")
      throw err
    }
  }, [tenantId, refresh])

  const markInvoicePaid = useCallback(async (
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    paymentReference: string
  ) => {
    try {
      setError(null)
      console.log("💳 Marking invoice as paid:", invoiceId)
      
      const response = await invoiceManagementApi.markInvoicePaid(
        invoiceId,
        amount,
        paymentMethod as any,
        paymentReference
      )
      
      if (response.success) {
        refresh()
        return response.data
      } else {
        throw new Error("Failed to mark invoice as paid")
      }
    } catch (err: any) {
      console.error("❌ Error marking invoice as paid:", err)
      setError(err.response?.data?.error || err.message || "Failed to mark invoice as paid")
      throw err
    }
  }, [refresh])

  const uploadReceipt = useCallback(async (invoiceId: string, receiptFile: File) => {
    try {
      setError(null)
      console.log("📎 Uploading receipt for invoice:", invoiceId)
      
      const response = await invoiceManagementApi.uploadReceipt(invoiceId, receiptFile)
      
      if (response.success) {
        refresh()
        return response.data
      } else {
        throw new Error("Failed to upload receipt")
      }
    } catch (err: any) {
      console.error("❌ Error uploading receipt:", err)
      setError(err.response?.data?.error || err.message || "Failed to upload receipt")
      throw err
    }
  }, [refresh])

  const sendReminder = useCallback(async (invoiceId: string) => {
    try {
      setError(null)
      console.log("📧 Sending reminder for invoice:", invoiceId)
      
      const response = await invoiceManagementApi.sendReminder(invoiceId)
      
      if (response.success) {
        refresh()
        return response.data
      } else {
        throw new Error("Failed to send reminder")
      }
    } catch (err: any) {
      console.error("❌ Error sending reminder:", err)
      setError(err.response?.data?.error || err.message || "Failed to send reminder")
      throw err
    }
  }, [refresh])

  // ===============================================================================
  // COMPUTED VALUES
  // ===============================================================================
  const unpaidInvoices = invoices.filter(invoice => 
    invoice.paymentStatus !== 'PAID' && invoice.status !== 'CANCELLED'
  )

  const overdueInvoices = invoices.filter(invoice => 
    invoice.status === 'OVERDUE' || 
    (invoice.dueDate < Date.now() && invoice.paymentStatus !== 'PAID')
  )

  const totalOutstanding = unpaidInvoices.reduce((sum, invoice) => 
    sum + (invoice.remainingAmount || invoice.totalAmount), 0
  )

  const recentInvoices = invoices
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  // ===============================================================================
  // RETURN HOOK DATA
  // ===============================================================================
  return {
    // Core data
    invoices,
    loading,
    error,

    // Computed data
    unpaidInvoices,
    overdueInvoices,
    totalOutstanding,
    recentInvoices,

    // Actions
    refresh,
    generateInvoice,
    markInvoicePaid,
    uploadReceipt,
    sendReminder,

    // Individual fetch
    fetchInvoices
  }
}