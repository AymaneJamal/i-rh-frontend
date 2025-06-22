"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
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
import { useTenants } from "@/hooks/use-tenants"
import { tenantApi } from "@/lib/api/tenant"
import { Tenant } from "@/types/tenant"
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users,
  Shield,
  Clock
} from "lucide-react"

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default" // Green
    case "INACTIVE":
      return "secondary" // Gray
    case "SUSPENDED":
      return "destructive" // Red
    case "PENDING":
      return "outline" // Yellow
    default:
      return "secondary"
  }
}

const getSubscriptionBadgeVariant = (expired: boolean) => {
  return expired ? "destructive" : "default"
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const TenantTableRow = ({ tenant }: { tenant: Tenant }) => {
  const router = useRouter()
  const isDetailsAvailable = tenantApi.isTenantDetailsAvailable(tenant.createdAt)

  const handleViewTenant = () => {
    router.push(`/dashboard/tenants/${tenant.tenantId}`)
  }

  const handleEditTenant = () => {
    router.push(`/dashboard/tenants/${tenant.tenantId}/edit`)
  }

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(tenant.status)}>
            {tenant.status}
          </Badge>
          {tenant.active && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          )}
          {!isDetailsAvailable && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              En attente
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">
            {tenant.tenantName}
          </div>
          <div className="text-sm text-gray-500">ID: {tenant.tenantId}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{tenant.adminId}</div>
          <div className="text-sm text-gray-500">Administrateur</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getSubscriptionBadgeVariant(tenant.subscriptionExpired)}>
          {tenant.subscriptionExpired ? "Expiré" : "Actif"}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600">
        {formatDate(tenant.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewTenant}
            disabled={!isDetailsAvailable}
            title={!isDetailsAvailable ? "Détails disponibles dans 10 minutes après création" : "Voir les détails"}
            className={!isDetailsAvailable ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEditTenant}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const TenantFilters = ({ 
  onFilterChange, 
  onSearch,
  onRefresh,
  loading 
}: {
  onFilterChange: (filters: any) => void
  onSearch: (tenantName: string) => void
  onRefresh: () => void
  loading: boolean
}) => {
  const [searchTenant, setSearchTenant] = useState("")

  const handleSearch = () => {
    onSearch(searchTenant)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom du Tenant</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Rechercher par nom..."
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select onValueChange={(value) => onFilterChange({ status: value === "all" ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Abonnement</label>
            <Select onValueChange={(value) => onFilterChange({ subscription: value === "all" ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les abonnements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les abonnements</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Éléments par page</label>
            <Select onValueChange={(value) => onFilterChange({ size: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 par page</SelectItem>
                <SelectItem value="20">20 par page</SelectItem>
                <SelectItem value="50">50 par page</SelectItem>
                <SelectItem value="100">100 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  hasNext,
  hasPrevious,
  onPageChange 
}: {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Affichage {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} résultats
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
        >
          Précédent
        </Button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = Math.max(0, currentPage - 2) + i
          if (pageNum >= totalPages) return null
          
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum + 1}
            </Button>
          )
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}

export default function TenantsPage() {
  const router = useRouter()

  const {
    tenants,
    loading,
    error,
    pagination,
    currentPage,
    pageSize,
    updateFilters,
    updatePage,
    updatePageSize,
    refresh
  } = useTenants({ page: 0, size: 20 })

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.size) {
      updatePageSize(newFilters.size)
    } else {
      updateFilters(newFilters)
    }
  }

  const handleSearch = (tenantName: string) => {
    updateFilters({ tenantName: tenantName || undefined })
  }

  return (
    <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-blue-600" />
              Gestion des Tenants
            </h1>
            <p className="text-gray-600">Gérer les organisations et leurs abonnements</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/dashboard/tenants/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Tenant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold">{pagination.totalElements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold">
                    {tenants.filter(t => t.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
                  <p className="text-2xl font-bold">
                    {tenants.filter(t => !t.subscriptionExpired).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Abonnements Expirés</p>
                  <p className="text-2xl font-bold">
                    {tenants.filter(t => t.subscriptionExpired).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Level Warning */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-blue-700">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">ADMIN_PRINCIPAL Access Required</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Cette page est accessible uniquement aux utilisateurs avec le rôle ADMIN_PRINCIPAL.
            </p>
          </CardContent>
        </Card>

        {/* Tenant Details Info */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start text-amber-800">
              <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Accès aux détails des tenants</span>
                <p className="text-amber-700 text-sm mt-1">
                  Les détails des tenants ne sont accessibles que 10 minutes après leur création 
                  pour des raisons de sécurité et de provisioning. Les tenants "En attente" 
                  ne peuvent pas être consultés en détail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <TenantFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              Tenants ({pagination.totalElements})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center p-4 mb-4 text-red-700 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Chargement des tenants...</span>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun tenant trouvé</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statut</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Abonnement</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TenantTableRow key={tenant.tenantId} tenant={tenant} />
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalElements={pagination.totalElements}
                    pageSize={pageSize}
                    hasNext={pagination.hasNext}
                    hasPrevious={pagination.hasPrevious}
                    onPageChange={updatePage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}