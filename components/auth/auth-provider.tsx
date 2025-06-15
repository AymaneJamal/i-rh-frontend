"use client"

import type React from "react"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { checkAuthStatus } from "@/lib/store/auth-slice"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus())
  }, [dispatch])

  return <>{children}</>
}
