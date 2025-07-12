// hooks/use-tenant-helpers.ts
import { useState, useCallback, useEffect } from "react"
import { useAppSelector } from "@/lib/hooks"
import { tenantHelpersApi, TenantHelpersSummaryResponse, MyTenantHelperResponse, SuperAdminTenantHelpersResponse, TenantHelperSummary } from "@/lib/api/tenant-helpers"
// Re-export pour utilisation dans les composants
export type { TenantHelperSummary } from "@/lib/api/tenant-helpers"


// AJOUTER après les imports existants
export interface HelperFilters {
  search: string
  status: 'all' | 'active' | 'pending' | 'emergency_access' | 'read_only' | 'suspended' | 'deleted'
  scope: 'all' | 'my_helpers'
}

// Fonction pour filtrer les helpers côté client
const filterHelpers = (helpers: TenantHelperSummary[], filters: HelperFilters): TenantHelperSummary[] => {
  if (!helpers) return []
  
  return helpers.filter(helperItem => {
    const helper = helperItem.helper
    
    // Filtre par recherche (nom, prénom, email)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const fullName = `${helper.firstName} ${helper.lastName}`.toLowerCase()
      const email = helper.email.toLowerCase()
      
      if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
        return false
      }
    }
    
    // Filtre par statut

    // Filtre par statut
    if (filters.status !== 'all') {
    const helperStatus = helper.status?.toUpperCase()
    const filterStatus = filters.status.toUpperCase()
    
    if (helperStatus !== filterStatus) {
        return false
    }
    }
    
    return true
  })
}





export const useTenantHelpers = (tenantId: string) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [helpersSummary, setHelpersSummary] = useState<TenantHelpersSummaryResponse | null>(null)
  const [myHelperDetails, setMyHelperDetails] = useState<MyTenantHelperResponse | null>(null)
  const [superAdminHelpers, setSuperAdminHelpers] = useState<SuperAdminTenantHelpersResponse | null>(null)
  
  
  const { user } = useAppSelector((state) => state.auth)

    // États pour les filtres
    const [filters, setFilters] = useState<HelperFilters>({
    search: '',
    status: 'active',
    scope: 'all'
    })
    const [myHelperOnly, setMyHelperOnly] = useState<TenantHelperSummary[]>([])
  
  const canViewHelperDetails = useCallback((helperId?: string) => {
  if (!user || !helperId) return false
  
  // ADMIN_PRINCIPAL a TOUJOURS accès (sans vérifier helpersSummary)
  if (user.role === "ADMIN_PRINCIPAL") {
    return true
  }
  
  // Pour SUPER_ADMIN, vérifier helpersSummary
  if (!helpersSummary) return false
  
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
  if (!user) return false
  
  // ADMIN_PRINCIPAL a toujours accès à tout
  if (user.role === "ADMIN_PRINCIPAL") {
    return true
  }
  
  // SUPER_ADMIN a accès s'il y a des helpers
  if (user.role === "SUPER_ADMIN") {
    return Boolean(helpersSummary?.data && Object.keys(helpersSummary.data).some(key => key.startsWith('helper_')))
  }
  
  return false
}, [user, helpersSummary])
  
  const helpers = useCallback(() => {
  let baseHelpers: TenantHelperSummary[] = []
  
 // D'abord, récupérer TOUS les helpers selon le rôle
if (user?.role === "ADMIN_PRINCIPAL" && superAdminHelpers?.data) {
  // Pour ADMIN_PRINCIPAL, extraire depuis superAdminHelpers
  const data = superAdminHelpers.data as any
  
  // Vérifier s'il y a des helpers dans la structure
  if (data.helpers && Array.isArray(data.helpers)) {
    // Si c'est un array direct
    baseHelpers = data.helpers.map((helper: any) => ({
      helper: {
        id: helper.id,
        firstName: helper.firstName,
        lastName: helper.lastName,
        role: helper.role,
        userId: helper.id,
        email: helper.email,
        status: helper.status
      },
      adminHelper: {
        id: user.id ?? "admin-unknown",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        userId: user.id ?? "admin-unknown",
        email: user.email
      }
    }))
  } else {
    // Si c'est la structure helper_0, helper_1, etc.
    Object.keys(data).forEach(key => {
      if (key.startsWith('helper_') && typeof data[key] === 'object') {
        const helperData = data[key]
        if (helperData.helper) {
          baseHelpers.push({
            helper: {
              id: helperData.helper.id || helperData.helper.userId,
              firstName: helperData.helper.firstName,
              lastName: helperData.helper.lastName,
              role: helperData.helper.role,
              userId: helperData.helper.userId || helperData.helper.id,
              email: helperData.helper.email,
              status: helperData.helper.status
            },
            adminHelper: helperData.adminHelper || {
              id: user.id ?? "admin-unknown",
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              userId: user.id ?? "admin-unknown",
              email: user.email
            }
          })
        }
      }
    })
  }
} else if (user?.role === "SUPER_ADMIN" && helpersSummary?.data) {
  // Pour SUPER_ADMIN, utiliser helpersSummary
  const data = helpersSummary.data
  Object.keys(data).forEach(key => {
    if (key.startsWith('helper_') && typeof data[key] === 'object') {
      baseHelpers.push(data[key] as TenantHelperSummary)
    }
  })
}

// PUIS filtrer par scope si nécessaire
if (filters.scope === 'my_helpers' && user) {
  // Filtrer pour garder seulement les assistants où l'adminHelper.email = user.email
  baseHelpers = baseHelpers.filter(helperItem => 
    helperItem.adminHelper.email === user.email
  )
}
  
  // Appliquer les filtres
  return filterHelpers(baseHelpers, filters)
}, [helpersSummary, superAdminHelpers, myHelperOnly, user, filters])
  
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

  // Fonction pour récupérer les helpers de l'utilisateur connecté
