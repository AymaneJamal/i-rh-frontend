"use client"

import { AssignPlanModal } from "@/components/modals/assign-plan-modal"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { SuspendTenantModal } from "@/components/modals/suspend-tenant-modal"
import { ReactivateTenantModal } from "@/components/modals/reactivate-tenant-modal"
import { useTenantDetail } from "@/hooks/use-tenant-detail"
import { useTenantSubscription } from "@/hooks/use-tenant-subscription"
import { useTenantInvoices } from "@/hooks/use-tenant-invoices"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { formatCurrency, formatDate, formatDuration } from "@/lib/formatters"
import { formatBytes } from "@/lib/utils"
import { Currency } from "@/lib/constants"
// Ajouter ces imports :
import { StatusHistorySection } from "@/components/tenant/status-history-section"
import { InvoicesSection } from "@/components/tenant/invoices-section"
import { useTenantHistory } from "@/hooks/use-tenant-history"
import {
  ArrowLeft,
  Building2,
  User,
  Database,
  HardDrive,
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Pause,
  Play,
  FileText,
  DollarSign,
  Activity,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

interface TenantActionCardProps {
  tenant: any
  onSuspend: () => void
  onReactivate: () => void
  onAssignPlan: () => void
  loading: boolean
}

function TenantActionCard({ tenant, onSuspend, onReactivate, onAssignPlan, loading }: TenantActionCardProps) {
  const isActive = tenant?.status === "ACTIVE"
  const isSuspended = tenant?.status === "SUSPENDED"
  const hasPlan = tenant?.plan?.id

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Actions Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onAssignPlan} 
          disabled={loading}
          className="w-full"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {hasPlan ? "Changer de Plan" : "Attribuer un Plan"}
        </Button>
        
        {isActive ? (
          <Button 
            variant="destructive" 
            onClick={onSuspend} 
            disabled={loading}
            className="w-full"
          >
            <Pause className="h-4 w-4 mr-2" />
            Suspendre
          </Button>
        ) : isSuspended ? (
          <Button 
            variant="default" 
            onClick={onReactivate} 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Réactiver
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId as string

  // Modals state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Hooks
  const {
    tenant,
    adminUser,
    loading,
    error,
    isAvailable,
    remainingTime,
    subscriptionStatus,
    usageData,
    statusLoading,
    usageLoading,
    hasSubscription,
    hasUsageAlerts,
    isInGracePeriod,
    isSuspended,
    isExpired,
    usagePercentages,
    daysUntilExpiry,
    refresh,
    refreshSubscriptionData
  } = useTenantDetail(tenantId, false) // POLLING DISABLED

  const { assignPlan } = useTenantSubscription()

    const {
      statusHistory,
      statusLoading: historyStatusLoading,
      statusError: historyStatusError,
      refreshStatusHistory,
      invoices,
      invoicesLoading: historyInvoicesLoading,
      invoicesError: historyInvoicesError,
      refreshInvoices,
      refreshAll: refreshHistory
    } = useTenantHistory(tenantId)

  // ===============================================================================
  // STATUS HELPERS
  // ===============================================================================

  const getStatusBadge = (status: string) => {
    const statusMappings: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      ACTIVE: "default",
      SUSPENDED: "destructive", 
      GRACE_PERIOD: "secondary",
      EXPIRED: "destructive",
      PENDING: "outline"
    }
    
    const variant = statusMappings[status] || "outline"
    
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    )
  }

  const getSubscriptionBadge = (expiryDate: number | null) => {
    if (!expiryDate) return <Badge variant="outline">Aucun plan</Badge>
    
    const now = Date.now()
    const isExpired = now > expiryDate
    
    if (isExpired) {
      return <Badge variant="destructive">Expiré</Badge>
    }
    
    const daysLeft = Math.floor((expiryDate - now) / (24 * 60 * 60 * 1000))
    
    if (daysLeft <= 7) {
      return <Badge variant="secondary">Expire dans {daysLeft} jour(s)</Badge>
    }
    
    return <Badge variant="default">Actif</Badge>
  }




  // ===============================================================================
  // ACTION HANDLERS
  // ===============================================================================

  const handleSuspendTenant = async (reason: string) => {
    try {
      setActionLoading(true)
      await tenantSubscriptionApi.suspendTenant(tenantId, reason)
      
      // Refresh data
      refresh()
      refreshSubscriptionData()
      
    } catch (error: any) {
      console.error("Failed to suspend tenant:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateTenant = async (newPlanId?: string) => {
    try {
      setActionLoading(true)
      await tenantSubscriptionApi.reactivateTenant(tenantId, newPlanId)
      
      // Refresh data
      refresh()
      refreshSubscriptionData()
      
    } catch (error: any) {
      console.error("Failed to reactivate tenant:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssignPlan = () => {
    setShowSubscriptionModal(true)
  }

  const handleSubscriptionAssigned = () => {
    // Actualiser seulement les données principales, pas l'API usage qui fait erreur
    refresh()
    if (refreshInvoices) {
      refreshInvoices()
    }
    // refreshSubscriptionData() : a remplacer pour prendre les subscription data une fois le backend et bien
  }

  // Manual refresh for subscription data
  const handleRefreshUsageData = async () => {
    refreshSubscriptionData()
  }



  // ===============================================================================
  // RENDER LOADING STATE
  // ===============================================================================

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Chargement des détails du tenant...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // ===============================================================================
  // RENDER ERROR STATE
  // ===============================================================================

  if (error) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/dashboard/tenants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des détails du tenant : {error}
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  // ===============================================================================
  // RENDER UNAVAILABLE STATE
  // ===============================================================================

  if (!isAvailable) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/dashboard/tenants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tenant en cours de traitement</h3>
                <p className="text-gray-600 mb-4">
                  Les détails du tenant seront disponibles dans {formatDuration(remainingTime)}
                </p>
                <Button onClick={refresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (!tenant) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Tenant non trouvé</AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  // ===============================================================================
  // MAIN RENDER
  // ===============================================================================

  return (
    <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/tenants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="mr-3 h-8 w-8 text-blue-600" />
                {tenant.name}
              </h1>
              <p className="text-gray-600">ID: {tenant.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(tenant.status)}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshUsageData}
              disabled={statusLoading || usageLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(statusLoading || usageLoading) ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">


            {/* Suspension Info if suspended */}
            {tenant.status === "SUSPENDED" && tenant.suspensionReason && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Pause className="h-5 w-5 mr-2" />
                    Suspension
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date de suspension</p>
                      <p className="text-lg">
                        {tenant.suspensionDate ? formatDate(tenant.suspensionDate) : "Inconnue"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Raison</p>
                      <p className="text-sm bg-red-50 p-2 rounded">
                        {tenant.suspensionReason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-lg">{tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    {getStatusBadge(tenant.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Créé le</p>
                    <p className="text-lg">{formatDate(tenant.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Créé par</p>
                    <p className="text-lg">{tenant.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Région</p>
                    <p className="text-lg">{tenant.region}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industrie</p>
                    <p className="text-lg">{tenant.industry}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Abonnement
                  {statusLoading && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tenant.plan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Plan actuel</p>
                        <p className="text-lg font-semibold">{tenant.plan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Prix mensuel</p>
                        <p className="text-lg">
                          {tenant.currentPlanPrice ? 
                            formatCurrency(tenant.currentPlanPrice, tenant.currency as Currency) : 
                            "Non défini"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date de début</p>
                        <p className="text-lg">
                          {tenant.planStartDate ? formatDate(tenant.planStartDate) : "Non définie"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date d'expiration</p>
                        <p className="text-lg">
                          {tenant.planExpiryDate ? formatDate(tenant.planExpiryDate) : "Non définie"}
                        </p>
                      </div>
                    </div>

                    {daysUntilExpiry !== null && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Temps restant</span>
                          <span className="text-sm text-gray-600">
                            {daysUntilExpiry} jour(s)
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, (daysUntilExpiry / 30) * 100))} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {isInGracePeriod && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ce tenant est actuellement en période de grâce.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun plan attribué</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Information - Show from tenant data instead of API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Utilisation des Ressources
                  {usageLoading && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Database Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        Stockage Base de Données
                      </span>
                      <span className="text-sm text-gray-600">
                        {tenant.currentDatabaseUsageMB} MB
                      </span>
                    </div>
                    <div className="bg-gray-100 h-2 rounded">
                      <div className="bg-blue-500 h-2 rounded" style={{width: '20%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usage actuel</p>
                  </div>

                  {/* S3 Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center">
                        <HardDrive className="h-4 w-4 mr-2" />
                        Stockage S3
                      </span>
                      <span className="text-sm text-gray-600">
                        {tenant.currentS3UsageMB} MB
                      </span>
                    </div>
                    <div className="bg-gray-100 h-2 rounded">
                      <div className="bg-green-500 h-2 rounded" style={{width: '10%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usage actuel</p>
                  </div>

                  {/* Users Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Utilisateurs
                      </span>
                      <span className="text-sm text-gray-600">
                        {tenant.currentUsersCount}
                      </span>
                    </div>
                    <div className="bg-gray-100 h-2 rounded">
                      <div className="bg-purple-500 h-2 rounded" style={{width: '5%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Utilisateurs actifs</p>
                  </div>

                  {/* Employees Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Employés
                      </span>
                      <span className="text-sm text-gray-600">
                        {tenant.currentEmployeesCount}
                      </span>
                    </div>
                    <div className="bg-gray-100 h-2 rounded">
                      <div className="bg-orange-500 h-2 rounded" style={{width: '0%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Employés enregistrés</p>
                  </div>

                  {/* Active Warnings */}
                  {tenant.activeWarnings && tenant.activeWarnings.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Alertes actives :</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {tenant.activeWarnings.map((warning: string, index: number) => (
                            <li key={index} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-xs text-gray-500">
                    Dernière mise à jour : {formatDate(tenant.resourcesLastUpdated)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Informations de Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email de facturation
                    </p>
                    <p className="text-lg">{tenant.billingEmail || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Téléphone
                    </p>
                    <p className="text-lg">{tenant.phone || "Non défini"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Adresse
                    </p>
                    <p className="text-lg">
                      {tenant.address && tenant.city && tenant.country
                        ? `${tenant.address}, ${tenant.city}, ${tenant.country}`
                        : "Non définie"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">URL de connexion</p>
                    <p className="text-lg font-mono bg-gray-50 p-2 rounded text-sm break-all">
                      {tenant.databaseUrl}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom d'utilisateur</p>
                      <p className="text-lg font-mono">{tenant.databaseCredentials.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mot de passe</p>
                      <p className="text-lg font-mono">••••••••</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <TenantActionCard
              tenant={tenant}
              onSuspend={() => setShowSuspendModal(true)}
              onReactivate={() => setShowReactivateModal(true)}
              onAssignPlan={handleAssignPlan}
              loading={actionLoading}
            />

            {/* Admin User Info */}
            {adminUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Administrateur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-lg">{adminUser.firstName} {adminUser.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg">{adminUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <Badge variant={adminUser.status === "ACTIVE" ? "default" : "destructive"}>
                        {adminUser.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dernière connexion</p>
                      <p className="text-lg">
                        {adminUser.lastLoginAt ? formatDate(adminUser.lastLoginAt) : "Jamais"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Statistiques Rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Utilisateurs</span>
                    <span className="font-medium">{tenant.currentUsersCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employés</span>
                    <span className="font-medium">{tenant.currentEmployeesCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Départements</span>
                    <span className="font-medium">{tenant.currentDepartmentsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documents</span>
                    <span className="font-medium">{tenant.currentDocumentsCount || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stockage DB</span>
                    <span className="font-medium">{formatBytes(tenant.currentDatabaseUsageMB * 1024 * 1024)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stockage S3</span>
                    <span className="font-medium">{formatBytes(tenant.currentS3UsageMB * 1024 * 1024)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Facturation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total payé</span>
                    <span className="font-medium">
                      {tenant.totalAmountPaid ? 
                        formatCurrency(tenant.totalAmountPaid, tenant.currency as Currency) : 
                        "0 €"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Montant dû</span>
                    <span className="font-medium">
                      {tenant.outstandingAmount ? 
                        formatCurrency(tenant.outstandingAmount, tenant.currency as Currency) : 
                        "0 €"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dernier paiement</span>
                    <span className="font-medium">
                      {tenant.lastPaymentDate ? formatDate(tenant.lastPaymentDate) : "Aucun"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prochaine facturation</span>
                    <span className="font-medium">
                      {tenant.nextBillingDate ? formatDate(tenant.nextBillingDate) : "Non programmée"}
                    </span>
  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Factures</span>
                   <span className="font-medium">{invoices?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

          

        {/* Modals */}
        <AssignPlanModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          tenantId={params.tenantId as string}
          tenantName={tenant?.name || ""}
          onPlanAssigned={refresh}
        />

        <SuspendTenantModal
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          tenantId={tenantId}
          tenantName={tenant.name}
          onSuspendConfirm={handleSuspendTenant}
          loading={actionLoading}
        />

        <ReactivateTenantModal
          isOpen={showReactivateModal}
          onClose={() => setShowReactivateModal(false)}
          tenantId={tenantId}
          tenantName={tenant.name}
          currentPlanId={tenant.plan?.id}
          onReactivateConfirm={handleReactivateTenant}
          loading={actionLoading}
        />

    {/* Status History Section */}
    <StatusHistorySection 
      statusHistory={statusHistory}
      loading={historyStatusLoading}
      error={historyStatusError}
      onRefresh={refreshStatusHistory}
    />

    {/* Invoices Section */}
    <InvoicesSection 
      invoices={invoices}
      loading={historyInvoicesLoading}
      error={historyInvoicesError}
      onRefresh={refreshInvoices}
    />
      </div>
    </ProtectedRoute>
  )
}