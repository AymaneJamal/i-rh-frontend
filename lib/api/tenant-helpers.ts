// lib/api/tenant-helpers.ts
import { apiClient } from "@/lib/api-client"

// Types pour les réponses des assistants
export interface TenantHelper {
    id: string
  firstName: string
  lastName: string
  role: string
  userId: string
  email: string
  status: string
}

export interface AdminHelper {
    id: string
    firstName: string
    lastName: string
    role: string
    userId: string
    email: string
    status: string
}

export interface TenantHelperSummary {
  helper: TenantHelper
  adminHelper: AdminHelper
}

export interface TenantHelpersSummaryResponse {
  timestamp: number
  message: string
  success: boolean
  data: {
    count: number
    tenantName: string
    tenantId: string
    [key: string]: TenantHelperSummary | string | number // pour helper_0, helper_1, etc.
  }
  requestId: string
}

export interface TenantHelperDetail {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
  status: string
  createdAt: number
  isEmailVerified: number
  companyRole: string
  statusModifiedAt: number
  modifiedAt: number
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number
  isHelperOf: string | null
  isHelpingBy: string
}

export interface MyTenantHelperResponse {
  requestId: string
  data: {
    tenantName: string
    helper: TenantHelperDetail
    tenantId: string
  }
  success: boolean
  message: string
  timestamp: number
}

export interface SuperAdminTenantHelpersResponse {
  // Structure selon votre réponse réelle - ajustez selon la vraie structure
  success: boolean
  data: {
    tenantName: string
    helpers: TenantHelperDetail[] // Les helpers sont probablement dans un sous-objet
    // ou d'autres propriétés selon votre API
  }
  message: string
  timestamp: number
}

// Types pour le changement de mot de passe
export interface ChangeHelperPasswordRequest {
  tenantId: string
  helperId: string
  superAdminId: string
  newPassword: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
  timestamp: number
  requestId: string
}

export const tenantHelpersApi = {
  /**
   * Récupère le résumé des assistants pour un locataire
   * Endpoint: GET /api/tenants/{tenantId}/get-helpers-summury
   */
  getHelpersSummary: async (tenantId: string): Promise<TenantHelpersSummaryResponse> => {
    const response = await apiClient.get(
      `/api/tenants/${tenantId}/get-helpers-summury`,
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Récupère les détails de l'assistant du locataire pour l'utilisateur connecté (SUPER_ADMIN)
   * Endpoint: GET /api/tenants/{tenantId}/my-tenant-helper
   */
  getMyTenantHelper: async (tenantId: string): Promise<MyTenantHelperResponse> => {
    const response = await apiClient.get(
      `/api/tenants/${tenantId}/my-tenant-helper`,
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Récupère tous les détails des assistants pour un ADMIN_PRINCIPAL
   * Endpoint: GET /api/super-admin/tenant/{tenantId}/helpers-details
   */
  getSuperAdminTenantHelpers: async (tenantId: string): Promise<SuperAdminTenantHelpersResponse> => {
    const response = await apiClient.get(
      `/api/super-admin/tenant/${tenantId}/helpers-details`,
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Reset password pour un helper par un SUPER_ADMIN
   * Endpoint: PUT /api/tenants/{tenantId}/{helperId}/password-reset
   */
  resetHelperPasswordBySuperAdmin: async (
    tenantId: string, 
    helperId: string, 
    newPassword: string,
    superAdminId: string
  ): Promise<PasswordResetResponse> => {
    const request: ChangeHelperPasswordRequest = {
      tenantId,
      helperId,
      superAdminId,
      newPassword
    }
    
    const response = await apiClient.put(
      `/api/tenants/${tenantId}/${helperId}/password-reset`,
      request,
      { includeUserEmail: true }
    )
    return response.data
  },

  /**
   * Reset password pour un helper par un ADMIN_PRINCIPAL
   * Endpoint: PUT /api/super-admin/{tenantId}/{helperId}/password-reset
   */
  resetHelperPasswordByAdminPrincipal: async (
    tenantId: string, 
    helperId: string, 
    newPassword: string,
    superAdminId: string
  ): Promise<PasswordResetResponse> => {
    const request: ChangeHelperPasswordRequest = {
      tenantId,
      helperId,
      superAdminId,
      newPassword
    }
    
    const response = await apiClient.put(
      `/api/super-admin/${tenantId}/${helperId}/password-reset`,
      request,
      { includeUserEmail: true }
    )
    return response.data
  },

 /**
   * Créer un nouvel assistant
   * Endpoint: POST /api/tenants/{tenantId}/create-heper
   */
    createHelper: async (request: {
    tenantId: string
    createdForId: string
    isCreatedForActualUser: number
    email: string
    password: string
    firstName: string
    lastName: string
    }): Promise<boolean> => {
    try {
      const response = await apiClient.post(
        `/api/tenants/${request.tenantId}/create-heper`,
                {
        tenantId: request.tenantId,
        createdForId: request.createdForId,
        isCreatedForActualUser: request.isCreatedForActualUser,
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName
        },
        { includeUserEmail: true }
      )
      return response.data.success
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'assistant:", error)
      throw error
    }
  }

}