"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { superAdminApi } from "@/lib/api/super-admin"
import { useSuperAdminDetail } from "@/hooks/use-super-admin-detail"
import { useProfilePicture } from "@/hooks/use-profile-picture"
import { UpdateSuperAdminRequest, SuperAdminUser } from "@/types/super-admin"
import {
  ArrowLeft,
  Shield,
  User,
  Phone,
  MapPin,
  Building,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  UserCog,
  Info
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

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default"
    case "INACTIVE":
      return "secondary"
    case "PENDING":
      return "outline"
    case "SUSPENDED":
      return "destructive"
    default:
      return "secondary"
  }
}

const getUserInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const EditSuperAdminContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { user, loading: userLoading, error: userError, refresh } = useSuperAdminDetail(email || "")
  const { profilePictureUrl, loading: imageLoading } = useProfilePicture(email || "", user?.documents || [])

  const [formData, setFormData] = useState<UpdateSuperAdminRequest>({
    firstName: "",
    lastName: "",
    companyRole: "",
    department: "",
    phoneNumber: "",
    address: ""
  })

  const [originalData, setOriginalData] = useState<UpdateSuperAdminRequest>({
    firstName: "",
    lastName: "",
    companyRole: "",
    department: "",
    phoneNumber: "",
    address: ""
  })

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user && user.email && !isInitialized) {
      console.log("🔄 Initializing form with user data:", user)
      
      const initialData: UpdateSuperAdminRequest = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        companyRole: user.companyRole || "",
        department: user.department || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      }
      
      console.log("📝 Setting form data:", initialData)
      
      setFormData(initialData)
      setOriginalData(initialData)
      setIsInitialized(true)
      setError(null)
    }
  }, [user, isInitialized])

  // Check for changes
  useEffect(() => {
    if (isInitialized) {
      const hasAnyChanges = Object.keys(formData).some(key => {
        const typedKey = key as keyof UpdateSuperAdminRequest
        return formData[typedKey] !== originalData[typedKey]
      })
      setHasChanges(hasAnyChanges)
      console.log("🔍 Changes detected:", hasAnyChanges)
    }
  }, [formData, originalData, isInitialized])

  // Debug effect
  useEffect(() => {
    if (user) {
      console.log("🧪 DEBUG - User data loaded:", {
        firstName: user.firstName,
        lastName: user.lastName,
        companyRole: user.companyRole,
        department: user.department,
        phoneNumber: user.phoneNumber,
        address: user.address
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    // Check if at least first name and last name are provided
    if (!formData.firstName?.trim()) {
      setError("Le prénom est requis")
      return false
    }

    if (!formData.lastName?.trim()) {
      setError("Le nom est requis")
      return false
    }

    // Phone number validation (if provided)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
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
    if (!hasChanges) {
      setError("Aucune modification détectée")
      return
    }
    if (!email) {
      setError("Email utilisateur manquant")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("✏️ Updating super admin with data:", formData)
      
      // Prepare data for sending (only include changed fields)
      const dataToSend: UpdateSuperAdminRequest = {}
      
      Object.keys(formData).forEach(key => {
        const typedKey = key as keyof UpdateSuperAdminRequest
        const currentValue = formData[typedKey]
        const originalValue = originalData[typedKey]
        
        // Only include fields that have changed
        if (currentValue !== originalValue) {
          if (currentValue && currentValue.trim() !== "") {
            dataToSend[typedKey] = currentValue.trim()
          } else if (originalValue && originalValue.trim() !== "") {
            // Field was cleared, send empty string to update
            dataToSend[typedKey] = ""
          }
        }
      })

      console.log("✏️ Data to send (only changed fields):", dataToSend)
      
      if (Object.keys(dataToSend).length === 0) {
        setError("Aucune modification valide détectée")
        return
      }
      
      const response = await superAdminApi.updateSuperAdmin(email, dataToSend)
      
      console.log("✅ Super admin updated successfully:", response)
      setSuccess(true)
      
      // Update original data to reflect changes
      setOriginalData({ ...formData })
      setHasChanges(false)
      
      // Refresh user data
      refresh()
      
      // Show success message and redirect after delay
      setTimeout(() => {
        router.push(`/dashboard/super-admins/user?email=${encodeURIComponent(email)}`)
      }, 2000)

    } catch (err: any) {
      console.error("❌ Failed to update super admin:", err)
      
      let errorMessage = "Erreur lors de la modification du super admin"
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || err.response.data?.message || "Données invalides"
      } else if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé"
      } else if (err.response?.status === 401) {
        errorMessage = "Vous n'avez pas l'autorisation de modifier ce super admin"
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
    if (hasChanges) {
      const confirmed = window.confirm("Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?")
      if (!confirmed) return
    }
    router.push(`/dashboard/super-admins/user?email=${encodeURIComponent(email || "")}`)
  }

  const handleReset = () => {
    console.log("🔄 Resetting form to original values:", originalData)
    setFormData({ ...originalData })
    setError(null)
    setSuccess(false)
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Request</h3>
          <p className="text-gray-500 mb-4">Email parameter is required</p>
          <Button onClick={() => router.push("/dashboard/super-admins")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Super Admins
          </Button>
        </div>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading super admin details...</p>
        </div>
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
          <p className="text-gray-500 mb-4">{userError || "User not found"}</p>
          <Button onClick={() => router.push("/dashboard/super-admins")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Super Admins
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Profil Mis à Jour!</h3>
            <p className="text-gray-600 mb-4">
              Le profil de <strong>{user.email}</strong> a été mis à jour avec succès.
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
                <UserCog className="mr-3 h-8 w-8 text-blue-600" />
                Modifier le Profil Super Admin
              </h1>
              <p className="text-gray-600">Mettre à jour les informations de {user.email}</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {imageLoading ? (
                  <AvatarFallback>
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={profilePictureUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">{user.firstName} {user.lastName}</h3>
                <p className="text-blue-700">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modification Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start text-amber-800">
              <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Informations modifiables</span>
                <p className="text-amber-700 text-sm mt-1">
                  Vous pouvez modifier les informations personnelles et professionnelles. 
                  L'email et le mot de passe ne peuvent pas être modifiés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations Personnelles
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
                      value={formData.firstName || ""}
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
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      placeholder="Entrez le nom"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyRole">Rôle dans l'entreprise</Label>
                  <Input
                    id="companyRole"
                    name="companyRole"
                    value={formData.companyRole || ""}
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
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department || ""}
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
                      value={formData.phoneNumber || ""}
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
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Adresse complète"
                      className="pl-10 resize-none"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Modifications détectées</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Vous avez des modifications non sauvegardées. Cliquez sur "Sauvegarder" pour les appliquer.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading || !hasChanges}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            
            <div className="flex space-x-4">
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
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}

export default function EditSuperAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    }>
      <EditSuperAdminContent />
    </Suspense>
  )
}