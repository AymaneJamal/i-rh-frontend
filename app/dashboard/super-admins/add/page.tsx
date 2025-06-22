"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { superAdminApi } from "@/lib/api/super-admin"
import { CreateSuperAdminRequest } from "@/types/super-admin"
import { validatePassword } from "@/lib/password-validation"
import {
  ArrowLeft,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  UserPlus
} from "lucide-react"

const DEPARTMENTS = [
  "IT Operations",
  "Human Resources", 
  "Finance",
  "Marketing",
  "Operations",
  "Legal",
  "Administration",
  "Security"
]

const COMPANY_ROLES = [
  "System Administrator",
  "Senior Administrator", 
  "Platform Manager",
  "Security Manager",
  "Operations Manager",
  "Technical Lead"
]

export default function AddSuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const [formData, setFormData] = useState<CreateSuperAdminRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyRole: "",
    department: "",
    phoneNumber: "",
    address: "",
    createdBy: "ADMIN_PRINCIPAL" // Valeur par défaut fixée
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (error) setError(null)
    if (name === 'password' && passwordErrors.length > 0) {
      setPasswordErrors([])
    }
  }

  const validateForm = () => {
    // Required fields validation
    const requiredFields = ['email', 'password', 'firstName', 'lastName']
    for (const field of requiredFields) {
      if (!formData[field as keyof CreateSuperAdminRequest]) {
        setError(`Le champ ${field} est requis`)
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide")
      return false
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors)
      return false
    }

    // Phone number validation (if provided)
    if (formData.phoneNumber) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError("Format de numéro de téléphone invalide")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      console.log("🆕 Creating super admin with data:", formData)
      
      // Préparer les données pour l'envoi avec createdBy automatique
      const dataToSend = { 
        ...formData,
        createdBy: "ADMIN_PRINCIPAL" // Force la valeur
      }
      
      // Nettoyer les champs optionnels vides (sauf createdBy)
      if (!dataToSend.companyRole) delete dataToSend.companyRole
      if (!dataToSend.department) delete dataToSend.department
      if (!dataToSend.phoneNumber) delete dataToSend.phoneNumber
      if (!dataToSend.address) delete dataToSend.address
      
      const response = await superAdminApi.createSuperAdmin(dataToSend)
      
      console.log("✅ Super admin created successfully:", response)
      setSuccess(true)
      
      // Redirect to user details after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/super-admins/user?email=${encodeURIComponent(formData.email)}`)
      }, 2000)

    } catch (err: any) {
      console.error("❌ Failed to create super admin:", err)
      
      let errorMessage = "Erreur lors de la création du super admin"
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || err.response.data?.message || "Données invalides"
      } else if (err.response?.status === 409) {
        errorMessage = "Un utilisateur avec cet email existe déjà"
      } else if (err.response?.status === 401) {
        errorMessage = "Vous n'avez pas l'autorisation de créer des super admins"
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/super-admins")
  }

  if (success) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Créé!</h3>
            <p className="text-gray-600 mb-4">
              Le super admin <strong>{formData.email}</strong> a été créé avec succès.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de détails...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserPlus className="mr-3 h-8 w-8 text-red-600" />
                Ajouter un Super Admin
              </h1>
              <p className="text-gray-600">Créer un nouveau compte super administrateur</p>
            </div>
          </div>
        </div>

        {/* Access Level Warning */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">ADMIN_PRINCIPAL Access Required</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Seuls les utilisateurs avec le rôle ADMIN_PRINCIPAL peuvent créer des super admins.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations de Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Entrez le prénom"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Entrez le nom"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@example.com"
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Entrez un mot de passe sécurisé"
                      className="pl-10 pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {passwordErrors.length > 0 && (
                    <div className="text-sm text-red-600 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <p key={index} className="flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Informations Professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyRole">Rôle dans l'entreprise</Label>
                  <Input
                    id="companyRole"
                    name="companyRole"
                    value={formData.companyRole}
                    onChange={handleInputChange}
                    placeholder="ex: System Administrator"
                    disabled={loading}
                    list="company-roles"
                  />
                  <datalist id="company-roles">
                    {COMPANY_ROLES.map((role) => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="ex: IT Operations"
                    disabled={loading}
                    list="departments"
                  />
                  <datalist id="departments">
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+212 6 78 81 62 95"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Adresse complète"
                      className="pl-10 resize-none"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Le champ "Créé par" est maintenant complètement caché */}
                {/* La valeur ADMIN_PRINCIPAL est automatiquement envoyée */}
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Création..." : "Créer Super Admin"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}