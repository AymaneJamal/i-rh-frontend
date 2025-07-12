// components/tenant/tenant-helpers-filters.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Filter, 
  X, 
  RefreshCw,
  Users,
  User,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2
} from "lucide-react"

export interface HelperFilters {
  search: string
  status: 'all' | 'active' | 'pending' | 'emergency_access' | 'read_only' | 'suspended' | 'deleted'
  scope: 'all' | 'my_helpers'
}

interface TenantHelpersFiltersProps {
  filters: HelperFilters
  onFiltersChange: (filters: HelperFilters) => void
  onRefresh: () => void
  loading?: boolean
  resultsCount?: number
}

export const TenantHelpersFilters = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading = false,
  resultsCount = 0
}: TenantHelpersFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: status as HelperFilters['status'] })
  }

  const handleScopeChange = (scope: string) => {
    onFiltersChange({ ...filters, scope: scope as HelperFilters['scope'] })
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    onFiltersChange({ ...filters, search: '' })
  }

  const handleResetFilters = () => {
    const defaultFilters: HelperFilters = {
      search: '',
      status: 'active',
      scope: 'all'
    }
    setLocalSearch('')
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = filters.search || filters.status !== 'active' || filters.scope !== 'all'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-orange-600" />
    case 'emergency_access':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'read_only':
      return <Eye className="h-4 w-4 text-blue-600" />
    case 'suspended':
      return <Ban className="h-4 w-4 text-red-600" />
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-gray-800" />
    default:
      return <Users className="h-4 w-4 text-gray-600" />
  }
}

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'my_helpers':
        return <User className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header avec titre et bouton refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filtres et Recherche</h3>
              {resultsCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filtres principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                placeholder="Rechercher par nom ou email..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-1 top-1 flex gap-1">
                {localSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Filtre par statut */}
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  
                  <SelectValue placeholder="Statut" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                    <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Tous les statuts
                    </div>
                </SelectItem>
                <SelectItem value="active">
                    <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Actifs
                    </div>
                </SelectItem>
                <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    En attente
                    </div>
                </SelectItem>
                <SelectItem value="emergency_access">
                    <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Accès d'urgence
                    </div>
                </SelectItem>
                <SelectItem value="read_only">
                    <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Lecture seule
                    </div>
                </SelectItem>
                <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-red-600" />
                    Suspendus
                    </div>
                </SelectItem>
                <SelectItem value="deleted">
                    <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-gray-800" />
                    Supprimés
                    </div>
                </SelectItem>
                </SelectContent>
            </Select>

            {/* Filtre par portée */}
            <Select value={filters.scope} onValueChange={handleScopeChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  
                  <SelectValue placeholder="Portée" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Tous les assistants
                  </div>
                </SelectItem>
                <SelectItem value="my_helpers">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Mes assistants
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Badges des filtres actifs */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Filtres actifs :</span>
              <div className="flex gap-2 flex-wrap">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    <Search className="h-3 w-3" />
                    "{filters.search}"
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, search: '' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.status !== 'active' && (
                  <Badge variant="secondary" className="gap-1">
                    {getStatusIcon(filters.status)}
                    {filters.status === 'all' ? 'Tous statuts' : 
                     filters.status === 'suspended' ? 'Suspendus' : 'Actifs'}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, status: 'active' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.scope !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getScopeIcon(filters.scope)}
                    Mes assistants
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, scope: 'all' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Réinitialiser tout
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}