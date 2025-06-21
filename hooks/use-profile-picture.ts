// hooks/use-profile-picture.ts
import { useState, useCallback, useMemo, useEffect } from "react"
import { superAdminApi } from "@/lib/api/super-admin"
import { Document } from "@/types/super-admin"

export const useProfilePicture = (email: string, documents: Document[] = []) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if user has a profile picture (PROFILE en majuscules)
  const hasProfilePicture = useMemo(() => {
    const profileDoc = documents.find(doc => doc.fileType === "PROFILE")
    console.log("🔍 Checking for profile document in:", documents)
    console.log("🔍 Profile document found:", profileDoc)
    return !!profileDoc
  }, [documents])

  // Load profile picture when user has one
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!hasProfilePicture || !email) {
        console.log("❌ No profile picture or email:", { hasProfilePicture, email })
        setProfilePictureUrl(null)
        return
      }

      try {
        setLoading(true)
        console.log("📥 Loading profile picture for:", email)
        
        const blobUrl = await superAdminApi.getProfilePictureBlob(email)
        setProfilePictureUrl(blobUrl)
        console.log("✅ Profile picture loaded:", blobUrl)
      } catch (err: any) {
        console.error("❌ Failed to load profile picture:", err)
        setProfilePictureUrl(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfilePicture()

    // Cleanup function to revoke blob URL
    return () => {
      if (profilePictureUrl && profilePictureUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profilePictureUrl)
      }
    }
  }, [hasProfilePicture, email, documents]) // ← Ajouter documents comme dépendance

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!email) {
      throw new Error("Email is required")
    }

    try {
      setUploading(true)
      setError(null)

      console.log("📤 Uploading profile picture for:", email)
      const response = await superAdminApi.uploadProfilePicture(email, file)
      console.log("✅ Upload response:", response)
      
      if (!response.success) {
        throw new Error(response.message || "Upload failed")
      }

      // After upload, reload the profile picture
      // The effect will be triggered by the documents change

      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Upload failed"
      console.error("❌ Upload error:", errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [email])

  const clearError = () => {
    setError(null)
  }

  return {
    hasProfilePicture,
    profilePictureUrl,
    loading,
    uploading,
    error,
    uploadProfilePicture,
    clearError
  }
}