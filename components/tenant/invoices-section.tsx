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
import { TenantInvoice } from "@/lib/api/tenant-invoices"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { Currency } from "@/lib/constants"
import {
  RefreshCw,
  FileText,
  AlertCircle,
  Download,
  Eye,
  DollarSign,
  Calendar,
  CreditCard
} from "lucide-react"

interface InvoicesSectionProps {
  invoices: TenantInvoice[]
  loading: boolean
  error: string | null
  onRefresh: () => void
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
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusColor = (paymentStatus: string) => {
  switch (paymentStatus.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'PREPAID':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function InvoicesSection({ 
  invoices, 
  loading, 
  error, 
  onRefresh 
}: InvoicesSectionProps) {
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Liste des Factures
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Liste des Factures ({invoices.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des factures...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune facture trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            {invoices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Factures</p>
                        <p className="text-2xl font-bold">{invoices.length}</p>
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
                          {formatPrice(
                            invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
                            invoices[0]?.currency
                          )}
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
                          {formatPrice(
                            invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
                            invoices[0]?.currency
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Invoices Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">{invoice.invoiceId}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.planName}</p>
                          <p className="text-xs text-gray-500">{invoice.billingType}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {invoice.invoiceType}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(invoice.billingPeriodStart)} →
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {formatDate(invoice.billingPeriodEnd)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatPrice(invoice.totalAmount, invoice.currency)}
                          </p>
                          {invoice.remainingAmount > 0 && (
                            <p className="text-xs text-red-600">
                              Reste: {formatPrice(invoice.remainingAmount, invoice.currency)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(invoice.status)}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={getPaymentStatusColor(invoice.paymentStatus)}
                        >
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(invoice.issueDate)}</p>
                          {invoice.dueDate && (
                            <p className="text-xs text-gray-500">
                              Échéance: {formatDate(invoice.dueDate)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view invoice details
                              console.log("View invoice:", invoice.invoiceId)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {invoice.pdfFileUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (invoice.pdfFileUrl) {
                                  window.open(invoice.pdfFileUrl, '_blank')
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}