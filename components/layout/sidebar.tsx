"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Analytical",
    icon: BarChart3,
    href: "/dashboard/analytical",
  },
  {
    title: "Demographic",
    icon: Users,
    href: "/dashboard/demographic",
  },
  {
    title: "IoT",
    icon: Zap,
    href: "/dashboard/iot",
  },
  {
    title: "App",
    icon: Layers,
    href: "/dashboard/app",
  },
  {
    title: "File Manager",
    icon: Database,
    href: "/dashboard/files",
  },
  {
    title: "Blog",
    icon: BookOpen,
    href: "/dashboard/blog",
  },
  {
    title: "UI Elements",
    icon: Layers,
    href: "/dashboard/ui-elements",
  },
  {
    title: "Widgets",
    icon: Settings,
    href: "/dashboard/widgets",
  },
  {
    title: "Authentication",
    icon: Lock,
    href: "/dashboard/auth",
  },
  {
    title: "Pages",
    icon: FileText,
    href: "/dashboard/pages",
  },
  {
    title: "Forms",
    icon: FileText,
    href: "/dashboard/forms",
  },
  {
    title: "Tables",
    icon: Table,
    href: "/dashboard/tables",
  },
  {
    title: "Charts",
    icon: BarChart3,
    href: "/dashboard/charts",
  },
  {
    title: "Maps",
    icon: Map,
    href: "/dashboard/maps",
  },
  {
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
  },
  {
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
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isParentActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
  }

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <Button variant="ghost" className="w-full justify-start text-teal-600 hover:text-teal-700 hover:bg-teal-50">
            <Settings className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.title)
              const isChildActive = isParentActive(item.children)

              return (
                <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        isChildActive && "bg-teal-50 text-teal-700",
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.title}
                      </div>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-6 mt-1">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm font-normal",
                            isActive(child.href) && "bg-teal-50 text-teal-700",
                          )}
                        >
                          {child.title}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal", isActive(item.href) && "bg-teal-50 text-teal-700")}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
