"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { validateToken, validateCsrfToken, logout } from "@/lib/store/auth-slice"
import { useRouter } from "next/navigation"

interface SecurityProviderProps {
  children: React.ReactNode
  validationInterval?: number // in minutes, default 5
}

export function SecurityProvider({ 
  children, 
  validationInterval = 5 
}: SecurityProviderProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, user, csrfToken } = useAppSelector((state) => state.auth)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const failureCountRef = useRef(0)
  const [isValidating, setIsValidating] = useState(false)
  
  const maxFailures = 2 // Allow 2 failures before logout
  const intervalMs = validationInterval * 60 * 1000 // Convert minutes to milliseconds

  const performSecurityValidation = async () => {
    if (authState !== "AUTHENTICATED" || !csrfToken || !user) {
      return
    }

    try {
      setIsValidating(true)
      console.log(`🔒 Performing periodic security validation (every ${validationInterval} min)`)
      
      // Step 1: Validate CSRF Token seulement si on en a un
      if (csrfToken) {
        console.log("🛡️ Validating CSRF token...")
        try {
          const csrfResult = await dispatch(validateCsrfToken()).unwrap()
          
          if (!csrfResult.valid && csrfResult.newCsrfToken) {
            console.log("🔄 CSRF token was renewed during validation")
          }
        } catch (csrfError) {
          console.error("❌ CSRF validation failed:", csrfError)
          // Ne pas arrêter la validation JWT si CSRF échoue, le token pourrait être expiré
        }
      }
      
      // Step 2: Validate JWT Token (via cookie) - plus critique
      console.log("🔑 Validating JWT token...")
      await dispatch(validateToken({ role: user.role })).unwrap()
      
      // Reset failure count on successful validation
      failureCountRef.current = 0
      console.log("✅ Periodic security validation successful")
      
    } catch (error) {
      failureCountRef.current += 1
      console.error(`❌ Periodic security validation failed (${failureCountRef.current}/${maxFailures})`, error)
      
      if (failureCountRef.current >= maxFailures) {
        console.log("🚨 Max validation failures reached, forcing logout")
        await dispatch(logout())
        router.push("/login")
      }
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    // Only start periodic validation if user is authenticated
    if (authState === "AUTHENTICATED" && csrfToken && user) {
      console.log(`🔒 Starting periodic security validation (every ${validationInterval} minutes)`)
      
      // Start the interval
      intervalRef.current = setInterval(performSecurityValidation, intervalMs)
      
      // Cleanup function
      return () => {
        if (intervalRef.current) {
          console.log("🔒 Stopping periodic security validation")
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } else {
      // Stop validation if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      failureCountRef.current = 0
    }
  }, [authState, csrfToken, user, intervalMs, validationInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Add visual indicator when validating (optional)
  if (isValidating) {
    return (
      <div className="relative">
        {children}
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
          <span>Validating session...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}