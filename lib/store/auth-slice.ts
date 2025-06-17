import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api-client"

export type AuthState = "NOT_AUTH" | "SEMI_AUTH" | "AUTHENTICATED"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthSliceState {
  authState: AuthState
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthSliceState = {
  authState: "NOT_AUTH",
  user: null,
  token: null,
  loading: false,
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await apiClient.post("/auth/login", { email, password })
    return response.data
  },
)

export const verifyMFA = createAsyncThunk("auth/verifyMFA", async ({ code }: { code: string }) => {
  const response = await apiClient.post("/auth/verify-mfa", { code })
  return response.data
})

export const resendMFACode = createAsyncThunk("auth/resendMFACode", async () => {
  const response = await apiClient.post("/auth/resend-mfa")
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

export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async () => {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error("No token found")
  }

  const response = await apiClient.get("/auth/me")
  return { ...response.data, token }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.authState = "NOT_AUTH"
      state.user = null
      state.token = null
      localStorage.removeItem("token")
    },
    clearError: (state) => {
      state.error = null
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
          state.user = action.payload.user
        } else {
          state.authState = "AUTHENTICATED"
          state.user = action.payload.user
          state.token = action.payload.token
          localStorage.setItem("token", action.payload.token)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Login failed"
      })

      // MFA Verification
      .addCase(verifyMFA.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.loading = false
        state.authState = "AUTHENTICATED"
        state.token = action.payload.token
        localStorage.setItem("token", action.payload.token)
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "MFA verification failed"
      })

      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.authState = "AUTHENTICATED"
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.authState = "NOT_AUTH"
        state.user = null
        state.token = null
        localStorage.removeItem("token")
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

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer