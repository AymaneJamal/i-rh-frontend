"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/image-upload"
import { useProfilePicture } from "@/hooks/use-profile-picture"
import { Document } from "@/types/super-admin"

interface ProfilePictureModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  documents: Document[]
  onUploadSuccess: () => void
}

export function ProfilePictureModal({
  isOpen,
  onClose,
  email,
  documents,
  onUploadSuccess
}: ProfilePictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploading, error, uploadProfilePicture, clearError } = useProfilePicture(email, documents)

  const handleImageSelect = (file: File) => {
    setSelectedFile(file)
    clearError()
  }

  const handleUpload = async (file: File) => {
    try {
      await uploadProfilePicture(file)
      onUploadSuccess()
      onClose()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      clearError()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture. The image will be automatically resized and optimized.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onUpload={handleUpload}
            loading={uploading}
            maxSizeMB={2}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}