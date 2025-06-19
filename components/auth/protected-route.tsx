"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { validateToken, logout } from "@/lib/store/auth-slice"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "SUPER_ADMIN" | "ADMIN_PRINCIPAL"
  allowBoth?: boolean // Allow both roles
}

export function ProtectedRoute({ 
  children, 
  requiredRole = "SUPER_ADMIN", 
  allowBoth = false 
}: ProtectedRouteProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, user, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const validateAccess = async () => {
      // First check if user is authenticated
      if (authState !== "AUTHENTICATED" || !token) {
        router.push("/login")
        return
      }

      try {
        setIsValidating(true)
        
        // Validate token with required role
        await dispatch(validateToken({ role: requiredRole })).unwrap()
        
        // Additional role-based authorization check
        const userRole = user?.role
        
        if (allowBoth) {
          // Allow both SUPER_ADMIN and ADMIN_PRINCIPAL
          if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_PRINCIPAL") {
            setIsAuthorized(true)
          } else {
            // Unauthorized role
            router.push("/dashboard") // Redirect to basic dashboard
          }
        } else {
          // Check specific role requirement
          if (userRole === requiredRole) {
            setIsAuthorized(true)
          } else if (userRole === "ADMIN_PRINCIPAL" && requiredRole === "SUPER_ADMIN") {
            // ADMIN_PRINCIPAL has access to SUPER_ADMIN features
            setIsAuthorized(true)
          } else {
            // Unauthorized
            router.push("/dashboard")
          }
        }
      } catch (error) {
        // Token validation failed - logout handled by auth slice
        console.error("Token validation failed:", error)
        setIsAuthorized(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateAccess()
  }, [authState, token, requiredRole, allowBoth, user?.role, dispatch, router])

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Show children only if authorized
  if (isAuthorized) {
    return <>{children}</>
  }

  // Return loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
    </div>
  )
}