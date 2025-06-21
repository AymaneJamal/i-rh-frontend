"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useSuperAdmins } from "@/hooks/use-super-admins"
import { SuperAdminUser } from "@/types/super-admin"
import { 
  Shield, 
  Plus, 
  Eye, 
  Edit, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react"

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default" // Green
    case "INACTIVE":
      return "secondary" // Gray
    case "PENDING":
      return "outline" // Yellow
    case "SUSPENDED":
      return "destructive" // Red
    default:
      return "secondary"
  }
}

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return "Never"
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

const SuperAdminTableRow = ({ user }: { user: SuperAdminUser }) => {
  const router = useRouter()

  const handleViewUser = () => {
    router.push(`/dashboard/super-admins/user?email=${encodeURIComponent(user.email)}`)
  }

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <Badge variant={getStatusBadgeVariant(user.status)}>
          {user.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{user.role}</div>
          <div className="text-sm text-gray-500">{user.department}</div>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">
        {formatDate(user.lastLoginAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleViewUser}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const SuperAdminFilters = ({ 
  onFilterChange, 
  onSearch,
  onRefresh,
  loading 
}: {
  onFilterChange: (filters: any) => void
  onSearch: (email: string) => void
  onRefresh: () => void
  loading: boolean
}) => {
  const [searchEmail, setSearchEmail] = useState("")

  const handleSearch = () => {
    onSearch(searchEmail)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select onValueChange={(value) => onFilterChange({ status: value === "all" ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select onValueChange={(value) => onFilterChange({ department: value === "all" ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                <SelectItem value="IT Operations">IT Operations</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Page Size</label>
            <Select onValueChange={(value) => onFilterChange({ size: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Pagination = ({ 
  currentPage, 
  totalElements, 
  pageSize, 
  onPageChange 
}: {
  currentPage: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}) => {
  const totalPages = Math.ceil(totalElements / pageSize)
  
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = Math.max(0, currentPage - 2) + i
          if (pageNum >= totalPages) return null
          
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum + 1}
            </Button>
          )
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default function SuperAdminsPage() {
  const {
    users,
    loading,
    error,
    totalElements,
    currentPage,
    pageSize,
    updateFilters,
    updatePage,
    updatePageSize,
    refresh
  } = useSuperAdmins({ page: 0, size: 10 })

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.size) {
      updatePageSize(newFilters.size)
    } else {
      updateFilters(newFilters)
    }
  }

  const handleSearch = (email: string) => {
    updateFilters({ email: email || undefined })
  }

  return (
    <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-red-600" />
              Super Admin Management
            </h1>
            <p className="text-gray-600">Manage super administrators and their permissions</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Super Admin
          </Button>
        </div>

        {/* Access Level Warning */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">ADMIN_PRINCIPAL Access Required</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              This page is only accessible to users with ADMIN_PRINCIPAL role.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <SuperAdminFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              Super Admin Users ({totalElements})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center p-4 mb-4 text-red-700 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading super admins...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No super admins found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <SuperAdminTableRow key={user.id} user={user} />
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalElements={totalElements}
                    pageSize={pageSize}
                    onPageChange={updatePage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}