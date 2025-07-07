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
import { SubscriptionStatus } from "@/lib/constants"
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

// FONCTION MISE À JOUR POUR NOUVEAUX STATUTS
const getSubscriptionBadgeVariant = (subscriptionStatus: SubscriptionStatus) => {
  switch (subscriptionStatus) {
    case "PENDING":
      return "outline" // Orange
    case "ACTIVE":
      return "default" // Green
    case "EXPIRED":
      return "destructive" // Red
    case "GRACE":
      return "secondary" // Yellow
    default:
      return "outline"
  }
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
  const isDetailsAvailable = Date.now() > (tenant.createdAt + 10 * 60 * 1000)

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
          {tenant.isActive && (
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
        {/* UTILISER LE NOUVEAU subscriptionStatus */}
        <Badge variant={getSubscriptionBadgeVariant(tenant.subscriptionStatus)}>
          {tenant.subscriptionStatus}
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEditTenant}
            disabled={!isDetailsAvailable}
            title={!isDetailsAvailable ? "Modification disponible dans 10 minutes après création" : "Modifier le tenant"}
            className={!isDetailsAvailable ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

interface TenantFiltersProps {
  onFilterChange: (filters: any) => void
  onSearch: (email: string) => void
  onRefresh: () => void
  loading: boolean
}

function TenantFilters({ onFilterChange, onSearch, onRefresh, loading }: TenantFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  // NOUVEAU FILTRE POUR subscriptionStatus
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all")
  const [pageSizeFilter, setPageSizeFilter] = useState("20")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    onFilterChange({ 
      status: value === "all" ? undefined : value,
      subscriptionStatus: subscriptionStatusFilter === "all" ? undefined : subscriptionStatusFilter
    })
  }

  // NOUVEAU HANDLER POUR subscriptionStatus
  const handleSubscriptionStatusChange = (value: string) => {
    setSubscriptionStatusFilter(value)
    onFilterChange({ 
      status: statusFilter === "all" ? undefined : statusFilter,
      subscriptionStatus: value === "all" ? undefined : value
    })
  }

  const handlePageSizeChange = (value: string) => {
    setPageSizeFilter(value)
    onFilterChange({ size: parseInt(value) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres et Recherche
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-2">
            <Input
              placeholder="Rechercher un tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="INACTIVE">Inactif</SelectItem>
              <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
            </SelectContent>
          </Select>

          {/* NOUVEAU FILTRE subscriptionStatus */}
          <Select value={subscriptionStatusFilter} onValueChange={handleSubscriptionStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les subscriptions</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expirée</SelectItem>
              <SelectItem value="GRACE">Période de grâce</SelectItem>
            </SelectContent>
          </Select>

          {/* Page Size */}
          <Select value={pageSizeFilter} onValueChange={handlePageSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Taille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 par page</SelectItem>
              <SelectItem value="20">20 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
              <SelectItem value="100">100 par page</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setSubscriptionStatusFilter("all")
              setPageSizeFilter("20")
              onFilterChange({})
              onSearch("")
            }}
            className="w-full"
          >
            Effacer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalElements, pageSize, onPageChange }: PaginationProps) {
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Affichage de {startItem} à {endItem} sur {totalElements} résultats
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + Math.max(0, currentPage - 2)
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
          disabled={currentPage >= totalPages - 1}
        >
          Next
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
  } = useTenants({ page: 0, size: 10 })

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.size) {
      updatePageSize(newFilters.size)
    } else {
      updateFilters(newFilters)
    }
  }

  const handleSearch = (email: string) => {
    updateFilters({ tenantName: email || undefined })
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
            <p className="text-gray-600">Gérer les tenants et leurs abonnements</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/tenants/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Tenant
          </Button>
        </div>

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
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span>Chargement des tenants...</span>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tenant trouvé</h3>
                <p className="text-gray-600">Commencez par créer votre premier tenant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statut</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TenantTableRow key={tenant.tenantId} tenant={tenant} />
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalElements={pagination.totalElements}
                  pageSize={pageSize}
                  onPageChange={updatePage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}