const fetchMyHelpers = useCallback(async () => {
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_PRINCIPAL")) return
  
  try {
    console.log("🔍 Fetching my helpers for tenant:", tenantId)
    const response = await tenantHelpersApi.getMyTenantHelper(tenantId)
    
    if (response.success && response.data.helper) {
      const myHelper: TenantHelperSummary = {
        helper: {
            id: response.data.helper.id,
            firstName: response.data.helper.firstName,
            lastName: response.data.helper.lastName,
            role: response.data.helper.role,
            userId: response.data.helper.id,
            email: response.data.helper.email,
            status: response.data.helper.status
        },
        adminHelper: {
            id: user.id ?? "admin-unknown",
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            userId: user.id ?? "admin-unknown",
            email: user.email,
            status : user.status || "ACTIVE" // Assurez-vous que le statut est défini
        }
        }
      setMyHelperOnly([myHelper])
    } else {
      setMyHelperOnly([])
    }
  } catch (err: any) {
    console.error("❌ Error fetching my helpers:", err)
    setMyHelperOnly([])
  }
}, [tenantId, user])
  
const refresh = useCallback(async () => {
  if (!tenantId || !user) return
  
  try {
    setLoading(true)
    setError(null)

    console.log("🔄 Refreshing tenant helpers data...")
    
    if (user.role === "ADMIN_PRINCIPAL") {
        await Promise.all([
            fetchSuperAdminHelpers(),
            fetchMyHelpers() // ✅ AJOUTER cette ligne
        ])
    } else if (user.role === "SUPER_ADMIN") {
      await Promise.all([
        fetchHelpersSummary(),
        fetchMyHelpers()
      ])
    }
    
    console.log("✅ Tenant helpers data refreshed")
  } catch (err: any) {
    console.error("❌ Error refreshing tenant helpers:", err)
    setError("Erreur lors du rafraîchissement des données")
  } finally {
    setLoading(false)
  }
}, [tenantId, user, fetchHelpersSummary, fetchSuperAdminHelpers, fetchMyHelpers])

  // Fonction pour suspendre un assistant
  const suspendHelper = useCallback(async (helperId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔒 Suspending helper:", helperId)
      const response = await tenantHelpersApi.suspendHelper(tenantId, helperId)
      
      if (response.success) {
        console.log("✅ Helper suspended successfully")
        // Refresh les données après suspension
        await refresh()
        return true
      } else {
        setError("Échec de la suspension de l'assistant")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error suspending helper:", err)
      setError(err.response?.data?.message || err.message || "Erreur lors de la suspension")
      return false
    } finally {
      setLoading(false)
    }
  }, [tenantId, refresh])

  // Fonction pour réactiver un assistant
  const reactivateHelper = useCallback(async (helperId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔓 Reactivating helper:", helperId)
      const response = await tenantHelpersApi.reactivateHelper(tenantId, helperId)
      
      if (response.success) {
        console.log("✅ Helper reactivated successfully")
        // Refresh les données après réactivation
        await refresh()
        return true
      } else {
        setError("Échec de la réactivation de l'assistant")
        return false
      }
    } catch (err: any) {
      console.error("❌ Error reactivating helper:", err)
      setError(err.response?.data?.message || err.message || "Erreur lors de la réactivation")
      return false
    } finally {
      setLoading(false)
    }
  }, [tenantId, refresh])
  
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
    filteredHelpers: helpers(),
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
    decodePassword,
    suspendHelper,
    reactivateHelper,
    filters,
    setFilters,
  }
}