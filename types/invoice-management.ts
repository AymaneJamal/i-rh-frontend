// types/invoice-management.ts - MISE À JOUR POUR CORRESPONDRE AU MODÈLE JAVA INVOICE

import { BillingType, InvoiceTemplate, InvoiceStatus, PaymentStatus, PaymentMethod, Currency } from "@/lib/constants"

// ===============================================================================
// INTERFACE PRINCIPALE INVOICE (correspond au modèle Java)
// ===============================================================================

export interface Invoice {
  // Identifiants et informations de base
  invoiceId: string
  invoiceNumber: string // Numéro de facture lisible (INV-2024-001)
  tenantId: string
  tenantName: string
  
  // Informations temporelles
  issueDate: number // Date d'émission
  dueDate: number | null // Date d'échéance
  paidDate: number | null // Date de paiement (null si pas payé)
  createdAt: number
  modifiedAt: number | null
  modifiedBy: string | null
  
  // Informations du plan et de la période
  planId: string
  planName: string
  billingPeriodStart: number
  billingPeriodEnd: number
  billingType: string // MONTHLY, YEARLY, PRORATA, UPGRADE, DOWNGRADE
  
  // Montants et calculs financiers
  subtotalAmount: number
  taxAmount: number
  taxRate: number // Taux de taxe appliqué (ex: 0.20 pour 20%)
  totalAmount: number
  currency: string | null // Devise (EUR, USD, MAD, etc.)
  discountAmount: number
  discountReason: string | null
  
  // Détails des lignes de facturation
  lineItems: any[] | null // List<Map<String, Object>> en Java
  
  // Statut et paiement
  status: string // DRAFT, SENT, PAID, OVERDUE, CANCELLED, REFUNDED
  paymentStatus: string // PENDING, PAID, FAILED, PARTIAL, REFUNDED
  paymentMethod: string | null // CREDIT_CARD, BANK_TRANSFER, PAYPAL, etc.
  paymentReference: string | null
  paidAmount: number
  remainingAmount: number
  
  // Informations de facturation du client
  billingEmail: string
  billingName: string
  billingAddress: any // Map<String, Object> en Java
  vatNumber: string | null
  
  // Documents et fichiers associés
  pdfFileUrl: string | null
  s3BucketName: string | null
  s3Key: string | null
  attachments: any[] | null // List<Map<String, String>> en Java
  
  // Informations de génération et envoi
  generatedBy: string
  sentDate: number | null
  emailSent: number | null // 0 = Non envoyé, 1 = Envoyé
  emailSentTo: string | null
  remindersSent: number | null
  lastReminderDate: number | null
  
  // Informations comptables et légales
  fiscalYear: string | null
  legalEntity: string | null
  invoiceTemplate: string | null
  notes: string | null
  termsAndConditions: string | null
  
  // Traçabilité et audit
  auditTrail: any[] | null // List<Map<String, Object>> en Java
  parentInvoiceId: string | null
  invoiceType: string // STANDARD, PREPAYE
  isPrepayedInvoiceReason: string | null
  isPrepayeInvoiceContab: number
  isRecurring: number | null // 0 = Non, 1 = Facture récurrente
  recurringSchedule: string | null
  
  // Informations de crédit et remboursement
  creditReason: string | null
  refundAmount: number | null
  refundDate: number | null
  refundReason: string | null
  
  // Attributs de paiements (du modèle Invoice Java)
  autoRenewalEnabled: number | null // 0 = Désactivé, 1 = Activé
  isAutoGracePeriod: number | null
  isManualGracePeriod: number | null
  manualGracePeriodSetBy: string | null
  manualGracePeriodSetAt: number | null
  manualGracePeriodModifiedAt: number | null
  gracePeriodStartDate: number | null
  gracePeriodEndDate: number | null
}

// ===============================================================================
// INTERFACES POUR LES RÉPONSES API
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
// INTERFACES POUR L'HISTORIQUE DES FACTURES
// ===============================================================================

export interface InvoiceHistoryItem {
  invoiceId: string
  invoiceNumber: string
  issueDate: number
  dueDate: number | null
  totalAmount: number
  currency: string | null
  status: string
  paymentStatus: string
  paidDate?: number
  paidAmount?: number
  paymentMethod?: string
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
// INTERFACES POUR L'UPLOAD DE REÇUS
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
// INTERFACES POUR LES PAIEMENTS
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
// INTERFACES POUR LES FACTURES IMPAYÉES ET EN RETARD
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
// INTERFACES POUR LES RAPPELS
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
// INTERFACES POUR LE DASHBOARD FINANCIER
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
    stats: FinancialStats
    criticalTenants: CriticalTenants
    recentActivity: RecentActivity[]
  }
  message: string
  requestId: string
  timestamp: number
}