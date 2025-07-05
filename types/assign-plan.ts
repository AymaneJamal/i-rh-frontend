// types/assign-plan.ts

export interface AssignPlanRequest {
  // Identifiants
  tenantId: string
  planId: string

  // Dates de période
  startDate?: number // Optionnel, par défaut = maintenant
  endDate?: number   // Optionnel, calculé selon le plan

  // Configuration du renouvellement
  autoRenewalEnabled: number // 0=Non, 1=Oui
  billingMethod: string // MONTHLY, YEARLY, CUSTOM

  // Périodes de grâce
  isAutoGracePeriod: number // 0=Non, 1=Oui
  isManualGracePeriod: number // 0=Non, 1=Oui (si admin donne grâce manuelle)
  manualGracePeriod?: number // minuscule comme backend

  // Informations de paiement
  invoiceType: string // STANDARD, PREPAYE
  isPrepayeInvoiceContab?: number // Pour PREPAYE uniquement
  isPrepayedInvoiceReason?: string // Raison du prépaiement
  isCustomPrize?: number // Prix custom
  taxeRate: number

  // Informations de facturation
  withRecus: number // 0=Non, 1=Oui
  invoiceStatus?: string // PAID, PENDING, OVERDUE
  dueDate?: number // Date d'échéance de la facture
  paidAmount?: number // Montant payé
  paymentMethod?: string // CREDIT_CARD, BANK_TRANSFER, etc.
  paymentReference?: string // Référence du paiement
  paymentStatus?: string // PAID, PENDING, FAILED

  // Métadonnées
  additionalInfo?: Record<string, string>
  notes?: string
}

export interface AssignPlanResponse {
  requestId: string
  data: {
    assignPlanToTenantResult: {
      assignment: {
        tenantName: string
        endDate: number
        billingMethod: string
        tenantId: string
        planName: string
        planId: string
        startDate: number
      }
      success: boolean
      payment: {
        outstandingAmount: number | null
        paidAmount: number | null
        status: string | null
      }
      invoice: {
        totalAmount: number
        dueDate: number
        invoiceNumber: string
        invoiceId: string
        currency: string
        status: string
      }
      tenantUpdates: {
        nextBillingDate: number
        currentPlanPrice: number
        planStartDate: number
        planExpiryDate: number
        status: string
      }
    }
  }
  success: boolean
  message: string
  timestamp: number
}

// États du formulaire multi-étapes
export interface AssignPlanFormState {
  // Étape 1: Sélection du plan
  selectedPlanId: string
  selectedPlan: SubscriptionPlan | null

  // Étape 2: Type de facturation
  invoiceType: 'STANDARD' | 'PREPAYE' | ''
  isPrepayeInvoiceContab: number
  isPrepayedInvoiceReason: string

  // Étape 3: Configuration billing
  billingMethod: 'MONTHLY' | 'YEARLY' | 'CUSTOM' | ''
  startDate: number | null
  endDate: number | null
  customPrice: number | null

  // Étape 4: Informations de paiement
  withReceipt: boolean
  receiptFile: File | null
  paidAmount: number | null
  paymentMethod: string
  paymentReference: string
  paymentStatus: 'PAID' | 'PENDING' | ''
  invoiceStatus: 'PAID' | 'PENDING' | 'OVERDUE' | ''
  dueDate: number | null

  // Étape 5: Configuration avancée
  autoRenewalEnabled: boolean
  isAutoGracePeriod: boolean
  isManualGracePeriod: boolean
  manualGracePeriod: number | null // minuscule pour correspondre au backend
  taxRate: number

  // État du formulaire
  currentStep: number
  isValid: boolean
  errors: Record<string, string>
}

// Plans depuis l'API /api/subscriptions/plans
export interface SubscriptionPlan {
  planId: string
  planName: string
  description: string
  category: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  maxDatabaseStorageMB: number
  maxS3StorageMB: number
  maxUsers: number
  maxEmployees: number
  maxDepartments: number
  maxReports: number
  hrFeatures: Record<string, boolean>
  hrLimits: Record<string, number>
  status: string
  isPublic: number
  isRecommended: number
  gracePeriodDays: number
  includedModules: string[]
  customAttributes: Record<string, string>
  termsAndConditions: string
}

// Calculs en temps réel
export interface PricingCalculation {
  basePrice: number // Prix HT
  taxAmount: number // Montant de la taxe
  totalPrice: number // Prix TTC
  currency: string
  remainingAmount: number // Montant restant si paiement partiel
}

// Options de paiement
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Carte de crédit',
  BANK_TRANSFER: 'Virement bancaire',
  CHECK: 'Chèque',
  CASH: 'Espèces',
  PAYPAL: 'PayPal'
} as const

export const BILLING_METHODS = {
  MONTHLY: 'Mensuel',
  YEARLY: 'Annuel', 
  CUSTOM: 'Personnalisé'
} as const

export const INVOICE_TYPES = {
  STANDARD: 'Facturation Standard',
  PREPAYE: 'Facturation Prépayée'
} as const