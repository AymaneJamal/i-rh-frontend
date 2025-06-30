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
import { AlertTriangle, Pause, User, Building2, Calendar, FileText } from "lucide-react"

interface SuspendTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onSuspendConfirm: (reason: string) => Promise<void>
  loading?: boolean
}

const SUSPENSION_REASONS = [
  { value: "NON_PAYMENT", label: "Non-paiement" },
  { value: "POLICY_VIOLATION", label: "Violation des conditions d'utilisation" },
  { value: "SECURITY_BREACH", label: "Problème de sécurité" },
  { value: "OVERDUE_RENEWAL", label: "Renouvellement en retard" },
  { value: "RESOURCE_ABUSE", label: "Abus de ressources" },
  { value: "MAINTENANCE", label: "Maintenance technique" },
  { value: "LEGAL_ISSUE", label: "Problème légal" },
  { value: "CUSTOMER_REQUEST", label: "Demande du client" },
  { value: "OTHER", label: "Autre (préciser)" }
]

export function SuspendTenantModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onSuspendConfirm,
  loading = false
}: SuspendTenantModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [customReason, setCustomReason] = useState<string>("")
  const [additionalNotes, setAdditionalNotes] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'confirm' | 'reason' | 'notes'>('confirm')

  const handleClose = () => {
    if (!loading) {
      setSelectedReason("")
      setCustomReason("")
      setAdditionalNotes("")
      setError(null)
      setStep('confirm')
      onClose()
    }
  }

  const handleConfirmSuspension = () => {
    setStep('reason')
  }

  const handleReasonNext = () => {
    if (!selectedReason) {
      setError("Veuillez sélectionner une raison de suspension")
      return
    }
    
    if (selectedReason === "OTHER" && !customReason.trim()) {
      setError("Veuillez préciser la raison personnalisée")
      return
    }
    
    setError(null)
    setStep('notes')
  }

  const handleFinalSuspend = async () => {
    try {
      setError(null)
      
      let finalReason = selectedReason
      if (selectedReason === "OTHER" && customReason.trim()) {
        finalReason = customReason.trim()
      } else if (selectedReason !== "OTHER") {
        const reasonObj = SUSPENSION_REASONS.find(r => r.value === selectedReason)
        finalReason = reasonObj?.label || selectedReason
      }

      // Ajouter les notes supplémentaires si présentes
      if (additionalNotes.trim()) {
        finalReason += ` - Notes: ${additionalNotes.trim()}`
      }

      await onSuspendConfirm(finalReason)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suspension")
    }
  }

  const selectedReasonLabel = SUSPENSION_REASONS.find(r => r.value === selectedReason)?.label || selectedReason

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {step === 'confirm' && 'Suspendre le Tenant'}
            {step === 'reason' && 'Raison de la Suspension'}
            {step === 'notes' && 'Confirmer la Suspension'}
          </DialogTitle>
          <DialogDescription>
            {step === 'confirm' && `Vous êtes sur le point de suspendre le tenant "${tenantName}". Cette action entraînera l'arrêt immédiat de tous les services.`}
            {step === 'reason' && 'Sélectionnez la raison principale de cette suspension.'}
            {step === 'notes' && 'Ajoutez des notes supplémentaires (optionnel) et confirmez la suspension.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du tenant */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{tenantName}</span>
              <Badge variant="outline" className="text-xs">ID: {tenantId}</Badge>
            </div>
          </div>

          {/* Étape 1: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention :</strong> La suspension d'un tenant :
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>Désactivera immédiatement tous les accès</li>
                    <li>Empêchera toute connexion des utilisateurs</li>
                    <li>Conservera les données mais les rendra inaccessibles</li>
                    <li>Nécessitera une réactivation manuelle</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Étape 2: Sélection de la raison */}
          {step === 'reason' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Raison de suspension *</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une raison..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPENSION_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "OTHER" && (
                <div>
                  <Label htmlFor="customReason">Raison personnalisée *</Label>
                  <Input
                    id="customReason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Précisez la raison..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {customReason.length}/200 caractères
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Notes supplémentaires et confirmation */}
          {step === 'notes' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Raison sélectionnée :</span>
                </div>
                <p className="text-blue-700 mt-1">{selectedReasonLabel}</p>
                {selectedReason === "OTHER" && (
                  <p className="text-blue-600 text-sm mt-1">"{customReason}"</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ajoutez des détails supplémentaires si nécessaire..."
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {additionalNotes.length}/500 caractères
                </p>
              </div>

              <Alert>
                <Pause className="h-4 w-4" />
                <AlertDescription>
                  Le tenant sera suspendu immédiatement après confirmation.
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
              variant="destructive"
              onClick={handleConfirmSuspension}
              disabled={loading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Continuer
            </Button>
          )}
          
          {step === 'reason' && (
            <Button
              onClick={handleReasonNext}
              disabled={loading}
            >
              Suivant
            </Button>
          )}
          
          {step === 'notes' && (
            <Button
              variant="destructive"
              onClick={handleFinalSuspend}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suspension...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Suspendre le Tenant
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}