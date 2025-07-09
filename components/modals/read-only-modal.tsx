"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTenantEmergency } from "@/hooks/use-tenant-emergency"
import { Eye, Users, CheckCircle, RefreshCw, Building2, AlertTriangle } from "lucide-react"

interface ReadOnlyModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  tenantName: string
  onSuccess: () => void
}

export function ReadOnlyModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onSuccess
}: ReadOnlyModalProps) {
  const [reason, setReason] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    users,
    loading: usersLoading,
    error: usersError,
    actionLoading,
    setReadOnlyAccess
  } = useTenantEmergency(tenantId)

  const handleClose = () => {
    if (!actionLoading) {
      setReason("")
      setSelectedUserIds([])
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("La raison de l'accès en lecture seule est obligatoire")
      return
    }

    if (selectedUserIds.length === 0) {
      setError("Veuillez sélectionner au moins un utilisateur")
      return
    }

    try {
      setError(null)
      const result = await setReadOnlyAccess(reason.trim(), selectedUserIds)
      
      if (result) {
        setSuccess(true)
        onSuccess()
        setTimeout(() => {
          handleClose()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'activation du mode lecture seule")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-600">
            <Eye className="h-5 w-5 mr-2" />
            Mode Lecture Seule
          </DialogTitle>
          <DialogDescription>
            Accordez un accès en lecture seule aux utilisateurs sélectionnés.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Mode lecture seule activé !
            </h3>
            <p className="text-gray-600">
              Les utilisateurs sélectionnés ont maintenant un accès en lecture seule au tenant.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informations du tenant */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{tenantName}</span>
                <Badge variant="outline" className="text-xs">ID: {tenantId}</Badge>
              </div>
            </div>

            {/* Information */}
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Mode lecture seule :</strong> Les utilisateurs sélectionnés pourront 
                consulter les données mais ne pourront pas les modifier.
              </AlertDescription>
            </Alert>

            {/* Sélection des utilisateurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs éligibles ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Chargement des utilisateurs...</span>
                  </div>
                ) : usersError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{usersError}</AlertDescription>
                  </Alert>
                ) : users.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun utilisateur trouvé pour ce tenant.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={user.id}
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.companyRole}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raison */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison de l'accès en lecture seule *
              </Label>
              <Textarea
                id="reason"
                placeholder="Décrivez la raison de l'accès en lecture seule..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={actionLoading}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Cette information sera enregistrée dans l'historique du tenant.
              </p>
            </div>

            {/* Résumé */}
            {selectedUserIds.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {selectedUserIds.length} utilisateur(s) sélectionné(s)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Ces utilisateurs auront un accès en lecture seule au tenant.
                </p>
              </div>
            )}

            {/* Erreur */}
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
            <Button variant="outline" onClick={handleClose} disabled={actionLoading}>
              Annuler
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={actionLoading || !reason.trim() || selectedUserIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Activation...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activer le Mode Lecture Seule
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}