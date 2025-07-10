// hooks/use-extend-plan.ts
import { useState, useCallback, useMemo } from "react"
import { AssignPlanFormState, AssignPlanRequest, SubscriptionPlan, PricingCalculation } from "@/types/assign-plan"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"

export const useExtendPlan = (tenantId: string, existingPlan: SubscriptionPlan | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<AssignPlanFormState>({
    selectedPlanId: '',
    selectedPlan: null,
    invoiceType: '',
    isPrepayeInvoiceContab: 0,
    isPrepayedInvoiceReason: '',
    billingMethod: '',
    startDate: null,
    endDate: null,
    customPrice: null,
    withReceipt: false,
    receiptFile: null,
    paidAmount: null,
    paymentMethod: '',
    paymentReference: '',
    paymentStatus: '',
    invoiceStatus: '',
    dueDate: null,
    autoRenewalEnabled: true,
    isAutoGracePeriod: true, // Par défaut automatique
    isManualGracePeriod: false, // Mutuellement exclusif
    manualGracePeriod: null,
    taxRate: 0.2, // 20% par défaut
    currentStep: 1,
    isValid: false,
    errors: {}
  })

  // ===============================================================================
  // CALCULS AUTOMATIQUES - COPIE EXACTE
  // ===============================================================================
  
  const pricingCalculation = useMemo((): PricingCalculation | null => {
    if (!formState.selectedPlan) return null

    // Selon le workflow : prix affiché seulement pour STANDARD et PREPAYE comptabilisé
    const shouldShowPricing = formState.invoiceType === 'STANDARD' || 
      (formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 1)

    if (!shouldShowPricing) return null

    let basePrice = 0
    
    if (formState.customPrice !== null) {
      // Prix personnalisé défini
      basePrice = formState.customPrice
    } else if (formState.billingMethod === 'MONTHLY') {
      basePrice = formState.selectedPlan.monthlyPrice
    } else if (formState.billingMethod === 'YEARLY') {
      basePrice = formState.selectedPlan.yearlyPrice
    } else {
      // Pour CUSTOM sans prix personnalisé, on ne peut pas calculer
      return null
    }

    const taxAmount = basePrice * formState.taxRate
    const totalPrice = basePrice + taxAmount
    const remainingAmount = formState.paidAmount ? Math.max(0, totalPrice - formState.paidAmount) : totalPrice

    return {
      basePrice,
      taxAmount,
      totalPrice,
      currency: formState.selectedPlan.currency,
      remainingAmount
    }
  }, [formState.selectedPlan, formState.customPrice, formState.billingMethod, formState.taxRate, formState.paidAmount, formState.invoiceType, formState.isPrepayeInvoiceContab])

  // ===============================================================================
  // CALCUL DES DATES AUTOMATIQUES - COPIE EXACTE
  // ===============================================================================
  
  const calculateDates = useCallback((billingMethod: string, startDate?: number) => {
    const start = startDate || Date.now()
    let end = start

    if (billingMethod === 'MONTHLY') {
      const date = new Date(start)
      date.setMonth(date.getMonth() + 1)
      end = date.getTime()
    } else if (billingMethod === 'YEARLY') {
      const date = new Date(start)
      date.setFullYear(date.getFullYear() + 1)
      end = date.getTime()
    }

    return { startDate: start, endDate: end }
  }, [])

  // ===============================================================================
  // MISE À JOUR DES CHAMPS - COPIE EXACTE
  // ===============================================================================
  
  const updateFormField = useCallback((field: keyof AssignPlanFormState, value: any) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value }

      // Logique de calcul automatique des dates
      if (field === 'billingMethod' && (value === 'MONTHLY' || value === 'YEARLY')) {
        const dates = calculateDates(value)
        newState.startDate = dates.startDate
        newState.endDate = dates.endDate
        
        if (newState.selectedPlan) {
          newState.customPrice = value === 'MONTHLY' 
            ? newState.selectedPlan.monthlyPrice 
            : newState.selectedPlan.yearlyPrice
        }
      }

      if (field === 'billingMethod' && value === 'CUSTOM') {
        // COPIE EXACTE D'ASSIGN-PLAN : Reset des dates pour permettre saisie manuelle
        newState.startDate = null
        newState.endDate = null
        newState.customPrice = null
      }

      // Fix: Logique mutuelle exclusive pour la période de grâce
      if (field === 'isAutoGracePeriod' && value) {
        newState.isManualGracePeriod = false
        newState.manualGracePeriod = null
      }

      if (field === 'isManualGracePeriod' && value) {
        newState.isAutoGracePeriod = false
      }

      if (field === 'paymentStatus' && value === 'PAID' && pricingCalculation) {
        newState.paidAmount = pricingCalculation.totalPrice
      }

      return newState
    })
  }, [calculateDates, pricingCalculation])

  const resetCustomPrice = useCallback(() => {
    updateFormField('customPrice', null)
  }, [updateFormField])

  // ===============================================================================
  // NAVIGATION ENTRE ÉTAPES - COMME ASSIGN PLAN
  // ===============================================================================
  
  const nextStep = useCallback(() => {
    let nextStepNumber = formState.currentStep + 1
    
    // Si on est à l'étape 2 et qu'on a choisi PREPAYE non comptabilisé, on saute l'étape 3
    if (formState.currentStep === 2 && formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 0) {
      nextStepNumber = 4 // Aller directement à l'étape 4
    }
    
    setFormState(prev => ({ ...prev, currentStep: nextStepNumber }))
  }, [formState.currentStep, formState.invoiceType, formState.isPrepayeInvoiceContab])

  const prevStep = useCallback(() => {
    let prevStepNumber = formState.currentStep - 1
    
    // Si on est à l'étape 4 et qu'on a PREPAYE non comptabilisé, on retourne à l'étape 2
    if (formState.currentStep === 4 && formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 0) {
      prevStepNumber = 2
    }
    
    setFormState(prev => ({ ...prev, currentStep: Math.max(1, prevStepNumber) }))
  }, [formState.currentStep, formState.invoiceType, formState.isPrepayeInvoiceContab])

  // ===============================================================================
  // VALIDATION - COPIE EXACTE
  // ===============================================================================
  
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    // Validation étape 1
    if (!formState.selectedPlanId) {
      errors.plan = "Veuillez sélectionner un plan"
    }

    // Validation étape 2
    if (!formState.invoiceType) {
      errors.invoiceType = "Veuillez choisir le type de facturation"
    }

    // Validation étape 3
    if (!formState.billingMethod) {
      errors.billingMethod = "Veuillez choisir la méthode de facturation"
    }

    if (formState.billingMethod === 'CUSTOM') {
      if (!formState.startDate) errors.startDate = "Date de début requise"
      if (!formState.endDate) errors.endDate = "Date de fin requise"
      if (!formState.customPrice) errors.customPrice = "Prix personnalisé requis"
    }

    // Validation étape 4 (si reçu)
    if (formState.withReceipt) {
      if (!formState.receiptFile) errors.receiptFile = "Fichier reçu requis"
      if (!formState.paymentMethod) errors.paymentMethod = "Méthode de paiement requise"
      if (!formState.paymentReference) errors.paymentReference = "Référence de paiement requise"
      if (!formState.paymentStatus) errors.paymentStatus = "Statut de paiement requis"
      
      if (formState.paidAmount && pricingCalculation) {
        if (formState.paidAmount > pricingCalculation.totalPrice) {
          errors.paidAmount = "Le montant payé ne peut pas dépasser le total"
        }
        if (formState.paidAmount < pricingCalculation.totalPrice && !formState.dueDate) {
          errors.dueDate = "Date d'échéance requise pour paiement partiel"
        }
      }
    }

    // Validation étape 5
    if (formState.isManualGracePeriod && !formState.manualGracePeriod) {
      errors.manualGracePeriod = "Période de grâce manuelle requise"
    }

    setFormState(prev => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }, [formState, pricingCalculation])

  // ===============================================================================
  // SOUMISSION - MODIFIÉE POUR EXTEND
  // ===============================================================================
  
  const submitExtendPlan = useCallback(async (): Promise<boolean> => {
    // Validation complète uniquement à la soumission finale
    if (!formState.selectedPlanId) {
      setError("Veuillez sélectionner un plan")
      return false
    }
    
    if (!formState.invoiceType) {
      setError("Veuillez choisir le type de facturation")
      return false
    }
    
    if (!formState.billingMethod) {
      setError("Veuillez choisir la méthode de facturation")
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const request: AssignPlanRequest = {
        tenantId,
        planId: formState.selectedPlanId,
        startDate: formState.startDate || undefined,
        endDate: formState.endDate || undefined,
        autoRenewalEnabled: formState.autoRenewalEnabled ? 1 : 0,
        billingMethod: formState.billingMethod,
        isAutoGracePeriod: formState.isAutoGracePeriod ? 1 : 0,
        isManualGracePeriod: formState.isManualGracePeriod ? 1 : 0,
        manualGracePeriod: formState.manualGracePeriod || undefined, // minuscule pour backend
        invoiceType: formState.invoiceType,
        isPrepayeInvoiceContab: formState.invoiceType === 'PREPAYE' ? formState.isPrepayeInvoiceContab : undefined,
        isPrepayedInvoiceReason: formState.invoiceType === 'PREPAYE' ? formState.isPrepayedInvoiceReason : undefined,
        isCustomPrize: formState.customPrice || undefined,
        taxeRate: formState.taxRate,
        withRecus: formState.withReceipt ? 1 : 0,
        invoiceStatus: formState.invoiceStatus || undefined,
        dueDate: formState.dueDate || undefined,
        paidAmount: formState.paidAmount || undefined,
        paymentMethod: formState.paymentMethod || undefined,
        paymentReference: formState.paymentReference || undefined,
        paymentStatus: formState.paymentStatus || undefined
      }

      console.log("🔍 Submitting extend plan request:", request)

      // SEULE DIFFÉRENCE : utiliser extendPlan au lieu d'assignPlan
      const response = await tenantSubscriptionApi.extendPlan(request, formState.receiptFile || undefined)

      if (response.success) {
        console.log("✅ Plan extended successfully:", response.data)
        return true
      } else {
        setError("Échec de l'extension du plan")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error extending plan:", err)
      setError(err.response?.data?.error || err.message || "Erreur lors de l'extension du plan")
      return false
    } finally {
      setLoading(false)
    }
  }, [tenantId, formState, validateForm])

  return {
    formState,
    loading,
    error,
    pricingCalculation,
    updateFormField,
    resetCustomPrice,
    nextStep,
    prevStep,
    submitExtendPlan,
    validateForm
  }
}