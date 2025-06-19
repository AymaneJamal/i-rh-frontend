"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Settings, Eye } from "lucide-react"

export default function SuperAdminsPage() {
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

        {/* Demo Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Super Admin Users</span>
                <Badge variant="secondary">12</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Total super administrators in the system</p>
              <Button variant="outline" className="mt-4 w-full">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Sessions</span>
                <Badge variant="default">8</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Currently active super admin sessions</p>
              <Button variant="outline" className="mt-4 w-full">
                <Settings className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Permissions</span>
                <Badge variant="outline">24</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Total permission levels configured</p>
              <Button variant="outline" className="mt-4 w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}