// components/modals/add-receipt-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TenantInvoice } from "@/lib/api/tenant-invoices"
import { modifyInvoiceApi, ModifyInvoiceRequest } from "@/lib/api/modify-invoice"
import { formatCurrency } from "@/lib/formatters"
import { PAYMENT_METHODS, Currency } from "@/lib/constants"
import {
  Receipt,
  Upload,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  X
} from "lucide-react"

interface AddReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: TenantInvoice | null
  onReceiptAdded: () => void
}

export function AddReceiptModal({
  isOpen,
  onClose,
  invoice,
  onReceiptAdded
}: AddReceiptModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    recuPaidAmount: "",
    paymentMethod: "",
    paymentReference: "",
    receiptFile: null as File | null
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        recuPaidAmount: "",
        paymentMethod: "",
        paymentReference: "",
        receiptFile: null
      })
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError(null)
      setSuccess(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Le fichier ne doit pas dépasser 2MB")
        return
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setError("Format de fichier non supporté. Utilisez PDF, JPG ou PNG")
        return
      }
      
      setFormData(prev => ({ ...prev, receiptFile: file }))
      setError(null)
    }
  }

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, receiptFile: null }))
  }

  const handleAmountChange = (value: string) => {
    // Permettre seulement les nombres avec maximum 2 décimales
    const regex = /^\d*\.?\d{0,2}$/
    if (regex.test(value) || value === "") {
      setFormData(prev => ({ ...prev, recuPaidAmount: value }))
      
      // Vérifier que le montant ne dépasse pas le montant restant
      if (invoice && value) {
        const amount = parseFloat(value)
        if (amount > invoice.remainingAmount) {
          setError(`Le montant ne peut pas dépasser le montant restant: ${formatCurrency(invoice.remainingAmount, invoice.currency as Currency)}`)
        } else {
          setError(null)
        }
      }
    }
  }

  const validateForm = (): boolean => {
    if (!formData.recuPaidAmount || parseFloat(formData.recuPaidAmount) <= 0) {
      setError("Le montant payé est requis et doit être supérieur à 0")
      return false
    }
    
    if (!formData.paymentMethod) {
      setError("La méthode de paiement est requise")
      return false
    }
    
    if (!formData.paymentReference.trim()) {
      setError("La référence de paiement est requise")
      return false
    }
    
    if (!formData.receiptFile) {
      setError("Le fichier reçu est requis")
      return false
    }
    
    if (invoice) {
      const amount = parseFloat(formData.recuPaidAmount)
      if (amount > invoice.remainingAmount) {
        setError(`Le montant ne peut pas dépasser le montant restant: ${formatCurrency(invoice.remainingAmount, invoice.currency as Currency)}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return

    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const request: ModifyInvoiceRequest = {
        tenantId: invoice.tenantId,
        invoiceId: invoice.invoiceId,
        // Champs de modification (null car on ne modifie que les reçus)
        dueDate: null,
        autoRenewalEnabled: null,
        isAutoGracePeriod: null,
        isManualGracePeriod: null,
        gracePeriodStartDate: null,
        gracePeriodEndDate: null,
        // Champs pour reçu (remplis cette fois)
        withRecus: 1,
        recuPaidAmount: parseFloat(formData.recuPaidAmount),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim()
      }

      console.log("🧾 Submitting receipt request:", request)

      const response = await modifyInvoiceApi.modifyInvoice(
        invoice.invoiceId, 
        request, 
        formData.receiptFile!
      )

      if (response.success) {
        setSuccess(true)
        onReceiptAdded()
        
        // Auto-close after 1.5 seconds
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setError("Échec de l'ajout du reçu")
      }
    } catch (err: any) {
      console.error("❌ Error adding receipt:", err)
      setError(err.response?.data?.error || err.message || "Erreur lors de l'ajout du reçu")
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Receipt className="h-6 w-6 mr-3 text-green-600" />
            Ajouter un Reçu - Facture {invoice.invoiceNumber.split('-').pop()}
          </DialogTitle>
        </DialogHeader>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Le reçu a été ajouté avec succès !
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
            <h3 className="font-semibold text-gray-900 mb-3">Informations de la facture</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tenant:</span>
                <span className="ml-2 font-medium">{invoice.tenantName}</span>
              </div>
              <div>
                <span className="text-gray-500">Plan:</span>
                <span className="ml-2 font-medium">{invoice.planName}</span>
              </div>
              <div>
                <span className="text-gray-500">Montant total:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatCurrency(invoice.totalAmount, invoice.currency as Currency)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Montant restant:</span>
                <span className="ml-2 font-medium text-orange-600">
                  {formatCurrency(invoice.remainingAmount, invoice.currency as Currency)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Montant payé */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <Label htmlFor="recuPaidAmount" className="text-base font-medium">
                Montant payé *
              </Label>
            </div>
            <div className="relative">
              <Input
                id="recuPaidAmount"
                type="text"
                placeholder="0.00"
                value={formData.recuPaidAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {invoice.currency || 'EUR'}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Maximum: {formatCurrency(invoice.remainingAmount, invoice.currency as Currency)}
            </p>
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <Label htmlFor="paymentMethod" className="text-base font-medium">
                Méthode de paiement *
              </Label>
            </div>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une méthode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT_CARD">Carte de crédit</SelectItem>
                <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Référence de paiement */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <Label htmlFor="paymentReference" className="text-base font-medium">
                Référence de paiement *
              </Label>
            </div>
            <Input
              id="paymentReference"
              type="text"
              placeholder="Ex: TRANSFER_2024_001, CARD_****1234, etc."
              value={formData.paymentReference}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Upload du fichier reçu */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              <Label htmlFor="receiptFile" className="text-base font-medium">
                Fichier reçu *
              </Label>
            </div>
            
            {!formData.receiptFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="receiptFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <Label htmlFor="receiptFile" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Cliquez pour sélectionner un fichier
                  </span>
                  <span className="text-gray-500"> ou glissez-déposez</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (max 2MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{formData.receiptFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(formData.receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reçu ajouté !
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Ajouter le reçu
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}