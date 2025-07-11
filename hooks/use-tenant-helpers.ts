// hooks/use-tenant-helpers.ts
import { useState, useCallback, useEffect } from "react"
import { useAppSelector } from "@/lib/hooks"
import { tenantHelpersApi, TenantHelpersSummaryResponse, MyTenantHelperResponse, SuperAdminTenantHelpersResponse, TenantHelperSummary } from "@/lib/api/tenant-helpers"

export const useTenantHelpers = (tenantId: string) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [helpersSummary, setHelpersSummary] = useState<TenantHelpersSummaryResponse | null>(null)
  const [myHelperDetails, setMyHelperDetails] = useState<MyTenantHelperResponse | null>(null)
  const [superAdminHelpers, setSuperAdminHelpers] = useState<SuperAdminTenantHelpersResponse | null>(null)
  
  const { user } = useAppSelector((state) => state.auth)
  
  const canViewHelperDetails = useCallback((helperId?: string) => {
    if (!user || !helpersSummary || !helperId) return false
    
    if (user.role === "ADMIN_PRINCIPAL") {
      return true
    }
    
    if (user.role === "SUPER_ADMIN") {
      const helpers = Object.keys(helpersSummary.data)
        .filter(key => key.startsWith('helper_'))
        .map(key => helpersSummary.data[key] as TenantHelperSummary)
      
      const targetHelper = helpers.find(h => h.helper.id === helperId)
      
      if (targetHelper && targetHelper.adminHelper) {
        const adminHelper = targetHelper.adminHelper as any
        
        if (adminHelper.email === user.email) {
          return true
        }
        
        if (adminHelper.isHelperOf && Array.isArray(adminHelper.isHelperOf)) {
          return adminHelper.isHelperOf.some((helperRef: any) => 
            helperRef.tenantId === tenantId && 
            helperRef.tenantHelperId === helperId
          )
        }
      }
    }
    
    return false
  }, [user, helpersSummary, tenantId])

  const hasAnyAccess = useCallback(() => {
    return canViewHelperDetails()
  }, [canViewHelperDetails])
  
  const helpers = useCallback(() => {
    if (!helpersSummary?.data) return []
    
    const helpersArray: TenantHelperSummary[] = []
    const data = helpersSummary.data
    
    Object.keys(data).forEach(key => {
      if (key.startsWith('helper_') && typeof data[key] === 'object') {
        helpersArray.push(data[key] as TenantHelperSummary)
      }
    })
    
    return helpersArray
  }, [helpersSummary])
  
  const fetchHelpersSummary = useCallback(async () => {
    if (!tenantId) {
      setError("ID du locataire requis")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantHelpersApi.getHelpersSummary(tenantId)
      
      if (response.success) {
        setHelpersSummary(response)
      } else {
        setError("Échec de la récupération du résumé des assistants")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Échec de la récupération des assistants")
    } finally {
      setLoading(false)
    }
  }, [tenantId])
  
const fetchSpecificHelperDetails = useCallback(async (helperUserId: string) => {
  if (!tenantId || !canViewHelperDetails(helperUserId)) {
    setError("Accès non autorisé pour ce helper")
    return null
  }
  
  try {
    console.log("🔍 Récupération des détails du helper:", helperUserId)
    
    if (user?.role === "ADMIN_PRINCIPAL") {
      const response = await tenantHelpersApi.getSuperAdminTenantHelpers(tenantId)
      
      if (response.success && response.data) {
        // Extraire les helpers de la structure helper_0, helper_1, etc.
        const helpers = Object.keys(response.data)
          .filter(key => key.startsWith('helper_'))
          .map(key => (response.data as any)[key].helper)
        
        console.log("👥 Helpers extraits:", helpers)
        
        const specificHelper = helpers.find(h => h.id === helperUserId)
        console.log("🎯 Helper trouvé:", specificHelper)
        
        if (specificHelper) {
          return {
            data: {
              helper: specificHelper,
              tenantName: response.data.tenantName || "N/A"
            }
          }
        }
      }
    }
    
    return null
  } catch (err: any) {
    console.error("💥 Erreur:", err)
    setError(err.response?.data?.message || err.message || "Échec de la récupération des détails")
    return null
  }
}, [tenantId, canViewHelperDetails, user?.role, helpersSummary])
  
  const fetchSuperAdminHelpers = useCallback(async () => {
    if (!tenantId || user?.role !== "ADMIN_PRINCIPAL") return
    
    try {
      const response = await tenantHelpersApi.getSuperAdminTenantHelpers(tenantId)
      if (response.success) {
        setSuperAdminHelpers(response)
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la récupération des assistants du super admin:", err)
    }
  }, [tenantId, user?.role])
  
  const refresh = useCallback(async () => {
    await fetchHelpersSummary()
    
    if (hasAnyAccess()) {
      if (user?.role === "ADMIN_PRINCIPAL") {
        await fetchSuperAdminHelpers()
      }
    }
  }, [fetchHelpersSummary, fetchSuperAdminHelpers, hasAnyAccess, user?.role])
  
  useEffect(() => {
    refresh()
  }, [tenantId, user?.role])
  
  const decodePassword = useCallback((hashedPassword: string): string => {
    if (!hashedPassword) {
      return "Mot de passe non disponible"
    }
    
    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
      return hashedPassword
    }
    
    return hashedPassword
  }, [])
  
  const resetHelperPassword = useCallback(async (helperId: string, newPassword: string): Promise<boolean> => {
    if (!tenantId || !user) {
      setError("Informations utilisateur manquantes")
      return false
    }
    
    try {
      let response
      if (user.role === "SUPER_ADMIN") {
        response = await tenantHelpersApi.resetHelperPasswordBySuperAdmin(
          tenantId, 
          helperId, 
          newPassword, 
          user.id || user.email || ""
        )
      } else if (user.role === "ADMIN_PRINCIPAL") {
        response = await tenantHelpersApi.resetHelperPasswordByAdminPrincipal(
          tenantId, 
          helperId, 
          newPassword, 
          user.id || user.email || ""
        )
      } else {
        setError("Permissions insuffisantes pour changer le mot de passe")
        return false
      }
      
      if (response.success) {
        return true
      } else {
        setError(response.message || "Échec du changement de mot de passe")
        return false
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Échec du changement de mot de passe")
      return false
    }
  }, [tenantId, user])
  
  return {
    helpersSummary,
    myHelperDetails,
    superAdminHelpers,
    helpers: helpers(),
    loading,
    error,
    canViewHelperDetails,
    hasAnyAccess: hasAnyAccess(),
    tenantName: helpersSummary?.data?.tenantName,
    helpersCount: helpersSummary?.data?.count || 0,
    refresh,
    fetchHelpersSummary,
    fetchSpecificHelperDetails,
    fetchSuperAdminHelpers,
    resetHelperPassword,
    decodePassword
  }
}