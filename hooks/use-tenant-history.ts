// hooks/use-tenant-history.ts
import { useState, useEffect, useCallback } from "react"
import { tenantStatusApi, StatusHistoryItem } from "@/lib/api/tenant-status"
import { tenantInvoicesApi, TenantInvoice } from "@/lib/api/tenant-invoices"

export const useTenantHistory = (tenantId: string) => {
  // Status History State
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([])
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Invoices State
  const [invoices, setInvoices] = useState<TenantInvoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)

  // Refresh triggers
  const [statusRefreshTrigger, setStatusRefreshTrigger] = useState(0)
  const [invoicesRefreshTrigger, setInvoicesRefreshTrigger] = useState(0)

  // ===============================================================================
  // FETCH STATUS HISTORY
  // ===============================================================================
  
  const fetchStatusHistory = useCallback(async () => {
    if (!tenantId) return

    try {
      setStatusLoading(true)
      setStatusError(null)
      
      console.log("🔍 Fetching status history for tenant:", tenantId)
      const response = await tenantStatusApi.getStatusHistory(tenantId)
      
      if (response.success) {
        console.log("✅ Status history fetched successfully:", response.data.status.length, "items")
        setStatusHistory(response.data.status)
      } else {
        console.error("❌ Status history response not successful:", response)
        setStatusError("Failed to fetch status history")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch status history:", err)
      
      if (err.response?.status === 401) {
        setStatusError("You don't have permission to view status history")
      } else if (err.response?.status === 404) {
        setStatusError("Tenant not found")
      } else if (err.response?.status === 403) {
        setStatusError("Access denied - insufficient permissions")
      } else {
        setStatusError(err.message || "Failed to fetch status history")
      }
    } finally {
      setStatusLoading(false)
    }
  }, [tenantId, statusRefreshTrigger])

  // ===============================================================================
  // FETCH INVOICES
  // ===============================================================================
  
  const fetchInvoices = useCallback(async () => {
    if (!tenantId) return

    try {
      setInvoicesLoading(true)
      setInvoicesError(null)
      
      console.log("🔍 Fetching invoices for tenant:", tenantId)
      const response = await tenantInvoicesApi.getTenantInvoices(tenantId)
      
      if (response.success) {
        console.log("✅ Invoices fetched successfully:", response.data.length, "items")
        setInvoices(response.data)
      } else {
        console.error("❌ Invoices response not successful:", response)
        setInvoicesError("Failed to fetch invoices")
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch invoices:", err)
      
      if (err.response?.status === 401) {
        setInvoicesError("You don't have permission to view invoices")
      } else if (err.response?.status === 404) {
        setInvoicesError("No invoices found for this tenant")
      } else if (err.response?.status === 403) {
        setInvoicesError("Access denied - insufficient permissions")
      } else {
        setInvoicesError(err.message || "Failed to fetch invoices")
      }
    } finally {
      setInvoicesLoading(false)
    }
  }, [tenantId, invoicesRefreshTrigger])

  // ===============================================================================
  // EFFECTS
  // ===============================================================================
  
  useEffect(() => {
    if (tenantId) {
      fetchStatusHistory()
    }
  }, [fetchStatusHistory])

  useEffect(() => {
    if (tenantId) {
      fetchInvoices()
    }
  }, [fetchInvoices])

  // ===============================================================================
  // REFRESH FUNCTIONS
  // ===============================================================================
  
  const refreshStatusHistory = useCallback(() => {
    if (tenantId) {
      console.log("🔄 Refreshing status history...")
      setStatusRefreshTrigger(prev => prev + 1)
    }
  }, [tenantId])

  const refreshInvoices = useCallback(() => {
    if (tenantId) {
      console.log("🔄 Refreshing invoices...")
      setInvoicesRefreshTrigger(prev => prev + 1)
    }
  }, [tenantId])

  const refreshAll = useCallback(() => {
    refreshStatusHistory()
    refreshInvoices()
  }, [refreshStatusHistory, refreshInvoices])

  return {
    // Status History
    statusHistory,
    statusLoading,
    statusError,
    refreshStatusHistory,
    
    // Invoices
    invoices,
    invoicesLoading,
    invoicesError,
    refreshInvoices,
    
    // Combined
    refreshAll
  }
}