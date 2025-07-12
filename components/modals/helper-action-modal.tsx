// components/modals/helper-action-modal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  User,
  RefreshCw
} from "lucide-react"

interface HelperActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean>
  action: 'suspend' | 'reactivate'
  helperName: string
  loading?: boolean
}

export const HelperActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  helperName,
  loading = false
}: HelperActionModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const isSuspend = action === 'suspend'
  
  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      const success = await onConfirm()
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Erreur lors de l'action:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              isSuspend 
                ? 'bg-gradient-to-br from-red-500 to-orange-600' 
                : 'bg-gradient-to-br from-green-500 to-blue-600'
            }`}>
              {isSuspend ? (
                <Ban className="h-6 w-6 text-white" />
              ) : (
                <CheckCircle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isSuspend ? 'Suspendre Assistant' : 'Réactiver Assistant'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Confirmation requise
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations sur l'assistant */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{helperName}</p>
                <p className="text-sm text-gray-500">Assistant</p>
              </div>
            </div>
          </div>

          {/* Message de confirmation */}
          <Alert className={`border ${
            isSuspend ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
          }`}>
            <AlertTriangle className={`h-4 w-4 ${
              isSuspend ? 'text-red-600' : 'text-green-600'
            }`} />
            <AlertDescription className={`${
              isSuspend ? 'text-red-700' : 'text-green-700'
            }`}>
              {isSuspend ? (
                <>
                  <strong>Attention :</strong> En suspendant cet assistant, il ne pourra plus se connecter 
                  à l'application jusqu'à ce qu'il soit réactivé.
                </>
              ) : (
                <>
                  <strong>Confirmation :</strong> L'assistant sera réactivé et pourra à nouveau 
                  se connecter à l'application.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 ${
                isSuspend 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isSuspend ? 'Suspension...' : 'Réactivation...'}
                </>
              ) : (
                <>
                  {isSuspend ? (
                    <Ban className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {isSuspend ? 'Suspendre' : 'Réactiver'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}