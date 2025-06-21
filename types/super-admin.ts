// types/super-admin.ts

export type FileType = 
  | "CARTE_NATIONAL"
  | "CONTRAT"
  | "PROFILE"  // MAJUSCULES comme dans le backend
  // Autres types seront ajoutés plus tard

export interface Document {
  id: number
  userId: string
  fileName: string
  fileKey: string
  fileType: FileType
  fileSize: number
  mimeType: string
  bucketName?: string
  uploadDate?: string
  isActive?: boolean
  description?: string
}

export interface FileUploadResponse {
  fileName: string
  fileKey: string
  fileSize: number
  mimeType: string
  uploadDate: string
}

export interface ProfilePictureUploadResponse {
  success: boolean
  message: string
  data: FileUploadResponse
}

export interface SuperAdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  companyRole: string
  tenantId: string
  createdAt: number
  modifiedAt: number
  lastLoginAt: number | null
  failedLoginAttempts: number
  department: string
  phoneNumber: string
  address: string
  createdBy: string
  documents: Document[]
  documentCount: number
  totalFileSize: number
  emailVerified: boolean
  mfaRequired: boolean
}

export interface SuperAdminDetailResponse {
  success: boolean
  data: SuperAdminUser
}

export interface SuperAdminResponse {
  data: SuperAdminUser[]
  size: number
  success: boolean
  page: number
  totalElements: number
}

export interface SuperAdminFilters {
  page?: number
  size?: number
  department?: string
  createdBy?: string
  status?: string
  email?: string
}