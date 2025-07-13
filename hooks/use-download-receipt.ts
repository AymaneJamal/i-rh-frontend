// hooks/use-download-receipt.ts
import { useState } from "react"
import { downloadReceiptApi } from "@/lib/api/download-receipt"

export const useDownloadReceipt = () => {
  const [downloading, setDownloading] = useState<string | null>(null) // receiptName en cours de téléchargement
  const [error, setError] = useState<string | null>(null)

  const downloadReceipt = async (invoiceId: string, receiptName: string) => {
    try {
      setDownloading(receiptName)
      setError(null)
      
      console.log("🚀 Starting download:", { invoiceId, receiptName })
      
      // Appel API pour télécharger le fichier
      const response = await downloadReceiptApi.downloadReceipt(invoiceId, receiptName)
      
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
      
      console.log("✅ Download completed successfully")
      
    } catch (err: any) {
      console.error("❌ Download failed:", err)
      
      let errorMessage = "Erreur lors du téléchargement"
      
      if (err.response?.status === 404) {
        errorMessage = "Fichier non trouvé"
      } else if (err.response?.status === 403) {
        errorMessage = "Accès non autorisé"
      } else if (err.response?.status >= 500) {
        errorMessage = "Erreur serveur"
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      
      // Réinitialiser l'erreur après 5 secondes
      setTimeout(() => setError(null), 5000)
    } finally {
      setDownloading(null)
    }
  }

  return {
    downloading,
    error,
    downloadReceipt
  }
}