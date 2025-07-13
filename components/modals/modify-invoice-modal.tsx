// components/modals/modify-invoice-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TenantInvoice } from "@/lib/api/tenant-invoices"
import { modifyInvoiceApi, ModifyInvoiceRequest } from "@/lib/api/modify-invoice"
import { formatDate } from "@/lib/formatters"
import {
  CalendarDays,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Clock
} from "lucide-react"

interface ModifyInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: TenantInvoice | null
  onInvoiceModified: () => void
}

export function ModifyInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onInvoiceModified
}: ModifyInvoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    dueDate: "",
    autoRenewalEnabled: false,
    isAutoGracePeriod: false,
    isManualGracePeriod: false,
    gracePeriodStartDate: "",
    gracePeriodEndDate: ""
  })

  // Initialize form with invoice data
  useEffect(() => {
    if (invoice && isOpen) {
      setFormData({
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
        autoRenewalEnabled: invoice.autoRenewalEnabled === 1,
        isAutoGracePeriod: invoice.isAutoGracePeriod === 1,
        isManualGracePeriod: invoice.isManualGracePeriod === 1,
        gracePeriodStartDate: invoice.gracePeriodStartDate 
          ? new Date(invoice.gracePeriodStartDate).toISOString().split('T')[0] 
          : "",
        gracePeriodEndDate: invoice.gracePeriodEndDate 
          ? new Date(invoice.gracePeriodEndDate).toISOString().split('T')[0] 
          : ""
      })
      setError(null)
      setSuccess(false)
    }
  }, [invoice, isOpen])

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError(null)
      setSuccess(false)
    }
  }

  const handleGracePeriodToggle = (type: 'auto' | 'manual', enabled: boolean) => {
    if (type === 'auto') {
      setFormData(prev => ({
        ...prev,
        isAutoGracePeriod: enabled,
        isManualGracePeriod: enabled ? false : prev.isManualGracePeriod
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        isManualGracePeriod: enabled,
        isAutoGracePeriod: enabled ? false : prev.isAutoGracePeriod
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return

    setLoading(true)
    setError(null)

    try {
      const request: ModifyInvoiceRequest = {
        tenantId: invoice.tenantId,
        invoiceId: invoice.invoiceId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
        autoRenewalEnabled: formData.autoRenewalEnabled ? 1 : 0,
        isAutoGracePeriod: formData.isAutoGracePeriod ? 1 : 0,
        isManualGracePeriod: formData.isManualGracePeriod ? 1 : 0,
        gracePeriodStartDate: formData.gracePeriodStartDate 
          ? new Date(formData.gracePeriodStartDate).getTime() 
          : null,
        gracePeriodEndDate: formData.gracePeriodEndDate 
          ? new Date(formData.gracePeriodEndDate).getTime() 
          : null,
        // Champs pour reçu (null pour modification simple)
        withRecus: null,
        recuPaidAmount: null,
        paymentMethod: null,
        paymentReference: null
      }

      console.log("🔍 Submitting modify request:", request)

      const response = await modifyInvoiceApi.modifyInvoice(invoice.invoiceId, request)

      if (response.success) {
        setSuccess(true)
        onInvoiceModified()
        
        // Auto-close after 1.5 seconds
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setError("Échec de la modification de la facture")
      }
    } catch (err: any) {
      console.error("❌ Error modifying invoice:", err)
      setError(err.response?.data?.error || err.message || "Erreur lors de la modification")
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) return null

  const canModifyDueDate = invoice.invoiceType !== 'PREPAYE'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Settings className="h-6 w-6 mr-3 text-blue-600" />
            Modifier la Facture {invoice.invoiceNumber.split('-').pop()}
          </DialogTitle>
        </DialogHeader>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              La facture a été modifiée avec succès !
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informations de la facture */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Informations de la facture</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tenant:</span>
                <span className="ml-2 font-medium">{invoice.tenantName}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{invoice.invoiceType}</span>
              </div>
              <div>
                <span className="text-gray-500">Plan:</span>
                <span className="ml-2 font-medium">{invoice.planName}</span>
              </div>
              <div>
                <span className="text-gray-500">Statut:</span>
                <span className="ml-2 font-medium">{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Date d'échéance */}
          {canModifyDueDate && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <Label htmlFor="dueDate" className="text-base font-medium">
                  Date d'échéance
                </Label>
              </div>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full"
              />
              {invoice.dueDate && (
                <p className="text-sm text-gray-500">
                  Actuelle: {formatDate(invoice.dueDate)}
                </p>
              )}
            </div>
          )}

          {!canModifyDueDate && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                La date d'échéance ne peut pas être modifiée pour les factures prépayées.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Renouvellement automatique */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-green-600" />
              <div>
                <Label className="text-base font-medium">Renouvellement automatique</Label>
                <p className="text-sm text-gray-500">Activer le renouvellement automatique</p>
              </div>
            </div>
            <Switch
              checked={formData.autoRenewalEnabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, autoRenewalEnabled: checked }))
              }
            />
          </div>

          <Separator />

          {/* Période de grâce */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <Label className="text-base font-medium">Période de grâce</Label>
            </div>

            {/* Période de grâce automatique */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Période de grâce automatique</Label>
                <p className="text-sm text-gray-500">Utiliser la période de grâce du plan</p>
              </div>
              <Switch
                checked={formData.isAutoGracePeriod}
                onCheckedChange={(checked) => handleGracePeriodToggle('auto', checked)}
              />
            </div>

            {/* Période de grâce manuelle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Période de grâce manuelle</Label>
                  <p className="text-sm text-gray-500">Définir une période personnalisée</p>
                </div>
                <Switch
                  checked={formData.isManualGracePeriod}
                  onCheckedChange={(checked) => handleGracePeriodToggle('manual', checked)}
                />
              </div>

              {/* Dates de période manuelle */}
              {formData.isManualGracePeriod && (
                <div className="pl-4 space-y-4 border-l-2 border-purple-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gracePeriodStartDate" className="text-sm font-medium">
                        Date de début
                      </Label>
                      <Input
                        id="gracePeriodStartDate"
                        type="date"
                        value={formData.gracePeriodStartDate}
                        onChange={(e) => 
                          setFormData(prev => ({ ...prev, gracePeriodStartDate: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gracePeriodEndDate" className="text-sm font-medium">
                        Date de fin
                      </Label>
                      <Input
                        id="gracePeriodEndDate"
                        type="date"
                        value={formData.gracePeriodEndDate}
                        onChange={(e) => 
                          setFormData(prev => ({ ...prev, gracePeriodEndDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Période actuelle */}
                  {invoice.gracePeriodStartDate && invoice.gracePeriodEndDate && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-1">Période actuelle:</p>
                      <p>Du {formatDate(invoice.gracePeriodStartDate)} au {formatDate(invoice.gracePeriodEndDate)}</p>
                      {invoice.manualGracePeriodSetBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Définie par: {invoice.manualGracePeriodSetBy}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Modifiée !
                </>
              ) : (
                "Modifier la facture"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}