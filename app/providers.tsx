"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SecurityProvider } from "@/components/auth/security-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SecurityProvider validationInterval={5}>
          {children}
        </SecurityProvider>
      </AuthProvider>
    </Provider>
  )
}