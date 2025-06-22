"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAppSelector } from "@/lib/hooks"
import {
  LayoutDashboard,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Settings,
  Database,
  FileText,
  BarChart3,
  Map,
  Layers,
  Zap,
  Lock,
  BookOpen,
  Table,
  Shield,
  UserCog,
} from "lucide-react"

const baseMenuItems = [{}]

const userManagementSection = {
  title: "User Management",
  icon: Users,
  children: [
    {
      title: "All Users",
      href: "/dashboard/users",
    },
    {
      title: "Add User",
      href: "/dashboard/users/add",
    },
    {
      title: "User Roles",
      href: "/dashboard/users/roles",
    },
    {
      title: "Permissions",
      href: "/dashboard/users/permissions",
    },
  ],
}

const tenantManagementSection = {
  title: "Tenant Management",
  icon: Building2,
  children: [
    {
      title: "All Tenants",
      href: "/dashboard/tenants",
    },
    {
      title: "Add Tenant",
      href: "/dashboard/tenants/add",
    },
    {
      title: "Tenant Settings",
      href: "/dashboard/tenants/settings",
    },
    {
      title: "Billing",
      href: "/dashboard/tenants/billing",
    },
  ],
}

// ADMIN_PRINCIPAL exclusive sections
const adminPrincipalSections = [
  {
    title: "Super Admin Management",
    icon: Shield,
    children: [
      {
        title: "All Super Admins",
        href: "/dashboard/super-admins",
      },
      {
        title: "Add Super Admin",
        href: "/dashboard/super-admins/add",
      }
    ],
  },
  {
    title: "System Configuration",
    icon: UserCog,
    children: [
      {
        title: "Global Settings",
        href: "/dashboard/system/settings",
      },
      {
        title: "Security Config",
        href: "/dashboard/system/security",
      },
      {
        title: "System Logs",
        href: "/dashboard/system/logs",
      },
      {
        title: "Backup & Restore",
        href: "/dashboard/system/backup",
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const { user } = useAppSelector((state) => state.auth)

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  // Build menu items based on user role
  const getMenuItems = () => {
    const menuItems = [...baseMenuItems]
    const sections = []

    // All authenticated users get user and tenant management
    sections.push(userManagementSection, tenantManagementSection)

    // ADMIN_PRINCIPAL gets additional sections
    if (user?.role === "ADMIN_PRINCIPAL") {
      sections.push(...adminPrincipalSections)
    }

    return { menuItems, sections }
  }

  const { menuItems, sections } = getMenuItems()

  return (
    <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="p-4 space-y-2">
        {/* Collapsible Sections */}
        {sections.map((section) => (
          <Collapsible
            key={section.title}
            open={openItems.includes(section.title)}
            onOpenChange={() => toggleItem(section.title)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <section.icon className="mr-2 h-4 w-4" />
                  {section.title}
                </div>
                {openItems.includes(section.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 ml-4">
              {section.children.map((child) => (
                <Link key={child.href} href={child.href}>
                  <Button
                    variant={pathname === child.href ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      pathname === child.href && "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    )}
                  >
                    {child.title}
                  </Button>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {/* Role-based indicator */}
        {user?.role === "ADMIN_PRINCIPAL" && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Admin Principal Access</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}