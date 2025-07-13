// components/tenant/invoice-filters.tsx
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
  FileText,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from "lucide-react"

export interface InvoiceFilters {
  search: string
  invoiceType: 'all' | 'STANDARD' | 'PREPAYE'
  status: 'all' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | 'DRAFT' | 'CREDIT' | 'PREPAID'
  paymentStatus: 'all' | 'PAID' | 'PENDING' | 'FAILED' | 'PARTIAL' | 'REFUNDED'
  period: 'all' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom'
}

interface InvoiceFiltersProps {
  filters: InvoiceFilters
  onFiltersChange: (filters: InvoiceFilters) => void
  onRefresh: () => void
  loading?: boolean
  resultsCount?: number
}

export const InvoiceFilters = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading = false,
  resultsCount = 0
}: InvoiceFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch })
  }

  const handleInvoiceTypeChange = (invoiceType: string) => {
    onFiltersChange({ ...filters, invoiceType: invoiceType as InvoiceFilters['invoiceType'] })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: status as InvoiceFilters['status'] })
  }

  const handlePaymentStatusChange = (paymentStatus: string) => {
    onFiltersChange({ ...filters, paymentStatus: paymentStatus as InvoiceFilters['paymentStatus'] })
  }

  const handlePeriodChange = (period: string) => {
    onFiltersChange({ ...filters, period: period as InvoiceFilters['period'] })
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    onFiltersChange({ ...filters, search: '' })
  }

  const handleResetFilters = () => {
    const defaultFilters: InvoiceFilters = {
      search: '',
      invoiceType: 'all',
      status: 'all',
      paymentStatus: 'all',
      period: 'all'
    }
    setLocalSearch('')
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = filters.search || filters.invoiceType !== 'all' || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.period !== 'all'

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'DRAFT':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'CREDIT':
        return <DollarSign className="h-4 w-4 text-purple-600" /> // ← Ajouter
      case 'PREPAID':
        return <CreditCard className="h-4 w-4 text-blue-600" /> // ← Ajouter  
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PARTIAL':
        return <DollarSign className="h-4 w-4 text-orange-600" />
      case 'REFUNDED':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getInvoiceTypeIcon = (invoiceType: string) => {
    switch (invoiceType) {
      case 'STANDARD':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'PREPAYE':
        return <CreditCard className="h-4 w-4 text-green-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getPeriodIcon = (period: string) => {
    return <Calendar className="h-4 w-4 text-gray-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                placeholder="N° facture, plan..."
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

            {/* Filtre par type de facture */}
            <Select value={filters.invoiceType} onValueChange={handleInvoiceTypeChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Tous les types
                  </div>
                </SelectItem>
                <SelectItem value="STANDARD">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Standard
                  </div>
                </SelectItem>
                <SelectItem value="PREPAYE">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    Prépayé
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

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
                    <FileText className="h-4 w-4 text-gray-600" />
                    Tous statuts
                  </div>
                </SelectItem>
                <SelectItem value="PAID">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Payé
                  </div>
                </SelectItem>
                <SelectItem value="CREDIT">
                    <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    Crédit
                    </div>
                </SelectItem>
                <SelectItem value="PREPAID">
                    <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Prépayé
                    </div>
                </SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    En attente
                  </div>
                </SelectItem>
                <SelectItem value="OVERDUE">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    En retard
                  </div>
                </SelectItem>
                <SelectItem value="CANCELLED">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    Annulé
                  </div>
                </SelectItem>
                <SelectItem value="DRAFT">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Brouillon
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par statut de paiement 
            <Select value={filters.paymentStatus} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {getPaymentStatusIcon(filters.paymentStatus)}
                  <SelectValue placeholder="Paiement" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    Tous paiements
                  </div>
                </SelectItem>
                <SelectItem value="PAID">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Payé
                  </div>
                </SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    En attente
                  </div>
                </SelectItem>
                <SelectItem value="FAILED">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Échoué
                  </div>
                </SelectItem>
                <SelectItem value="PARTIAL">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    Partiel
                  </div>
                </SelectItem>
                <SelectItem value="REFUNDED">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    Remboursé
                  </div>
                </SelectItem>
              </SelectContent>
            </Select> */}

            {/* Filtre par période */}
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  
                  <SelectValue placeholder="Période" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    Toutes périodes
                  </div>
                </SelectItem>
                <SelectItem value="last_month">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Dernier mois
                  </div>
                </SelectItem>
                <SelectItem value="last_3_months">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    3 derniers mois
                  </div>
                </SelectItem>
                <SelectItem value="last_6_months">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    6 derniers mois
                  </div>
                </SelectItem>
                <SelectItem value="last_year">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Dernière année
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
                {filters.invoiceType !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getInvoiceTypeIcon(filters.invoiceType)}
                    {filters.invoiceType === 'STANDARD' ? 'Standard' : 
                     filters.invoiceType === 'PREPAYE' ? 'Prépayé' : filters.invoiceType}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, invoiceType: 'all' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getStatusIcon(filters.status)}
                    {filters.status}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.paymentStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getPaymentStatusIcon(filters.paymentStatus)}
                    {filters.paymentStatus}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, paymentStatus: 'all' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.period !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getPeriodIcon(filters.period)}
                    {filters.period === 'last_month' ? 'Dernier mois' :
                     filters.period === 'last_3_months' ? '3 derniers mois' :
                     filters.period === 'last_6_months' ? '6 derniers mois' :
                     filters.period === 'last_year' ? 'Dernière année' : filters.period}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, period: 'all' })}
                      className="h-4 w-4 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}