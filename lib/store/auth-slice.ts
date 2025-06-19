import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api-client"

export type AuthState = "NOT_AUTH" | "SEMI_AUTH" | "AUTHENTICATED"

interface User {
  id: string | null
  email: string
  password: string | null
  firstName: string
  lastName: string
  role: string
  tenantId: string | null
  status: string
  createdAt: string | null
  isEmailVerified: number
  companyRole: string | null
  statusModifiedAt: string | null
  modifiedAt: string | null
  isMfaRequired: number
  secretCodeMFA: string | null
  lastLoginAt: number | null
  failedLoginAttempts: number | null
}

interface AuthSliceState {
  authState: AuthState
  user: User | null
  csrfToken: string | null // Remplace token JWT
  loading: boolean
  error: string | null
  // Temporary storage for MFA flow
  tempEmail: string | null
  tempPassword: string | null
}

const initialState: AuthSliceState = {
  authState: "NOT_AUTH",
  user: null,
  csrfToken: null,
  loading: false,
  error: null,
  tempEmail: null,
  tempPassword: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/login", { email, password })
      
      // Handle successful login without MFA
      if (response.data.success && response.data.responseType === "SUCCESS") {
        // Extraire le CSRF token du bon chemin
        const csrfToken = response.data.data?.additionalData?.csrfToken
        
        console.log("🔒 Login successful, CSRF token received:", csrfToken)
        
        return {
          requiresMFA: false,
          user: response.data.data.user,
          csrfToken: csrfToken,
          message: response.data.message
        }
      }
      
      // This shouldn't happen based on your API, but just in case
      return rejectWithValue(response.data.message || "Login failed")
    } catch (error: any) {
      // Check if it's MFA required (401 with specific response)
      if (error.response?.status === 401 && 
          error.response?.data?.responseType === "MFA_REQUIRED") {
        return {
          requiresMFA: true,
          email,
          password,
          message: error.response.data.message
        }
      }
      
      // Handle other errors
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

export const verifyMFA = createAsyncThunk(
  "auth/verifyMFA", 
  async ({ code }: { code: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthSliceState }
      const { tempEmail, tempPassword } = state.auth
      
      if (!tempEmail || !tempPassword) {
        return rejectWithValue("Email and password not found. Please login again.")
      }
      
      const response = await apiClient.post("/api/auth/public/login/mfa", {
        email: tempEmail,
        password: tempPassword,
        mfaCode: code
      })
      
      if (response.data.success && response.data.responseType === "SUCCESS") {
        // Extraire le CSRF token du bon chemin
        const csrfToken = response.data.data?.additionalData?.csrfToken
        
        console.log("🔒 MFA verification successful, CSRF token received:", csrfToken)
        
        return {
          user: response.data.data.user,
          csrfToken: csrfToken,
          message: response.data.message
        }
      }
      
      return rejectWithValue(response.data.message || "MFA verification failed")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "MFA verification failed")
    }
  }
)

export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async ({ role }: { role: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/validate/token", {
        role: role
      })
      
      if (response.data.valid && response.data.status === "AUTHORIZED") {
        return {
          role: response.data.data.role,
          email: response.data.data.email,
          message: response.data.message
        }
      }
      
      return rejectWithValue(response.data.message || "Token validation failed")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Token validation failed")
    }
  }
)

export const validateCsrfToken = createAsyncThunk(
  "auth/validateCsrfToken",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthSliceState }
      const { csrfToken } = state.auth
      
      if (!csrfToken) {
        return rejectWithValue("No CSRF token found")
      }
      
      // Endpoint de validation CSRF - cet endpoint nécessite le CSRF token en paramètre
      const response = await apiClient.post("/api/validate/csrf-validate", null, {
        params: { csrfToken },
        // Pour cet endpoint spécifique, on n'ajoute pas le header CSRF car c'est ce qu'on valide
        headers: {
          "X-CSRF-Token": undefined
        }
      })
      
      if (response.data.valid) {
        return { valid: true }
      } else {
        // CSRF token invalide, backend a généré un nouveau
        if (response.data.newCsrfToken) {
          console.log("🔄 CSRF token renewed")
          return { 
            valid: false, 
            newCsrfToken: response.data.newCsrfToken 
          }
        }
        return rejectWithValue("CSRF validation failed")
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "CSRF validation failed")
    }
  }
)

export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
  try {
    // Vérifier s'il y a un CSRF token
    const csrfToken = localStorage.getItem("csrfToken")
    if (!csrfToken) {
      return rejectWithValue("No CSRF token found")
    }

    // Le JWT sera automatiquement envoyé via cookie HTTP-Only
    // On essaie d'abord avec SUPER_ADMIN, puis ADMIN_PRINCIPAL si ça échoue
    try {
      const response = await apiClient.post("/api/validate/token", {
        role: "SUPER_ADMIN"
      })

      if (response.data.valid && response.data.status === "AUTHORIZED") {
        const user = {
          id: null,
          email: response.data.data.email,
          password: null,
          firstName: "Admin",
          lastName: "User",   
          role: response.data.data.role,
          tenantId: null,
          status: "ACTIVE",
          createdAt: null,
          isEmailVerified: 1,
          companyRole: null,
          statusModifiedAt: null,
          modifiedAt: null,
          isMfaRequired: 0,
          secretCodeMFA: null,
          lastLoginAt: Date.now(),
          failedLoginAttempts: null
        }

        return { user, csrfToken }
      }
    } catch (firstError: any) {
      // Si erreur de rôle, essayer avec ADMIN_PRINCIPAL
      if (firstError.response?.status === 401 && 
          firstError.response?.data?.message?.includes("Access denied")) {
        console.log("🔄 Trying with ADMIN_PRINCIPAL role...")
        
        const response = await apiClient.post("/api/validate/token", {
          role: "ADMIN_PRINCIPAL"
        })

        if (response.data.valid && response.data.status === "AUTHORIZED") {
          const user = {
            id: null,
            email: response.data.data.email,
            password: null,
            firstName: "Admin",
            lastName: "User",
            role: response.data.data.role,
            tenantId: null,
            status: "ACTIVE",
            createdAt: null,
            isEmailVerified: 1,
            companyRole: null,
            statusModifiedAt: null,
            modifiedAt: null,
            isMfaRequired: 0,
            secretCodeMFA: null,
            lastLoginAt: Date.now(),
            failedLoginAttempts: null
          }

          return { user, csrfToken }
        }
      }
      
      throw firstError
    }

    return rejectWithValue("Authentication validation failed")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Authentication failed")
  }
})

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Appeler l'endpoint de logout pour nettoyer le cookie côté serveur
    await apiClient.post("/api/auth/logout")
    return { success: true }
  } catch (error: any) {
    // Même si l'appel échoue, on nettoie quand même côté client
    console.log("Logout API call failed, but cleaning client state anyway")
    return { success: true }
  }
})

