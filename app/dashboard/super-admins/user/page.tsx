"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSuperAdminDetail } from "@/hooks/use-super-admin-detail"
import { useProfilePicture } from "@/hooks/use-profile-picture"
import { ProfilePictureModal } from "@/components/modals/profile-picture-modal"
import { SuperAdminUser, Document, FileType } from "@/types/super-admin"
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  Clock,
  FileText,
  Download,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Camera
} from "lucide-react"

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default"
    case "INACTIVE":
      return "secondary"
    case "PENDING":
      return "outline"
    case "SUSPENDED":
      return "destructive"
    default:
      return "secondary"
  }
}

const getFileTypeBadgeColor = (fileType: FileType) => {
  switch (fileType) {
    case "CARTE_NATIONAL":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "CONTRAT":
      return "bg-green-100 text-green-800 border-green-200"
    case "PROFILE":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getFileTypeIcon = (fileType: FileType) => {
  switch (fileType) {
    case "CARTE_NATIONAL":
      return "🆔"
    case "CONTRAT":
      return "📋"
    case "PROFILE":
      return "🖼️"
    default:
      return "📄"
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return "Never"
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const getUserInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const DocumentsTable = ({ documents }: { documents: Document[] }) => {
  console.log("📋 DocumentsTable - All documents received:", documents)
  console.log("📋 DocumentsTable - Documents types:", documents?.map(doc => ({ fileName: doc.fileName, fileType: doc.fileType })))
  
  // Filter out profile pictures from documents table (PROFILE en majuscules)
  const nonProfileDocuments = documents?.filter(doc => {
    console.log(`📋 Checking document ${doc.fileName}: fileType = "${doc.fileType}", is PROFILE? ${doc.fileType === "PROFILE"}`)
    return doc.fileType !== "PROFILE"
  }) || []
  
  console.log("📋 DocumentsTable - Non-profile documents:", nonProfileDocuments)
  
  if (nonProfileDocuments.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No documents uploaded</p>
        <p className="text-xs text-gray-400 mt-2">
          Total documents: {documents?.length || 0}, 
          Profile documents: {documents?.filter(doc => doc.fileType === "PROFILE").length || 0}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nonProfileDocuments.map((doc) => (
          <TableRow key={doc.id} className="hover:bg-gray-50">
            <TableCell>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getFileTypeIcon(doc.fileType)}</span>
                <Badge
                  variant="outline"
                  className={getFileTypeBadgeColor(doc.fileType)}
                >
                  {doc.fileType.replace("_", " ")}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="font-medium">{doc.fileName}</TableCell>
            <TableCell className="text-gray-600">
              {formatFileSize(doc.fileSize)}
            </TableCell>
            <TableCell className="text-gray-600">
              {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  valueColor = "text-gray-900" 
}: {
  icon: any
  label: string
  value: string | React.ReactNode
  valueColor?: string
}) => (
  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
    <Icon className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-sm ${valueColor} break-words`}>{value}</p>
    </div>
  </div>
)

const SuperAdminDetailContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const { user, loading, error, refresh } = useSuperAdminDetail(email || "")
  const { hasProfilePicture, profilePictureUrl, loading: imageLoading } = useProfilePicture(email || "", user?.documents || [])

  const handleProfileUploadSuccess = () => {
    refresh()
    setIsProfileModalOpen(false)
  }

  console.log("👤 User data:", user)
  console.log("📸 Has profile picture:", hasProfilePicture)
  console.log("🖼️ Profile picture URL:", profilePictureUrl)
  console.log("📋 All documents:", user?.documents)
  console.log("🔍 Profile documents:", user?.documents?.filter(doc => doc.fileType === "PROFILE"))

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Request</h3>
          <p className="text-gray-500 mb-4">Email parameter is required</p>
          <Button onClick={() => router.push("/dashboard/super-admins")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Super Admins
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading super admin details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
          <p className="text-gray-500 mb-4">{error || "User not found"}</p>
          <div className="space-x-2">
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.push("/dashboard/super-admins")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Super Admins
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate actual non-profile documents count (PROFILE en majuscules)
  const nonProfileDocumentsCount = user.documents?.filter(doc => doc.fileType !== "PROFILE").length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/super-admins")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-red-600" />
              Super Admin Profile
            </h1>
            <p className="text-gray-600">View and manage super administrator details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
            <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => router.push(`/dashboard/super-admins/edit?email=${encodeURIComponent(user.email)}`)}
                >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block mb-4">
                  <Avatar className="h-32 w-32 mx-auto">
                    {imageLoading ? (
                      <AvatarFallback className="bg-gray-200">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage 
                          src={profilePictureUrl || ""} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          onError={(e) => console.error("🖼️ Avatar image error:", e)}
                          onLoad={() => console.log("✅ Avatar image loaded successfully")}
                        />
                        <AvatarFallback className="bg-teal-600 text-white text-2xl">
                          {getUserInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full p-2 bg-white shadow-md hover:bg-gray-50"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 mb-3">{user.companyRole}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {user.role}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {nonProfileDocumentsCount}
                    </p>
                    <p className="text-sm text-gray-600">Documents</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(user.totalFileSize || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Size</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                {user.emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MFA Required</span>
                {user.mfaRequired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Login Attempts</span>
                <Badge variant={user.failedLoginAttempts > 0 ? "destructive" : "outline"}>
                  {user.failedLoginAttempts}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={Mail}
                  label="Email Address"
                  value={user.email}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone Number"
                  value={user.phoneNumber}
                />
                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={user.address}
                  valueColor="text-gray-700"
                />
                <InfoItem
                  icon={Building}
                  label="Department"
                  value={user.department}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="User ID"
                  value={user.id}
                  valueColor="text-gray-700"
                />
                <InfoItem
                  icon={Building}
                  label="Tenant ID"
                  value={user.tenantId}
                />
                <InfoItem
                  icon={Calendar}
                  label="Created At"
                  value={formatDate(user.createdAt)}
                />
                <InfoItem
                  icon={Clock}
                  label="Last Login"
                  value={formatDate(user.lastLoginAt)}
                />
                <InfoItem
                  icon={User}
                  label="Created By"
                  value={user.createdBy}
                />
                <InfoItem
                  icon={Calendar}
                  label="Modified At"
                  value={formatDate(user.modifiedAt)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents ({nonProfileDocumentsCount})</span>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsTable documents={user.documents || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {user && (
        <ProfilePictureModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          email={email}
          documents={user.documents || []}
          onUploadSuccess={handleProfileUploadSuccess}
        />
      )}
    </div>
  )
}

export default function SuperAdminDetailPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN_PRINCIPAL">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }>
        <SuperAdminDetailContent />
      </Suspense>
    </ProtectedRoute>
  )
}