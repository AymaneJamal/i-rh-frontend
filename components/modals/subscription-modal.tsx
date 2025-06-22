"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { tenantApi } from "@/lib/api/tenant"
import { AssignSubscriptionRequest, SubscriptionPlan } from "@/types/tenant"
import { CreditCard, Upload, FileText, AlertCircle, CheckCircle, Crown, Zap, Users, HardDrive } from "lucide-react"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onSubscriptionAssigned: () => void
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    duration: 1,
    features: ["Jusqu'à 10 utilisateurs", "5GB de stockage", "Support email", "Fonctionnalités de base"],
    maxUsers: 10,
    maxStorage: 5,
    support: "Email"
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    duration: 1,
    features: ["Jusqu'à 50 utilisateurs", "50GB de stockage", "Support prioritaire", "Fonctionnalités avancées", "Intégrations API"],
    maxUsers: 50,
    maxStorage: 50,
    support: "Priority"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    duration: 1,
    features: ["Utilisateurs illimités", "500GB de stockage", "Support 24/7", "Toutes les fonctionnalités", "Intégrations personnalisées", "Manager dédié"],
    maxUsers: -1, // unlimited
    maxStorage: 500,
    support: "24/7"
  }
]

const BILLING_METHODS = [
  { value: "credit_card", label: "Carte de crédit" },
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "paypal", label: "PayPal" },
  { value: "invoice", label: "Facturation" }
]

export function SubscriptionModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onSubscriptionAssigned
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [billingMethod, setBillingMethod] = useState<string>("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [autoRenew, setAutoRenew] = useState(true)
  const [customExpiryDate, setCustomExpiryDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedPlanDetails = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError("Format de fichier non supporté. Utilisez JPG, PNG ou PDF.")
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Le fichier est trop volumineux. Taille maximale: 5MB")
        return
      }
      
      setReceiptFile(file)
      setError(null)
    }
  }

  const handleAssignSubscription = async () => {
    if (!selectedPlan || !billingMethod) {
      setError("Veuillez sélectionner un plan et une méthode de paiement")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const request: AssignSubscriptionRequest = {
        tenantId,
        planId: selectedPlan,
        billingMethod,
        autoRenew,
        receiptFile: receiptFile || undefined,
        customExpiryDate: customExpiryDate || undefined
      }

      await tenantApi.assignSubscription(request)
      
      setSuccess(true)
      setTimeout(() => {
        onSubscriptionAssigned()
        onClose()
        resetForm()
      }, 2000)

    } catch (err: any) {
      console.error("Failed to assign subscription:", err)
      setError(err.response?.data?.message || "Erreur lors de l'assignation de l'abonnement")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedPlan("")
    setBillingMethod("")
    setReceiptFile(null)
    setAutoRenew(true)
    setCustomExpiryDate("")
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "starter": return <Zap className="h-5 w-5" />
      case "professional": return <Users className="h-5 w-5" />
      case "enterprise": return <Crown className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "starter": return "border-blue-200 bg-blue-50"
      case "professional": return "border-purple-200 bg-purple-50"
      case "enterprise": return "border-yellow-200 bg-yellow-50"
      default: return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Assigner un Abonnement</span>
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un plan d'abonnement pour <strong>{tenantName}</strong>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Abonnement Assigné!</h3>
            <p className="text-gray-600">L'abonnement a été assigné avec succès au tenant.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? `${getPlanColor(plan.id)} border-current` 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id && (
                      <div className="absolute -top-2 -right-2">
                        <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mb-3">
                      {getPlanIcon(plan.id)}
                      <h3 className="font-semibold">{plan.name}</h3>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-2xl font-bold">{plan.price}€</span>
                      <span className="text-gray-500">/mois</span>
                    </div>
                    
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Details */}
            {selectedPlanDetails && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Détails du Plan Sélectionné</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{selectedPlanDetails.maxUsers === -1 ? "Illimité" : selectedPlanDetails.maxUsers} utilisateurs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span>{selectedPlanDetails.maxStorage}GB stockage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>{selectedPlanDetails.price}€/mois</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span>Support {selectedPlanDetails.support}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Method */}
            <div className="space-y-2">
              <Label htmlFor="billingMethod">Méthode de Paiement</Label>
              <Select value={billingMethod} onValueChange={setBillingMethod}>
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

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt">Reçu de Paiement (optionnel)</Label>
              <Input
                id="receipt"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={loading}
              />
              {receiptFile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{receiptFile.name}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formats acceptés: JPG, PNG, PDF. Taille max: 5MB
              </p>
            </div>

            {/* Auto Renewal */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRenew">Renouvellement Automatique</Label>
                <p className="text-sm text-gray-500">L'abonnement sera renouvelé automatiquement</p>
              </div>
              <Switch
                id="autoRenew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
                disabled={loading}
              />
            </div>

            {/* Custom Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date d'Expiration Personnalisée (optionnel)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={customExpiryDate}
                onChange={(e) => setCustomExpiryDate(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Laissez vide pour utiliser la durée par défaut du plan
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          {!success && (
            <Button
              onClick={handleAssignSubscription}
              disabled={!selectedPlan || !billingMethod || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Assignation..." : "Assigner l'Abonnement"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}