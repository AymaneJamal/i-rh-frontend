// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { API_HEADERS } from '@/lib/constants'

// ===============================================================================
// API CLIENT CONFIGURATION
// ===============================================================================

interface ApiClientConfig extends AxiosRequestConfig {
  userEmail?: string
  autoRetry?: boolean
  maxRetries?: number
}

class ApiClient {
  private client: AxiosInstance
  private currentUserEmail: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010",
      timeout: 30000, // 30 seconds
      withCredentials: true,
    })

    // Setup interceptors
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
  }

  // ===============================================================================
  // USER EMAIL MANAGEMENT
  // ===============================================================================

  setUserEmail(email: string) {
    this.currentUserEmail = email
    console.log("🔧 API Client: User email set to", email)
  }

  getUserEmail(): string | null {
    return this.currentUserEmail
  }

  private getUserEmailFromStorage(): string | null {
    if (typeof window === 'undefined') return null
    
    // Try to get from Redux store first, then localStorage
    try {
      const authState = localStorage.getItem('auth')
      if (authState) {
        const parsed = JSON.parse(authState)
        return parsed?.user?.email || null
      }
    } catch (error) {
      console.warn("Could not parse auth state from localStorage")
    }
    
    return localStorage.getItem('userEmail')
  }

  // ===============================================================================
  // REQUEST INTERCEPTOR
  // ===============================================================================

  private setupRequestInterceptor() {
    this.client.interceptors.request.use(
      (config) => {
        // Get CSRF token
        const csrfToken = localStorage.getItem("csrfToken")
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken
        }

        // Auto-add user email header if not provided
        const userEmail = config.headers[API_HEADERS.USER_EMAIL] || 
                         this.currentUserEmail || 
                         this.getUserEmailFromStorage()

        if (userEmail) {
          config.headers[API_HEADERS.USER_EMAIL] = userEmail
        }

        // Handle FormData content type
        if (config.data instanceof FormData) {
          // Let browser set Content-Type automatically for FormData
          delete config.headers['Content-Type']
        } else if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = API_HEADERS.CONTENT_TYPE_JSON
        }

        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          hasData: !!config.data,
          isFormData: config.data instanceof FormData
        })

        return config
      },
      (error) => {
        console.error("❌ Request interceptor error:", error)
        return Promise.reject(error)
      }
    )
  }

  // ===============================================================================
  // RESPONSE INTERCEPTOR
  // ===============================================================================

  private setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Update CSRF token if provided
        const newCsrfToken = response.data?.newCsrfToken || response.data?.csrfToken
        if (newCsrfToken) {
          localStorage.setItem("csrfToken", newCsrfToken)
        }

        console.log(`📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
        return response
      },
      (error: AxiosError) => {
        console.error(`❌ ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })

        // Handle specific error cases
        if (error.response?.status === 401) {
          console.warn("🔒 Unauthorized - clearing auth state")
          localStorage.removeItem("csrfToken")
          // Could dispatch logout action here if needed
        }

        return Promise.reject(error)
      }
    )
  }

  // ===============================================================================
  // HTTP METHODS WITH ENHANCED FEATURES
  // ===============================================================================

  async get<T = any>(url: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.get<T>(url, config), config)
  }

  async post<T = any>(url: string, data?: any, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config), config)
  }

  async put<T = any>(url: string, data?: any, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config), config)
  }

  async delete<T = any>(url: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config), config)
  }

  async patch<T = any>(url: string, data?: any, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.patch<T>(url, data, config), config)
  }

  // ===============================================================================
  // FORM DATA HELPERS
  // ===============================================================================

  async postFormData<T = any>(
    url: string, 
    formData: FormData, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    const formConfig: ApiClientConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Content-Type will be set automatically by browser for FormData
      }
    }

    return this.post<T>(url, formData, formConfig)
  }

  async putFormData<T = any>(
    url: string, 
    formData: FormData, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    const formConfig: ApiClientConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Content-Type will be set automatically by browser for FormData
      }
    }

    return this.put<T>(url, formData, formConfig)
  }

  // ===============================================================================
  // URL-ENCODED DATA HELPERS
  // ===============================================================================

  async postUrlEncoded<T = any>(
    url: string, 
    data: Record<string, any>, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    const urlEncodedData = new URLSearchParams()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlEncodedData.append(key, String(value))
      }
    })

    const urlEncodedConfig: ApiClientConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': API_HEADERS.CONTENT_TYPE_FORM
      }
    }

    return this.post<T>(url, urlEncodedData.toString(), urlEncodedConfig)
  }

  async putUrlEncoded<T = any>(
    url: string, 
    data: Record<string, any>, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    const urlEncodedData = new URLSearchParams()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlEncodedData.append(key, String(value))
      }
    })

    const urlEncodedConfig: ApiClientConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': API_HEADERS.CONTENT_TYPE_FORM
      }
    }

    return this.put<T>(url, urlEncodedData.toString(), urlEncodedConfig)
  }

  // ===============================================================================
  // RETRY LOGIC
  // ===============================================================================

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    if (!config?.autoRetry) {
      return operation()
    }

    const maxRetries = config.maxRetries || 3
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof AxiosError) {
          const status = error.response?.status
          if (status && status >= 400 && status < 500 && status !== 429) {
            throw error
          }
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`⏳ Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================

  createFormData(data: Record<string, any>): FormData {
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })

    return formData
  }

  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  // ===============================================================================
  // HEALTH CHECK
  // ===============================================================================

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch (error) {
      console.error("❌ Health check failed:", error)
      return false
    }
  }
}

// ===============================================================================
// SINGLETON EXPORT
// ===============================================================================

export const apiClient = new ApiClient()
export default apiClient