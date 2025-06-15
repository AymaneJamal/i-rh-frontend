"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

export default function HomePage() {
  const router = useRouter()
  const { authState } = useAppSelector((state) => state.auth)

  useEffect(() => {
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
  }, [authState, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
    </div>
  )
}
