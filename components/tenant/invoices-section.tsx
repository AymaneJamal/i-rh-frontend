// components/tenant/invoices-section.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { TenantInvoice } from "@/lib/api/tenant-invoices"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { Currency } from "@/lib/constants"
import { InvoiceFilters } from "@/components/tenant/invoice-filters"
import { useInvoiceFilters } from "@/hooks/use-invoice-filters"
import { useDownloadInvoicePdf } from "@/hooks/use-download-invoice-pdf"
import { Invoice } from "@/hooks/use-tenant-invoices"
import {
  RefreshCw,
  FileText,
  AlertCircle,
  Download,
  Eye,
  DollarSign,
  Calendar,
  CreditCard,
  Zap,
  Loader2 ,
  Clock
} from "lucide-react"

interface InvoicesSectionProps {
  invoices: Invoice[] // ← Maintenant Invoice est importé
  loading: boolean
  error: string | null
  onRefresh: () => void
  onExtendPlan?: () => void
  tenant?: any
}

// Helper function pour éviter les erreurs de type Currency
const formatPrice = (amount: number, currency: string | null): string => {
  return formatCurrency(amount, (currency || 'MAD') as Currency)
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'OVERDUE':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'PREPAID':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CREDIT':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusColor = (paymentStatus: string) => {
  if (!paymentStatus) return 'bg-gray-100 text-gray-800'
  switch (paymentStatus.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'PREPAID':
      return 'bg-blue-100 text-blue-800'
    case 'PARTIAL':
      return 'bg-orange-100 text-orange-800'
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function InvoicesSection({ 
  invoices, 
  loading, 
  error, 
  onRefresh,
  onExtendPlan,
  tenant
}: InvoicesSectionProps) {
  const router = useRouter()
  const { downloadingPdf, pdfError, downloadInvoicePdf } = useDownloadInvoicePdf()
  
  // Utilisation du hook pour les filtres
  const {
    filters,
    setFilters,
    filteredAndSortedInvoices,
    stats
  } = useInvoiceFilters(invoices)

// Dans components/tenant/invoices-section.tsx
const handleViewInvoice = (invoice: Invoice) => {
  // Convertir Invoice en TenantInvoice pour le sessionStorage
  const tenantInvoice = {
    ...invoice,
    // S'assurer que les propriétés requises existent
    billingPeriodStart: invoice.billingPeriodStart || invoice.issueDate,
    billingPeriodEnd: invoice.billingPeriodEnd || invoice.dueDate || invoice.issueDate,
    discountAmount: invoice.discountAmount || 0,
    discountReason: invoice.discountReason || null,
    invoiceType: invoice.invoiceType || 'STANDARD',
    paidDate: invoice.paidDate || null, // Convertir undefined en null
    remainingAmount: invoice.remainingAmount || 0,
    paidAmount: invoice.paidAmount || 0,
    // Ajouter d'autres propriétés requises avec des valeurs par défaut
    lineItems: invoice.lineItems || null,
    billingEmail: invoice.billingEmail || '',
    billingName: invoice.billingName || '',
    billingAddress: invoice.billingAddress || {},
    vatNumber: invoice.vatNumber || null,
    s3BucketName: invoice.s3BucketName || null,
    s3Key: invoice.s3Key || null,
    attachments: invoice.attachments || null,
    sentDate: invoice.sentDate || null,
    emailSent: invoice.emailSent || null,
    emailSentTo: invoice.emailSentTo || null,
    fiscalYear: invoice.fiscalYear || null,
    legalEntity: invoice.legalEntity || null,
    notes: invoice.notes || null,
    termsAndConditions: invoice.termsAndConditions || null,
    auditTrail: invoice.auditTrail || [],
    parentInvoiceId: invoice.parentInvoiceId || null,
    isPrepayedInvoiceReason: invoice.isPrepayedInvoiceReason || null,
    isPrepayeInvoiceContab: invoice.isPrepayeInvoiceContab || 0,
    isRecurring: invoice.isRecurring || null,
    recurringSchedule: invoice.recurringSchedule || null,
    creditReason: invoice.creditReason || null,
    refundAmount: invoice.refundAmount || null,
    refundDate: invoice.refundDate || null,
    refundReason: invoice.refundReason || null,
    autoRenewalEnabled: invoice.autoRenewalEnabled || null,
    isAutoGracePeriod: invoice.isAutoGracePeriod || null,
    isManualGracePeriod: invoice.isManualGracePeriod || null,
    manualGracePeriodSetBy: invoice.manualGracePeriodSetBy || null,
    manualGracePeriodSetAt: invoice.manualGracePeriodSetAt || null,
    manualGracePeriodModifiedAt: invoice.manualGracePeriodModifiedAt || null,
    gracePeriodStartDate: invoice.gracePeriodStartDate || null,
    gracePeriodEndDate: invoice.gracePeriodEndDate || null
  }
  
  sessionStorage.setItem(`invoice-${invoice.invoiceId}`, JSON.stringify(tenantInvoice))
  router.push(`/dashboard/invoices/${invoice.invoiceId}`)
}

    const handleDownloadPdf = async (invoice: Invoice) => {
      try {
        await downloadInvoicePdf(invoice.invoiceId, 'standard-invoice')
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
      }
    }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Facturation ({invoices.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onExtendPlan && tenant?.plan?.id && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onExtendPlan}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Étendre Plan
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
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
    <div className="space-y-6">
      {/* Header avec bouton Étendre Plan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-3 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Facturation ({stats.total})
            </h2>
            <p className="text-gray-600">Gestion des factures et paiements</p>
          </div>
        </div>
        {onExtendPlan && tenant?.plan?.id && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onExtendPlan}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Étendre Plan
          </Button>
        )}
      </div>

      {/* Filtres */}
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={onRefresh}
        loading={loading}
        resultsCount={stats.total}
      />

      {/* Alertes d'erreur PDF */}
      {pdfError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pdfError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Liste des Factures
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des factures...</span>
            </div>
          ) : filteredAndSortedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.search || filters.invoiceType !== 'all' || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.period !== 'all'
                  ? 'Aucune facture trouvée'
                  : 'Aucune facture disponible'}
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.invoiceType !== 'all' || filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.period !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Les factures apparaîtront ici une fois générées.'}
              </p>
            </div>
          ) : (
            <>
              {/* Statistiques */}
              {filteredAndSortedInvoices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Factures</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Montant Total</p>
                          <p className="text-2xl font-bold">
                            {formatPrice(stats.totalAmount, stats.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CreditCard className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Montant Payé</p>
                          <p className="text-2xl font-bold">
                            {formatPrice(stats.paidAmount, stats.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {stats.remainingAmount > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Impayé</p>
                            <p className="text-2xl font-bold text-red-600">
                              {formatPrice(stats.remainingAmount, stats.currency)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Table des factures */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Numéro</TableHead>
                      <TableHead className="font-semibold">Plan</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Période</TableHead>
                      <TableHead className="font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[120px]" title={invoice.invoiceId}>
                              {invoice.invoiceId}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.planName}</p>
                            <p className="text-xs text-gray-500 capitalize">{invoice.billingType.toLowerCase()}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              invoice.invoiceType === 'STANDARD' 
                                ? 'border-blue-200 text-blue-700 bg-blue-50' 
                                : 'border-green-200 text-green-700 bg-green-50'
                            }`}
                          >
                            {invoice.invoiceType}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {/* Utiliser billingPeriodStart si disponible, sinon issueDate */}
                              {formatDate(invoice.billingPeriodStart || invoice.issueDate)}
                            </div>
                            <div className="text-xs text-gray-500 pl-4">
                              {/* Utiliser billingPeriodEnd si disponible, sinon dueDate */}
                              → {formatDate(invoice.billingPeriodEnd || invoice.dueDate || invoice.issueDate)}
                            </div>
                          </div>
                        </TableCell>
                        
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(invoice.totalAmount, invoice.currency)}
                          </p>
                          {/* Vérifier que remainingAmount existe et > 0 */}
                          {(invoice.remainingAmount || 0) > 0 && (
                            <p className="text-xs text-red-600 font-medium">
                              Reste: {formatPrice(invoice.remainingAmount || 0, invoice.currency)}
                            </p>
                          )}
                          {/* Vérifier que paidAmount existe et remainingAmount est 0 */}
                          {(invoice.paidAmount || 0) > 0 && (invoice.remainingAmount || 0) === 0 && (
                            <p className="text-xs text-green-600">
                              Payé intégralement
                            </p>
                          )}
                        </div>
                      </TableCell>
                        
                        <TableCell>
                          <Badge className={`text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        
                        {/* 
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`text-xs font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                              {invoice.paymentStatus}
                            </Badge>
                            {invoice.paymentMethod && (
                              <p className="text-xs text-gray-500 truncate max-w-[80px]">
                                {invoice.paymentMethod}
                              </p>
                            )}
                          </div>
                        </TableCell>*/}
                        
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Émise:</span> {formatDate(invoice.issueDate)}
                            </p>
                            {invoice.dueDate && (
                              <p className={`text-xs ${
                                invoice.dueDate < Date.now() && invoice.paymentStatus !== 'PAID' 
                                  ? 'text-red-600 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                <span className="font-medium">Échéance:</span> {formatDate(invoice.dueDate)}
                              </p>
                            )}
                            {invoice.paidDate && (
                              <p className="text-xs text-green-600">
                                <span className="font-medium">Payée:</span> {formatDate(invoice.paidDate)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPdf(invoice)}
                              disabled={downloadingPdf}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
                              title="Télécharger PDF"
                            >
                              {downloadingPdf ? (
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                              ) : (
                                <Download className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer avec alertes */}
              <div className="mt-6 space-y-3">
                {stats.remainingAmount > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Montant impayé: {formatPrice(stats.remainingAmount, stats.currency)}
                          </p>
                          <p className="text-sm">
                            {stats.unpaidCount} facture(s) avec solde impayé
                            {stats.overdueCount > 0 && ` • ${stats.overdueCount} facture(s) en retard`}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {stats.overdueCount > 0 && stats.remainingAmount === 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <p className="font-medium">
                        {stats.overdueCount} facture(s) en retard détectée(s)
                      </p>
                      <p className="text-sm">
                        Certaines factures ont dépassé leur date d'échéance
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}