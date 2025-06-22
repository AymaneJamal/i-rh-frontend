// lib/api/super-admin.ts
import { apiClient } from "@/lib/api-client"
import { SuperAdminResponse, SuperAdminFilters, SuperAdminDetailResponse, ProfilePictureUploadResponse, DocumentUploadResponse, CreateSuperAdminRequest, CreateSuperAdminResponse , UpdateSuperAdminRequest, UpdateSuperAdminResponse } from "@/types/super-admin"

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
   * Create new super admin user
   */
  createSuperAdmin: async (request: CreateSuperAdminRequest): Promise<CreateSuperAdminResponse> => {
    try {
      console.log("🆕 Creating super admin user:", request.email)
      
      const response = await apiClient.post('/api/super-admin/users', request)
      
      console.log("✅ Super admin created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to create super admin:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
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
  },

  /**
   * Upload document for super admin
   */
  uploadDocument: async (
    email: string, 
    file: File, 
    documentType: string, 
    description?: string
  ): Promise<DocumentUploadResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      if (description) {
        formData.append('description', description)
      }

      console.log("📄 Uploading document for email:", email)
      console.log("📄 Document type:", documentType)
      console.log("📄 File:", file.name, file.size, "bytes")
      console.log("📄 Description:", description || "Document uploadé")

      const response = await apiClient.post(
        `/api/super-admin/users/${encodeURIComponent(email)}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log("✅ Document uploaded successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to upload document:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  },

  /**
   * Download document by ID
   */
  downloadDocument: async (documentId: number): Promise<void> => {
    try {
      console.log("📥 Downloading document with ID:", documentId)

      const response = await apiClient.get(
        `/api/super-admin/documents/${documentId}/download`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      )

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = `document_${documentId}`
      
      if (contentDisposition) {
        // Handle both quoted and unquoted filenames
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
          // Decode if it's URL encoded
          try {
            filename = decodeURIComponent(filename)
          } catch (e) {
            // If decoding fails, use as is
          }
        }
      }

      // Get the correct MIME type from response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { type: contentType })
      const downloadUrl = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log("✅ Document downloaded successfully:", filename)
    } catch (error: any) {
      console.error("❌ Failed to download document:", error)
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  },


    /**
   * Update super admin user
   */
  updateSuperAdmin: async (email: string, request: UpdateSuperAdminRequest): Promise<UpdateSuperAdminResponse> => {
    try {
      console.log("✏️ Updating super admin user:", email)
      console.log("✏️ Update data:", request)
      
      const response = await apiClient.put(`/api/super-admin/users/${encodeURIComponent(email)}`, request)
      
      console.log("✅ Super admin updated successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("❌ Failed to update super admin:", error)
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