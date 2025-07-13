// hooks/use-download-invoice-pdf.ts
import { useState } from "react"
import { downloadInvoicePdfApi } from "@/lib/api/download-invoice-pdf"

export const useDownloadInvoicePdf = () => {
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const downloadInvoicePdf = async (invoiceId: string, template?: string) => {
    try {
      setDownloadingPdf(true)
      setPdfError(null)
      
      console.log("🚀 Starting PDF download:", { invoiceId, template })
      
      // Appel API pour télécharger le PDF
      const response = await downloadInvoicePdfApi.downloadInvoicePdf(invoiceId, template)
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(response.data)
      
      // Créer un lien temporaire pour déclencher le téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = response.fileName
      
      // Ajouter le lien au DOM et le cliquer
      document.body.appendChild(link)
      link.click()
      
      // Nettoyer
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log("✅ PDF download completed successfully")
      
    } catch (err: any) {
      console.error("❌ PDF download failed:", err)
      
      let errorMessage = "Erreur lors du téléchargement du PDF"
      
      if (err.response?.status === 404) {
        errorMessage = "Facture PDF non trouvée"
      } else if (err.response?.status === 403) {
        errorMessage = "Accès non autorisé au PDF"
      } else if (err.response?.status >= 500) {
        errorMessage = "Erreur serveur lors de la génération du PDF"
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setPdfError(errorMessage)
      
      // Réinitialiser l'erreur après 5 secondes
      setTimeout(() => setPdfError(null), 5000)
    } finally {
      setDownloadingPdf(false)
    }
  }

  return {
    downloadingPdf,
    pdfError,
    downloadInvoicePdf
  }
}