// hooks/use-invoice-management.ts
import { useState, useEffect, useCallback } from "react"
import { invoiceManagementApi } from "@/lib/api/invoice-management"
import { BillingType, InvoiceTemplate, PaymentMethod } from "@/lib/constants"

interface InvoiceHistoryItem {
  invoiceId: string
  invoiceNumber: string
  issueDate: number
  dueDate: number
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  paidDate?: number
  paidAmount?: number
  paymentMethod?: string
  planName: string
}

interface UnpaidInvoice {
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  tenantName: string
  totalAmount: number
  currency: string
  issueDate: number
  dueDate: number
  paymentStatus: string
  daysPastDue: number
}

export const useInvoiceManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInvoice = useCallback(async (
    tenantId: string,
    billingType?: BillingType,
    template?: InvoiceTemplate
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await invoiceManagementApi.generateInvoice(tenantId, billingType, template)
      
      if (response.success) {
        return true
      } else {
        setError("Failed to generate invoice")
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to generate invoice")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadReceipt = useCallback(async (
    invoiceId: string,
    receiptFile: File
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await invoiceManagementApi.uploadReceipt(invoiceId, receiptFile)
      
      if (response.success) {
        return true
      } else {
        setError("Failed to upload receipt")
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to upload receipt")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const markInvoicePaid = useCallback(async (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paymentReference: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await invoiceManagementApi.markInvoicePaid(
        invoiceId,
        amount,
        paymentMethod,
        paymentReference
      )
      
      if (response.success) {
        return true
      } else {
        setError("Failed to mark invoice as paid")
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to mark invoice as paid")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const sendReminder = useCallback(async (invoiceId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await invoiceManagementApi.sendReminder(invoiceId)
      
      if (response.success) {
        return true
      } else {
        setError("Failed to send reminder")
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to send reminder")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    generateInvoice,
    uploadReceipt,
    markInvoicePaid,
    sendReminder
  }
}

export const useTenantInvoices = (tenantId: string | null) => {
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTenantInvoices = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await invoiceManagementApi.getTenantInvoices(tenantId)
      
      // Structure simple : response = { success, data: [...], message }
      if (response.success) {
        setInvoices(response.data || [])
      } else {
        setError("Failed to fetch tenant invoices")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to fetch tenant invoices")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    if (tenantId) {
      fetchTenantInvoices()
    }
  }, [tenantId, fetchTenantInvoices])

  const refresh = useCallback(() => {
    fetchTenantInvoices()
  }, [fetchTenantInvoices])

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'PAID').length
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus === 'PENDING').length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  return {
    invoices,
    loading,
    error,
    refresh,
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    totalAmount
  }
}

export const useUnpaidInvoices = () => {
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<UnpaidInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUnpaidInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [unpaidResponse, overdueResponse] = await Promise.all([
        invoiceManagementApi.getUnpaidInvoices(),
        invoiceManagementApi.getOverdueInvoices()
      ])
      
      // Structure simple : response = { success, data: [...] }
      if (unpaidResponse.success) {
        setUnpaidInvoices(unpaidResponse.data || [])
      }
      
      if (overdueResponse.success) {
        setOverdueInvoices(overdueResponse.data || [])
      }
      
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to fetch unpaid invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnpaidInvoices()
  }, [fetchUnpaidInvoices])

  const refresh = useCallback(() => {
    fetchUnpaidInvoices()
  }, [fetchUnpaidInvoices])

  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  return {
    unpaidInvoices,
    overdueInvoices,
    loading,
    error,
    refresh,
    totalUnpaidAmount,
    totalOverdueAmount
  }
}