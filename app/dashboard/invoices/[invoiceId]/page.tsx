"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TenantInvoice } from "@/lib/api/tenant-invoices"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { ModifyInvoiceModal } from "@/components/modals/modify-invoice-modal"
import { Currency } from "@/lib/constants"
import { tenantInvoicesApi } from "@/lib/api/tenant-invoices"
import { AddReceiptModal } from "@/components/modals/add-receipt-modal"
import { Loader2 } from "lucide-react"
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Download,
  Edit,
  Plus,
  Receipt,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  FileCheck,
  Zap
} from "lucide-react"

export default function InvoiceDetailPage() {

  const params = useParams()
  const router = useRouter()
  const invoiceId = params.invoiceId as string

  const [invoice, setInvoice] = useState<TenantInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [showAddReceiptModal, setShowAddReceiptModal] = useState(false)

  useEffect(() => {
    const storedInvoice = sessionStorage.getItem(`invoice-${invoiceId}`)
    
    if (storedInvoice) {
      try {
        const parsedInvoice = JSON.parse(storedInvoice)
        setInvoice(parsedInvoice)
      } catch (err) {
        setError("Erreur lors du chargement de la facture")
      }
    } else {
      setError("Facture non trouvée")
    }
    
    setLoading(false)
  }, [invoiceId])

  const handleBack = () => {
    router.back()
  }

  const handleEditInvoice = () => {
    setShowModifyModal(true)
  }

const handleInvoiceModified = async () => {
  console.log("✅ Facture modifiée avec succès")
  
  // Vérification de sécurité
  if (!invoice) {
    console.error("❌ Invoice is null, cannot reload")
    setError("Erreur: facture non disponible pour rechargement")
    return
  }
  
  try {
    setReloading(true)
    setError(null)
    console.log("🔄 Reloading invoice data...")
    
    // Récupérer la facture mise à jour depuis l'API
    const response = await tenantInvoicesApi.getInvoiceById(invoice.tenantId, invoiceId)
    
    console.log("🔍 API response received:", response)
    
    // Vérifier si la réponse est valide
    if (response.success && response.data?.getInvoiceResult?.invoice) {
      const updatedInvoice = response.data.getInvoiceResult.invoice
      
      // Vérifier que l'invoice a bien un ID
      if (updatedInvoice.invoiceId) {
        // Mettre à jour l'état local
        setInvoice(updatedInvoice)
        
        // Mettre à jour sessionStorage pour cohérence
        sessionStorage.setItem(`invoice-${invoiceId}`, JSON.stringify(updatedInvoice))
        
        console.log("✅ Invoice data reloaded successfully")
        console.log("📊 Updated invoice data:", updatedInvoice)
      } else {
        console.error("❌ Invalid invoice data - missing invoiceId")
        setError("Données de facture invalides après rechargement")
      }
    } else {
      console.error("❌ Invalid response structure:", response)
      setError("Structure de réponse inattendue lors du rechargement")
    }
    
  } catch (error: any) {
    console.error("❌ Error reloading invoice:", error)
    setError(
      error.response?.data?.error || 
      error.response?.data?.message ||
      error.message || 
      "Erreur lors du rechargement des données de la facture"
    )
  } finally {
    setReloading(false)
  }
}

    const handleAddReceipt = () => {
    setShowAddReceiptModal(true)
    }

    const handleReceiptAdded = async () => {
    console.log("✅ Reçu ajouté avec succès")
    
    // Réutiliser la même logique que handleInvoiceModified
    await handleInvoiceModified()
    }

  const formatPrice = (amount: number, currency: string | null): string => {
    return formatCurrency(amount, (currency || 'MAD') as Currency)
  }

  const formatDateModern = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return { 
          color: 'bg-emerald-500 text-white',
          icon: CheckCircle,
          label: 'Payée'
        }
      case 'PENDING':
        return { 
          color: 'bg-amber-500 text-white',
          icon: Clock,
          label: 'En attente'
        }
      case 'OVERDUE':
        return { 
          color: 'bg-red-500 text-white',
          icon: XCircle,
          label: 'Échue'
        }
      case 'PREPAID':
        return { 
          color: 'bg-blue-500 text-white',
          icon: Zap,
          label: 'Prépayée'
        }
      case 'CREDIT':
        return { 
          color: 'bg-purple-500 text-white',
          icon: DollarSign,
          label: 'Crédit'
        }
      default:
        return { 
          color: 'bg-gray-500 text-white',
          icon: FileText,
          label: status
        }
    }
  }

  const getPaymentStatusConfig = (paymentStatus: string | null) => {
    if (!paymentStatus) return { color: 'bg-gray-100 text-gray-700', label: 'Non défini' }
    
    switch (paymentStatus.toUpperCase()) {
      case 'PAID':
        return { color: 'bg-green-100 text-green-700', label: 'Payé' }
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' }
      case 'FAILED':
        return { color: 'bg-red-100 text-red-700', label: 'Échec' }
      case 'PREPAID':
        return { color: 'bg-blue-100 text-blue-700', label: 'Prépayé' }
      default:
        return { color: 'bg-gray-100 text-gray-700', label: paymentStatus }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Chargement de la facture...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute requiredRole="SUPER_ADMIN">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Facture non trouvée"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const statusConfig = getStatusConfig(invoice.status)
  const paymentConfig = getPaymentStatusConfig(invoice.paymentStatus)
  const StatusIcon = statusConfig.icon

  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN">
        {/* Overlay de rechargement */}
        {reloading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                <p className="font-medium">Actualisation en cours</p>
                <p className="text-sm text-gray-600">Rechargement des données de la facture...</p>
                </div>
            </div>
            </div>
        )}
      <div className="min-h-screen bg-gray-50">
        {/* Header moderne avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="text-white hover:bg-white/10 border-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Facture {invoice.invoiceNumber.split('-').pop()}</h1>
                    {reloading && (
                        <div className="flex items-center space-x-2 text-blue-100">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Actualisation...</span>
                        </div>
                    )}
                </div>
                  <p className="text-blue-100">{invoice.tenantName} • {formatDateShort(invoice.issueDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                    variant="outline" 
                    onClick={handleEditInvoice}
                    disabled={reloading}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                    <Edit className="h-4 w-4 mr-2" />
                    {reloading ? "Actualisation..." : "Modifier"}
                </Button>
                
                {invoice.remainingAmount > 0 && (
                    <Button 
                        onClick={handleAddReceipt}
                        disabled={reloading}
                        className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {reloading ? "Actualisation..." : "Ajouter un reçu"}
                    </Button>
                )}
                
                {invoice.pdfFileUrl && (
                  <Button 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                )}
              </div>
            </div>

            {/* Badges de statut modernes */}
            <div className="flex items-center space-x-3 mt-6">
              <Badge className={`${statusConfig.color} px-4 py-2 text-sm font-medium`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusConfig.label}
              </Badge>
              
              <Badge className={`${paymentConfig.color} px-3 py-1`}>
                {paymentConfig.label}
              </Badge>
              
              <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                {invoice.invoiceType === 'STANDARD' ? 'Standard' : 'Prépayée'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Alertes de rechargement et d'erreur */}
                {reloading && (
                <div className="max-w-7xl mx-auto px-6">
                    <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertDescription className="text-blue-700">
                        <strong>Actualisation en cours...</strong> Rechargement des données de la facture après modification.
                    </AlertDescription>
                    </Alert>
                </div>
                )}

                {error && (
                <div className="max-w-7xl mx-auto px-6">
                    <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Erreur de rechargement:</strong> {error}
                    </AlertDescription>
                    </Alert>
                </div>
                )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Résumé en cards modernes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm">Total TTC</p>
                        <p className="text-2xl font-bold">{formatPrice(invoice.totalAmount, invoice.currency)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-emerald-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Montant payé</p>
                        <p className="text-2xl font-bold">{formatPrice(invoice.paidAmount, invoice.currency)}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm">Restant</p>
                        <p className="text-2xl font-bold">{formatPrice(invoice.remainingAmount, invoice.currency)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Détails de la facture */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="h-6 w-6 mr-3 text-blue-600" />
                    Détails de la Facture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Numéro</p>
                        <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded-lg">{invoice.invoiceNumber}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Plan</p>
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <p className="font-semibold text-blue-900">{invoice.planName}</p>
                          <p className="text-sm text-blue-600">{invoice.billingType}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Période</p>
                        <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{formatDateShort(invoice.billingPeriodStart)}</p>
                            <p className="text-sm text-gray-600">au {formatDateShort(invoice.billingPeriodEnd)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Émission</p>
                        <p className="text-lg">{formatDateModern(invoice.issueDate)}</p>
                      </div>
                      
                      {invoice.dueDate && (
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Échéance</p>
                          <p className="text-lg text-amber-600 font-medium">{formatDateModern(invoice.dueDate)}</p>
                        </div>
                      )}
                      
                      {invoice.paidDate && (
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Paiement</p>
                          <p className="text-lg text-green-600 font-medium">{formatDateModern(invoice.paidDate)}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Créée par</p>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <p className="font-medium">{invoice.generatedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center text-xl">
                    <Building2 className="h-6 w-6 mr-3 text-blue-600" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Organisation</p>
                        <p className="text-2xl font-bold text-gray-900">{invoice.tenantName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</p>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{invoice.billingEmail}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-green-500" />
                            <span className="font-medium">{invoice.billingName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Adresse</p>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{invoice.billingAddress.address}</p>
                              <p className="text-gray-600">{invoice.billingAddress.city}, {invoice.billingAddress.country}</p>
                              {invoice.billingAddress.postalCode && (
                                <p className="text-gray-600">{invoice.billingAddress.postalCode}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Phone className="h-4 w-4 text-purple-500" />
                            <span className="font-mono">{invoice.billingAddress.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Numéros légaux modernes */}
                  {invoice.billingAddress && Object.keys(invoice.billingAddress).some(key => 
                    !['country', 'address', 'city', 'phone', 'postalCode', 'region'].includes(key) && 
                    invoice.billingAddress[key as keyof typeof invoice.billingAddress]
                    ) && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Numéros Légaux</p>
                        <div className="grid grid-cols-2 gap-4">
                        {Object.entries(invoice.billingAddress)
                            .filter(([key, value]) => 
                            !['country', 'address', 'city', 'phone', 'postalCode', 'region'].includes(key) && 
                            value
                            )
                            .map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-blue-500">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{key}</p>
                                <p className="font-mono text-lg font-semibold text-gray-900">{value}</p>
                            </div>
                            ))
                        }
                        </div>
                    </div>
                    )}
                </CardContent>
              </Card>

              {/* Pièces jointes */}
              {invoice.attachments && invoice.attachments.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center text-xl">
                      <Receipt className="h-6 w-6 mr-3 text-blue-600" />
                      Pièces Jointes ({invoice.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {invoice.attachments.map((attachment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{attachment.fileName}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{(parseInt(attachment.size) / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{attachment.contentType}</span>
                                <span>•</span>
                                <span>{formatDateShort(parseInt(attachment.uploadDate))}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="lg" className="ml-4">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audit Trail */}
              {invoice.auditTrail && invoice.auditTrail.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center text-xl">
                      <Clock className="h-6 w-6 mr-3 text-blue-600" />
                      Historique des Modifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {invoice.auditTrail.map((trail, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-sm">{trail.status}</Badge>
                            <div>
                              <p className="font-medium">{trail.paymentMethod}</p>
                              <p className="text-sm text-gray-600">
                                Payé: {formatPrice(trail.paidAmount, invoice.currency)} • 
                                Restant: {formatPrice(trail.remainingAmount, invoice.currency)}
                              </p>
                              {trail.paymentReference && (
                                <p className="text-xs text-gray-500 font-mono">Ref: {trail.paymentReference}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Résumé financier détaillé */}
              <Card className="border-0 shadow-lg top-6">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <DollarSign className="h-6 w-6 mr-3" />
                    Résumé Financier
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Sous-total HT</span>
                      <span className="font-semibold text-lg">{formatPrice(invoice.subtotalAmount, invoice.currency)}</span>
                    </div>
                    
                    {invoice.discountAmount && invoice.discountAmount > 0 && (
                      <div className="flex justify-between items-center py-2 text-green-600">
                        <span>Remise</span>
                        <span className="font-semibold">-{formatPrice(invoice.discountAmount, invoice.currency)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">TVA ({(invoice.taxRate * 100).toFixed(1)}%)</span>
                      <span className="font-semibold text-lg">{formatPrice(invoice.taxAmount, invoice.currency)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                      <span className="font-bold text-xl">Total TTC</span>
                      <span className="font-bold text-2xl text-blue-600">{formatPrice(invoice.totalAmount, invoice.currency)}</span>
                    </div>
                    
                    {invoice.paidAmount > 0 && (
                      <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded-lg">
                        <span className="text-green-700 font-medium">Montant payé</span>
                        <span className="font-bold text-green-600">{formatPrice(invoice.paidAmount, invoice.currency)}</span>
                      </div>
                    )}
                    
                    {invoice.remainingAmount > 0 && (
                      <div className="flex justify-between items-center py-2 bg-red-50 px-4 rounded-lg">
                        <span className="text-red-700 font-medium">Montant restant</span>
                        <span className="font-bold text-red-600">{formatPrice(invoice.remainingAmount, invoice.currency)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations de paiement */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {invoice.paymentMethod && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Méthode</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{invoice.paymentMethod}</p>
                      </div>
                    </div>
                  )}
                  
                  {invoice.paymentReference && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Référence</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-mono text-sm">{invoice.paymentReference}</p>
                      </div>
                    </div>
                  )}

                  {invoice.gracePeriodStartDate && invoice.gracePeriodEndDate && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <p className="font-semibold text-blue-800">Période de grâce</p>
                      </div>
                      <p className="text-sm text-blue-600">
                        Du {formatDateShort(invoice.gracePeriodStartDate)} au {formatDateShort(invoice.gracePeriodEndDate)}
                      </p>
                      {invoice.manualGracePeriodSetBy && (
                        <p className="text-xs text-blue-500 mt-2">
                          Définie par: {invoice.manualGracePeriodSetBy}
                        </p>
                      )}
                    </div>
                  )}

                  {invoice.autoRenewalEnabled === 1 && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Renouvellement automatique</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes et informations supplémentaires */}
              {(invoice.notes || invoice.discountReason || invoice.isPrepayedInvoiceReason) && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center">
                      <FileCheck className="h-5 w-5 mr-2" />
                      Notes & Informations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {invoice.notes && (
                     <div>
                       <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                         <p className="text-sm">{invoice.notes}</p>
                       </div>
                     </div>
                   )}
                   
                   {invoice.discountReason && (
                     <div>
                       <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Raison de la remise</p>
                       <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                         <p className="text-sm">{invoice.discountReason}</p>
                       </div>
                     </div>
                   )}
                   
                   {invoice.isPrepayedInvoiceReason && (
                     <div>
                       <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Raison du prépaiement</p>
                       <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                         <p className="text-sm">{invoice.isPrepayedInvoiceReason}</p>
                       </div>
                     </div>
                   )}
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </div>
     </div>
     {/* Modal de modification */}
        <ModifyInvoiceModal
        isOpen={showModifyModal}
        onClose={() => setShowModifyModal(false)}
        invoice={invoice}
        onInvoiceModified={handleInvoiceModified}
        />
        {/* Modal pour ajouter un reçu */}
        <AddReceiptModal
        isOpen={showAddReceiptModal}
        onClose={() => setShowAddReceiptModal(false)}
        invoice={invoice}
        onReceiptAdded={handleReceiptAdded}
        />
   </ProtectedRoute>
 )
}