// components/tenant/password-reset-component.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  Shield
} from "lucide-react"

interface PasswordResetComponentProps {
  isOpen: boolean
  onClose: () => void
  onResetPassword: (newPassword: string) => Promise<boolean>
  helperName: string
  loading?: boolean
}

interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
}

const isPasswordValid = (validation: PasswordValidation): boolean => {
  return Object.values(validation).every(Boolean)
}

export const PasswordResetComponent = ({
  isOpen,
  onClose,
  onResetPassword,
  helperName,
  loading = false
}: PasswordResetComponentProps) => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validation = validatePassword(newPassword)
  const isValid = isPasswordValid(validation)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      setError("Le mot de passe ne respecte pas tous les critères")
      return
    }
    
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const success = await onResetPassword(newPassword)
      
      if (success) {
        setSuccess(true)
        setTimeout(() => {
          setNewPassword("")
          setConfirmPassword("")
          setSuccess(false)
          onClose()
        }, 2000)
      }
    } catch (err) {
      setError("Erreur lors du changement de mot de passe")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
    setSuccess(false)
    onClose()
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {isValid ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm ${isValid ? 'text-green-700' : 'text-red-600'}`}>
        {text}
      </span>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
              <p className="text-sm text-gray-500 mt-1">Pour {helperName}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mot de passe modifié !</h3>
            <p className="text-gray-600">Le mot de passe a été changé avec succès.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez le nouveau mot de passe"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {passwordsMatch ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${passwordsMatch ? 'text-green-700' : 'text-red-600'}`}>
                    {passwordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                  </span>
                </div>
              )}
            </div>

            {/* Critères de validation */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Critères requis :</h4>
              <ValidationItem isValid={validation.minLength} text="Au moins 8 caractères" />
              <ValidationItem isValid={validation.hasUppercase} text="Au moins 1 majuscule" />
              <ValidationItem isValid={validation.hasLowercase} text="Au moins 1 minuscule" />
              <ValidationItem isValid={validation.hasNumber} text="Au moins 1 chiffre" />
              <ValidationItem isValid={validation.hasSpecialChar} text="Au moins 1 caractère spécial" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isValid || !passwordsMatch || isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Changement...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}