"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { superAdminApi } from "@/lib/api/super-admin"
import { FileType } from "@/types/super-admin"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  onUploadSuccess: () => void
}

const DOCUMENT_TYPES: { value: FileType; label: string; description: string }[] = [
  {
    value: "CARTE_NATIONAL",
    label: "Carte Nationale",
    description: "Document d'identité nationale"
  },
  {
    value: "CONTRAT",
    label: "Contrat",
    description: "Contrat de travail ou autre document contractuel"
  },
  // Vous pouvez ajouter d'autres types ici
]

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB (réduit de 10MB)
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export function DocumentUploadModal({
  isOpen,
  onClose,
  userEmail,
  onUploadSuccess
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<FileType | "">("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validate file size (2MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Le fichier est trop volumineux. Taille maximale: 2MB")
      return
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError("Type de fichier non supporté. Formats acceptés: PDF, JPG, PNG, DOC, DOCX")
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !documentType) {
      setError("Veuillez sélectionner un fichier et un type de document")
      return
    }

    setUploading(true)
    setError(null)

    try {
      console.log("📄 Starting document upload...")
      console.log("📄 File:", file.name, file.size, "bytes")
      console.log("📄 Document type:", documentType)
      console.log("📄 User email:", userEmail)

      await superAdminApi.uploadDocument(
        userEmail,
        file,
        documentType,
        description || "Document uploadé"
      )

      console.log("✅ Document upload successful")
      setSuccess(true)
      
      // Reset form after short delay
      setTimeout(() => {
        setFile(null)
        setDocumentType("")
        setDescription("")
        setSuccess(false)
        onUploadSuccess()
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error("❌ Document upload failed:", err)
      
      let errorMessage = "Erreur lors de l'upload du document"
      
      if (err.response?.status === 413) {
        errorMessage = "Le fichier est trop volumineux"
      } else if (err.response?.status === 415) {
        errorMessage = "Type de fichier non supporté"
      } else if (err.response?.status === 401) {
        errorMessage = "Vous n'avez pas l'autorisation d'uploader des documents"
      } else if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFile(null)
      setDocumentType("")
      setDescription("")
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const truncateFileName = (fileName: string, maxLength: number = 40) => {
    if (fileName.length <= maxLength) return fileName
    const extension = fileName.split('.').pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4)
    return `${truncatedName}...${extension}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Uploader un Document</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={uploading}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="break-words">
            Ajoutez un document pour l'utilisateur <span className="font-medium">{userEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Document uploadé avec succès!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="documentType">Type de Document *</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as FileType)}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de document" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="py-1">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="cursor-pointer"
            />
            {file && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" title={file.name}>
                    {truncateFileName(file.name)}
                  </div>
                  <div className="text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Formats acceptés: PDF, JPG, PNG, DOC, DOCX. Taille max: <strong>2MB</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du document..."
              disabled={uploading}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !documentType || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? "Upload..." : "Uploader"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}