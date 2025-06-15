"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { logout } from "@/lib/store/auth-slice"
import { Search, Bell, MessageSquare, Settings, User, LogOut, Calendar, BarChart3 } from "lucide-react"

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Search */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">i-RH</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Right side - Stats and User Menu */}
        <div className="flex items-center space-x-6">
          {/* Stats */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-gray-600">Sales</div>
              <div className="font-semibold">456</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Order</div>
              <div className="font-semibold">1350</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Revenue</div>
              <div className="font-semibold">$2.13B</div>
            </div>
          </div>

          {/* Charts */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xs text-gray-600">Visitors</div>
              <div className="h-8 w-16 bg-gradient-to-r from-blue-200 to-blue-400 rounded"></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Visits</div>
              <div className="h-8 w-16 bg-gradient-to-r from-red-200 to-red-400 rounded"></div>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                5
              </Badge>
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "AT"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">Welcome,</div>
                  <div className="text-sm text-gray-600">{user?.name || "Alizee Thomas"}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
