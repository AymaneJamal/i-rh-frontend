"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans"
import { useTenantSubscription } from "@/hooks/use-tenant-subscription"
import { validateFileUpload, validatePaymentInfo } from "@/lib/validators"
import { formatCurrency } from "@/lib/formatters"
import { PAYMENT_METHODS, Currency } from "@/lib/constants"
import { CreditCard, Upload, FileText, AlertCircle, CheckCircle, Crown, Zap, Users, HardDrive, X } from "lucide-react"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onSubscriptionAssigned: () => void
}

const BILLING_METHODS = [
  { value: "BANK_TRANSFER", label: "Virement bancaire" },
  { value: "CREDIT_CARD", label: "Carte de crédit" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "CHECK", label: "Chèque" }
]

export function SubscriptionModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onSubscriptionAssigned
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [paymentReference, setPaymentReference] = useState<string>("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { plans, loading: plansLoading } = useSubscriptionPlans({ publicOnly: true })
  const { assignPlan, loading: assignLoading } = useTenantSubscription()

  const selectedPlanDetails = plans.find(plan => plan.planId === selectedPlan)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFileUpload(file, 'receipt')
      if (!validation.isValid) {
        setError(validation.errors[0])
        return
      }
      setReceiptFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPlan || !paymentMethod || !paymentReference || !receiptFile) {
      setError("Tous les champs sont requis")
      return
    }

    const paymentValidation = validatePaymentInfo(
      selectedPlanDetails?.monthlyPrice || 0,
      paymentMethod,
      paymentReference
    )

    if (!paymentValidation.isValid) {
      setError(paymentValidation.errors[0])
      return
    }

    try {
      setError(null)
      await assignPlan(
        tenantId,
        selectedPlan,
        paymentMethod as any,
        paymentReference,
        receiptFile
      )
      setSuccess(true)
      setTimeout(() => {
        onSubscriptionAssigned()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erreur lors de l'attribution du plan")
    }
  }

  const resetForm = () => {
    setSelectedPlan("")
    setPaymentMethod("")
    setPaymentReference("")
    setReceiptFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getPlanIcon = (planId: string) => {
    if (planId.toLowerCase().includes('basic')) return <Users className="h-5 w-5 text-blue-500" />
    if (planId.toLowerCase().includes('premium')) return <Zap className="h-5 w-5 text-purple-500" />
    if (planId.toLowerCase().includes('enterprise')) return <Crown className="h-5 w-5 text-yellow-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const getPlanColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'basic': return 'text-blue-600'
      case 'premium': return 'text-purple-600'
      case 'enterprise': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <span>Attribuer un Plan d'Abonnement</span>
          </DialogTitle>
          <DialogDescription>
            Attribuer un plan d'abonnement au tenant <strong>{tenantName}</strong>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plan Attribué avec Succès!</h3>
            <p className="text-gray-600">Le plan a été attribué au tenant avec succès.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Plan Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Choisir un Plan d'Abonnement</Label>
              {plansLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des plans...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan.planId}
                      className={`relative cursor-pointer transition-all ${
                        selectedPlan === plan.planId 
                          ? `${getPlanColor(plan.category)} border-current border-2` 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPlan(plan.planId)}
                    >
                      {selectedPlan === plan.planId && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          {getPlanIcon(plan.planId)}
                          <h3 className="font-semibold">{plan.planName}</h3>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-2xl font-bold">{formatCurrency(plan.monthlyPrice, plan.currency as Currency)}</span>
                          <span className="text-gray-500">/mois</span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{plan.maxUsers === -1 ? "Illimité" : plan.maxUsers} utilisateurs</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <span>{Math.floor(plan.maxDatabaseStorageMB / 1024)}GB base de données</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <span>{Math.floor(plan.maxS3StorageMB / 1024)}GB stockage S3</span>
                          </div>
                        </div>
                        
                        {plan.isRecommended === 1 && (
                          <Badge className="mt-2" variant="secondary">Recommandé</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Plan Summary */}
            {selectedPlanDetails && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-blue-900">Plan Sélectionné: {selectedPlanDetails.planName}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{selectedPlanDetails.maxUsers === -1 ? "Illimité" : selectedPlanDetails.maxUsers} utilisateurs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-gray-500" />
                      <span>{Math.floor(selectedPlanDetails.maxDatabaseStorageMB / 1024)}GB base de données</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-gray-500" />
                      <span>{Math.floor(selectedPlanDetails.maxS3StorageMB / 1024)}GB stockage S3</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedPlanDetails.monthlyPrice, selectedPlanDetails.currency as Currency)}/mois
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Méthode de Paiement *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={assignLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Référence de Paiement *</Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ex: REF-PAY-2024-001, ID transaction..."
                disabled={assignLoading}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt">Reçu de Paiement *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="receipt" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Cliquez pour uploader ou glissez-déposez
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PDF, PNG, JPG jusqu'à 5MB
                      </span>
                    </label>
                    <input
                      id="receipt"
                      name="receipt"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      disabled={assignLoading}
                    />
                  </div>
                </div>
                {receiptFile && (
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">{receiptFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReceiptFile(null)}
                      disabled={assignLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={assignLoading}>
            Annuler
          </Button>
          {!success && (
            <Button
              onClick={handleSubmit}
              disabled={assignLoading || !selectedPlan || !paymentMethod || !paymentReference || !receiptFile}
            >
              {assignLoading ? "Attribution..." : "Attribuer le Plan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}