export const resendMFACode = createAsyncThunk("auth/resendMFACode", async () => {
  const response = await apiClient.post("/api/auth/resend-mfa")
  return response.data
})

// Password Reset - with proper API error handling
export const sendResetCode = createAsyncThunk(
  "auth/sendResetCode", 
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/password-reset", { email })
      return response.data
    } catch (error: any) {
      // Handle your Spring Boot API error format
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to send reset code"
      return rejectWithValue(errorMessage)
    }
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, resetCode, newPassword }: { email: string; resetCode: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/password-reset/confirm", { 
        email, 
        resetCode, 
        newPassword 
      })
      return response.data
    } catch (error: any) {
      // Handle your Spring Boot API error format
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to reset password"
      return rejectWithValue(errorMessage)
    }
  }
)

export const resendResetCode = createAsyncThunk(
  "auth/resendResetCode",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/password-reset/resend", { email })
      return response.data
    } catch (error: any) {
      // Handle your Spring Boot API error format
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to resend reset code"
      return rejectWithValue(errorMessage)
    }
  }
)
// END Password Reset

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateCsrfToken: (state, action) => {
      state.csrfToken = action.payload
      localStorage.setItem("csrfToken", action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        console.log("🔒 Login fulfilled payload:", action.payload)
        
        if (action.payload.requiresMFA) {
          state.authState = "SEMI_AUTH"
          state.tempEmail = action.payload.email || null
          state.tempPassword = action.payload.password || null
          console.log("🔒 MFA required, storing temporary credentials")
        } else {
          state.authState = "AUTHENTICATED"
          state.user = action.payload.user || null
          state.csrfToken = action.payload.csrfToken || null
          
          if (action.payload.csrfToken) {
            localStorage.setItem("csrfToken", action.payload.csrfToken)
            console.log("🔒 CSRF token stored in localStorage:", action.payload.csrfToken)
          } else {
            console.error("❌ No CSRF token in login response!")
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Login failed"
      })

      // MFA Verification
      .addCase(verifyMFA.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.loading = false
        state.authState = "AUTHENTICATED"
        state.user = action.payload.user || null
        state.csrfToken = action.payload.csrfToken || null
        state.tempEmail = null
        state.tempPassword = null
        
        console.log("🔒 MFA verification fulfilled payload:", action.payload)
        
        if (action.payload.csrfToken) {
          localStorage.setItem("csrfToken", action.payload.csrfToken)
          console.log("🔒 CSRF token stored in localStorage after MFA:", action.payload.csrfToken)
        } else {
          console.error("❌ No CSRF token in MFA response!")
        }
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "MFA verification failed"
      })

      // Token Validation
      .addCase(validateToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false
        // Token is valid, maintain current state
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Token validation failed"
        
        // Always logout when token validation fails
        console.log("Token validation failed, logging out user")
        state.authState = "NOT_AUTH"
        state.user = null
        state.csrfToken = null
        state.tempEmail = null
        state.tempPassword = null
        localStorage.removeItem("csrfToken")
      })

      // CSRF Validation
      .addCase(validateCsrfToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(validateCsrfToken.fulfilled, (state, action) => {
        state.loading = false
        if (!action.payload.valid && action.payload.newCsrfToken) {
          // Mettre à jour le CSRF token
          state.csrfToken = action.payload.newCsrfToken
          localStorage.setItem("csrfToken", action.payload.newCsrfToken)
        }
      })
      .addCase(validateCsrfToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "CSRF validation failed"
        
        // CSRF validation failed completely, logout
        console.log("CSRF validation failed, logging out user")
        state.authState = "NOT_AUTH"
        state.user = null
        state.csrfToken = null
        state.tempEmail = null
        state.tempPassword = null
        localStorage.removeItem("csrfToken")
      })

      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.authState = "AUTHENTICATED"
        state.user = action.payload.user
        state.csrfToken = action.payload.csrfToken
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.authState = "NOT_AUTH"
        state.user = null
        state.csrfToken = null
        localStorage.removeItem("csrfToken")
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.authState = "NOT_AUTH"
        state.user = null
        state.csrfToken = null
        state.tempEmail = null
        state.tempPassword = null
        localStorage.removeItem("csrfToken")
      })

      // Reset Password - Updated with better error handling
      .addCase(sendResetCode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendResetCode.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(sendResetCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to send reset code"
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to reset password"
      })

      // Resend Reset Code
      .addCase(resendResetCode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendResetCode.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resendResetCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to resend reset code"
      })
  },
})

export const { clearError, updateCsrfToken } = authSlice.actions
export default authSlice.reducer