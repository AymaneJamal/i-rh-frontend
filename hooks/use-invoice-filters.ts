// hooks/use-invoice-filters.ts
import { useState, useMemo } from "react"
import { Invoice } from "@/hooks/use-tenant-invoices" // ← Importer Invoice au lieu de TenantInvoice

export interface InvoiceFilters {
  search: string
  invoiceType: 'all' | 'STANDARD' | 'PREPAYE'
  status: 'all' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | 'DRAFT' | 'CREDIT' | 'PREPAID'
  paymentStatus: 'all' | 'PAID' | 'PENDING' | 'FAILED' | 'PARTIAL' | 'REFUNDED'
  period: 'all' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom'
}

export const useInvoiceFilters = (invoices: Invoice[]) => { // ← Changer TenantInvoice[] par Invoice[]
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    invoiceType: 'all',
    status: 'all',
    paymentStatus: 'all',
    period: 'all'
  })

  // Fonction pour filtrer les factures selon les critères
  const filterInvoices = (invoices: Invoice[], filters: InvoiceFilters): Invoice[] => { // ← Changer TenantInvoice[] par Invoice[]
    if (!invoices) return []
    
    return invoices.filter(invoice => {
      // Filtre par recherche (numéro de facture, plan, ID)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || ''
        const planName = invoice.planName?.toLowerCase() || ''
        const invoiceId = invoice.invoiceId?.toLowerCase() || ''
        
        if (!invoiceNumber.includes(searchTerm) && 
            !planName.includes(searchTerm) && 
            !invoiceId.includes(searchTerm)) {
          return false
        }
      }
      
      // Filtre par type de facture
      if (filters.invoiceType !== 'all') {
        // Utiliser une valeur par défaut si invoiceType n'existe pas
        const invoiceType = invoice.invoiceType || 'STANDARD'
        if (invoiceType !== filters.invoiceType) {
          return false
        }
      }
      
      // Filtre par statut
      if (filters.status !== 'all') {
        if (invoice.status !== filters.status) {
          return false
        }
      }
      
      // Filtre par statut de paiement
      if (filters.paymentStatus !== 'all') {
        if (invoice.paymentStatus !== filters.paymentStatus) {
          return false
        }
      }
      
      // Filtre par période
      if (filters.period !== 'all') {
        const now = Date.now()
        // Utiliser issueDate si billingPeriodStart n'existe pas
        const invoiceDate = invoice.billingPeriodStart || invoice.issueDate
        
        switch (filters.period) {
          case 'last_month':
            if (invoiceDate < now - (30 * 24 * 60 * 60 * 1000)) return false
            break
          case 'last_3_months':
            if (invoiceDate < now - (90 * 24 * 60 * 60 * 1000)) return false
            break
          case 'last_6_months':
            if (invoiceDate < now - (180 * 24 * 60 * 60 * 1000)) return false
            break
          case 'last_year':
            if (invoiceDate < now - (365 * 24 * 60 * 60 * 1000)) return false
            break
        }
      }
      
      return true
    })
  }

  // Calcul des factures filtrées et triées
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = filterInvoices(invoices, filters)
    // Trier par date de période de début (plus récent au plus ancien)
    // Utiliser billingPeriodStart si disponible, sinon issueDate
    return filtered.sort((a, b) => {
      const dateA = a.billingPeriodStart || a.issueDate
      const dateB = b.billingPeriodStart || b.issueDate
      return dateB - dateA
    })
  }, [invoices, filters])

  // Calcul des statistiques sur les factures filtrées
  const stats = useMemo(() => {
  return {
    total: filteredAndSortedInvoices.length,
    totalAmount: filteredAndSortedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: filteredAndSortedInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0), // ← Ajouter || 0
    remainingAmount: filteredAndSortedInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0),
    currency: filteredAndSortedInvoices[0]?.currency || 'MAD',
    unpaidCount: filteredAndSortedInvoices.filter(inv => (inv.remainingAmount || 0) > 0).length,
    overdueCount: filteredAndSortedInvoices.filter(inv => 
      inv.status === 'OVERDUE' || 
      (inv.dueDate && inv.dueDate < Date.now() && inv.paymentStatus !== 'PAID')
    ).length
  }
}, [filteredAndSortedInvoices])

  // Fonctions helper pour l'interface
  const updateFilters = (newFilters: Partial<InvoiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      invoiceType: 'all',
      status: 'all',
      paymentStatus: 'all',
      period: 'all'
    })
  }

  const hasActiveFilters = filters.search || 
    filters.invoiceType !== 'all' || 
    filters.status !== 'all' || 
    filters.paymentStatus !== 'all' || 
    filters.period !== 'all'

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    filteredAndSortedInvoices,
    stats,
    originalInvoices: invoices
  }
}