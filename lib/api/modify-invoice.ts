// lib/api/modify-invoice.ts
import { apiClient } from "@/lib/api-client"

export interface ModifyInvoiceRequest {
  // Identification
  tenantId: string
  invoiceId: string
  
  // Les champs qui peuvent être modifiés dans la facture
  dueDate: number | null
  autoRenewalEnabled: number | null
  isAutoGracePeriod: number | null
  isManualGracePeriod: number | null
  gracePeriodStartDate: number | null
  gracePeriodEndDate: number | null
  
  // Si reçu ajouté (laisser null pour modification simple)
  withRecus: number | null
  recuPaidAmount: number | null
  paymentMethod: string | null
  paymentReference: string | null
}

export interface ModifyInvoiceResponse {
  success: boolean
  data: any
  message: string
  requestId: string
  timestamp: number
}

export const modifyInvoiceApi = {
  /**
   * Modifier une facture
   */
  modifyInvoice: async (
    invoiceId: string,
    request: ModifyInvoiceRequest,
    receiptFile?: File
  ): Promise<ModifyInvoiceResponse> => {
    try {
      console.log("📝 Modifying invoice:", invoiceId, request)
      
      const formData = new FormData()
      
      // Ajouter le JSON request en tant que string
      formData.append('request', JSON.stringify(request))
      
      // Ajouter le fichier séparément si présent
      if (receiptFile) {
        formData.append('receipt', receiptFile)
      }

      const response = await apiClient.put(
        `/api/subscriptions/invoices/${invoiceId}/modify`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          includeUserEmail: true
        }
      )
      
      console.log("✅ Invoice modified successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to modify invoice:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  }
}