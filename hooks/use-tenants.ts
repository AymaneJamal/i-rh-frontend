// hooks/use-tenants.ts
import { useState, useEffect, useCallback } from "react"
import { Tenant, TenantFilters, TenantPagination } from "@/types/tenant"
import { tenantApi } from "@/lib/api/tenant"

export const useTenants = (initialFilters: TenantFilters = {}) => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<TenantPagination>({
    size: 20,
    hasNext: false,
    totalElements: 0,
    page: 0,
    hasPrevious: false,
    totalPages: 1
  })
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 0)
  const [pageSize, setPageSize] = useState(initialFilters.size || 20)
  const [filters, setFilters] = useState<TenantFilters>(initialFilters)

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await tenantApi.getAllTenants({
        ...filters,
        page: currentPage,
        size: pageSize
      })
      
      setTenants(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      console.error("Failed to fetch tenants:", err)
      setError(err.message || "Failed to fetch tenants")
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, pageSize])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const updateFilters = (newFilters: Partial<TenantFilters>) => {
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
    fetchTenants()
  }

  return {
    tenants,
    loading,
    error,
    pagination,
    currentPage,
    pageSize,
    filters,
    updateFilters,
    updatePage,
    updatePageSize,
    refresh
  }
}