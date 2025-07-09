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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Play, Building2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface ReactivateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onReactivateConfirm: (reason: string) => Promise<void>
  loading?: boolean
}

export function ReactivateTenantModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onReactivateConfirm,
  loading = false
}: ReactivateTenantModalProps) {
  const [reason, setReason] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    if (!loading) {
      setReason("")
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("La raison de la réactivation est obligatoire")
      return
    }

    try {
      setError(null)
      await onReactivateConfirm(reason.trim())
      setSuccess(true)
      
      // Auto-close after success
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réactivation")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <Play className="h-5 w-5 mr-2" />
            Réactiver le Tenant
          </DialogTitle>
          <DialogDescription>
            Réactivez le tenant suspendu pour restaurer l'accès à tous les services.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Tenant réactivé avec succès !
            </h3>
            <p className="text-gray-600">
              Le tenant {tenantName} est maintenant actif.
            </p>
          </div>
        ) : (
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

            {/* Informations sur la réactivation */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>La réactivation permettra :</strong>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>Restaurer l'accès immédiatement</li>
                  <li>Permettre les connexions des utilisateurs</li>
                  <li>Rendre les données à nouveau accessibles</li>
                  <li>Reprendre le fonctionnement normal</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Champ raison */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison de la réactivation *
              </Label>
              <Textarea
                id="reason"
                placeholder="Décrivez la raison de la réactivation du tenant..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Cette information sera enregistrée dans l'historique du tenant.
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !reason.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Réactivation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Réactiver le Tenant
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}