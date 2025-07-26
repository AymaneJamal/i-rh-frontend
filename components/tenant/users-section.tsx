// components/tenant/users-section.tsx
"use client"

import { useState, useMemo } from "react"
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  UserX, 
  UserCheck,
  Filter,
  Shield
} from "lucide-react"
import { TenantUser } from "@/lib/api/tenant-users"
import { formatDate } from "@/lib/formatters"

interface UsersSectionProps {
  users: TenantUser[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onViewUser: (user: TenantUser) => void
  onSuspendUser: (userId: string) => Promise<boolean>
  onReactivateUser: (userId: string) => Promise<boolean>
}

// Helper function pour les badges de statut
const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default" // Green
    case "PENDING":
      return "outline" // Orange
    case "SUSPENDED":
      return "destructive" // Red
    case "DELETED":
      return "secondary" // Gray
    default:
      return "secondary"
  }
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

export function UsersSection({ 
  users, 
  loading, 
  error, 
  onRefresh,
  onViewUser,
  onSuspendUser,
  onReactivateUser
}: UsersSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === "" || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, statusFilter])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      pending: users.filter(u => u.status === 'PENDING').length,
      suspended: users.filter(u => u.status === 'SUSPENDED').length,
      deleted: users.filter(u => u.status === 'DELETED').length
    }
  }, [users])

  const handleUserAction = async (userId: string, action: 'suspend' | 'reactivate') => {
    setActionLoading(userId)
    try {
      if (action === 'suspend') {
        await onSuspendUser(userId)
      } else {
        await onReactivateUser(userId)
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Utilisateurs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-red-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-slate-800">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Utilisateurs
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-sm font-normal rounded-full">
              {stats.total}
            </span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 mb-1">Actifs</p>
            <p className="text-lg font-semibold text-green-800">{stats.active}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 mb-1">En attente</p>
            <p className="text-lg font-semibold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 mb-1">Suspendus</p>
            <p className="text-lg font-semibold text-red-800">{stats.suspended}</p>
          </div>
          
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par email, nom, prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <SelectValue placeholder="Statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              <SelectItem value="DELETED">Supprimé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Chargement des utilisateurs...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0 ? "Aucun utilisateur" : "Aucun résultat"}
            </h3>
            <p className="text-gray-600">
              {users.length === 0 
                ? "Ce tenant n'a pas encore d'utilisateurs." 
                : "Aucun utilisateur ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 break-all">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.role}</p>
                      {user.companyRole && (
                        <p className="text-xs text-gray-500">{user.companyRole}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Jamais"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Bouton Voir */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                    {/* Bouton Suspendre/Réactiver - Bloqué pour TENANT_ADMIN */}
                    {user.role === 'TENANT_ADMIN' ? (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={true}
                        className="border-gray-200 text-gray-400 cursor-not-allowed"
                        title="Les administrateurs de tenant ne peuvent pas être suspendus"
                    >
                        <Shield className="h-4 w-4" />
                    </Button>
                    ) : user.status === 'SUSPENDED' ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'reactivate')}
                        disabled={actionLoading === user.id}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                        {actionLoading === user.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                        <UserCheck className="h-4 w-4" />
                        )}
                    </Button>
                    ) : user.status === 'ACTIVE' ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'suspend')}
                        disabled={actionLoading === user.id}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                        {actionLoading === user.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                        <UserX className="h-4 w-4" />
                        )}
                    </Button>
                    ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}