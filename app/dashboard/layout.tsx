"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { authState, user, csrfToken } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Simple check without additional validation to avoid loops
    if (authState === "NOT_AUTH") {
      console.log("🚪 Dashboard: User not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    if (authState === "SEMI_AUTH") {
      console.log("🔐 Dashboard: User needs MFA verification, redirecting")
      router.push("/verify")
      return
    }

    if (authState === "AUTHENTICATED" && (!csrfToken || !user)) {
      console.log("🚨 Dashboard: Authenticated but missing CSRF or user data, redirecting to login")
      router.push("/login")
      return
    }

    console.log("✅ Dashboard: User authenticated and verified")
  }, [authState, csrfToken, user, router])

  // Show loading while auth state is being determined or if redirecting
  if (authState !== "AUTHENTICATED" || !csrfToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  )
}