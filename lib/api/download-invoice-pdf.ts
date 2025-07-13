// lib/api/download-invoice-pdf.ts
import { apiClient } from "@/lib/api-client"

export interface DownloadInvoicePdfResponse {
  success: boolean
  data: Blob
  fileName: string
  contentType: string
}

export const downloadInvoicePdfApi = {
  /**
   * Télécharger le PDF d'une facture
   */
  downloadInvoicePdf: async (
    invoiceId: string,
    template: string = "standard-invoice"
  ): Promise<DownloadInvoicePdfResponse> => {
    try {
      console.log("📄 Downloading invoice PDF:", { invoiceId, template })
      
      const queryParams = apiClient.buildQueryString({ template })
      
      const response = await apiClient.get(
        `/api/subscriptions/invoices/${invoiceId}/pdf/preview${queryParams}`,
        {
          responseType: 'blob', // Important pour les fichiers PDF
          includeUserEmail: true
        }
      )
      
      // Extraire le nom du fichier depuis les headers si disponible
      const contentDisposition = response.headers['content-disposition']
      let fileName = `facture-${invoiceId}.pdf`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Extraire le type de contenu (devrait être application/pdf)
      const contentType = response.headers['content-type'] || 'application/pdf'
      
      console.log("✅ Invoice PDF downloaded successfully:", {
        fileName,
        contentType,
        size: response.data.size
      })
      
      return {
        success: true,
        data: response.data,
        fileName,
        contentType
      }
    } catch (error: any) {
      console.error("❌ Failed to download invoice PDF:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      })
      throw error
    }
  }
}