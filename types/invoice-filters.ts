// types/invoice-filters.ts
export interface InvoiceFilters {
  search: string
  invoiceType: 'all' | 'STANDARD' | 'PREPAYE'
  status: 'all' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | 'DRAFT' | 'SENT' | 'REFUNDED' | 'CREDIT' | 'PREPAID'
  paymentStatus: 'all' | 'PAID' | 'PENDING' | 'FAILED' | 'PARTIAL' | 'REFUNDED'
  period: 'all' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom'
}

export interface InvoiceStats {
  total: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  currency: string
  unpaidCount: number
  overdueCount: number
  pendingCount: number
  paidCount: number
}

export interface InvoiceFilterOptions {
  invoiceTypes: Array<{
    value: InvoiceFilters['invoiceType']
    label: string
    icon?: string
  }>
  statuses: Array<{
    value: InvoiceFilters['status']
    label: string
    icon?: string
    color?: string
  }>
  paymentStatuses: Array<{
    value: InvoiceFilters['paymentStatus']
    label: string
    icon?: string
    color?: string
  }>
  periods: Array<{
    value: InvoiceFilters['period']
    label: string
    icon?: string
  }>
}

// Constantes pour les options de filtres
export const INVOICE_FILTER_OPTIONS: InvoiceFilterOptions = {
  invoiceTypes: [
    { value: 'all', label: 'Tous les types' },
    { value: 'STANDARD', label: 'Standard' },
    { value: 'PREPAYE', label: 'Prépayé' }
  ],
  statuses: [
    { value: 'all', label: 'Tous statuts' },
    { value: 'PAID', label: 'Payé', color: 'green' },
    { value: 'PENDING', label: 'En attente', color: 'yellow' },
    { value: 'OVERDUE', label: 'En retard', color: 'red' },
    { value: 'DRAFT', label: 'Brouillon', color: 'blue' },
    { value: 'CREDIT', label: 'Crédit', color: 'purple' }, // ← Ajouter
    { value: 'PREPAID', label: 'Prépayé', color: 'blue' }, 
    { value: 'SENT', label: 'Envoyé', color: 'blue' },
    { value: 'CANCELLED', label: 'Annulé', color: 'gray' },
    { value: 'REFUNDED', label: 'Remboursé', color: 'purple' }
  ],
  paymentStatuses: [
    { value: 'all', label: 'Tous paiements' },
    { value: 'PAID', label: 'Payé', color: 'green' },
    { value: 'PENDING', label: 'En attente', color: 'yellow' },
    { value: 'FAILED', label: 'Échoué', color: 'red' },
    { value: 'PARTIAL', label: 'Partiel', color: 'orange' },
    { value: 'REFUNDED', label: 'Remboursé', color: 'purple' }
  ],
  periods: [
    { value: 'all', label: 'Toutes périodes' },
    { value: 'last_month', label: 'Dernier mois' },
    { value: 'last_3_months', label: '3 derniers mois' },
    { value: 'last_6_months', label: '6 derniers mois' },
    { value: 'last_year', label: 'Dernière année' }
  ]
}