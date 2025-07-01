"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useCreatePlan } from "@/hooks/use-create-plan"
import { 
  CreatePlanRequest,
  HR_FEATURES,
  HR_LIMITS,
  HR_MODULES,
  PLAN_CATEGORIES,
  PLAN_STATUSES,
  CURRENCIES,
  PREDEFINED_CUSTOM_ATTRIBUTES
} from "@/types/create-plan"
import {
  ArrowLeft,
  Plus,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Settings,
  Database,
  Users,
  Zap,
  Trash2,
  Info
} from "lucide-react"

export default function AddPlanPage() {
  const router = useRouter()
  const { createPlan, loading, error, success, reset } = useCreatePlan()
  
  const [formData, setFormData] = useState<CreatePlanRequest>({
    planName: "",
    description: "",
    category: "SILVER",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "MAD",
    maxDatabaseStorageMB: 1024,
    maxS3StorageMB: 5120,
    maxUsers: 10,
    maxEmployees: 50,
    maxDepartments: 5,
    maxReports: 10,
    hrFeatures: {
      payroll: false,
      recruitment: false,
      performance_management: false,
      employee_onboarding: false,
      time_tracking: false,
      leave_management: false,
      training_management: false,
      document_management: false,
      reporting_analytics: false,
      employee_self_service: false
    },
    hrLimits: {
      max_payslips_per_month: 100,
      max_job_postings: 5,
      max_candidates_per_month: 50,
      max_performance_reviews: 100,
      max_training_sessions: 0,
      max_document_uploads_per_month: 100,
      max_custom_reports: 10,
      max_api_calls_per_day: 1000
    },
    status: "ACTIVE",
    version: "v1.0",
    isPublic: 1,
    isRecommended: 0,
    gracePeriodDays: 7,
    includedModules: [],
    customAttributes: {},
    termsAndConditions: ""
  })

  const [customAttributeKey, setCustomAttributeKey] = useState("")
  const [customAttributeValue, setCustomAttributeValue] = useState("")

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) reset()
  }

  const handleHRFeatureChange = (feature: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      hrFeatures: {
        ...prev.hrFeatures,
        [feature]: enabled
      }
    }))
  }

  const handleHRLimitChange = (limit: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      hrLimits: {
        ...prev.hrLimits,
        [limit]: value
      }
    }))
  }

  const handleModuleToggle = (moduleValue: string) => {
    setFormData(prev => ({
      ...prev,
      includedModules: prev.includedModules.includes(moduleValue)
        ? prev.includedModules.filter(m => m !== moduleValue)
        : [...prev.includedModules, moduleValue]
    }))
  }

  const handleAddCustomAttribute = () => {
    if (customAttributeKey && customAttributeValue) {
      setFormData(prev => ({
        ...prev,
        customAttributes: {
          ...prev.customAttributes,
          [customAttributeKey]: customAttributeValue
        }
      }))
      setCustomAttributeKey("")
      setCustomAttributeValue("")
    }
  }

  const handleRemoveCustomAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.customAttributes }
      delete newAttributes[key]
      return {
        ...prev,
        customAttributes: newAttributes
      }
    })
  }

  const handlePredefinedAttributeSelect = (key: string) => {
    setCustomAttributeKey(key)
  }

  const validateForm = () => {
    if (!formData.planName.trim()) {
      return "Plan name is required"
    }
    if (!formData.description.trim()) {
      return "Description is required"
    }
    if (formData.monthlyPrice <= 0) {
      return "Monthly price must be greater than 0"
    }
    if (formData.yearlyPrice <= 0) {
      return "Yearly price must be greater than 0"
    }
    if (formData.maxUsers <= 0) {
      return "Max users must be greater than 0"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    const result = await createPlan(formData)
    if (result) {
      setTimeout(() => {
        router.push("/dashboard/plans")
      }, 2000)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/plans")
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Créé!</h3>
          <p className="text-gray-600 mb-4">
            Le plan <strong>{formData.planName}</strong> a été créé avec succès.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers la liste des plans...
          </p>
        </div>
      </div>
    )
  }

  return (
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
              <Plus className="mr-3 h-8 w-8 text-teal-600" />
              Créer un Nouveau Plan
            </h1>
            <p className="text-gray-600">Configurez un nouveau plan d'abonnement</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Informations de Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planName">Nom du Plan *</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) => handleInputChange("planName", e.target.value)}
                  placeholder="Ex: Premium Business"
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  placeholder="Ex: v1.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez les fonctionnalités et avantages du plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic === 1}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked ? 1 : 0)}
                />
                <Label htmlFor="isPublic">Plan Public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecommended"
                  checked={formData.isRecommended === 1}
                  onCheckedChange={(checked) => handleInputChange("isRecommended", checked ? 1 : 0)}
                />
                <Label htmlFor="isRecommended">Plan Recommandé</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-green-500" />
              Tarification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyPrice">Prix Mensuel *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleInputChange("monthlyPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="yearlyPrice">Prix Annuel *</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={(e) => handleInputChange("yearlyPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="gracePeriodDays">Période de Grâce (jours)</Label>
                <Input
                  id="gracePeriodDays"
                  type="number"
                  value={formData.gracePeriodDays}
                  onChange={(e) => handleInputChange("gracePeriodDays", parseInt(e.target.value) || 0)}
                  placeholder="7"
                />
              </div>
            </div>
            {formData.monthlyPrice > 0 && formData.yearlyPrice > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">
                  Économie annuelle: {Math.round((1 - formData.yearlyPrice / (formData.monthlyPrice * 12)) * 100)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-500" />
              Limites des Ressources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxUsers">Utilisateurs Max</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange("maxUsers", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="maxEmployees">Employés Max</Label>
                <Input
                  id="maxEmployees"
                  type="number"
                  value={formData.maxEmployees}
                  onChange={(e) => handleInputChange("maxEmployees", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="maxDepartments">Départements Max</Label>
                <Input
                  id="maxDepartments"
                  type="number"
                  value={formData.maxDepartments}
                  onChange={(e) => handleInputChange("maxDepartments", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="maxDatabaseStorageMB">Stockage BD (MB)</Label>
                <Input
                  id="maxDatabaseStorageMB"
                  type="number"
                  value={formData.maxDatabaseStorageMB}
                  onChange={(e) => handleInputChange("maxDatabaseStorageMB", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="maxS3StorageMB">Stockage S3 (MB)</Label>
                <Input
                  id="maxS3StorageMB"
                  type="number"
                  value={formData.maxS3StorageMB}
                  onChange={(e) => handleInputChange("maxS3StorageMB", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="maxReports">Rapports Max</Label>
                <Input
                  id="maxReports"
                  type="number"
                  value={formData.maxReports}
                  onChange={(e) => handleInputChange("maxReports", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HR Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Fonctionnalités RH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HR_FEATURES.map((feature) => (
                <div key={feature.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.key}
                    checked={formData.hrFeatures[feature.key as keyof typeof formData.hrFeatures]}
                    onCheckedChange={(checked) => handleHRFeatureChange(feature.key, !!checked)}
                  />
                  <Label htmlFor={feature.key} className="text-sm">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HR Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-500" />
              Limites RH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HR_LIMITS.map((limit) => (
                <div key={limit.key}>
                  <Label htmlFor={limit.key} className="text-sm">
                    {limit.label}
                  </Label>
                  <Input
                    id={limit.key}
                    type="number"
                    value={formData.hrLimits[limit.key as keyof typeof formData.hrLimits]}
                    onChange={(e) => handleHRLimitChange(limit.key, parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Included Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-indigo-500" />
              Modules Inclus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HR_MODULES.map((module) => (
                <div key={module.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.value}
                    checked={formData.includedModules.includes(module.value)}
                    onCheckedChange={() => handleModuleToggle(module.value)}
                  />
                  <Label htmlFor={module.value} className="text-sm">
                    {module.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Modules sélectionnés: {formData.includedModules.length}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.includedModules.map((moduleValue) => {
                  const module = HR_MODULES.find(m => m.value === moduleValue)
                  return (
                    <Badge key={moduleValue} variant="secondary" className="text-xs">
                      {module?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-cyan-500" />
              Attributs Personnalisés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Custom Attribute */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customAttributeKey">Nom de l'Attribut</Label>
                  <Select value={customAttributeKey} onValueChange={handlePredefinedAttributeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner ou taper..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CUSTOM_ATTRIBUTES.map((attr) => (
                        <SelectItem key={attr.key} value={attr.key}>
                          {attr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="mt-2"
                    value={customAttributeKey}
                    onChange={(e) => setCustomAttributeKey(e.target.value)}
                    placeholder="Ou tapez un nom personnalisé..."
                  />
                </div>
                <div>
                  <Label htmlFor="customAttributeValue">Valeur</Label>
                  {customAttributeKey && PREDEFINED_CUSTOM_ATTRIBUTES.find(attr => attr.key === customAttributeKey) ? (
                    <Select value={customAttributeValue} onValueChange={setCustomAttributeValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une valeur..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_CUSTOM_ATTRIBUTES.find(attr => attr.key === customAttributeKey)?.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={customAttributeValue}
                      onChange={(e) => setCustomAttributeValue(e.target.value)}
                      placeholder="Entrez la valeur..."
                    />
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleAddCustomAttribute}
                    disabled={!customAttributeKey || !customAttributeValue}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>

            {/* Display Current Attributes */}
            {Object.keys(formData.customAttributes).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Attributs Configurés:</h4>
                <div className="space-y-2">
                  {Object.entries(formData.customAttributes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{key}:</span>
                        <span className="ml-2 text-sm text-gray-600">{value}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomAttribute(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Termes et Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="termsAndConditions">Conditions d'utilisation</Label>
              <Textarea
                id="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                placeholder="Décrivez les termes et conditions de ce plan..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
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
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer le Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}