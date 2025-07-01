"use client"

import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePlanDetail } from "@/hooks/use-plan-detail"
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Users,
  Database,
  Settings,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  Star,
  Crown,
  Info,
  Calendar,
  User,
  Building,
  FileText,
  Globe,
  Lock,
  Trash2
} from "lucide-react"

const getCategoryColor = (category: string) => {
  switch (category.toUpperCase()) {
    case "BRONZE":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "SILVER":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "GOLD":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "PLATINUM":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

const getCategoryIcon = (category: string) => {
  switch (category.toUpperCase()) {
    case "BRONZE":
      return <Shield className="h-4 w-4" />
    case "SILVER":
      return <Star className="h-4 w-4" />
    case "GOLD":
      return <Crown className="h-4 w-4" />
    case "PLATINUM":
      return <Zap className="h-4 w-4" />
    default:
      return <CreditCard className="h-4 w-4" />
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default"
    case "INACTIVE":
      return "secondary"
    case "DRAFT":
      return "outline"
    default:
      return "secondary"
  }
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currency || 'MAD',
    minimumFractionDigits: 0
  }).format(price)
}

const formatStorage = (megabytes: number) => {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(1)} GB`
  }
  return `${megabytes} MB`
}

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return "Non défini"
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const BooleanIndicator = ({ value, label }: { value: boolean | null, label: string }) => {
  if (value === null) {
    return (
      <div className="flex items-center text-gray-500">
        <Info className="h-4 w-4 mr-2" />
        <span className="text-sm">{label}: Non défini</span>
      </div>
    )
  }
  
  return (
    <div className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
      {value ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.planId as string
  
  const { plan, loading, error, refresh } = usePlanDetail(planId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des détails du plan...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de Chargement</h3>
          <p className="text-gray-500 mb-4">{error || "Plan non trouvé"}</p>
          <div className="space-x-2">
            <Button onClick={() => router.push("/dashboard/plans")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Plans
            </Button>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const activeFeatures = Object.entries(plan.hrFeatures).filter(([, enabled]) => enabled)
  const economyPercentage = plan.monthlyPrice > 0 ? 
    Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/plans")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{plan.planName}</h1>
              {plan.isRecommended === 1 && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  Recommandé
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">{plan.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ID du Plan</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{plan.planId}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Catégorie</p>
                <Badge className={`${getCategoryColor(plan.category)} border mt-1`}>
                  {getCategoryIcon(plan.category)}
                  <span className="ml-1">{plan.category}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <Badge variant={getStatusBadgeVariant(plan.status)} className="mt-1">
                  {plan.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Version</p>
                <p className="text-lg font-bold text-gray-900">{plan.version}</p>
              </div>
              <Info className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-500" />
                Informations de Prix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Prix Mensuel</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(plan.monthlyPrice, plan.currency)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Prix Annuel</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(plan.yearlyPrice, plan.currency)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Économie Annuelle</p>
                  <p className="text-2xl font-bold text-purple-600">{economyPercentage}%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>Devise: {plan.currency}</span>
                {plan.billingCycle && <span>Cycle: {plan.billingCycle}</span>}
                {plan.trialPeriodDays && <span>Essai: {plan.trialPeriodDays} jours</span>}
              </div>
            </CardContent>
          </Card>

          {/* Resource Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-500" />
                Limites de Ressources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Database className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Base de Données</p>
                    <p className="font-semibold">{formatStorage(plan.maxDatabaseStorageMB)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Database className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Stockage S3</p>
                    <p className="font-semibold">{formatStorage(plan.maxS3StorageMB)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs</p>
                    <p className="font-semibold">{plan.maxUsers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Employés</p>
                    <p className="font-semibold">{plan.maxEmployees.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Départements</p>
                    <p className="font-semibold">{plan.maxDepartments}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-cyan-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Rapports</p>
                    <p className="font-semibold">{plan.maxReports}</p>
                  </div>
                </div>
              </div>
              
              {/* Additional Limits */}
              {(plan.maxProjects || plan.maxDocuments) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.maxProjects && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Projets Max:</span>
                        <span className="font-semibold">{plan.maxProjects}</span>
                      </div>
                    )}
                    {plan.maxDocuments && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Documents Max:</span>
                        <span className="font-semibold">{plan.maxDocuments}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HR Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Fonctionnalités RH
                <Badge variant="outline" className="ml-2">
                  {activeFeatures.length}/{Object.keys(plan.hrFeatures).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(plan.hrFeatures).map(([feature, enabled]) => (
                  <div key={feature} className={`flex items-center p-2 rounded-lg ${
                    enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {enabled ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(plan.hrLimits).map(([limit, value]) => (
                  <div key={limit} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 capitalize">
                      {limit.replace(/_/g, ' ').replace('max ', '')}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Plan Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-indigo-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {plan.isPublic === 1 ? 'Plan Public' : 'Plan Privé'}
                  </span>
                </div>
                {plan.gracePeriodDays > 0 && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Période de grâce: {plan.gracePeriodDays} jours</span>
                  </div>
                )}
                {plan.autoRenewalDays && (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Auto-renouvellement: {plan.autoRenewalDays} jours</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-cyan-500" />
                Fonctionnalités Avancées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <BooleanIndicator value={plan.hasAdvancedReporting} label="Rapports Avancés" />
              <BooleanIndicator value={plan.hasApiAccess} label="Accès API" />
              <BooleanIndicator value={plan.hasCustomBranding} label="Branding Personnalisé" />
              <BooleanIndicator value={plan.hasMultiLanguage} label="Multi-langues" />
              <BooleanIndicator value={plan.hasSsoIntegration} label="Intégration SSO" />
              <BooleanIndicator value={plan.hasBackupRestore} label="Sauvegarde & Restauration" />
              <BooleanIndicator value={plan.hasPrioritySupport} label="Support Prioritaire" />
            </CardContent>
          </Card>

          {/* Included Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-indigo-500" />
                Modules Inclus
                <Badge variant="outline" className="ml-2">
                  {plan.includedModules.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {plan.includedModules.map((module) => (
                  <Badge key={module} variant="secondary" className="text-xs">
                    {module.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Attributes */}
          {Object.keys(plan.customAttributes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-cyan-500" />
                  Attributs Personnalisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(plan.customAttributes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Management - Only show if there's content */}
          {(plan.upgradeableTo || plan.downgradeableTo || plan.requiresDataMigration !== null) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-2 text-gray-500" />
                  Gestion du Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.upgradeableTo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mise à niveau vers:</span>
                    <Badge variant="outline">{plan.upgradeableTo}</Badge>
                  </div>
                )}
                {plan.downgradeableTo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rétrogradation vers:</span>
                    <Badge variant="outline">{plan.downgradeableTo}</Badge>
                  </div>
                )}
                {plan.requiresDataMigration !== null && (
                  <div className="flex items-center space-x-2">
                    {plan.requiresDataMigration ? (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">
                      {plan.requiresDataMigration ? 'Migration requise' : 'Aucune migration requise'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Créé par</p>
                <p className="text-sm font-medium">{plan.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Créé le</p>
                <p className="text-sm">{formatDate(plan.createdAt)}</p>
              </div>
              {plan.modifiedBy && (
                <div>
                  <p className="text-xs text-gray-500">Modifié par</p>
                  <p className="text-sm font-medium">{plan.modifiedBy}</p>
                </div>
              )}
              {plan.modifiedAt && (
                <div>
                  <p className="text-xs text-gray-500">Modifié le</p>
                  <p className="text-sm">{formatDate(plan.modifiedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms and Conditions */}
      {plan.termsAndConditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-500" />
              Termes et Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {plan.termsAndConditions}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier le Plan
              </Button>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Dupliquer le Plan
              </Button>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer le Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}