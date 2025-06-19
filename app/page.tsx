"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

export default function HomePage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { authState } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Wait a moment for auth provider to finish initialization
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    switch (authState) {
      case "NOT_AUTH":
        router.push("/login")
        break
      case "SEMI_AUTH":
        router.push("/verify")
        break
      case "AUTHENTICATED":
        router.push("/dashboard")
        break
      default:
        router.push("/login")
    }
  }, [authState, router, isInitialized])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}