"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Settings, CreditCard } from "lucide-react"

const tenants = [
  {
    id: 1,
    name: "Acme Corporation",
    domain: "acme.example.com",
    plan: "Enterprise",
    users: 150,
    status: "Active",
    created: "2024-01-15",
  },
  {
    id: 2,
    name: "TechStart Inc",
    domain: "techstart.example.com",
    plan: "Professional",
    users: 45,
    status: "Active",
    created: "2024-02-20",
  },
  {
    id: 3,
    name: "Global Solutions",
    domain: "global.example.com",
    plan: "Enterprise",
    users: 200,
    status: "Active",
    created: "2024-01-10",
  },
  {
    id: 4,
    name: "StartupXYZ",
    domain: "startupxyz.example.com",
    plan: "Basic",
    users: 12,
    status: "Trial",
    created: "2024-03-01",
  },
  {
    id: 5,
    name: "MegaCorp Ltd",
    domain: "megacorp.example.com",
    plan: "Enterprise",
    users: 500,
    status: "Suspended",
    created: "2023-12-05",
  },
]

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.plan.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Trial":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case "Suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
      case "Professional":
        return <Badge className="bg-blue-100 text-blue-800">Professional</Badge>
      case "Basic":
        return <Badge variant="outline">Basic</Badge>
      default:
        return <Badge variant="secondary">{plan}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600">Manage all tenants and their configurations</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            A list of all tenants in your system including their plan, user count, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tenant Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.id}</TableCell>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-blue-600">{tenant.domain}</TableCell>
                    <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                    <TableCell>{tenant.users}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{tenant.created}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Billing
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
