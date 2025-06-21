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
  csrfToken: string | null
  loading: boolean
  error: string | null
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

// Helper function to get new CSRF token
export const renewCsrfToken = createAsyncThunk(
  "auth/renewCsrfToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/auth/public/csrf-token")
      return response.data.csrfToken
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to get CSRF token")
    }
  }
)

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/public/login", { email, password })
      
      if (response.data.success && response.data.responseType === "SUCCESS") {
        const csrfToken = response.data.data?.additionalData?.csrfToken
        
        return {
          requiresMFA: false,
          user: response.data.data.user,
          csrfToken: csrfToken,
          message: response.data.message
        }
      }
      
      return rejectWithValue(response.data.message || "Login failed")
    } catch (error: any) {
      if (error.response?.status === 401 && 
          error.response?.data?.responseType === "MFA_REQUIRED") {
        return {
          requiresMFA: true,
          email,
          password,
          message: error.response.data.message
        }
      }
      
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

// Verify MFA
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
        const csrfToken = response.data.data?.additionalData?.csrfToken
        
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

// Validate token with proper CSRF handling
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async ({ role }: { role: string }, { dispatch, rejectWithValue }) => {
    try {
      // First attempt - validate with current CSRF token
      const response = await apiClient.post("/api/validate/token", { role })
      
      if (response.data.valid && response.data.status === "AUTHORIZED") {
        return {
          role: response.data.data.role,
          email: response.data.data.email,
          message: response.data.message
        }
      }
      
      return rejectWithValue(response.data.message || "Token validation failed")
    } catch (error: any) {
      // Check if it's a CSRF validation failure
      if (error.response?.status === 401 && 
          error.response?.data?.message === "CSRF validation failed") {
        
        console.log("🔄 CSRF validation failed, attempting to renew CSRF token...")
        
        try {
          // Get new CSRF token
          const newCsrfToken = await dispatch(renewCsrfToken()).unwrap()
          
          // Update the token in localStorage immediately
          localStorage.setItem("csrfToken", newCsrfToken)
          
          // Retry the validation with new CSRF token
          const retryResponse = await apiClient.post("/api/validate/token", { role })
          
          if (retryResponse.data.valid && retryResponse.data.status === "AUTHORIZED") {
            return {
              role: retryResponse.data.data.role,
              email: retryResponse.data.data.email,
              message: retryResponse.data.message,
              newCsrfToken // Include new token in response
            }
          }
          
          return rejectWithValue(retryResponse.data.message || "Token validation failed after CSRF renewal")
        } catch (csrfError: any) {
          // If CSRF renewal fails, it means JWT is invalid - logout
          console.log("🚨 CSRF renewal failed, JWT is invalid - logging out")
          return rejectWithValue("JWT_INVALID")
        }
      }
      
      // For any other error, consider it a JWT failure
      return rejectWithValue("JWT_INVALID")
    }
  }
)

// Check authentication status on app initialization
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus", 
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const csrfToken = localStorage.getItem("csrfToken")
      if (!csrfToken) {
        return rejectWithValue("No CSRF token found")
      }

      // Try SUPER_ADMIN first, then ADMIN_PRINCIPAL
      try {
        const response = await dispatch(validateToken({ role: "SUPER_ADMIN" })).unwrap()
        
        const user = {
          id: null,
          email: response.email,
          password: null,
          firstName: "Admin",
          lastName: "User",
          role: response.role,
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

        return { 
          user, 
          csrfToken: response.newCsrfToken || csrfToken 
        }
      } catch (firstError: any) {
        // If SUPER_ADMIN fails due to role, try ADMIN_PRINCIPAL
        if (firstError === "JWT_INVALID") {
          throw firstError
        }
        
        console.log("🔄 Trying with ADMIN_PRINCIPAL role...")
        
        const response = await dispatch(validateToken({ role: "ADMIN_PRINCIPAL" })).unwrap()
        
        const user = {
          id: null,
          email: response.email,
          password: null,
          firstName: "Admin",
          lastName: "User",
          role: response.role,
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

        return { 
          user, 
          csrfToken: response.newCsrfToken || csrfToken 
        }
      }
    } catch (error: any) {
      return rejectWithValue("Authentication validation failed")
    }
  }
)

// Logout
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiClient.post("/api/auth/logout")
    return { success: true }
  } catch (error: any) {
    // Even if logout fails on server, clear local state
    return { success: true }
  }
})

// Resend MFA code
export const resendMFACode = createAsyncThunk(
  "auth/resendMFACode",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthSliceState }
      const { tempEmail } = state.auth
      
      if (!tempEmail) {
        return rejectWithValue("Email not found. Please login again.")
      }
      
      const response = await apiClient.post("/api/auth/resend-mfa", { email: tempEmail })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to resend MFA code")
    }
  }
)

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
        
        if (action.payload.requiresMFA) {
          state.authState = "SEMI_AUTH"
          state.tempEmail = action.payload.email || null
          state.tempPassword = action.payload.password || null
        } else {
          state.authState = "AUTHENTICATED"
          state.user = action.payload.user || null
          state.csrfToken = action.payload.csrfToken || null
          
          if (action.payload.csrfToken) {
            localStorage.setItem("csrfToken", action.payload.csrfToken)
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
        
        if (action.payload.csrfToken) {
          localStorage.setItem("csrfToken", action.payload.csrfToken)
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
        // Update CSRF token if renewed
        if (action.payload.newCsrfToken) {
          state.csrfToken = action.payload.newCsrfToken
          localStorage.setItem("csrfToken", action.payload.newCsrfToken)
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Token validation failed"
        
        // Only logout if JWT is invalid, not for other errors
        if (action.payload === "JWT_INVALID") {
          console.log("JWT is invalid, logging out user")
          state.authState = "NOT_AUTH"
          state.user = null
          state.csrfToken = null
          state.tempEmail = null
          state.tempPassword = null
          localStorage.removeItem("csrfToken")
        }
      })

      // CSRF Token Renewal
      .addCase(renewCsrfToken.fulfilled, (state, action) => {
        state.csrfToken = action.payload
        localStorage.setItem("csrfToken", action.payload)
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

      // Resend MFA Code
      .addCase(resendMFACode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendMFACode.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resendMFACode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to resend MFA code"
      })
  },
})

export const { clearError, updateCsrfToken } = authSlice.actions
export default authSlice.reducer