"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Card, CardContent } from "@/components/ui/card"
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans"
import { formatCurrency } from "@/lib/formatters"
import { Currency } from "@/lib/constants"
import { Play, Building2, Crown, CheckCircle, AlertTriangle } from "lucide-react"

interface ReactivateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  currentPlanId?: string | null
  onReactivateConfirm: (newPlanId?: string) => Promise<void>
  loading?: boolean
}

export function ReactivateTenantModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  currentPlanId,
  onReactivateConfirm,
  loading = false
}: ReactivateTenantModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'confirm' | 'plan' | 'final'>('confirm')

  const { plans, loading: plansLoading } = useSubscriptionPlans({ publicOnly: true })

  const handleClose = () => {
    if (!loading) {
      setSelectedPlanId("")
      setNotes("")
      setError(null)
      setStep('confirm')
      onClose()
    }
  }

  const handleContinue = () => {
    setStep('plan')
  }

  const handlePlanNext = () => {
    if (!selectedPlanId) {
      setError("Veuillez sélectionner un plan pour la réactivation")
      return
    }
    setError(null)
    setStep('final')
  }

  const handleFinalReactivate = async () => {
    try {
      setError(null)
      await onReactivateConfirm(selectedPlanId || undefined)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réactivation")
    }
  }

  const selectedPlan = plans.find(plan => plan.planId === selectedPlanId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <Play className="h-5 w-5 mr-2" />
            {step === 'confirm' && 'Réactiver le Tenant'}
            {step === 'plan' && 'Sélection du Plan'}
            {step === 'final' && 'Confirmer la Réactivation'}
          </DialogTitle>
          <DialogDescription>
            {step === 'confirm' && `Vous êtes sur le point de réactiver le tenant "${tenantName}". Cette action restaurera l'accès à tous les services.`}
            {step === 'plan' && 'Choisissez le plan d\'abonnement pour la réactivation.'}
            {step === 'final' && 'Vérifiez les informations et confirmez la réactivation.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du tenant */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{tenantName}</span>
              <Badge variant="outline" className="text-xs">ID: {tenantId}</Badge>
              <Badge variant="destructive" className="text-xs">SUSPENDU</Badge>
            </div>
          </div>

          {/* Étape 1: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Réactivation du tenant :</strong>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>Restaurera l'accès immédiatement</li>
                    <li>Permettra les connexions des utilisateurs</li>
                    <li>Rendra les données à nouveau accessibles</li>
                    <li>Reprendra la facturation selon le plan sélectionné</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {currentPlanId && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <strong>Plan précédent :</strong> {currentPlanId}
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Vous pourrez choisir le même plan ou en sélectionner un nouveau.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Sélection du plan */}
          {step === 'plan' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan">Plan d'abonnement *</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plansLoading ? (
                      <SelectItem value="" disabled>Chargement des plans...</SelectItem>
                    ) : (
                      plans.map((plan) => (
                        <SelectItem key={plan.planId} value={plan.planId}>
                          <div className="flex items-center space-x-2">
                            <span>{plan.planName}</span>
                            {plan.isRecommended === 1 && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="text-sm text-gray-500">
                              {formatCurrency(plan.monthlyPrice, plan.currency as Currency)}/mois
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlan && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedPlan.planName}</span>
                        {selectedPlan.isRecommended === 1 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-500">Prix mensuel :</span>
                          <div className="font-medium">
                            {formatCurrency(selectedPlan.monthlyPrice, selectedPlan.currency as Currency)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Utilisateurs max :</span>
                          <div className="font-medium">{selectedPlan.maxUsers}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Stockage DB :</span>
                          <div className="font-medium">{selectedPlan.maxDatabaseStorageMB} MB</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Stockage S3 :</span>
                          <div className="font-medium">{selectedPlan.maxS3StorageMB} MB</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Étape 3: Confirmation finale */}
          {step === 'final' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Plan sélectionné :</span>
                </div>
                <p className="text-green-700 mt-1">{selectedPlan?.planName}</p>
                <p className="text-green-600 text-sm mt-1">
                  {formatCurrency(selectedPlan?.monthlyPrice || 0, (selectedPlan?.currency as Currency) || 'EUR')}/mois
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notes de réactivation (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cette réactivation..."
                  maxLength={300}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {notes.length}/300 caractères
                </p>
              </div>

              <Alert>
                <Play className="h-4 w-4" />
                <AlertDescription>
                  Le tenant sera réactivé immédiatement avec le plan sélectionné.
                  La facturation reprendra selon les conditions du plan.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          
          {step === 'confirm' && (
            <Button
              onClick={handleContinue}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Continuer
            </Button>
          )}
          
          {step === 'plan' && (
            <Button
              onClick={handlePlanNext}
              disabled={loading || !selectedPlanId}
            >
              Suivant
            </Button>
          )}
          
          {step === 'final' && (
            <Button
              onClick={handleFinalReactivate}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Réactivation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Réactiver le Tenant
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}