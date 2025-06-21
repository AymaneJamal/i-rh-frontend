"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, Loader2, AlertCircle } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onUpload: (file: File) => Promise<void>
  loading?: boolean
  disabled?: boolean
  maxSizeMB?: number
  acceptedTypes?: string[]
  currentImageUrl?: string
}

export function ImageUpload({
  onImageSelect,
  onUpload,
  loading = false,
  disabled = false,
  maxSizeMB = 2,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  currentImageUrl
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Please select: ${acceptedTypes.join(", ")}`
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      // Resize image if needed
      const resizedFile = await resizeImage(file)
      
      setSelectedFile(resizedFile)
      
      // Create preview
      const url = URL.createObjectURL(resizedFile)
      setPreviewUrl(url)
      
      onImageSelect(resizedFile)
    } catch (err) {
      setError("Error processing image")
    }
  }, [onImageSelect, maxSizeMB, acceptedTypes])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setError(null)
      await onUpload(selectedFile)
      // Clear selection after successful upload
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      setError(err.message || "Upload failed")
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || loading}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        onClick={openFileDialog}
        disabled={disabled || loading}
        className="w-full"
      >
        <Camera className="h-4 w-4 mr-2" />
        Change Profile Picture
      </Button>

      {/* Preview and upload section */}
      {selectedFile && previewUrl && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Preview</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Picture
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Maximum file size: {maxSizeMB}MB</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Images will be automatically resized and optimized</p>
      </div>
    </div>
  )
}