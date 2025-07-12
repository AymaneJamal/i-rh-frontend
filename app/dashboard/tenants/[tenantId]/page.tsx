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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
// Import des sections History et Invoices
import { StatusHistorySection } from "@/components/tenant/status-history-section"
import { InvoicesSection } from "@/components/tenant/invoices-section"
import { useTenantHistory } from "@/hooks/use-tenant-history"
// Ajoutez cette ligne avec les autres imports
import { TenantHelpersSection } from "@/components/tenant/tenant-helpers-section"

import { EmergencyAccessModal } from "@/components/modals/emergency-access-modal"
import { ReadOnlyModal } from "@/components/modals/read-only-modal"
import { ExtendPlanModal } from "@/components/modals/extend-plan-modal"

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
  MapPin,
  BarChart3,
  History,
  Info,
  AlertTriangle,
  Eye
} from "lucide-react"

/**
 * Vérifie si une action peut être effectuée (cooldown de 5 minutes)
 */
function parseTimestamp(timestamp: string | number): number {
  // Si c'est déjà un number, le retourner
  if (typeof timestamp === 'number') {
    return timestamp
  }

  // Si c'est une string
  if (typeof timestamp === 'string') {
    // Vérifier si c'est un format ISO (contient des lettres)
    if (timestamp.includes('T') || timestamp.includes('Z')) {
      return new Date(timestamp).getTime()
    }
    
    // Sinon, c'est un timestamp numérique en string
    return parseInt(timestamp, 10)
  }

  // Fallback
  return Date.now()
}

/**
 * Vérifie si une action peut être effectuée (cooldown de 5 minutes)
 */
function canPerformAction(statusHistory: any[]): { canAct: boolean; remainingTime: number } {
  console.log("🔍 Checking action cooldown with history:", statusHistory)
  
  if (!statusHistory || statusHistory.length === 0) {
    console.log("✅ No status history - allowing action")
    return { canAct: true, remainingTime: 0 }
  }

  // Trouver le dernier changement de statut RÉEL (previousStatus différent de newStatus)
  const realStatusChanges = statusHistory.filter(item => {
    const hasRealChange = item.previousStatus !== item.newStatus
    console.log("📊 History item:", {
      previousStatus: item.previousStatus,
      newStatus: item.newStatus,
      timestamp: item.timestamp,
      reason: item.reason,
      changedBy: item.changedBy,
      isRealChange: hasRealChange
    })
    return hasRealChange
  })

  console.log("🔄 Real status changes found:", realStatusChanges.length)

  if (realStatusChanges.length === 0) {
    console.log("✅ No real status changes found - allowing action")
    return { canAct: true, remainingTime: 0 }
  }

  // Trier par timestamp décroissant pour obtenir le plus récent
  const lastRealChange = realStatusChanges.sort((a, b) => {
    const timestampA = parseTimestamp(a.timestamp)
    const timestampB = parseTimestamp(b.timestamp)
    return timestampB - timestampA
  })[0]

  console.log("🕐 Last real change:", lastRealChange)

  // Convertir le timestamp en millisecondes
  const lastChangeTime = parseTimestamp(lastRealChange.timestamp)
  const currentTime = Date.now()
  const cooldownPeriod = 5 * 60 * 1000 // 5 minutes en millisecondes
  const timeSinceLastChange = currentTime - lastChangeTime
  const remainingTime = Math.max(0, cooldownPeriod - timeSinceLastChange)

  console.log("⏰ Cooldown calculation:", {
    lastChangeTime: new Date(lastChangeTime).toISOString(),
    currentTime: new Date(currentTime).toISOString(),
    timeSinceLastChange: Math.floor(timeSinceLastChange / 1000) + " seconds",
    cooldownPeriod: cooldownPeriod / 1000 + " seconds",
    remainingTime: Math.floor(remainingTime / 1000) + " seconds",
    canAct: timeSinceLastChange >= cooldownPeriod
  })

  return {
    canAct: timeSinceLastChange >= cooldownPeriod,
    remainingTime
  }
}

/**
 * Détermine quels boutons afficher selon le statut
 */
