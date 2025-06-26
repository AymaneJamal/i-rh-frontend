"use client"

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
import { useTenantDetail } from "@/hooks/use-tenant-detail"
import { useTenantSubscription } from "@/hooks/use-tenant-subscription"
import { useTenantInvoices } from "@/hooks/use-tenant-invoices"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { formatCurrency, formatDate, formatDuration } from "@/lib/formatters"
import { formatBytes } from "@/lib/utils"
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
            onClick={onSuspend} 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Pause className="h-4 w-4 mr-2" />
            Suspendre Tenant
          </Button>
        ) : (
          <Button 
            onClick={onReactivate} 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Réactiver Tenant
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function TenantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params.tenantId as string
  
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  
  const {
    tenant,
    adminUser,
    loading,
    error,
    refresh
  } = useTenantDetail(tenantId, false) // Désactiver le polling

  const {
    loading: actionLoading,
    suspendTenant,
    reactivateTenant
  } = useTenantSubscription()

  const {
    invoices,
    loading: invoicesLoading,
    refresh: refreshInvoices
  } = useTenantInvoices(tenantId)

  const handleBack = () => {
    router.push("/dashboard/tenants")
  }

  const handleSuspend = async () => {
    const reason = prompt("Raison de la suspension:")
    if (reason) {
      const success = await suspendTenant(tenantId, reason)
      if (success) {
        refresh()
      }
    }
  }

  const handleReactivate = async () => {
    const success = await reactivateTenant(tenantId)
    if (success) {
      refresh()
    }
  }

  const handleAssignPlan = () => {
    setIsSubscriptionModalOpen(true)
  }

  const handleSubscriptionAssigned = () => {
    refresh()
    refreshInvoices()
    setIsSubscriptionModalOpen(false)
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Requête invalide</h3>
          <p className="text-gray-500 mb-4">L'ID du tenant est requis</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux tenants
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Chargement des détails du tenant...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={() => refresh()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Tenant non trouvé
                </h3>
                <p className="text-yellow-700 mb-4">
                  Le tenant avec l'ID "{tenantId}" n'existe pas ou n'est pas accessible.
                </p>
                <Button onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux tenants
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (expiryDate: number | null) => {
    if (!expiryDate) {
      return <Badge className="bg-red-100 text-red-800">Aucun Plan</Badge>
    }
    
    const now = Date.now()
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-100 text-red-800">Expiré</Badge>
    } else if (daysUntilExpiry <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expire Bientôt</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>
    }
  }

  const calculateUsagePercentage = (current: number, max: number) => {
    if (max === 0 || max === -1) return 0
    return Math.min((current / max) * 100, 100)
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
                <Building2 className="mr-3 h-8 w-8 text-blue-600" />
                {tenant.name}
              </h1>
              <p className="text-gray-600">ID: {tenant.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(tenant.status)}
            {getSubscriptionBadge(tenant.planExpiryDate)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
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
                    <p className="text-sm font-medium text-gray-500">Modifié le</p>
                    <p className="text-lg">{formatDate(tenant.modifiedAt)}</p>
                  </div>
                  {tenant.industry && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Secteur</p>
                      <p className="text-lg">{tenant.industry}</p>
                    </div>
                  )}
                  {tenant.region && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Région</p>
                      <p className="text-lg">{tenant.region}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(tenant.billingEmail || tenant.phone || tenant.address) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Informations de Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenant.billingEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{tenant.billingEmail}</span>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.address && (
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{tenant.address}</span>
                        {tenant.city && <span>, {tenant.city}</span>}
                        {tenant.country && <span>, {tenant.country}</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Information */}
            {adminUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Administrateur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-lg">{adminUser.firstName} {adminUser.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg">{adminUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rôle</p>
                      <p className="text-lg">{adminUser.companyRole || adminUser.role}</p>
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

            {/* Subscription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tenant.plan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Plan Actuel</p>
                        <p className="text-lg font-semibold">{tenant.plan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Prix Mensuel</p>
                        <p className="text-lg">{formatCurrency(tenant.currentPlanPrice, tenant.currency)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date de Début</p>
                        <p className="text-lg">{formatDate(tenant.planStartDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date d'Expiration</p>
                        <p className="text-lg">{formatDate(tenant.planExpiryDate)}</p>
                      </div>
                    </div>
                    
                    {tenant.planExpiryDate && tenant.planStartDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Temps Restant</p>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max(0, 100 - ((Date.now() - tenant.planStartDate) / (tenant.planExpiryDate - tenant.planStartDate)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.ceil((tenant.planExpiryDate - Date.now()) / (1000 * 60 * 60 * 24))} jours restants
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun Plan Attribué</h3>
                    <p className="text-gray-500 mb-4">Ce tenant n'a pas de plan d'abonnement actif.</p>
                    <Button onClick={handleAssignPlan}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Attribuer un Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Utilisation des Ressources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Database Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Base de Données</span>
                      <span className="text-sm text-gray-500">
                        {formatBytes(tenant.currentDatabaseUsageMB * 1024 * 1024)} / {formatBytes(tenant.maxDatabaseStorageMB * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateUsagePercentage(tenant.currentDatabaseUsageMB, tenant.maxDatabaseStorageMB)} 
                      className="h-2"
                    />
                  </div>

                  {/* S3 Storage Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Stockage S3</span>
                      <span className="text-sm text-gray-500">
                        {formatBytes(tenant.currentS3UsageMB * 1024 * 1024)} / {formatBytes(tenant.maxS3StorageMB * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateUsagePercentage(tenant.currentS3UsageMB, tenant.maxS3StorageMB)} 
                      className="h-2"
                    />
                  </div>

                  {/* Users Count */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Utilisateurs</span>
                      <span className="text-sm text-gray-500">
                        {tenant.currentUsersCount} / {tenant.maxUsers === -1 ? "Illimité" : tenant.maxUsers}
                      </span>
                    </div>
                    <Progress 
                      value={calculateUsagePercentage(tenant.currentUsersCount, tenant.maxUsers)} 
                      className="h-2"
                    />
                  </div>

                  {/* Employees Count */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Employés</span>
                      <span className="text-sm text-gray-500">
                        {tenant.currentEmployeesCount} / {tenant.maxEmployees === -1 ? "Illimité" : tenant.maxEmployees}
                      </span>
                    </div>
                    <Progress 
                      value={calculateUsagePercentage(tenant.currentEmployeesCount, tenant.maxEmployees)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Factures Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-500">Chargement des factures...</p>
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice: any) => (
                      <div key={invoice.invoiceId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(invoice.issueDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                          <Badge 
                            variant={invoice.status === 'PAID' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {invoices.length > 3 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          Voir toutes les factures ({invoices.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune facture disponible</p>
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
              onSuspend={handleSuspend}
              onReactivate={handleReactivate}
              onAssignPlan={handleAssignPlan}
              loading={actionLoading}
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Statistiques Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Utilisateurs</span>
                  </div>
                  <span className="font-semibold">{tenant.currentUsersCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Base de données</span>
                  </div>
                  <span className="font-semibold">{formatBytes(tenant.currentDatabaseUsageMB * 1024 * 1024)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Stockage S3</span>
                  </div>
                  <span className="font-semibold">{formatBytes(tenant.currentS3UsageMB * 1024 * 1024)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Total Payé</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(tenant.totalAmountPaid || 0, tenant.currency)}
                  </span>
                </div>

                {tenant.outstandingAmount && tenant.outstandingAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Montant Dû</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(tenant.outstandingAmount, tenant.currency)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Informations Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">URL Base de Données</p>
                  <p className="text-xs text-gray-700 break-all">{tenant.databaseUrl}</p>
                </div>
                
                {tenant.databaseCredentials && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Utilisateur DB</p>
                    <p className="text-sm text-gray-700">{tenant.databaseCredentials.username}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Langue</p>
                  <p className="text-sm text-gray-700">{tenant.language || 'fr'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Fuseau Horaire</p>
                  <p className="text-sm text-gray-700">{tenant.timeZone || 'Europe/Paris'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Dernière Mise à Jour Ressources</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(tenant.resourcesLastUpdated)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Warnings */}
            {tenant.activeWarnings && tenant.activeWarnings.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Alertes Actives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tenant.activeWarnings.map((warning: string, index: number) => (
                      <Alert key={index} className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-yellow-800">
                          {warning}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          tenantId={tenantId}
          tenantName={tenant.name}
          onSubscriptionAssigned={handleSubscriptionAssigned}
        />
      </div>
    </ProtectedRoute>
  )
}