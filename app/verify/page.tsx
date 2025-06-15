"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { verifyMFA, resendMFACode } from "@/lib/store/auth-slice"
import { Shield, RefreshCw } from "lucide-react"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (authState !== "SEMI_AUTH") {
      router.push("/login")
    }
  }, [authState, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await dispatch(verifyMFA({ code })).unwrap()
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")

    try {
      await dispatch(resendMFACode()).unwrap()
      setCountdown(60)
    } catch (err: any) {
      setError(err.message || "Failed to resend code.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 text-white p-3 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Identity</CardTitle>
          <CardDescription className="text-center">Enter the verification code sent to {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend code in ${countdown}s`
                ) : (
                  "Resend verification code"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
