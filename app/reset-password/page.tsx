"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch } from "@/lib/hooks"
import { sendResetCode, resetPassword } from "@/lib/store/auth-slice"
import { ArrowLeft, Mail, Lock, Shield } from "lucide-react"

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await dispatch(sendResetCode({ email })).unwrap()
      setStep("reset")
    } catch (err: any) {
      setError(err.message || "Failed to send reset code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setLoading(true)

    try {
      await dispatch(resetPassword({ email, code, newPassword })).unwrap()
      router.push("/login?message=Password reset successful")
    } catch (err: any) {
      setError(err.message || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 text-white p-3 rounded-lg">
              {step === "email" ? <Mail className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {step === "email" ? "Reset Password" : "Set New Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "email" ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to email
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
