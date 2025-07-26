// components/modals/user-details-modal.tsx
"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Building, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Users
} from "lucide-react"
import { TenantUser } from "@/lib/api/tenant-users"
import { formatDate } from "@/lib/formatters"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: TenantUser | null
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "SUSPENDED":
      return "bg-red-100 text-red-800 border-red-200"
    case "DELETED":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "SUSPENDED":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "DELETED":
      return <AlertTriangle className="h-4 w-4 text-gray-600" />
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />
  }
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-6 w-6 mr-3 text-blue-600" />
            Détails de l'utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 break-all">{user.email}</p>
                </div>
              </div>
              <Badge className={`text-sm font-medium ${getStatusColor(user.status)} flex items-center gap-2`}>
                {getStatusIcon(user.status)}
                {user.status}
              </Badge>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Rôles et Permissions
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rôle système</span>
                    <span className="text-sm font-medium text-gray-900">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rôle entreprise</span>
                    <span className="text-sm font-medium text-gray-900">{user.companyRole || "Non défini"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">MFA requis</span>
                    <Badge variant={user.isMfaRequired ? "default" : "secondary"} className="text-xs">
                      {user.isMfaRequired ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  Vérification Email
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email vérifié</span>
                    <Badge variant={user.isEmailVerified ? "default" : "destructive"} className="text-xs">
                      {user.isEmailVerified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tentatives échouées</span>
                    <span className="text-sm font-medium text-gray-900">{user.failedLoginAttempts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Dates importantes
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 block">Créé le</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Modifié le</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(user.modifiedAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Statut modifié le</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(user.statusModifiedAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Dernière connexion</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Jamais"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-orange-600" />
                  Informations Tenant
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tenant ID</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{user.tenantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">User ID</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Relations d'assistance (si applicable) */}
          {(user.isHelperOf || user.isHelpingBy) && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-indigo-600" />
                Relations d'Assistance
              </h4>
              <div className="space-y-3">
                {user.isHelperOf && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assistant de</span>
                    <span className="text-sm font-medium text-gray-900">{user.isHelperOf}</span>
                  </div>
                )}
                {user.isHelpingBy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Aidé par</span>
                    <span className="text-sm font-medium text-gray-900">{user.isHelpingBy}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sécurité et MFA */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Key className="h-4 w-4 mr-2 text-red-600" />
              Sécurité
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Authentification 2FA</span>
                <Badge variant={user.isMfaRequired ? "default" : "secondary"} className="text-xs">
                  {user.isMfaRequired ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Secret MFA configuré</span>
                <Badge variant={user.secretCodeMFA ? "default" : "secondary"} className="text-xs">
                  {user.secretCodeMFA ? "Oui" : "Non"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tentatives échouées</span>
                <span className={`text-sm font-medium ${user.failedLoginAttempts > 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {user.failedLoginAttempts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}