"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { usePlans } from "@/hooks/use-plans"
import { Plan } from "@/types/plan"
import { 
  CreditCard, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
  Database,
  HardDrive,
  Building,
  Star,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  TrendingUp
} from "lucide-react"

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" }
]

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

const PlanCard = ({ plan }: { plan: Plan }) => {
  const router = useRouter()
  const activeFeatures = Object.entries(plan.hrFeatures).filter(([, enabled]) => enabled)
  const includedModulesCount = plan.includedModules.length

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      plan.isRecommended ? 'ring-2 ring-teal-500 shadow-md' : 'hover:shadow-md'
    }`}>
      {plan.isRecommended && (
        <div className="absolute top-0 right-0 bg-teal-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          <Star className="h-3 w-3 inline mr-1" />
          Recommandé
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getCategoryColor(plan.category)} border`}>
              {getCategoryIcon(plan.category)}
              <span className="ml-1">{plan.category}</span>
            </Badge>
            <Badge variant={getStatusBadgeVariant(plan.status)}>
              {plan.status}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Version</div>
            <div className="text-sm font-medium">{plan.version}</div>
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold text-gray-900 mt-2">
          {plan.planName}
        </CardTitle>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {plan.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Mensuel</div>
              <div className="text-lg font-bold text-teal-600">
                {formatPrice(plan.monthlyPrice, plan.currency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Annuel</div>
              <div className="text-lg font-bold text-teal-600">
                {formatPrice(plan.yearlyPrice, plan.currency)}
              </div>
              <div className="text-xs text-green-600">
                Économie: {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-gray-600">Utilisateurs:</span>
            <span className="ml-1 font-medium">{plan.maxUsers.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-gray-600">Employés:</span>
            <span className="ml-1 font-medium">{plan.maxEmployees.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm">
            <Database className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-gray-600">Base de données:</span>
            <span className="ml-1 font-medium">{formatStorage(plan.maxDatabaseStorageMB)}</span>
          </div>
          <div className="flex items-center text-sm">
            <HardDrive className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-gray-600">Stockage S3:</span>
            <span className="ml-1 font-medium">{formatStorage(plan.maxS3StorageMB)}</span>
          </div>
        </div>

        <Separator />

        {/* Features Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fonctionnalités RH</span>
            <Badge variant="outline" className="text-xs">
              {activeFeatures.length}/{Object.keys(plan.hrFeatures).length}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {activeFeatures.slice(0, 4).map(([feature]) => (
              <div key={feature} className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-gray-600 capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          {activeFeatures.length > 4 && (
            <div className="text-xs text-gray-500 mt-1">
              +{activeFeatures.length - 4} autres fonctionnalités
            </div>
          )}
        </div>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Modules inclus</span>
            <Badge variant="outline" className="text-xs">
              {includedModulesCount}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {plan.includedModules.slice(0, 3).map((module) => (
              <Badge key={module} variant="secondary" className="text-xs">
                {module.replace(/_/g, ' ')}
              </Badge>
            ))}
            {includedModulesCount > 3 && (
              <Badge variant="outline" className="text-xs">
                +{includedModulesCount - 3}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/plans/${plan.planId}`)}>
            <Eye className="h-4 w-4 mr-1" />
            Détails
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Période de grâce: {plan.gracePeriodDays} jours</div>
          <div>Créé par: {plan.createdBy}</div>
          <div>Créé le: {new Date(plan.createdAt).toLocaleDateString('fr-FR')}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PlansPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { plans, loading, error, metadata, filters, updateFilters, refresh, clearFilters } = usePlans()

  const filteredPlans = plans.filter(plan =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: metadata?.count || 0,
    active: plans.filter(p => p.status === "ACTIVE").length,
    recommended: plans.filter(p => p.isRecommended).length,
    public: plans.filter(p => p.isPublic).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600 mt-1">
            Gérez les plans d'abonnement et leurs fonctionnalités
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plans Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recommandés</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.recommended}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plans Publics</p>
                <p className="text-2xl font-bold text-purple-600">{stats.public}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, description ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.category || "all"} 
                onValueChange={(value) => updateFilters({ category: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.publicOnly?.toString() || "all"} 
                onValueChange={(value) => updateFilters({ 
                  publicOnly: value === "all" ? undefined : value === "true" 
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Visibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Publics uniquement</SelectItem>
                  <SelectItem value="false">Privés uniquement</SelectItem>
                </SelectContent>
              </Select>

              {(filters.category || filters.publicOnly !== undefined || searchTerm) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearFilters()
                    setSearchTerm("")
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Affichage de {filteredPlans.length} plan{filteredPlans.length > 1 ? 's' : ''} sur {stats.total}
            </span>
            {searchTerm && (
              <span>Résultats pour "{searchTerm}"</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <PlanCard key={plan.planId} plan={plan} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun plan trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.category || filters.publicOnly !== undefined
                ? "Aucun plan ne correspond à vos critères de recherche."
                : "Aucun plan d'abonnement n'est disponible pour le moment."
              }
            </p>
            {(searchTerm || filters.category || filters.publicOnly !== undefined) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  clearFilters()
                  setSearchTerm("")
                }}
              >
                Effacer les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}