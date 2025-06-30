"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { tenantApi } from "@/lib/api/tenant"
import { validateTenantData } from "@/lib/validators"
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Plus,
  X,
  FileText
} from "lucide-react"

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Transportation",
  "Energy",
  "Other"
]

const REGIONS = [
  "Europe",
  "North America",
  "Asia",
  "Africa",
  "South America",
  "Oceania",
  "MENA"
]

const COUNTRIES = [
  "France",
  "Morocco",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Spain",
  "Italy",
  "Other"
]

const TIMEZONES = [
  "Europe/Paris",
  "Africa/Casablanca",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney"
]

const PHONE_CODES = [
  { country: "Morocco", code: "+212", flag: "🇲🇦", id: "ma" },
  { country: "France", code: "+33", flag: "🇫🇷", id: "fr" },
  { country: "United States", code: "+1", flag: "🇺🇸", id: "us" },
  { country: "Canada", code: "+1", flag: "🇨🇦", id: "ca" },
  { country: "United Kingdom", code: "+44", flag: "🇬🇧", id: "uk" },
  { country: "Germany", code: "+49", flag: "🇩🇪", id: "de" },
  { country: "Spain", code: "+34", flag: "🇪🇸", id: "es" },
  { country: "Italy", code: "+39", flag: "🇮🇹", id: "it" }
]

const LEGAL_NUMBER_TYPES = [
  { value: "ice", label: "ICE", description: "Identifiant Commun de l'Entreprise" },
  { value: "rc", label: "RC", description: "Registre du Commerce" },
  { value: "patente", label: "Patente", description: "Licence d'exploitation" },
  { value: "cnss", label: "CNSS", description: "Caisse Nationale de Sécurité Sociale" },
  { value: "nif", label: "NIF", description: "Numéro d'Identification Fiscale" },
  { value: "tva", label: "TVA", description: "Numéro de TVA" },
  { value: "siret", label: "SIRET", description: "Système d'identification du répertoire des entreprises" },
  { value: "custom", label: "Autre", description: "Type personnalisé" }
]

interface LegalNumber {
  id: string
  type: string
  customType?: string
  value: string
}

export default function CreateTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Phone number state
  const [phoneCodeId, setPhoneCodeId] = useState("ma") // Use ID instead of code
  const [phoneNumber, setPhoneNumber] = useState("")

  // Get current phone code from ID
  const currentPhoneCode = PHONE_CODES.find(item => item.id === phoneCodeId)?.code || "+212"

  // Legal numbers state
  const [legalNumbers, setLegalNumbers] = useState<LegalNumber[]>([
    { id: "1", type: "", value: "" }
  ])

  const [formData, setFormData] = useState({
    // Tenant Information
    tenantName: "",
    industry: "",
    region: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    billingEmail: "",
    timeZone: "Africa/Casablanca",
    language: "fr",
    
    // Admin Information
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
    adminPassword: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (error) setError(null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only numbers
    setPhoneNumber(value)
    if (error) setError(null)
  }

  // Legal numbers management
  const addLegalNumber = () => {
    if (legalNumbers.length < 4) {
      setLegalNumbers(prev => [
        ...prev,
        { id: Date.now().toString(), type: "", value: "" }
      ])
    }
  }

  const removeLegalNumber = (id: string) => {
    if (legalNumbers.length > 1) {
      setLegalNumbers(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateLegalNumber = (id: string, field: keyof LegalNumber, value: string) => {
    setLegalNumbers(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare phone number
    const fullPhone = currentPhoneCode + phoneNumber

    // Prepare legal numbers object
    const legalNumbersObj: Record<string, string> = {}
    legalNumbers.forEach(item => {
      if (item.value.trim()) {
        const key = item.type === "custom" ? (item.customType || "").toLowerCase() : item.type
        if (key) {
          legalNumbersObj[key] = item.value.trim()
        }
      }
    })

    // Prepare final data
    const submitData = {
      ...formData,
      phone: fullPhone,
      legalNumbers: legalNumbersObj
    }

    // Validation
    const validation = validateTenantData(submitData)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await tenantApi.createTenant(submitData)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/tenants")
        }, 3000)
      } else {
        setError("Échec de la création du tenant")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erreur lors de la création du tenant")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/tenants")
  }

  if (success) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Tenant Créé avec Succès!
                </h3>
                <p className="text-green-700 mb-4">
                  Le tenant <strong>{formData.tenantName}</strong> a été créé avec succès.
                </p>
                <p className="text-sm text-green-600">
                  Redirection vers la liste des tenants...
                </p>
              </div>
            </CardContent>
          </Card>
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
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserPlus className="mr-3 h-8 w-8 text-blue-600" />
                Créer un Nouveau Tenant
              </h1>
              <p className="text-gray-600">Créer une nouvelle organisation avec son administrateur</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informations du Tenant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Nom du Tenant *</Label>
                  <Input
                    id="tenantName"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleInputChange}
                    placeholder="Ex: Medina Logistics"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industrie *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleSelectChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une industrie" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ex: Marrakech"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code Postal</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Ex: 40000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ex: Route de Casablanca, Sidi Ghanem"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="flex space-x-2">
                    <Select value={phoneCodeId} onValueChange={setPhoneCodeId}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHONE_CODES.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center space-x-2">
                              <span>{item.flag}</span>
                              <span>{item.code}</span>
                              <span className="text-xs text-gray-500">({item.country})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="524789123"
                      className="flex-1"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Numéro complet : {currentPhoneCode}{phoneNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Email de Facturation *</Label>
                  <Input
                    id="billingEmail"
                    name="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={handleInputChange}
                    placeholder="compta@medinalogistics.ma"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeZone">Fuseau Horaire *</Label>
                  <Select value={formData.timeZone} onValueChange={(value) => handleSelectChange("timeZone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue *</Label>
                  <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Numéros Légaux
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLegalNumber}
                  disabled={legalNumbers.length >= 4}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {legalNumbers.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Numéro Légal #{index + 1}</h4>
                    {legalNumbers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLegalNumber(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type de Numéro</Label>
                      <Select 
                        value={item.type} 
                        onValueChange={(value) => updateLegalNumber(item.id, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEGAL_NUMBER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {item.type === "custom" && (
                      <div className="space-y-2">
                        <Label>Nom du Type Personnalisé</Label>
                        <Input
                          value={item.customType || ""}
                          onChange={(e) => updateLegalNumber(item.id, "customType", e.target.value)}
                          placeholder="Ex: Licence Export"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Valeur</Label>
                      <Input
                        value={item.value}
                        onChange={(e) => updateLegalNumber(item.id, "value", e.target.value)}
                        placeholder="Ex: 003456789012345"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-gray-500">
                Maximum 4 numéros légaux. Les champs vides ne seront pas envoyés.
              </p>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations Administrateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">Prénom *</Label>
                  <Input
                    id="adminFirstName"
                    name="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={handleInputChange}
                    placeholder="Ex: Youssef"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Nom *</Label>
                  <Input
                    id="adminLastName"
                    name="adminLastName"
                    value={formData.adminLastName}
                    onChange={handleInputChange}
                    placeholder="Ex: Benjelloun"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    placeholder="manager@medinalogistics.ma"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Mot de Passe *</Label>
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 caractères"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer le Tenant
                </>
              )}
            </Button>
            
            <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}