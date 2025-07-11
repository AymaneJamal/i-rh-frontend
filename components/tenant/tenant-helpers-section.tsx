// components/tenant/tenant-helpers-section.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTenantHelpers } from "@/hooks/use-tenant-helpers"
import { useAppSelector } from "@/lib/hooks"
import { PasswordResetComponent } from "@/components/tenant/password-reset-component"
import { CreateHelperModal } from "@/components/modals/create-helper-modal"
import {
  Users,
  Eye,
  Plus,
  User,
  Mail,
  Shield,
  Calendar,
  AlertCircle,
  RefreshCw,
  Key,
  UserPlus,
  Building2,
  Activity,
  Clock
} from "lucide-react"

interface TenantHelpersSectionProps {
  tenantId: string
}

// Modal pour les détails de l'assistant
const HelperDetailsModal = ({ 
  open, 
  onOpenChange, 
  helperDetails, 
  onResetPassword,
  canResetPassword = false
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  helperDetails: any
  onResetPassword?: (helperId: string, helperName: string) => void
  canResetPassword?: boolean
}) => {
  if (!helperDetails) return null

  const helper = helperDetails.data?.helper
  const helperName = `${helper?.firstName} ${helper?.lastName}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Détails de l'Assistant</h2>
              <p className="text-sm text-gray-500 mt-1">
                Informations complètes du compte assistant
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          {/* Section Informations personnelles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Prénom</label>
                <p className="text-lg font-semibold text-gray-900">{helper?.firstName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Nom de famille</label>
                <p className="text-lg font-semibold text-gray-900">{helper?.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Adresse email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">{helper?.email}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Rôle système</label>
                <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 font-medium">
                  <Shield className="h-3 w-3 mr-1" />
                  {helper?.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Section Accès et sécurité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Key className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Accès et sécurité</h3>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-red-700">Mot de passe</label>
                {canResetPassword && onResetPassword && (
                  <Button
                    onClick={() => onResetPassword(helper?.id || helper?.userId, helperName)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-red-600" />
                  <code className="font-mono text-lg tracking-widest text-gray-600">
                    ••••••••••••••••
                  </code>
                </div>
              </div>
              {canResetPassword && (
                <p className="text-xs text-red-600 mt-2">
                  Vous avez les permissions pour réinitialiser ce mot de passe
                </p>
              )}
            </div>
          </div>

          {/* Section Statut du compte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Statut du compte</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Statut</label>
                <Badge 
                  variant={helper?.status === "ACTIVE" ? "default" : "secondary"}
                  className="text-sm py-1 px-3"
                >
                  {helper?.status}
                </Badge>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Email vérifié</label>
                <Badge 
                  variant={helper?.isEmailVerified ? "default" : "destructive"}
                  className="text-sm py-1 px-3"
                >
                  {helper?.isEmailVerified ? "Vérifié" : "Non vérifié"}
                </Badge>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-sm font-medium text-gray-500 mb-2 block">MFA</label>
                <Badge 
                  variant={helper?.isMfaRequired ? "default" : "secondary"}
                  className="text-sm py-1 px-3"
                >
                  {helper?.isMfaRequired ? "Activé" : "Désactivé"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Section Informations de l'entreprise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Rôle dans l'entreprise</label>
                <p className="text-gray-900 font-medium">{helper?.companyRole || "Non spécifié"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Date de création</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {helper?.createdAt ? new Date(helper.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "Non disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Activité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="text-sm font-medium text-gray-500 mb-2 block">Dernière connexion</label>
              <p className="text-gray-900 font-medium">
                {helper?.lastLoginAt 
                  ? new Date(helper.lastLoginAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "Aucune connexion enregistrée"
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const TenantHelpersSection = ({ tenantId }: TenantHelpersSectionProps) => {
  const [showHelperDetails, setShowHelperDetails] = useState(false)
  const [showCreateHelper, setShowCreateHelper] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [selectedHelperDetails, setSelectedHelperDetails] = useState<any>(null)
  const [selectedHelperForReset, setSelectedHelperForReset] = useState<{
    id: string
    name: string
  } | null>(null)
  
  const { user } = useAppSelector((state) => state.auth)
  
  const {
    helpersSummary,
    myHelperDetails,
    superAdminHelpers,
    helpers,
    loading,
    error,
    canViewHelperDetails,
    hasAnyAccess,
    tenantName,
    helpersCount,
    refresh,
    fetchSpecificHelperDetails,
    resetHelperPassword,
    decodePassword
  } = useTenantHelpers(tenantId)

  const handleViewDetails = async (helperUserId: string, helperId?: string) => {
    try {
      const details = await fetchSpecificHelperDetails(helperUserId)
      if (details) {
        setSelectedHelperDetails(details)
        setShowHelperDetails(true)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error)
    }
  }

  const handleCreateHelper = () => {
    setShowCreateHelper(true)
  }

  const handleResetPassword = (helperId: string, helperName: string) => {
    setSelectedHelperForReset({ id: helperId, name: helperName })
    setShowPasswordReset(true)
  }

  const handlePasswordResetSubmit = async (newPassword: string): Promise<boolean> => {
    if (!selectedHelperForReset) return false
    
    const success = await resetHelperPassword(selectedHelperForReset.id, newPassword)
    if (success) {
      setShowPasswordReset(false)
      setSelectedHelperForReset(null)
      refresh()
    }
    return success
  }

  const canResetPassword = (helperId: string): boolean => {
    if (!user) return false
    
    if (user.role === "ADMIN_PRINCIPAL") {
      return true
    }
    
    if (user.role === "SUPER_ADMIN") {
      return true
    }
    
    return false
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assistants du Locataire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Chargement des assistants...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assistants du Locataire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={refresh} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assistants du Locataire
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateHelper}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un Assistant
              </Button>
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total des Assistants</p>
                  <p className="text-2xl font-bold text-blue-700">{helpersCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Accès Autorisé</p>
                  <p className="text-2xl font-bold text-green-700">
                    {hasAnyAccess ? "Oui" : "Non"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Votre Rôle</p>
                  <p className="text-lg font-bold text-purple-700">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Liste des assistants */}
          {helpers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Liste des Assistants</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Administrateur Assistant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {helpers.map((helperItem, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">
                          {helperItem.helper.firstName} {helperItem.helper.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {helperItem.helper.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {helperItem.adminHelper.email}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canViewHelperDetails(helperItem.helper.userId) && (
                          <Button
                            onClick={() => handleViewDetails(helperItem.helper.userId)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        )}
                        {!canViewHelperDetails(helperItem.helper.userId) && (
                          <span className="text-sm text-gray-500">Accès refusé</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun assistant trouvé</h3>
              <p className="text-gray-500 mb-4">
                Il n'y a actuellement aucun assistant associé à ce locataire.
              </p>
              <Button onClick={handleCreateHelper}>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier assistant
              </Button>
            </div>
          )}

          {/* Informations supplémentaires pour les utilisateurs autorisés */}
          {hasAnyAccess && (
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Vous avez l'autorisation de voir les détails de certains assistants pour ce locataire.
                {user?.role === "ADMIN_PRINCIPAL" && " En tant qu'ADMIN_PRINCIPAL, vous pouvez voir tous les assistants."}
                {user?.role === "SUPER_ADMIN" && " En tant que SUPER_ADMIN, vous pouvez voir vos assistants associés."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <HelperDetailsModal
        open={showHelperDetails}
        onOpenChange={setShowHelperDetails}
        helperDetails={selectedHelperDetails}
        onResetPassword={handleResetPassword}
        canResetPassword={selectedHelperDetails ? canResetPassword(selectedHelperDetails.data?.helper?.id || selectedHelperDetails.data?.helper?.userId) : false}
      />
      
        <CreateHelperModal
        isOpen={showCreateHelper}
        onClose={() => setShowCreateHelper(false)}
        tenantId={tenantId}
        onHelperCreated={refresh}
        />
      
      <PasswordResetComponent
        isOpen={showPasswordReset}
        onClose={() => {
          setShowPasswordReset(false)
          setSelectedHelperForReset(null)
        }}
        onResetPassword={handlePasswordResetSubmit}
        helperName={selectedHelperForReset?.name || ""}
        loading={loading}
      />
    </>
  )
}