// hooks/use-super-admins.ts
import { useState, useEffect, useCallback } from "react"
import { SuperAdminUser, SuperAdminFilters } from "@/types/super-admin"
import { superAdminApi } from "@/lib/api/super-admin"

export const useSuperAdmins = (initialFilters: SuperAdminFilters = {}) => {
  const [users, setUsers] = useState<SuperAdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 0)
  const [pageSize, setPageSize] = useState(initialFilters.size || 10)
  const [filters, setFilters] = useState<SuperAdminFilters>(initialFilters)

  const fetchSuperAdmins = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await superAdminApi.getAllSuperAdmins({
        ...filters,
        page: currentPage,
        size: pageSize
      })
      
      setUsers(response.data)
      setTotalElements(response.totalElements)
    } catch (err: any) {
      // Error will be handled by the security provider if it's a 401
      console.error("Failed to fetch super admins:", err)
      setError(err.message || "Failed to fetch super admins")
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, pageSize])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSuperAdmins()
  }, [fetchSuperAdmins])

  const updateFilters = (newFilters: Partial<SuperAdminFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(0) // Reset to first page when filters change
  }

  const updatePage = (page: number) => {
    setCurrentPage(page)
  }

  const updatePageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(0) // Reset to first page when page size changes
  }

  const refresh = () => {
    fetchSuperAdmins()
  }

  return {
    users,
    loading,
    error,
    totalElements,
    currentPage,
    pageSize,
    filters,
    updateFilters,
    updatePage,
    updatePageSize,
    refresh
  }
}