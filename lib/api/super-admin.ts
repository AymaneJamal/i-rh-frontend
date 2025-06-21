// lib/api/super-admin.ts
import { apiClient } from "@/lib/api-client"
import { SuperAdminResponse, SuperAdminFilters, SuperAdminDetailResponse, ProfilePictureUploadResponse } from "@/types/super-admin"

export const superAdminApi = {
  /**
   * Get all super admin users with pagination and filters
   */
  getAllSuperAdmins: async (filters: SuperAdminFilters = {}): Promise<SuperAdminResponse> => {
    const params = new URLSearchParams()
    
    // Add pagination parameters
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())
    
    // Add filter parameters
    if (filters.department) params.append('department', filters.department)
    if (filters.createdBy) params.append('createdBy', filters.createdBy)
    if (filters.status) params.append('status', filters.status)
    if (filters.email) params.append('email', filters.email)

    const response = await apiClient.get(`/api/super-admin/users?${params.toString()}`)
    return response.data
  },

  /**
   * Get super admin user by email
   */
  getSuperAdminByEmail: async (email: string): Promise<SuperAdminDetailResponse> => {
    const response = await apiClient.get(`/api/super-admin/users/email/${encodeURIComponent(email)}`)
    return response.data
  },

  /**
   * Get profile picture as blob with proper authentication
   */
  getProfilePictureBlob: async (email: string): Promise<string> => {
    try {
      // Double encode the email to handle @ character properly
      const encodedEmail = encodeURIComponent(email)
      console.log("📥 Fetching profile picture for email:", email)
      console.log("📥 Encoded email:", encodedEmail)
      console.log("📥 Full URL:", `/api/super-admin/users/${encodedEmail}/profile-picture`)
      
      // Log the headers that will be sent
      const csrfToken = localStorage.getItem("csrfToken")
      console.log("📥 CSRF Token:", csrfToken ? "Present" : "Missing")
      
      const response = await apiClient.get(
        `/api/super-admin/users/${encodedEmail}/profile-picture`,
        {
          responseType: 'blob',
          // Explicitly ensure credentials are sent
          withCredentials: true
        }
      )
      
      // Create blob URL for the image
      const blob = new Blob([response.data], { type: 'image/jpeg' })
      const blobUrl = URL.createObjectURL(blob)
      console.log("✅ Profile picture blob created:", blobUrl)
      return blobUrl
    } catch (error: any) {
      console.error("❌ Failed to fetch profile picture:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        headers: error.config?.headers
      })
      
      // If 404, let's try the direct URL format
      if (error.response?.status === 404) {
        console.log("🔄 Trying direct URL format...")
        try {
          const directResponse = await apiClient.get(
            `/api/super-admin/users/${email}/profile-picture`,
            {
              responseType: 'blob',
              withCredentials: true
            }
          )
          const blob = new Blob([directResponse.data], { type: 'image/jpeg' })
          const blobUrl = URL.createObjectURL(blob)
          console.log("✅ Profile picture loaded with direct URL:", blobUrl)
          return blobUrl
        } catch (directError) {
          console.error("❌ Direct URL also failed:", directError)
        }
      }
      
      throw error
    }
  },

  /**
   * Get profile picture URL for super admin (for direct use in img tags)
   * Note: This might need authentication headers so use getProfilePictureBlob instead
   */
  getProfilePictureUrl: (email: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010"}/api/super-admin/users/${encodeURIComponent(email)}/profile-picture`
  },

  /**
   * Upload profile picture for super admin
   */
  uploadProfilePicture: async (email: string, file: File): Promise<ProfilePictureUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(
      `/api/super-admin/users/${encodeURIComponent(email)}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }
}