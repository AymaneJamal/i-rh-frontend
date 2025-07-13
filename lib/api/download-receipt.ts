// lib/api/download-receipt.ts
import { apiClient } from "@/lib/api-client"

export interface DownloadReceiptResponse {
  success: boolean
  data: Blob
  fileName: string
  contentType: string
}

export const downloadReceiptApi = {
  /**
   * Télécharger un reçu de facture
   */
  downloadReceipt: async (
    invoiceId: string,
    receiptName: string
  ): Promise<DownloadReceiptResponse> => {
    try {
      console.log("📥 Downloading receipt:", { invoiceId, receiptName })
      
      const response = await apiClient.get(
        `/api/subscriptions/invoices/${invoiceId}/${receiptName}/download`,
        {
          responseType: 'blob', // Important pour les fichiers
          includeUserEmail: true
        }
      )
      
      // Extraire le nom du fichier depuis les headers si disponible
      const contentDisposition = response.headers['content-disposition']
      let fileName = receiptName
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Extraire le type de contenu
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      
      console.log("✅ Receipt downloaded successfully:", {
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
      console.error("❌ Failed to download receipt:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      })
      throw error
    }
  }
}