function getAvailableActions(status: string): {
  showAssignPlan: boolean
  showSuspend: boolean
  showReactivate: boolean
  showEmergency: boolean
  showReadOnly: boolean
} {
  const normalizedStatus = status?.toUpperCase()
  console.log("🎯 Determining actions for status:", normalizedStatus)

  switch (normalizedStatus) {
    case 'CREATED':
      return {
        showAssignPlan: true,
        showSuspend: true,
        showReactivate: false,
        showEmergency: false,
        showReadOnly: false
      }

    case 'ACTIVE':
      return {
        showAssignPlan: false,
        showSuspend: true,
        showReactivate: false,
        showEmergency: true,
        showReadOnly: true
      }

    case 'SUSPENDED':
    case 'EMERGENCY_ACCESS':
    case 'READ_ONLY':
      return {
        showAssignPlan: false,
        showSuspend: true,
        showReactivate: true,
        showEmergency: false,
        showReadOnly: false
      }

    default:
      return {
        showAssignPlan: false,
        showSuspend: false,
        showReactivate: false,
        showEmergency: false,
        showReadOnly: false
      }
  }
}


interface TenantActionCardProps {
  tenant: any
  statusHistory: any[]
  onAssignPlan: () => void
  onSuspend: () => void
  onReactivate: () => void
  onEmergencyAccess: () => void
  onReadOnlyAccess: () => void
  loading: boolean
}

