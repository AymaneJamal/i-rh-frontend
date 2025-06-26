"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTenantDetail } from "@/hooks/use-tenant-detail"
import { useTenantSubscription } from "@/hooks/use-tenant-subscription"
import { useTenantInvoices } from "@/hooks/use-invoice-management"
import { tenantSubscriptionApi } from "@/lib/api/tenant-subscription"
import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { formatCurrency, formatDate, formatUsagePercentage } from "@/lib/formatters"
import {
  ArrowLeft,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  Info,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Shield,
  AlertTriangle,
  Zap,
  BarChart3,
  FileText,
  Users,
  HardDrive,
  Pause,
  Play
} from "lucide-react"

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default"
    case "INACTIVE":
      return "secondary"
    case "SUSPENDED":
      return "destructive"
    case "PENDING":
      return "outline"
    default:
      return "secondary"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return <CheckCircle className="h-4 w-4" />
    case "SUSPENDED":
      return <Pause className="h-4 w-4" />
    case "INACTIVE":
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  valueColor = "text-gray-900",
  copyable = false,
  badge = false,
  badgeVariant = "outline"
}: {
  icon: any
  label: string
  value: string | React.ReactNode | null
  valueColor?: string
  copyable?: boolean
  badge?: boolean
  badgeVariant?: "default" | "destructive" | "outline" | "secondary"
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {badge && typeof value === 'string' ? (
          <Badge variant={badgeVariant}>{value}</Badge>
        ) : (
          <span className={`text-sm font-medium ${valueColor}`}>
            {value || "N/A"}
          </span>
        )}
        {copyable && value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
            title={copied ? "Copié !" : "Copier"}
          >
            {copied ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

const DatabaseCredentialsCard = ({ 
  credentials, 
  databaseUrl 
}: { 
  credentials: { username: string; password: string }
  databaseUrl: string 
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Base de données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoItem
          icon={Globe}
          label="URL de connexion"
          value={databaseUrl}
          copyable
        />
        <InfoItem
          icon={User}
          label="Nom d'utilisateur"
          value={credentials.username}
          copyable
        />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Mot de passe</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 font-mono">
              {showPassword ? credentials.password : '••••••••••••'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-6 w-6 p-0"
            >
              {showPassword ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(credentials.password)}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const UsageStatsCard = ({ tenant, usageData }: { tenant: any, usageData: any }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Utilisation des ressources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="text-sm font-medium">{tenant.currentDatabaseUsageMB} MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stockage S3</span>
              <span className="text-sm font-medium">{tenant.currentS3UsageMB} MB</span>
            </div>
          </div>
          <div className="space-y-2">
            <InfoItem
              icon={Users}
              label="Utilisateurs"
              value={tenant.currentUsersCount}
            />
            <InfoItem
              icon={Users}
              label="Employés"
              value={tenant.currentEmployeesCount}
            />
          </div>
        </div>
        
        {usageData?.usagePercentages && (
          <div className="pt-4 border-t space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">DB Usage:</span>
                <span className="text-sm font-medium ml-2">{usageData.usagePercentages.databasePercent.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">S3 Usage:</span>
                <span className="text-sm font-medium ml-2">{usageData.usagePercentages.s3Percent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
        
        {tenant.resourcesLastUpdated && (
          <div className="pt-2 text-xs text-gray-500">
            Dernière mise à jour : {formatDate(tenant.resourcesLastUpdated)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const TenantActionsCard = ({ 
  tenant, 
  onAssignPlan, 
  onSuspend, 
  onReactivate,
  onChangePlan,
  loading 
}: { 
  tenant: any
  onAssignPlan: () => void
  onSuspend: () => void
  onReactivate: () => void
  onChangePlan: () => void
  loading: boolean
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Actions Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!tenant.plan && (
          <Button 
            onClick={onAssignPlan} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Attribuer un Plan
          </Button>
        )}
        
        {tenant.plan && (
          <Button 
            onClick={onChangePlan} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Changer de Plan
          </Button>
        )}
        
        {tenant.status !== 'SUSPENDED' ? (
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
  const [statusData, setStatusData] = useState<any>(null)
  const [usageData, setUsageData] = useState<any>(null)
  
  const {
    tenant,
    adminUser,
    loading,
    error,
    refresh
  } = useTenantDetail(tenantId)

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

  // Fetch status and usage data
  useEffect(() => {
    if (tenant) {
      const fetchAdditionalData = async () => {
        try {
          const [statusResponse, usageResponse] = await Promise.all([
            tenantSubscriptionApi.checkTenantStatus(tenantId),
            tenantSubscriptionApi.getTenantUsage(tenantId)
          ])
          
          if (statusResponse.success) {
            setStatusData(statusResponse.data)
          }
          
          if (usageResponse.success) {
            setUsageData(usageResponse.data)
          }
        } catch (error) {
          console.error("Error fetching additional data:", error)
        }
      }
      
      fetchAdditionalData()
    }
  }, [tenant, tenantId])

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
                <Button onClick={refresh} variant="outline">
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

  if (!tenant || !adminUser) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tenant non trouvé
                </h3>
                <p className="text-gray-500">Le tenant avec l'ID {tenantId} n'existe pas.</p>
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
                <Building2 className="mr-3 h-8 w-8 text-blue-600" />
                {tenant.name}
              </h1>
              <p className="text-gray-600">Détails et configuration du tenant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Suspension Alert */}
        {tenant.status === "SUSPENDED" && tenant.suspensionReason && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Tenant suspendu</strong> - {tenant.suspensionReason}
              {tenant.suspensionDate && (
                <span className="block text-sm mt-1">
                  Suspendu le : {formatDate(tenant.suspensionDate)}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Tenant Overview Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={tenant.linkLogo || undefined} alt={tenant.name} />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {tenant.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">{tenant.name}</h2>
                <div className="flex items-center space-x-4 mb-3">
                  <Badge variant={getStatusBadgeVariant(tenant.status)} className="flex items-center space-x-1">
                    {getStatusIcon(tenant.status)}
                    <span>{tenant.status}</span>
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {tenant.region}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {tenant.industry}
                  </Badge>
                </div>
                <p className="text-blue-700">
                  <strong>ID:</strong> {tenant.id} • <strong>Créé le:</strong> {formatDate(tenant.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600 mb-1">Plan Actuel</div>
                <div className="text-lg font-semibold text-blue-900">
                  {tenant.plan?.name || "Aucun plan assigné"}
                </div>
                {tenant.planExpiryDate && (
                  <div className="text-sm text-blue-600">
                    Expire le {formatDate(tenant.planExpiryDate)}
                  </div>
                )}
                {tenant.currentPlanPrice && (
                  <div className="text-lg font-bold text-green-600 mt-1">
                    {formatCurrency(tenant.currentPlanPrice, tenant.currency)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Utilisation</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Base de données</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Factures</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Informations de Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem
                    icon={Mail}
                    label="Email de facturation"
                    value={tenant.billingEmail}
                    copyable
                  />
                  <InfoItem
                    icon={Phone}
                    label="Téléphone"
                    value={tenant.phone}
                    copyable
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Adresse"
                    value={`${tenant.address}, ${tenant.city}, ${tenant.country}`}
                  />
                  {tenant.postalCode && (
                    <InfoItem
                      icon={MapPin}
                      label="Code postal"
                      value={tenant.postalCode}
                    />
                  )}
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuration Système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem
                    icon={Globe}
                    label="Fuseau horaire"
                    value={tenant.timeZone}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Langue"
                    value={tenant.language.toUpperCase()}
                    badge
                  />
                  <InfoItem
                    icon={Shield}
                    label="Multi-tenant"
                    value={tenant.isMultiTenant ? "Activé" : "Désactivé"}
                    badge
                    badgeVariant={tenant.isMultiTenant ? "default" : "secondary"}
                  />
                  <InfoItem
                    icon={User}
                    label="Créé par"
                    value={tenant.createdBy}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <TenantActionsCard
                tenant={tenant}
                onAssignPlan={handleAssignPlan}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                onChangePlan={handleAssignPlan}
                loading={actionLoading}
              />
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2" />
                    Plan d'Abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem
                    icon={Crown}
                    label="Plan actuel"
                    value={tenant.plan?.name || "Aucun"}
                  />
                  {tenant.planStartDate && (
                    <InfoItem
                      icon={Calendar}
                      label="Date de début"
                      value={formatDate(tenant.planStartDate)}
                    />
                  )}
                  {tenant.planExpiryDate && (
                    <InfoItem
                      icon={Calendar}
                      label="Date d'expiration"
                      value={formatDate(tenant.planExpiryDate)}
                    />
                  )}
                  {tenant.nextBillingDate && (
                    <InfoItem
                      icon={Calendar}
                      label="Prochaine facturation"
                      value={formatDate(tenant.nextBillingDate)}
                    />
                  )}
                  <InfoItem
                    icon={Zap}
                    label="Renouvellement auto"
                    value={tenant.autoRenewalEnabled ? "Activé" : "Désactivé"}
                    badge
                    badgeVariant={tenant.autoRenewalEnabled ? "default" : "secondary"}
                  />
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Informations de Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem
                    icon={CreditCard}
                    label="Prix actuel"
                    value={formatCurrency(tenant.currentPlanPrice, tenant.currency)}
                  />
                  <InfoItem
                    icon={CheckCircle}
                    label="Montant total payé"
                    value={formatCurrency(tenant.totalAmountPaid, tenant.currency)}
                  />
                  <InfoItem
                    icon={AlertTriangle}
                    label="Montant en attente"
                    value={formatCurrency(tenant.outstandingAmount, tenant.currency)}
                    valueColor={tenant.outstandingAmount ? "text-red-600" : "text-gray-900"}
                  />
                  {tenant.lastPaymentDate && (
                    <InfoItem
                      icon={Calendar}
                      label="Dernier paiement"
                      value={formatDate(tenant.lastPaymentDate)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <UsageStatsCard tenant={tenant} usageData={usageData} />
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <DatabaseCredentialsCard 
              credentials={tenant.databaseCredentials}
              databaseUrl={tenant.databaseUrl}
            />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Factures ({invoices.length})
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshInvoices} disabled={invoicesLoading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Chargement des factures...</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture</h3>
                    <p className="text-gray-500">Ce tenant n'a pas encore de factures.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.invoiceId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-gray-500">{invoice.planName}</p>
                            </div>
                            <Badge variant={invoice.paymentStatus === 'PAID' ? 'default' : 'destructive'}>
                              {invoice.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                          <p className="text-sm text-gray-500">{formatDate(invoice.issueDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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