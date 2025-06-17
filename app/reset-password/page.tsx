"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch } from "@/lib/hooks"
import { sendResetCode, resetPassword, resendResetCode } from "@/lib/store/auth-slice"
import { ArrowLeft, Mail, Lock, Shield, RefreshCw, CheckCircle, XCircle, Info } from "lucide-react"
import { validatePassword } from "@/lib/password-validation"

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const dispatch = useAppDispatch()
  const router = useRouter()

  // Countdown effect for resend functionality
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await dispatch(sendResetCode({ email })).unwrap()
      setStep("reset")
      setResendCountdown(60) // 60 seconds countdown
    } catch (err: any) {
      setError(err || "Failed to send reset code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPasswordErrors([])

    // Validate password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await dispatch(resetPassword({ email, resetCode: code, newPassword })).unwrap()
      router.push("/login?message=Password reset successful")
    } catch (err: any) {
      const errorMessage = err || "Failed to reset password."
      setError(errorMessage)
      
      // If the code expired, suggest resending
      if (errorMessage.includes("expiré") || errorMessage.includes("expired")) {
        // Clear the code field to encourage getting a new one
        setCode("")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")

    try {
      await dispatch(resendResetCode({ email })).unwrap()
      setResendCountdown(60)
    } catch (err: any) {
      setError(err || "Failed to resend code.")
    } finally {
      setResendLoading(false)
    }
  }

  // Real-time password validation for UI feedback
  const getPasswordPolicyStatus = (password: string) => {
    const checks = [
      { label: "At least 10 characters", valid: password.length >= 10 },
      { label: "At least 1 uppercase letter", valid: /[A-Z]/.test(password) },
      { label: "At least 1 lowercase letter", valid: /[a-z]/.test(password) },
      { label: "At least 1 number", valid: /\d/.test(password) },
      { label: "At least 1 special character", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
    ]
    return checks
  }

  const passwordChecks = getPasswordPolicyStatus(newPassword)

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
                  <AlertDescription>
                    {error}
                    {(error.includes("expiré") || error.includes("expired")) && (
                      <div className="mt-2 text-sm">
                        Please click "Resend code" to get a new verification code.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {passwordErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
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

              {/* Password Policy Display */}
              {newPassword && (
                <div className="space-y-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="text-sm font-medium mb-2">Password Requirements:</div>
                      <div className="space-y-1">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {check.valid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-xs ${check.valid ? 'text-green-700' : 'text-red-600'}`}>
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

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

              <div className="text-center space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resendLoading || resendCountdown > 0}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendLoading ? (
                    "Sending..."
                  ) : resendCountdown > 0 ? (
                    `Resend code in ${resendCountdown}s`
                  ) : (
                    "Resend code"
                  )}
                </Button>

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