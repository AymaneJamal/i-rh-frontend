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
import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { tenantApi } from "@/lib/api/tenant"
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
  Clock,
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
  Shield
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

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const formatRemainingTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  valueColor = "text-gray-900",
  copyable = false 
}: {
  icon: any
  label: string
  value: string | React.ReactNode
  valueColor?: string
  copyable?: boolean
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof value === 'string' && copyable) {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
      <Icon className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <div className="flex items-center space-x-2">
          <p className={`text-sm ${valueColor} break-words flex-1`}>{value}</p>
          {copyable && typeof value === 'string' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const DatabaseCredentials = ({ credentials }: { credentials: any }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-4">
      <InfoItem
        icon={User}
        label="Nom d'utilisateur"
        value={credentials.username}
        copyable
      />
      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
        <Shield className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">Mot de passe</p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-900 flex-1 font-mono">
              {showPassword ? credentials.password : '••••••••••••'}
            </p>
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
      </div>
    </div>
  )
}

export default function TenantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params.tenantId as string
  
  // We need to get the createdAt from the tenant list or make an additional API call
  // For now, we'll use the detail hook without the 10-minute restriction initially
  const [tenantCreatedAt, setTenantCreatedAt] = useState<number | undefined>()
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  
  const {
    tenant,
    adminUser,
    loading,
    error,
    isAvailable,
    remainingTime,
    refresh
  } = useTenantDetail(tenantId, tenantCreatedAt)

  // If we don't have createdAt and we have tenant data, set it
  useEffect(() => {
    if (tenant && !tenantCreatedAt) {
      setTenantCreatedAt(tenant.createdAt)
    }
  }, [tenant, tenantCreatedAt])

  const handleBack = () => {
    router.push("/dashboard/tenants")
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Request</h3>
          <p className="text-gray-500 mb-4">Tenant ID is required</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
        </div>
      </div>
    )
  }

  // Show waiting message if tenant was created less than 10 minutes ago
  if (tenantCreatedAt && !isAvailable && remainingTime > 0) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="mr-3 h-8 w-8 text-blue-600" />
                Détails du Tenant
              </h1>
              <p className="text-gray-600">Tenant ID: {tenantId}</p>
            </div>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">
                  Détails en cours de préparation
                </h3>
                <p className="text-amber-700 mb-4">
                  Les détails du tenant seront disponibles dans :
                </p>
                <div className="text-3xl font-bold text-amber-900 mb-4">
                  {formatRemainingTime(remainingTime)}
                </div>
                <p className="text-sm text-amber-600">
                  Les détails des tenants ne sont disponibles que 10 minutes après leur création 
                  pour des raisons de sécurité et de provisioning.
                </p>
                <Button 
                  variant="outline" 
                  onClick={refresh}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Vérifier maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des détails du tenant...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !tenant || !adminUser) {
    return (
      <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de Chargement</h3>
            <p className="text-gray-500 mb-4">{error || "Tenant non trouvé"}</p>
            <div className="space-x-2">
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux Tenants
              </Button>
            </div>
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
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsSubscriptionModalOpen(true)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Gérer Abonnement
            </Button>
          </div>
        </div>

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
                  <Badge variant={getStatusBadgeVariant(tenant.status)}>
                    {tenant.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {tenant.region}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
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
                  {tenant.plan || "Aucun plan assigné"}
                </div>
                {tenant.planExpiryDate && (
                  <div className="text-sm text-blue-600">
                    Expire le {formatDate(tenant.planExpiryDate)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Base de données</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Administrateur</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    Informations Système
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
                  />
                  <InfoItem
                    icon={User}
                    label="Créé par"
                    value={tenant.createdBy}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Dernière modification"
                    value={formatDate(tenant.modifiedAt)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  État de l'Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {tenant.plan || "Aucun"}
                    </div>
                    <div className="text-sm text-gray-600">Plan Actuel</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {tenant.planExpiryDate ? formatDate(tenant.planExpiryDate) : "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Date d'Expiration</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {tenant.billingMethod || "Non défini"}
                    </div>
                    <div className="text-sm text-gray-600">Méthode de Paiement</div>
                  </div>
                </div>
                
                {!tenant.plan && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucun plan d'abonnement n'est assigné à ce tenant. 
                      Cliquez sur "Gérer Abonnement" pour en assigner un.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Multi-tenancy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Multi-tenant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Multi-tenant</span>
                    {tenant.isMultiTenant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  {tenant.parentTenantId && (
                    <InfoItem
                      icon={Building2}
                      label="Tenant Parent"
                      value={tenant.parentTenantId}
                    />
                  )}
                  
                  {tenant.childTenantIds.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Tenants Enfants</div>
                      <div className="space-y-1">
                        {tenant.childTenantIds.map((childId) => (
                          <Badge key={childId} variant="outline">
                            {childId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Domains */}
              <Card>
                <CardHeader>
                  <CardTitle>Domaines</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenant.domains.length > 0 ? (
                    <div className="space-y-2">
                      {tenant.domains.map((domain) => (
                        <Badge key={domain} variant="outline" className="mr-2">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun domaine configuré</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Configuration de la Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  icon={Database}
                  label="URL de la base de données"
                  value={tenant.databaseUrl}
                  copyable
                />
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Identifiants d'Accès</h4>
                  <DatabaseCredentials credentials={tenant.databaseCredentials} />
                </div>
                
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Ces informations sont sensibles. Ne les partagez qu'avec des personnes autorisées.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Administrateur du Tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InfoItem
                      icon={User}
                      label="Nom complet"
                      value={`${adminUser.firstName} ${adminUser.lastName}`}
                    />
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={adminUser.email}
                      copyable
                    />
                    <InfoItem
                      icon={Building2}
                      label="Rôle dans l'entreprise"
                      value={adminUser.companyRole}
                    />
                    <InfoItem
                      icon={Badge}
                      label="Statut"
                      value={
                        <Badge variant={getStatusBadgeVariant(adminUser.status)}>
                          {adminUser.status}
                        </Badge>
                      }
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <InfoItem
                      icon={Calendar}
                      label="Créé le"
                      value={formatDate(adminUser.createdAt)}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Dernière connexion"
                      value={adminUser.lastLoginAt ? formatDate(adminUser.lastLoginAt) : "Jamais"}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Email vérifié</span>
                      {adminUser.isEmailVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">MFA activé</span>
                      {adminUser.isMfaRequired ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          tenantId={tenant.id}
          tenantName={tenant.name}
          onSubscriptionAssigned={() => {
            refresh()
            setIsSubscriptionModalOpen(false)
          }}
        />
      </div>
    </ProtectedRoute>
  )
}