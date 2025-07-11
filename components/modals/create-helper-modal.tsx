// components/modals/create-helper-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppSelector } from "@/lib/hooks"
import { tenantHelpersApi } from "@/lib/api/tenant-helpers"
import { superAdminApi } from "@/lib/api/super-admin"
import { 
  UserPlus, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  Shield,
  User,
  Mail,
  Search,
  Users
} from "lucide-react"

interface CreateHelperModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  onHelperCreated?: () => void
}

interface SuperAdmin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  companyRole: string
}

interface SuperAdminResponse {
  data: SuperAdmin[]
  success: boolean
  page: number
  size: number
  totalElements: number
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

export const CreateHelperModal = ({
  isOpen,
  onClose,
  tenantId,
  onHelperCreated
}: CreateHelperModalProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    createdForId: "",
    isCreatedForActualUser: 0
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([])
  const [loadingSuperAdmins, setLoadingSuperAdmins] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { user } = useAppSelector((state) => state.auth)
  const validation = validatePassword(formData.password)
  const isValid = isPasswordValid(validation)

  // Charger les super admins
  useEffect(() => {
    if (isOpen) {
      fetchSuperAdmins()
    }
  }, [isOpen])

  const fetchSuperAdmins = async () => {
    try {
      setLoadingSuperAdmins(true)
      const response = await superAdminApi.getAllSuperAdmins({
        page: 0,
        size: 100 // Récupérer tous les super admins
      })
      
      if (response.success && response.data) {
        setSuperAdmins(response.data)
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des super admins:", err)
    } finally {
      setLoadingSuperAdmins(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "createdForId") {
      setFormData(prev => ({
        ...prev,
        createdForId: value,
        isCreatedForActualUser: 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      setError("Le mot de passe ne respecte pas tous les critères")
      return
    }
    
    if (!formData.email || !formData.firstName || !formData.lastName || 
        (formData.isCreatedForActualUser === 0 && !formData.createdForId)) {
      setError("Tous les champs sont obligatoires")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
    const success = await tenantHelpersApi.createHelper({
      tenantId,
      createdForId: formData.createdForId,
      isCreatedForActualUser: formData.isCreatedForActualUser,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    })
      
      if (success) {
        setSuccess(true)
        setTimeout(() => {
          resetForm()
          onHelperCreated?.()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la création de l'assistant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        createdForId: "",
        isCreatedForActualUser: 0
      })
      setError(null)
      setSuccess(false)
      setSearchTerm("")
    }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSelectMyself = () => {
    setFormData(prev => ({
      ...prev,
      createdForId: "",
      isCreatedForActualUser: 1
    }))
  }

  const filteredSuperAdmins = superAdmins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSuperAdmin = superAdmins.find(admin => admin.id === formData.createdForId)
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "Moi"

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Créer un Assistant</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ajouter un nouvel assistant pour ce locataire
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assistant créé avec succès !</h3>
            <p className="text-gray-600">L'assistant a été ajouté et peut maintenant se connecter.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Section Informations personnelles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prénom *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Entrez le prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nom de famille *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Entrez le nom de famille"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Adresse email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="assistant@exemple.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section Sécurité */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mot de passe *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Entrez un mot de passe sécurisé"
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

              {/* Critères de validation */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Critères requis :</h4>
                <ValidationItem isValid={validation.minLength} text="Au moins 8 caractères" />
                <ValidationItem isValid={validation.hasUppercase} text="Au moins 1 majuscule" />
                <ValidationItem isValid={validation.hasLowercase} text="Au moins 1 minuscule" />
                <ValidationItem isValid={validation.hasNumber} text="Au moins 1 chiffre" />
                <ValidationItem isValid={validation.hasSpecialChar} text="Au moins 1 caractère spécial" />
              </div>
            </div>

            {/* Section Attribution */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attribution</h3>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Créé pour *</label>
                
                {/* Option "Moi" */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.isCreatedForActualUser === 1 ? "default" : "outline"}
                    onClick={handleSelectMyself}
                    className="flex-shrink-0"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Moi ({currentUserName})
                  </Button>
                </div>

                {/* Sélection Super Admin */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Ou sélectionner un Super Admin :</label>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un super admin..."
                        className="pl-10"
                      />
                    </div>

                    {loadingSuperAdmins ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Chargement...</span>
                      </div>
                    ) : (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {filteredSuperAdmins.length > 0 ? (
                          filteredSuperAdmins.map((admin) => (
                            <div
                              key={admin.id}
                              className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                                formData.createdForId === admin.id && formData.isCreatedForActualUser === 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                              onClick={() => handleInputChange("createdForId", admin.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {admin.firstName} {admin.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">{admin.email}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {admin.companyRole}
                                    </Badge>
                                    <Badge variant={admin.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                                      {admin.status}
                                    </Badge>
                                  </div>
                                </div>
                                {formData.createdForId === admin.id && formData.isCreatedForActualUser === 0 && (
                                  <Check className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Aucun super admin trouvé
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Affichage sélection actuelle */}
                {selectedSuperAdmin && formData.isCreatedForActualUser === 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Sélectionné :</p>
                    <p className="text-blue-800">
                      {selectedSuperAdmin.firstName} {selectedSuperAdmin.lastName} ({selectedSuperAdmin.email})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
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
                disabled={!isValid || (formData.isCreatedForActualUser === 0 && !formData.createdForId) || isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer l'Assistant
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