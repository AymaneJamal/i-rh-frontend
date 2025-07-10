// components/modals/extend-plan-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { useExtendPlan } from "@/hooks/use-extend-plan"
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { SubscriptionPlan, PAYMENT_METHODS, BILLING_METHODS, INVOICE_TYPES } from "@/types/assign-plan"
import { Currency } from "@/lib/constants"
import {
  CreditCard,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Crown,
  Plus,
  Calendar,
  DollarSign,
  Settings,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Calculator
} from "lucide-react"

interface ExtendPlanModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  existingPlan: any
  onPlanExtended: () => void
}

// Helper function pour éviter les erreurs de type Currency
const formatPrice = (amount: number, currency: string): string => {
  return formatCurrency(amount, currency as Currency)
}

export function ExtendPlanModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  existingPlan,
  onPlanExtended
}: ExtendPlanModalProps) {
  const { plans, loading: plansLoading, error: plansError } = useSubscriptionPlans({ publicOnly: true })
  const {
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
  } = useExtendPlan(tenantId, existingPlan)

  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    if (!loading) {
      setSuccess(false)
      onClose()
    }
  }

  const handleSubmit = async () => {
    const result = await submitExtendPlan()
    if (result) {
      setSuccess(true)
      setTimeout(() => {
        onPlanExtended()
        handleClose()
      }, 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        updateFormField('errors', { ...formState.errors, receiptFile: "Le fichier ne doit pas dépasser 2MB" })
        return
      }
      updateFormField('receiptFile', file)
    }
  }

  // ===============================================================================
  // RENDU DES ÉTAPES
  // ===============================================================================

  const renderCurrentStep = () => {
    switch (formState.currentStep) {
      case 1: return renderStepPlanSelection()
      case 2: return renderStepInvoiceType()
      case 3: return renderStepBillingMethod()
      case 4: return renderStepConfiguration()
      case 5: return renderStepGracePeriod()
      default: return null
    }
  }

  // ===============================================================================
  // ÉTAPE 1: SÉLECTION DU PLAN (MODIFIÉE POUR EXTEND)
  // ===============================================================================
  
  const renderStepPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Plan sélectionné</h3>
        <p className="text-gray-600">Extension du plan actuel pour {tenantName}</p>
      </div>

      {/* Affichage du plan existant */}
      {existingPlan && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {/* Trouver le plan complet depuis la liste */}
            {plans.find(p => p.planId === existingPlan.id) ? (
              <Card className="ring-2 ring-blue-500 bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-lg">{plans.find(p => p.planId === existingPlan.id)?.planName}</CardTitle>
                        <p className="text-sm text-gray-600">{plans.find(p => p.planId === existingPlan.id)?.description}</p>
                      </div>
                    </div>
                    <Badge variant="default">Plan actuel</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prix mensuel:</span>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(plans.find(p => p.planId === existingPlan.id)?.monthlyPrice || 0, plans.find(p => p.planId === existingPlan.id)?.currency || 'MAD')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Prix annuel:</span>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(plans.find(p => p.planId === existingPlan.id)?.yearlyPrice || 0, plans.find(p => p.planId === existingPlan.id)?.currency || 'MAD')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Utilisateurs max:</span>
                      <p>{plans.find(p => p.planId === existingPlan.id)?.maxUsers}</p>
                    </div>
                    <div>
                      <span className="font-medium">Employés max:</span>
                      <p>{plans.find(p => p.planId === existingPlan.id)?.maxEmployees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Chargement des informations du plan...</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ===============================================================================
  // ÉTAPE 2: TYPE DE FACTURATION - COPIE EXACTE
  // ===============================================================================
  
  const renderStepInvoiceType = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Type de facturation</h3>
        <p className="text-gray-600">Comment souhaitez-vous facturer cette extension ?</p>
      </div>

      <RadioGroup 
        value={formState.invoiceType} 
        onValueChange={(value) => updateFormField('invoiceType', value)}
      >
        {Object.entries(INVOICE_TYPES).map(([type, label]) => (
          <div key={type} className="flex items-center space-x-2">
            <RadioGroupItem value={type} id={type} />
            <Label htmlFor={type} className="flex-1 cursor-pointer">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <h4 className="font-medium">{label}</h4>
                <p className="text-sm text-gray-600">
                  {type === 'STANDARD' 
                    ? 'Facturation standard avec paiement différé' 
                    : 'Facturation prépayée - paiement déjà effectué'}
                </p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {formState.invoiceType === 'PREPAYE' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prepaye-comptabilise"
              checked={formState.isPrepayeInvoiceContab === 1}
              onCheckedChange={(checked) => updateFormField('isPrepayeInvoiceContab', checked ? 1 : 0)}
            />
            <Label htmlFor="prepaye-comptabilise">
              Extension comptabilisée (avec montant)
            </Label>
          </div>

          <div>
            <Label htmlFor="prepaye-reason">Raison de l'extension prépayée *</Label>
            <Textarea
              id="prepaye-reason"
              placeholder="Expliquez pourquoi cette extension est prépayée..."
              value={formState.isPrepayedInvoiceReason}
              onChange={(e) => updateFormField('isPrepayedInvoiceReason', e.target.value)}
              className={formState.errors.isPrepayedInvoiceReason ? 'border-red-300' : ''}
            />
            {formState.errors.isPrepayedInvoiceReason && (
              <p className="text-sm text-red-600 mt-1">{formState.errors.isPrepayedInvoiceReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ===============================================================================
  // ÉTAPE 3: MÉTHODE DE FACTURATION - COMME ASSIGN PLAN
  // ===============================================================================
  
  const renderStepBillingMethod = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Méthode de facturation</h3>
        <p className="text-gray-600">Choisissez la durée de l'extension</p>
      </div>

      <RadioGroup 
        value={formState.billingMethod} 
        onValueChange={(value) => updateFormField('billingMethod', value)}
      >
        {Object.entries(BILLING_METHODS).map(([method, label]) => (
          <div key={method} className="flex items-center space-x-2">
            <RadioGroupItem value={method} id={method} />
            <Label htmlFor={method} className="flex-1 cursor-pointer">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{label}</h4>
                    <p className="text-sm text-gray-600">
                      {method === 'MONTHLY' 
                        ? 'Extension d\'un mois' 
                        : method === 'YEARLY' 
                        ? 'Extension d\'une année' 
                        : 'Période personnalisée'}
                    </p>
                  </div>
                  {existingPlan && plans.find(p => p.planId === existingPlan.id) && method !== 'CUSTOM' && (
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {method === 'MONTHLY' 
                          ? formatPrice(plans.find(p => p.planId === existingPlan.id)?.monthlyPrice || 0, plans.find(p => p.planId === existingPlan.id)?.currency || 'MAD')
                          : formatPrice(plans.find(p => p.planId === existingPlan.id)?.yearlyPrice || 0, plans.find(p => p.planId === existingPlan.id)?.currency || 'MAD')
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {method === 'MONTHLY' ? 'par mois' : 'par an'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {formState.errors.billingMethod && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formState.errors.billingMethod}</AlertDescription>
        </Alert>
      )}

      {/* Debug info pour développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Méthode sélectionnée: {formState.billingMethod || 'Aucune'}
        </div>
      )}
    </div>
  )

  // ===============================================================================
  // ÉTAPE 4: CONFIGURATION - SELON WORKFLOW COMME ASSIGN PLAN
  // ===============================================================================
  
  const renderStepConfiguration = () => {
    // Déterminer si on affiche les champs selon le workflow
    const showBillingMethod = formState.invoiceType === 'STANDARD' || 
      (formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 1) ||
      (formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 0)

    const showPricing = formState.invoiceType === 'STANDARD' || 
      (formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 1)

    const showOnlyDates = formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 0

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {formState.invoiceType === 'PREPAYE' && formState.isPrepayeInvoiceContab === 0 
              ? "Configuration Prépayée" 
              : "Configuration"}
          </h3>
          <p className="text-gray-600">Configurez les détails de l'extension</p>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h4 className="font-medium">Période d'extension</h4>
          
          {formState.billingMethod !== 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début (automatique)</Label>
                <Input
                  type="text"
                  value={formState.startDate ? formatDate(formState.startDate) : ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Date de fin (automatique)</Label>
                <Input
                  type="text"
                  value={formState.endDate ? formatDate(formState.endDate) : ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {formState.billingMethod === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début *</Label>
                <Input
                  type="date"
                  value={formState.startDate ? new Date(formState.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormField('startDate', new Date(e.target.value).getTime())}
                  className={formState.errors.startDate ? 'border-red-300' : ''}
                />
                {formState.errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{formState.errors.startDate}</p>
                )}
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Input
                  type="date"
                  value={formState.endDate ? new Date(formState.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormField('endDate', new Date(e.target.value).getTime())}
                  className={formState.errors.endDate ? 'border-red-300' : ''}
                />
                {formState.errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{formState.errors.endDate}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION PRICING - Seulement pour STANDARD et PREPAYE comptabilisé */}
        {showPricing && (
          <div className="space-y-4">
            {formState.billingMethod !== 'CUSTOM' && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Prix du plan:</p>
                <p className="text-lg font-semibold">
                  {formState.billingMethod === 'MONTHLY' && formState.selectedPlan && formatPrice(formState.selectedPlan.monthlyPrice, formState.selectedPlan.currency)}
                  {formState.billingMethod === 'YEARLY' && formState.selectedPlan && formatPrice(formState.selectedPlan.yearlyPrice, formState.selectedPlan.currency)}
                </p>
              </div>
            )}

            <div>
              <Label>
                {formState.billingMethod === 'CUSTOM' ? 'Prix personnalisé *' : 'Prix (modifiable)'}
              </Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formState.customPrice || ''}
                  onChange={(e) => updateFormField('customPrice', parseFloat(e.target.value) || null)}
                  className={formState.errors.customPrice ? 'border-red-300' : ''}
                />
                {formState.billingMethod !== 'CUSTOM' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetCustomPrice}
                    size="sm"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
              {formState.errors.customPrice && (
                <p className="text-sm text-red-600 mt-1">{formState.errors.customPrice}</p>
              )}
            </div>

            <div>
              <Label>Taux de taxe (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formState.taxRate * 100}
                onChange={(e) => updateFormField('taxRate', parseFloat(e.target.value) / 100 || 0)}
              />
            </div>

            {/* Résumé des prix */}
            {pricingCalculation && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Résumé des coûts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prix de base:</span>
                    <span>{formatPrice(pricingCalculation.basePrice, pricingCalculation.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxe ({(formState.taxRate * 100).toFixed(1)}%):</span>
                    <span>{formatPrice(pricingCalculation.taxAmount, pricingCalculation.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Configuration du reçu pour STANDARD */}
        {formState.invoiceType === 'STANDARD' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="with-receipt"
                checked={formState.withReceipt}
                onCheckedChange={(checked) => updateFormField('withReceipt', checked)}
              />
              <Label htmlFor="with-receipt">
                J'ai un justificatif de paiement à joindre
              </Label>
            </div>

            {formState.withReceipt && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="receipt-file">Fichier justificatif *</Label>
                  <Input
                    id="receipt-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className={formState.errors.receiptFile ? 'border-red-300' : ''}
                  />
                  {formState.errors.receiptFile && (
                    <p className="text-sm text-red-600 mt-1">{formState.errors.receiptFile}</p>
                  )}
                  {formState.receiptFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Fichier sélectionné: {formState.receiptFile.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Méthode de paiement *</Label>
                    <Select 
                      value={formState.paymentMethod} 
                      onValueChange={(value) => updateFormField('paymentMethod', value)}
                    >
                      <SelectTrigger className={formState.errors.paymentMethod ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHODS).map(([method, label]) => (
                          <SelectItem key={method} value={method}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formState.errors.paymentMethod && (
                      <p className="text-sm text-red-600 mt-1">{formState.errors.paymentMethod}</p>
                    )}
                  </div>

                  <div>
                    <Label>Référence de paiement *</Label>
                    <Input
                      placeholder="Numéro de transaction..."
                      value={formState.paymentReference}
                      onChange={(e) => updateFormField('paymentReference', e.target.value)}
                      className={formState.errors.paymentReference ? 'border-red-300' : ''}
                    />
                    {formState.errors.paymentReference && (
                      <p className="text-sm text-red-600 mt-1">{formState.errors.paymentReference}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Statut du paiement *</Label>
                    <Select 
                      value={formState.paymentStatus} 
                      onValueChange={(value) => updateFormField('paymentStatus', value)}
                    >
                      <SelectTrigger className={formState.errors.paymentStatus ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">Payé</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="PARTIAL">Partiel</SelectItem>
                      </SelectContent>
                    </Select>
                    {formState.errors.paymentStatus && (
                      <p className="text-sm text-red-600 mt-1">{formState.errors.paymentStatus}</p>
                    )}
                  </div>

                  {pricingCalculation && (
                    <div>
                      <Label>Montant payé *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={pricingCalculation.totalPrice}
                        placeholder={`Max: ${formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}`}
                        value={formState.paidAmount || ''}
                        onChange={(e) => updateFormField('paidAmount', parseFloat(e.target.value) || null)}
                        className={formState.errors.paidAmount ? 'border-red-300' : ''}
                      />
                      {formState.errors.paidAmount && (
                        <p className="text-sm text-red-600 mt-1">{formState.errors.paidAmount}</p>
                      )}
                    </div>
                  )}
                </div>

                {pricingCalculation && formState.paidAmount && formState.paidAmount < pricingCalculation.totalPrice && (
                  <div>
                    <Label>Date d'échéance pour le solde *</Label>
                    <Input
                      type="date"
                      value={formState.dueDate ? new Date(formState.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateFormField('dueDate', new Date(e.target.value).getTime())}
                      className={formState.errors.dueDate ? 'border-red-300' : ''}
                    />
                    {formState.errors.dueDate && (
                      <p className="text-sm text-red-600 mt-1">{formState.errors.dueDate}</p>
                    )}
                    <p className="text-sm text-amber-600 mt-1">
                      Solde restant: {formatPrice(pricingCalculation.remainingAmount, pricingCalculation.currency)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!formState.withReceipt && (
              <div>
                <Label>Date d'échéance *</Label>
                <Input
                  type="date"
                  value={formState.dueDate ? new Date(formState.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormField('dueDate', new Date(e.target.value).getTime())}
                  className={formState.errors.dueDate ? 'border-red-300' : ''}
                />
                {formState.errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">{formState.errors.dueDate}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Debug pour développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
            <p>Debug - Type: {formState.invoiceType}</p>
            <p>Comptabilisé: {formState.isPrepayeInvoiceContab}</p>
            <p>Show pricing: {showPricing.toString()}</p>
            <p>Show only dates: {showOnlyDates.toString()}</p>
          </div>
        )}
      </div>
    )
  }

  // ===============================================================================
  // ÉTAPE 5: PÉRIODE DE GRÂCE - COMME ASSIGN PLAN (UN SEUL CHOIX)
  // ===============================================================================
  
  const renderStepGracePeriod = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Configuration finale</h3>
        <p className="text-gray-600">Paramètres de renouvellement et période de grâce</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-renewal"
            checked={formState.autoRenewalEnabled}
            onCheckedChange={(checked) => updateFormField('autoRenewalEnabled', checked)}
          />
          <Label htmlFor="auto-renewal" className="text-sm">
            Activer le renouvellement automatique
          </Label>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Période de grâce</h4>
          
          <RadioGroup
            value={formState.isAutoGracePeriod ? 'auto' : formState.isManualGracePeriod ? 'manual' : ''}
            onValueChange={(value) => {
              if (value === 'auto') {
                updateFormField('isAutoGracePeriod', true)
                updateFormField('isManualGracePeriod', false)
                updateFormField('manualGracePeriod', null)
              } else if (value === 'manual') {
                updateFormField('isAutoGracePeriod', false)
                updateFormField('isManualGracePeriod', true)
              }
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto-grace" />
              <Label htmlFor="auto-grace" className="text-sm">
                Période de grâce automatique (selon le plan)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual-grace" />
              <Label htmlFor="manual-grace" className="text-sm">
                Période de grâce personnalisée
              </Label>
            </div>
          </RadioGroup>

          {formState.isManualGracePeriod && (
            <div className="pl-6">
              <Label>Durée de la période de grâce (jours) *</Label>
              <Input
                type="number"
                min="1"
                max="365"
                placeholder="Ex: 30"
                value={formState.manualGracePeriod || ''}
                onChange={(e) => updateFormField('manualGracePeriod', parseInt(e.target.value) || null)}
                className={formState.errors.manualGracePeriod ? 'border-red-300' : ''}
              />
              {formState.errors.manualGracePeriod && (
                <p className="text-sm text-red-600 mt-1">{formState.errors.manualGracePeriod}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Résumé final */}
      {formState.selectedPlan && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Résumé de l'extension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Tenant:</span>
                <p>{tenantName}</p>
              </div>
              <div>
                <span className="font-medium">Plan:</span>
                <p>{formState.selectedPlan.planName}</p>
              </div>
              <div>
                <span className="font-medium">Type facturation:</span>
                <p>{INVOICE_TYPES[formState.invoiceType as keyof typeof INVOICE_TYPES]}</p>
              </div>
              <div>
                <span className="font-medium">Méthode:</span>
                <p>{BILLING_METHODS[formState.billingMethod as keyof typeof BILLING_METHODS]}</p>
              </div>
              <div>
                <span className="font-medium">Période:</span>
                <p>
                  {formState.startDate && formatDate(formState.startDate)} → {formState.endDate && formatDate(formState.endDate)}
                </p>
              </div>
              <div>
                <span className="font-medium">Total TTC:</span>
                <p className="text-lg font-bold text-green-700">
                  {pricingCalculation && formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ===============================================================================
  // NAVIGATION ET FOOTER - COPIE EXACTE
  // ===============================================================================
  
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= formState.currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  )

  const getStepTitle = () => {
    switch (formState.currentStep) {
      case 1: return 'Plan sélectionné'
      case 2: return 'Type de facturation'
      case 3: return 'Méthode de facturation'
      case 4: return 'Configuration'
      case 5: return 'Finalisation'
      default: return 'Extension de plan'
    }
  }

  const canGoNext = () => {
    switch (formState.currentStep) {
      case 1: 
        return formState.selectedPlanId !== ''
      
      case 2: 
        if (formState.invoiceType === 'PREPAYE') {
          return !!formState.invoiceType && formState.isPrepayedInvoiceReason.trim() !== ''
        }
        return formState.invoiceType !== ''
      
      case 3: 
        // DIFFÉRENCE AVEC ASSIGN-PLAN : Dans extend-plan, étapes séparées
        // Étape 3 = juste méthode, Étape 4 = configuration
        // Donc pour tous les types, juste vérifier la méthode
        return formState.billingMethod !== ''
      
      case 4: 
        // AJUSTÉ POUR EXTEND-PLAN : Validation différée depuis étape 3
        // Pour STANDARD - Valider dates/prix + Due date
        if (formState.invoiceType === 'STANDARD') {
          // D'abord valider dates et prix (qui étaient à l'étape 3 dans assign-plan)
          if (formState.billingMethod === 'CUSTOM') {
            const hasDates = formState.startDate !== null && formState.endDate !== null
            const datesValid = formState.startDate && formState.endDate ? formState.endDate > formState.startDate : false
            const hasCustomPrice = formState.customPrice !== null
            
            if (!hasDates || !datesValid || !hasCustomPrice) {
              return false
            }
          }
          
          // Ensuite valider due date (logique originale)
          if (!formState.withReceipt) {
            // Pas de reçu = due date obligatoire
            return formState.dueDate !== null
          } else {
            // Avec reçu - vérifier si couvre tout le montant
            if (pricingCalculation && formState.paidAmount !== null) {
              const coversFull = formState.paidAmount >= pricingCalculation.totalPrice
              return coversFull || formState.dueDate !== null
            }
            return formState.dueDate !== null
          }
        }
        
        // Pour PREPAYE - validation selon comptabilisé (inchangé)
        if (formState.invoiceType === 'PREPAYE') {
          const hasMethod = formState.billingMethod !== ''
          
          if (formState.billingMethod === 'CUSTOM') {
            // Custom = dates + prix obligatoires
            const hasDates = formState.startDate !== null && formState.endDate !== null
            const datesValid = formState.startDate && formState.endDate ? formState.endDate > formState.startDate : false
            const hasPrice = formState.isPrepayeInvoiceContab === 1 ? formState.customPrice !== null : true
            
            return hasMethod && hasDates && datesValid && hasPrice
          }
          
          return hasMethod
        }
        
        return true
      
      case 5: 
        // Au moins une option de grâce doit être sélectionnée
        const hasGraceOption = formState.isAutoGracePeriod || formState.isManualGracePeriod
        
        // Si manuel, période obligatoire
        if (formState.isManualGracePeriod) {
          return hasGraceOption && formState.manualGracePeriod !== null
        }
        
        return hasGraceOption
      
      default: 
        return false
    }
  }

  // Auto-sélection du plan existant
  useEffect(() => {
    if (existingPlan && plans.length > 0) {
      const foundPlan = plans.find(p => p.planId === existingPlan.id)
      if (foundPlan && !formState.selectedPlanId) {
        updateFormField('selectedPlanId', foundPlan.planId)
        updateFormField('selectedPlan', foundPlan)
      }
    }
  }, [existingPlan, plans, formState.selectedPlanId, updateFormField])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Extension de plan - {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            Étape {formState.currentStep} sur 5
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="py-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Plan étendu avec succès !
              </h3>
              <p className="text-gray-600">
                L'extension du plan a été appliquée au tenant {tenantName}
              </p>
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={formState.currentStep === 1 ? handleClose : prevStep}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {formState.currentStep === 1 ? 'Annuler' : 'Précédent'}
            </Button>

            {formState.currentStep < 5 ? (
              <Button
                onClick={() => {
                  console.log('Bouton Suivant cliqué:', {
                    currentStep: formState.currentStep,
                    canGoNext: canGoNext(),
                    invoiceType: formState.invoiceType,
                    selectedPlan: formState.selectedPlanId
                  })
                  nextStep()
                }}
                disabled={!canGoNext() || loading}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canGoNext()}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Extension en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Étendre le plan
                  </>
                )}
              </Button>
            )}

            {/* Messages d'aide selon l'étape - AJUSTÉ POUR EXTEND-PLAN */}
            {!canGoNext() && (
              <div className="text-xs text-red-600 mt-2">
                {formState.currentStep === 2 && formState.invoiceType === 'PREPAYE' && !formState.isPrepayedInvoiceReason.trim() && (
                  "⚠️ La raison du prépaiement est obligatoire"
                )}
                {formState.currentStep === 3 && formState.billingMethod === '' && (
                  "⚠️ Veuillez sélectionner une méthode de facturation"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'STANDARD' && formState.billingMethod === 'CUSTOM' && (!formState.startDate || !formState.endDate) && (
                  "⚠️ Dates de début et fin obligatoires pour mode personnalisé"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'STANDARD' && formState.billingMethod === 'CUSTOM' && !formState.customPrice && (
                  "⚠️ Prix personnalisé obligatoire pour mode personnalisé"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'STANDARD' && !formState.withReceipt && !formState.dueDate && (
                  "⚠️ Date d'échéance obligatoire"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'PREPAYE' && formState.billingMethod === 'CUSTOM' && (!formState.startDate || !formState.endDate) && (
                  "⚠️ Dates obligatoires pour PREPAYE personnalisé"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'PREPAYE' && formState.billingMethod === 'CUSTOM' && formState.isPrepayeInvoiceContab === 1 && !formState.customPrice && (
                  "⚠️ Prix obligatoire pour PREPAYE comptabilisé personnalisé"
                )}
                {formState.currentStep === 5 && !formState.isAutoGracePeriod && !formState.isManualGracePeriod && (
                  "⚠️ Veuillez sélectionner une option de période de grâce"
                )}
                {formState.currentStep === 5 && formState.isManualGracePeriod && !formState.manualGracePeriod && (
                  "⚠️ Durée de période de grâce manuelle obligatoire"
                )}
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}