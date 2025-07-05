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
import { useAssignPlan } from "@/hooks/use-assign-plan"
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

interface AssignPlanModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onPlanAssigned: () => void
}

// Helper function pour éviter les erreurs de type Currency
const formatPrice = (amount: number, currency: string): string => {
  return formatCurrency(amount, currency as Currency)
}

export function AssignPlanModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onPlanAssigned
}: AssignPlanModalProps) {
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
    submitAssignPlan,
    validateForm
  } = useAssignPlan(tenantId)

  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    if (!loading) {
      setSuccess(false)
      onClose()
    }
  }

  const handleSubmit = async () => {
    const result = await submitAssignPlan()
    if (result) {
      setSuccess(true)
      setTimeout(() => {
        onPlanAssigned()
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
  // ÉTAPE 1: SÉLECTION DU PLAN
  // ===============================================================================
  
  const renderStepPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Sélectionner un plan</h3>
        <p className="text-gray-600">Choisissez le plan d'abonnement pour {tenantName}</p>
      </div>

      {plansLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement des plans...</span>
        </div>
      ) : plansError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{plansError}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.planId}
                className={`cursor-pointer transition-all border-2 ${
                  formState.selectedPlanId === plan.planId
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                    : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                }`}
                onClick={() => {
                  updateFormField('selectedPlanId', plan.planId)
                  updateFormField('selectedPlan', plan)
                  console.log('Plan sélectionné:', plan.planId)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-lg">{plan.planName}</CardTitle>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    {plan.isRecommended === 1 && (
                      <Badge variant="default">Recommandé</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prix mensuel:</span>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(plan.monthlyPrice, plan.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Prix annuel:</span>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(plan.yearlyPrice, plan.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Utilisateurs max:</span>
                      <p>{plan.maxUsers}</p>
                    </div>
                    <div>
                      <span className="font-medium">Employés max:</span>
                      <p>{plan.maxEmployees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bouton créer nouveau plan */}
          <Card 
            className="cursor-pointer border-dashed border-2 hover:bg-gray-50 transition-colors"
            onClick={() => {
              // Rediriger vers la page de création de plan
              window.open('/dashboard/plans/add', '_blank')
            }}
          >
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Créer un nouveau plan</p>
                <p className="text-sm text-gray-500">Accéder à la page de création</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {formState.errors.plan && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formState.errors.plan}</AlertDescription>
        </Alert>
      )}

      {/* Debug info pour développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Plan sélectionné: {formState.selectedPlanId || 'Aucun'}
        </div>
      )}
    </div>
  )

  // ===============================================================================
  // ÉTAPE 2: TYPE DE FACTURATION
  // ===============================================================================
  
  const renderStepInvoiceType = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Type de facturation</h3>
        <p className="text-gray-600">Choisissez le mode de facturation</p>
      </div>

      <RadioGroup
        value={formState.invoiceType}
        onValueChange={(value) => {
          console.log('Changement type facturation:', value)
          updateFormField('invoiceType', value)
        }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <RadioGroupItem value="STANDARD" id="standard" />
          <Label htmlFor="standard" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Facturation Standard</p>
              <p className="text-sm text-gray-600">Facturation classique avec paiement après service</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <RadioGroupItem value="PREPAYE" id="prepaye" />
          <Label htmlFor="prepaye" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Facturation Prépayée</p>
              <p className="text-sm text-gray-600">Paiement en avance du service</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {formState.invoiceType === 'PREPAYE' && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Raison du prépaiement *</Label>
            <Textarea
              value={formState.isPrepayedInvoiceReason}
              onChange={(e) => updateFormField('isPrepayedInvoiceReason', e.target.value)}
              placeholder="Expliquez la raison du choix du prépaiement..."
              className={`min-h-[80px] ${!formState.isPrepayedInvoiceReason.trim() ? 'border-red-300' : ''}`}
            />
            {!formState.isPrepayedInvoiceReason.trim() && (
              <p className="text-sm text-red-600 mt-1">Ce champ est obligatoire</p>
            )}
          </div>
          
          <Label className="text-base font-medium">La facture est-elle comptabilisée ?</Label>
          <RadioGroup
            value={formState.isPrepayeInvoiceContab.toString()}
            onValueChange={(value) => updateFormField('isPrepayeInvoiceContab', parseInt(value))}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="comptabilise-oui" />
              <Label htmlFor="comptabilise-oui">Oui, comptabilisée</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="comptabilise-non" />
              <Label htmlFor="comptabilise-non">Non, non comptabilisée</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {formState.errors.invoiceType && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formState.errors.invoiceType}</AlertDescription>
        </Alert>
      )}

      {/* Debug pour développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <p>Debug - Type sélectionné: {formState.invoiceType || 'Aucun'}</p>
          <p>Can go next: {canGoNext().toString()}</p>
          <p>Étape actuelle: {formState.currentStep}</p>
        </div>
      )}
    </div>
  )

  // ===============================================================================
  // ÉTAPE 3: CONFIGURATION BILLING SELON WORKFLOW
  // ===============================================================================
  
  const renderStepBillingConfig = () => {
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
          <h3 className="text-lg font-semibold">Configuration de facturation</h3>
          <p className="text-gray-600">Définissez la période et les montants</p>
        </div>

        <div className="space-y-4">
          {/* Méthode de facturation - Toujours affichée */}
          <div>
            <Label className="text-base font-medium">Méthode de facturation</Label>
            <Select
              value={formState.billingMethod}
              onValueChange={(value) => updateFormField('billingMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir la méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensuel</SelectItem>
                <SelectItem value="YEARLY">Annuel</SelectItem>
                <SelectItem value="CUSTOM">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates - Comportement selon billing method */}
          {(formState.billingMethod === 'MONTHLY' || formState.billingMethod === 'YEARLY') && (
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
                />
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Input
                  type="date"
                  value={formState.endDate ? new Date(formState.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormField('endDate', new Date(e.target.value).getTime())}
                />
              </div>
            </div>
          )}

          {/* Prix - Seulement pour STANDARD et PREPAYE comptabilisé */}
          {showPricing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Prix</Label>
                {formState.customPrice && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetCustomPrice}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {!formState.customPrice && formState.selectedPlan && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Prix du plan:</p>
                    <p className="text-lg font-semibold">
                      {formState.billingMethod === 'MONTHLY' && formatPrice(formState.selectedPlan.monthlyPrice, formState.selectedPlan.currency)}
                      {formState.billingMethod === 'YEARLY' && formatPrice(formState.selectedPlan.yearlyPrice, formState.selectedPlan.currency)}
                      {formState.billingMethod === 'CUSTOM' && 'À définir'}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Prix personnalisé"
                    value={formState.customPrice || ''}
                    onChange={(e) => updateFormField('customPrice', parseFloat(e.target.value) || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (formState.selectedPlan && formState.billingMethod !== 'CUSTOM') {
                        const price = formState.billingMethod === 'MONTHLY' 
                          ? formState.selectedPlan.monthlyPrice 
                          : formState.selectedPlan.yearlyPrice
                        updateFormField('customPrice', price)
                      }
                    }}
                  >
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Taux de taxe - Seulement si prix affiché */}
              <div>
                <Label htmlFor="taxRate">Taux de taxe (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formState.taxRate}
                  onChange={(e) => updateFormField('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Calcul en temps réel - Seulement si prix affiché */}
              {pricingCalculation && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-800">
                      <Calculator className="h-5 w-5 mr-2" />
                      Récapitulatif des prix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Prix HT:</span>
                      <span className="font-medium">{formatPrice(pricingCalculation.basePrice, pricingCalculation.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxe ({(formState.taxRate * 100).toFixed(1)}%):</span>
                      <span className="font-medium">{formatPrice(pricingCalculation.taxAmount, pricingCalculation.currency)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-800 border-t pt-2">
                      <span>Total TTC:</span>
                      <span>{formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Juste taxe pour PREPAYE non comptabilisé */}
          {showOnlyDates && (
            <div>
              <Label htmlFor="taxRate">Taux de taxe (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formState.taxRate}
                onChange={(e) => updateFormField('taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        {/* Debug pour développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
            <p>Debug Étape 3:</p>
            <p>Invoice Type: {formState.invoiceType}</p>
            <p>Is Comptabilisé: {formState.isPrepayeInvoiceContab}</p>
            <p>Show Pricing: {showPricing.toString()}</p>
            <p>Show Only Dates: {showOnlyDates.toString()}</p>
            <p>Billing Method: {formState.billingMethod}</p>
          </div>
        )}
      </div>
    )
  }

  // ===============================================================================
  // ÉTAPE 4: INFORMATIONS DE PAIEMENT - SELON WORKFLOW
  // ===============================================================================
  
  const renderStepPaymentInfo = () => {
    const isPrePaye = formState.invoiceType === 'PREPAYE'
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {isPrePaye ? 'Configuration Prépayée - Billing' : 'Informations de paiement'}
          </h3>
          <p className="text-gray-600">
            {isPrePaye ? 'Configurez les paramètres de facturation' : 'Configurez les détails de paiement'}
          </p>
        </div>

        {/* Pour PREPAYE - Configuration billing simplifiée */}
        {isPrePaye && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Méthode de facturation</Label>
              <Select
                value={formState.billingMethod}
                onValueChange={(value) => updateFormField('billingMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensuel</SelectItem>
                  <SelectItem value="YEARLY">Annuel</SelectItem>
                  <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates selon méthode */}
            {(formState.billingMethod === 'MONTHLY' || formState.billingMethod === 'YEARLY') && (
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

            {/* Prix ET taxe seulement si comptabilisé */}
            {formState.isPrepayeInvoiceContab === 1 && (
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
                    {formState.billingMethod === 'CUSTOM' ? 'Prix personnalisé *' : 'Prix personnalisé (optionnel)'}
                  </Label>
                  <Input
                    type="number"
                    placeholder={formState.billingMethod === 'CUSTOM' ? 'Prix obligatoire pour durée personnalisée' : 'Laisser vide pour prix du plan'}
                    value={formState.customPrice || ''}
                    onChange={(e) => updateFormField('customPrice', parseFloat(e.target.value) || null)}
                    className={formState.billingMethod === 'CUSTOM' && !formState.customPrice ? 'border-red-300' : ''}
                  />
                  {formState.billingMethod === 'CUSTOM' && !formState.customPrice && (
                    <p className="text-sm text-red-600 mt-1">Prix obligatoire pour la durée personnalisée</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="taxRate">Taux de taxe (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formState.taxRate}
                    onChange={(e) => updateFormField('taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Calcul TTC pour comptabilisé */}
                {pricingCalculation && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <Calculator className="h-5 w-5 mr-2" />
                        Montant Total TTC
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-800">
                        {formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Pas de taxe si non comptabilisé */}
            {formState.isPrepayeInvoiceContab === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Facture non comptabilisée :</strong> Aucun calcul de prix ni taxe requis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pour STANDARD - Configuration classique de reçu */}
        {!isPrePaye && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withReceipt"
                checked={formState.withReceipt}
                onCheckedChange={(checked) => updateFormField('withReceipt', checked)}
              />
              <Label htmlFor="withReceipt" className="text-base font-medium">
                Importer un reçu de paiement
              </Label>
            </div>

            {formState.withReceipt && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div>
                  <Label>Fichier reçu (max 2MB)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  {formState.receiptFile && (
                    <p className="text-sm text-green-600 mt-1">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {formState.receiptFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Méthode de paiement *</Label>
                  <Select
                    value={formState.paymentMethod}
                    onValueChange={(value) => updateFormField('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Référence de paiement *</Label>
                  <Input
                    value={formState.paymentReference}
                    onChange={(e) => updateFormField('paymentReference', e.target.value)}
                    placeholder="Référence du paiement"
                  />
                </div>

                <div>
                  <Label>Montant payé</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formState.paidAmount || ''}
                    onChange={(e) => updateFormField('paidAmount', parseFloat(e.target.value) || null)}
                    placeholder={pricingCalculation ? `Total: ${pricingCalculation.totalPrice}` : 'Montant'}
                  />
                  {pricingCalculation && formState.paidAmount && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formState.paidAmount >= pricingCalculation.totalPrice 
                        ? "✅ Montant total couvert" 
                        : `Restant: ${formatPrice(pricingCalculation.totalPrice - formState.paidAmount, pricingCalculation.currency)}`
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Due Date - Obligatoire sauf si reçu couvre tout */}
            {(() => {
              const needsDueDate = !formState.withReceipt || 
                !pricingCalculation || 
                !formState.paidAmount || 
                formState.paidAmount < pricingCalculation.totalPrice

              return needsDueDate && (
                <div>
                  <Label>Date d'échéance *</Label>
                  <Input
                    type="date"
                    value={formState.dueDate ? new Date(formState.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormField('dueDate', new Date(e.target.value).getTime())}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {!formState.withReceipt 
                      ? "Date d'échéance obligatoire sans reçu"
                      : "Date d'échéance pour le montant restant"
                    }
                  </p>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    )
  }

  // ===============================================================================
  // ÉTAPE 5: CONFIGURATION AVANCÉE
  // ===============================================================================
  
  const renderStepAdvancedConfig = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Configuration avancée</h3>
        <p className="text-gray-600">Paramètres de renouvellement et de grâce</p>
      </div>

      <div className="space-y-6">
        {/* Auto-renouvellement */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="autoRenewal"
            checked={formState.autoRenewalEnabled}
            onCheckedChange={(checked) => updateFormField('autoRenewalEnabled', checked)}
          />
          <div>
            <Label htmlFor="autoRenewal" className="text-base font-medium">
              Renouvellement automatique
            </Label>
            <p className="text-sm text-gray-600">
              Le plan sera renouvelé automatiquement à l'expiration
            </p>
          </div>
        </div>

        {/* Période de grâce automatique */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="autoGrace"
            checked={formState.isAutoGracePeriod}
            onCheckedChange={(checked) => updateFormField('isAutoGracePeriod', checked)}
          />
          <div>
            <Label htmlFor="autoGrace" className="text-base font-medium">
              Période de grâce automatique
            </Label>
            <p className="text-sm text-gray-600">
              Période de grâce automatique selon le plan ({formState.selectedPlan?.gracePeriodDays || 0} jours)
            </p>
          </div>
        </div>

        {/* Période de grâce manuelle */}
        {!formState.isAutoGracePeriod && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="manualGrace"
                checked={formState.isManualGracePeriod}
                onCheckedChange={(checked) => updateFormField('isManualGracePeriod', checked)}
              />
              <div>
                <Label htmlFor="manualGrace" className="text-base font-medium">
                  Période de grâce manuelle
                </Label>
                <p className="text-sm text-gray-600">
                  Définir une période de grâce personnalisée
                </p>
              </div>
            </div>

            {formState.isManualGracePeriod && (
              <div className="pl-8">
                <Label>Nombre de jours de grâce</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={formState.manualGracePeriod || ''}
                  onChange={(e) => updateFormField('manualGracePeriod', parseInt(e.target.value) || null)}
                  placeholder="Nombre de jours"
                />
                {formState.errors.manualGracePeriod && (
                  <p className="text-sm text-red-600 mt-1">{formState.errors.manualGracePeriod}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Récapitulatif final */}
      {formState.selectedPlan && pricingCalculation && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Récapitulatif de l'attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
                  {formatPrice(pricingCalculation.totalPrice, pricingCalculation.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ===============================================================================
  // NAVIGATION ET FOOTER
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
    if (formState.invoiceType === 'PREPAYE' && formState.currentStep === 3) {
      return "Configuration Prépayée"
    }
    
    switch (formState.currentStep) {
      case 1: return "Sélection du plan"
      case 2: return "Type de facturation"
      case 3: return "Configuration billing"
      case 4: return "Informations de paiement"
      case 5: return "Configuration avancée"
      default: return ""
    }
  }

  const renderCurrentStep = () => {
    switch (formState.currentStep) {
      case 1: return renderStepPlanSelection()
      case 2: return renderStepInvoiceType()
      case 3: return renderStepBillingConfig()
      case 4: return renderStepPaymentInfo()
      case 5: return renderStepAdvancedConfig()
      default: return null
    }
  }

  const canGoNext = () => {
    switch (formState.currentStep) {
      case 1: 
        return formState.selectedPlanId !== ''
      
      case 2: 
        // Pour PREPAYE, la raison est obligatoire
        if (formState.invoiceType === 'PREPAYE') {
          return formState.isPrepayedInvoiceReason.trim() !== ''
        }
        return formState.invoiceType !== ''
      
      case 3: 
        // Pour STANDARD, tous les champs obligatoires
        if (formState.invoiceType === 'STANDARD') {
          const hasMethod = formState.billingMethod !== ''
          const hasDates = formState.startDate !== null && formState.endDate !== null
          const datesValid = formState.startDate && formState.endDate ? formState.endDate > formState.startDate : false
          const hasCustomPriceIfCustom = formState.billingMethod !== 'CUSTOM' || formState.customPrice !== null
          
          return hasMethod && hasDates && datesValid && hasCustomPriceIfCustom
        }
        return true
      
      case 4: 
        // Pour STANDARD - Due date obligatoire sauf si reçu couvre tout
        if (formState.invoiceType === 'STANDARD') {
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
        
        // Pour PREPAYE - validation selon comptabilisé
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
        return true
      
      default: 
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Attribution de plan - {getStepTitle()}
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
                Plan attribué avec succès !
              </h3>
              <p className="text-gray-600">
                Le plan a été attribué au tenant {tenantName}
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
                    Attribution...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Attribuer le plan
                  </>
                )}
              </Button>
            )}

            {/* Messages d'aide selon l'étape */}
            {!canGoNext() && (
              <div className="text-xs text-red-600 mt-2">
                {formState.currentStep === 2 && formState.invoiceType === 'PREPAYE' && !formState.isPrepayedInvoiceReason.trim() && (
                  "⚠️ La raison du prépaiement est obligatoire"
                )}
                {formState.currentStep === 3 && formState.invoiceType === 'STANDARD' && (
                  "⚠️ Tous les champs sont obligatoires. Pour CUSTOM: dates valides + prix requis"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'STANDARD' && (
                  "⚠️ Date d'échéance obligatoire (sauf si reçu couvre le montant total)"
                )}
                {formState.currentStep === 4 && formState.invoiceType === 'PREPAYE' && formState.billingMethod === 'CUSTOM' && (
                  "⚠️ Dates valides obligatoires. Prix obligatoire si comptabilisé"
                )}
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}