function TenantActionCard({ 
  tenant, 
  statusHistory,
  onAssignPlan,
  onSuspend, 
  onReactivate, 
  onEmergencyAccess,
  onReadOnlyAccess,
  loading 
}: TenantActionCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Actualiser le temps toutes les secondes pour le cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Vérifier si une action peut être effectuée
  const { canAct, remainingTime } = canPerformAction(statusHistory)
  
  // Déterminer quels boutons afficher
  const actions = getAvailableActions(tenant?.status)
  
  // Formater le temps restant
  const formatRemainingTime = (ms: number): string => {
    if (ms <= 0 || isNaN(ms)) return "0:00"
    
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  console.log("🎨 Rendering TenantActionCard:", {
    tenantStatus: tenant?.status,
    canAct,
    remainingTime: formatRemainingTime(remainingTime),
    actions,
    historyCount: statusHistory?.length || 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Actions Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Alerte de cooldown */}
        {!canAct && remainingTime > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Actions temporairement bloquées. Temps restant: {formatRemainingTime(remainingTime)}
            </AlertDescription>
          </Alert>
        )}

        {/* Status actuel */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Statut actuel:</span>
          {getStatusBadge(tenant?.status || 'UNKNOWN')}
        </div>

        {/* Bouton Attribuer un Plan */}
        {actions.showAssignPlan && (
          <Button 
            onClick={onAssignPlan}
            disabled={loading || !canAct}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Attribuer un Plan
          </Button>
        )}

        {/* Bouton Suspendre */}
        {actions.showSuspend && (
          <Button 
            variant="destructive" 
            onClick={onSuspend} 
            disabled={loading || !canAct}
            className="w-full"
          >
            <Pause className="h-4 w-4 mr-2" />
            Suspendre
          </Button>
        )}

        {/* Bouton Réactiver */}
        {actions.showReactivate && (
          <Button 
            variant="default" 
            onClick={onReactivate} 
            disabled={loading || !canAct}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Réactiver
          </Button>
        )}

        {/* Bouton Accès d'Urgence */}
        {actions.showEmergency && (
          <Button 
            onClick={onEmergencyAccess} 
            disabled={loading || !canAct}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Accès d'Urgence
          </Button>
        )}

        {/* Bouton Mode Lecture Seule */}
        {actions.showReadOnly && (
          <Button 
            onClick={onReadOnlyAccess} 
            disabled={loading || !canAct}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Mode Lecture Seule
          </Button>
        )}

        {/* Message si aucune action disponible */}
        {!actions.showAssignPlan && !actions.showSuspend && !actions.showReactivate && 
         !actions.showEmergency && !actions.showReadOnly && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Aucune action disponible pour ce statut</p>
          </div>
        )}

        {/* Debug info en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
            <div>Can Act: {canAct ? 'Yes' : 'No'}</div>
            <div>Remaining: {formatRemainingTime(remainingTime)}</div>
            <div>Status: {tenant?.status}</div>
            <div>History items: {statusHistory?.length || 0}</div>
            <div>Last real change: {statusHistory?.filter(item => item.previousStatus !== item.newStatus)?.[0]?.timestamp || 'None'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function pour les badges de statut
function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
    case "SUSPENDED":
      return <Badge variant="destructive">Suspendu</Badge>
    case "INACTIVE":
      return <Badge variant="secondary">Inactif</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId as string

  // ===============================================================================
  // HOOKS PRINCIPAUX
  // ===============================================================================
  const {
    tenant,
    adminUser,
    loading,
    error,
    isAvailable,
    remainingTime,
    hasSubscription,
    hasUsageAlerts,
    usagePercentages,
    subscriptionStatus,
    isActive,
    usageData,
    statusLoading,
    usageLoading,
    refresh,
    refreshSubscriptionData
  } = useTenantDetail(tenantId, false)

  // Hook pour les invoices du tenant
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    unpaidInvoices,
    overdueInvoices,
    totalOutstanding,
    recentInvoices,
    refresh: refreshInvoices,
    generateInvoice,
    markInvoicePaid,
    uploadReceipt,
    sendReminder
  } = useTenantInvoices(tenantId)

  // Hook pour l'historique des statuts et des invoices
  const {
    statusHistory,
    statusLoading: historyStatusLoading,
    statusError: historyStatusError,
    refreshStatusHistory,
    invoices: historyInvoices,
    invoicesLoading: historyInvoicesLoading,
    invoicesError: historyInvoicesError,
    refreshInvoices: refreshHistoryInvoices,
    refreshAll: refreshHistory
  } = useTenantHistory(tenantId)

  // ===============================================================================
  // STATES POUR LES MODALES
  // ===============================================================================
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)

  const [showEmergencyAccessModal, setShowEmergencyAccessModal] = useState(false)
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false)

  const [showExtendPlanModal, setShowExtendPlanModal] = useState(false)


  const [actionLoading, setActionLoading] = useState(false)

  // ===============================================================================
  // HANDLERS POUR LES ACTIONS
  // ===============================================================================
  const handleAssignPlan = () => {
    setShowSubscriptionModal(true)
  }

  const handleEmergencyAccess = () => {
  setShowEmergencyAccessModal(true)
  }

  const handleReadOnlyAccess = () => {
    setShowReadOnlyModal(true)
  }

  const handleEmergencyAccessSuccess = () => {
    refresh()
    refreshHistory()
    setShowEmergencyAccessModal(false)
  }

  const handleReadOnlySuccess = () => {
    refresh()
    refreshHistory()
    setShowReadOnlyModal(false)
  }


  const handleExtendPlan = () => {
  setShowExtendPlanModal(true)
  }

  const handleExtendPlanSuccess = () => {
    refresh()
    refreshHistory()
    setShowExtendPlanModal(false)
  }

  const handleSuspendTenant = async (reason: string) => {
    try {
      setActionLoading(true)
      const response = await tenantSubscriptionApi.suspendTenant(tenantId, reason)
      
      if (response.success) {
        refreshHistory()
        refresh()
        setShowSuspendModal(false)
      }
    } catch (err: any) {
      console.error("❌ Error suspending tenant:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateTenant = async (reason: string) => {
    try {
      setActionLoading(true)
      const response = await tenantSubscriptionApi.reactivateTenant(tenantId, reason)
      
      if (response.success) {
        refresh()
        refreshHistory()
        setShowReactivateModal(false)
      }
    } catch (err: any) {
      console.error("❌ Error reactivating tenant:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Fonction de refresh globale
  const handleRefreshAll = () => {
    refresh()
    refreshInvoices()
    refreshHistory()
    if (refreshSubscriptionData) {
      refreshSubscriptionData()
    }
  }

  // ===============================================================================
  // EARLY RETURNS
  // ===============================================================================
  if (loading) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Chargement des détails du tenant...</span>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !tenant) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Erreur</h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Impossible de charger les détails du tenant"}
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  // ===============================================================================
  // RENDER PRINCIPAL
  // ===============================================================================
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header avec informations principales */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => router.back()} size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div className="h-8 w-px bg-gray-300" />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {tenantId}</span>
                      <span>•</span>
                      <span>Créé le {formatDate(tenant.createdAt)}</span>
                      <span>•</span>
                      {getStatusBadge(tenant.status)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleRefreshAll} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes globales */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!isAvailable && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Le tenant sera disponible dans {formatDuration(remainingTime)}. 
                Certaines informations peuvent être limitées.
              </AlertDescription>
            </Alert>
          )}

          {hasUsageAlerts && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ce tenant a des alertes d'utilisation active. Vérifiez les ressources.
              </AlertDescription>
            </Alert>
          )}

          {tenant.status === "SUSPENDED" && tenant.suspensionDate && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tenant suspendu</strong> depuis le {formatDate(tenant.suspensionDate)}
                {tenant.suspensionReason && ` - Raison: ${tenant.suspensionReason}`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Interface à onglets moderne */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm border">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="helpers" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Assistants</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Utilisation</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Facturation</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Historique</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Informations générales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Informations Générales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Nom de l'organisation</p>
                            <p className="text-lg font-semibold">{tenant.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Industrie</p>
                            <p className="text-base">{tenant.industry}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Région</p>
                            <p className="text-base">{tenant.region}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Multi-tenant</p>
                            <Badge variant={tenant.isMultiTenant === 1 ? "default" : "secondary"}>
                              {tenant.isMultiTenant === 1 ? "Oui" : "Non"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Localisation</p>
                            <p className="text-base">{tenant.city}, {tenant.country}</p>
                            {tenant.postalCode && <p className="text-sm text-gray-600">{tenant.postalCode}</p>}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Configuration</p>
                            <p className="text-base">{tenant.timeZone}</p>
                            <p className="text-sm text-gray-600">Langue: {tenant.language}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Créé le</p>
                            <p className="text-base">{formatDate(tenant.createdAt)}</p>
                            <p className="text-sm text-gray-600">Par: {tenant.createdBy}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informations de contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Informations de Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email de facturation
                          </p>
                          <p className="text-base font-medium">{tenant.billingEmail || "Non défini"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            Téléphone
                          </p>
                          <p className="text-base font-medium">{tenant.phone || "Non défini"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Adresse complète
                          </p>
                          <p className="text-base">
                            {tenant.address && tenant.city && tenant.country
                              ? `${tenant.address}, ${tenant.city}, ${tenant.country}`
                              : "Non définie"
                            }
                          </p>
                        </div>
                        {tenant.domains && tenant.domains.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              Domaines associés
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tenant.domains.map((domain, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {tenant.legalNumbers && Object.keys(tenant.legalNumbers).length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Numéros légaux</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              {Object.entries(tenant.legalNumbers).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="ml-2">{value as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Détails de l'Abonnement
                    {statusLoading && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tenant.plan ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-600">Plan actuel</p>
                          <p className="text-xl font-bold text-blue-900">{tenant.plan.name}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-green-600">Statut</p>
                          <Badge variant={subscriptionStatus === "ACTIVE" ? "default" : "secondary"} className="text-sm">
                            {subscriptionStatus || "Inconnu"}
                          </Badge>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Devise</p>
                          <p className="text-xl font-bold text-gray-900">{tenant.currency || 'MAD'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID du plan</p>
                        <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded mt-1">{tenant.plan.id}</p>
                      </div>

                      {tenant.isInGracePeriod === 1 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Ce tenant est en période de grâce.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun plan attribué</h3>
                      <p className="text-gray-500 mb-6">Ce tenant n'a pas encore de plan d'abonnement.</p>
                      <Button onClick={handleAssignPlan}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Attribuer un Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Actions */}
                  <TenantActionCard
                      tenant={tenant}
                      statusHistory={statusHistory}
                      onAssignPlan={handleAssignPlan}
                      onSuspend={() => setShowSuspendModal(true)}
                      onReactivate={() => setShowReactivateModal(true)}
                      onEmergencyAccess={handleEmergencyAccess}
                      onReadOnlyAccess={handleReadOnlyAccess}
                      loading={actionLoading}
                    />

                  {/* Administrateur */}
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
                            <p className="text-base font-semibold">{adminUser.firstName} {adminUser.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base">{adminUser.email}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Statut</p>
                            <Badge variant={adminUser.status === "ACTIVE" ? "default" : "secondary"}>
                              {adminUser.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rôle</p>
                            <p className="text-base">{adminUser.companyRole || adminUser.role}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Dernière connexion</p>
                            <p className="text-sm text-gray-600">
                              {adminUser.lastLoginAt ? formatDate(adminUser.lastLoginAt) : "Jamais"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                </div>
              </div>
            </TabsContent>


            {/* Onglet Assistants du Locataire */}
            <TabsContent value="helpers" className="space-y-6">
              <TenantHelpersSection tenantId={params.tenantId as string}   tenantStatus={tenant?.status as string} />
            </TabsContent>

            {/* Onglet Utilisation */}
            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Utilisation des Ressources
                    {usageLoading && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Base de données */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Database className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Base de Données</span>
                        </div>
                        <span className="text-sm text-blue-600">
                          {formatBytes((tenant.currentDatabaseUsageMB || 0) * 1024 * 1024)}
                        </span>
                      </div>
                      <Progress 
                        value={usagePercentages?.database || 0} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-blue-700">
                        {usagePercentages?.database || 0}% utilisé
                      </p>
                    </div>

                    {/* Stockage S3 */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <HardDrive className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-900">Stockage S3</span>
                        </div>
                        <span className="text-sm text-green-600">
                          {formatBytes((tenant.currentS3UsageMB || 0) * 1024 * 1024)}
                        </span>
                      </div>
                      <Progress 
                        value={usagePercentages?.s3 || 0} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-green-700">
                        {usagePercentages?.s3 || 0}% utilisé
                      </p>
                    </div>

                    {/* Utilisateurs */}
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">Utilisateurs</span>
                        </div>
                        <span className="text-sm text-purple-600">
                          {tenant.currentUsersCount || 0}
                        </span>
                      </div>
                      <Progress 
                        value={usagePercentages?.users || 0} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-purple-700">
                        {usagePercentages?.users || 0}% de la limite
                      </p>
                    </div>

                    {/* Employés */}
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-orange-600 mr-2" />
                          <span className="font-medium text-orange-900">Employés</span>
                        </div>
                        <span className="text-sm text-orange-600">
                          {tenant.currentEmployeesCount || 0}
                        </span>
                      </div>
                      <Progress 
                        value={usagePercentages?.employees || 0} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-orange-700">
                        {usagePercentages?.employees || 0}% de la limite
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      Dernière mise à jour : {formatDate(tenant.resourcesLastUpdated)}
                   </p>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           {/* Onglet Facturation */}
           <TabsContent value="billing" className="space-y-6">
             <InvoicesSection 
              invoices={historyInvoices}
              loading={historyInvoicesLoading}
              error={historyInvoicesError}
              onRefresh={refreshHistoryInvoices}
              onExtendPlan={handleExtendPlan}
              tenant={tenant}
            />
           </TabsContent>

           {/* Onglet Historique */}
           <TabsContent value="history" className="space-y-6">
             <StatusHistorySection 
               statusHistory={statusHistory}
               loading={historyStatusLoading}
               error={historyStatusError}
               onRefresh={refreshStatusHistory}
             />
           </TabsContent>
         </Tabs>
       </div>

       {/* Modales */}
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
         onReactivateConfirm={handleReactivateTenant}
         loading={actionLoading}
       />


       <EmergencyAccessModal
        isOpen={showEmergencyAccessModal}
        onClose={() => setShowEmergencyAccessModal(false)}
        tenantId={tenantId}
        tenantName={tenant.name}
        onSuccess={handleEmergencyAccessSuccess}
      />

      <ReadOnlyModal
        isOpen={showReadOnlyModal}
        onClose={() => setShowReadOnlyModal(false)}
        tenantId={tenantId}
        tenantName={tenant.name}
        onSuccess={handleReadOnlySuccess}
      />

      <ExtendPlanModal
        isOpen={showExtendPlanModal}
        onClose={() => setShowExtendPlanModal(false)}
        tenantId={tenantId}
        tenantName={tenant?.name || ""}
        existingPlan={tenant?.plan}
        onPlanExtended={handleExtendPlanSuccess}
      />

     </div>
   </ProtectedRoute>
 )
}