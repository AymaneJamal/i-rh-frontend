// lib/api-client.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

// ===============================================================================
// TYPES & INTERFACES
// ===============================================================================

export interface ApiClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  includeUserEmail?: boolean // Nouveau flag pour inclure l'email automatiquement
  customHeaders?: Record<string, string>
}

// Extension de l'interface Axios pour nos propriétés personnalisées
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean
  includeUserEmail?: boolean
  customHeaders?: Record<string, string>
}

interface ApiErrorResponse {
  error?: string
  message?: string
  details?: any
}

// ===============================================================================
// API HEADERS CONSTANTS
// ===============================================================================

const API_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
  CONTENT_TYPE_FORM: "application/x-www-form-urlencoded",
  ACCEPT_JSON: "application/json", // Renommé pour éviter la duplication
  USER_EMAIL: "X-User-Email", // Header pour l'email utilisateur
  CSRF_TOKEN: "X-CSRF-Token"
} as const

// ===============================================================================
// API CLIENT CLASS
// ===============================================================================

class ApiClient {
  private client: AxiosInstance
  private baseURL: string
  private retryConfig: {
    maxRetries: number
    retryDelay: number
    retryCondition: (error: AxiosError) => boolean
  }

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4010"
    
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error: AxiosError) => {
        return (
          !error.response ||
          error.response.status >= 500 ||
          error.response.status === 429
        )
      }
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': API_HEADERS.CONTENT_TYPE_JSON,
        'Accept': API_HEADERS.ACCEPT_JSON,
      },
    })

    this.setupInterceptors()
  }

  // ===============================================================================
  // INTERCEPTORS SETUP
  // ===============================================================================

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        console.log("🔍 Request config:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        includeUserEmail: config.includeUserEmail
      })
        // Always add CSRF token if available
        const csrfToken = localStorage.getItem("csrfToken")
        if (csrfToken && !config.skipAuth) {
          if (config.headers) {
            config.headers[API_HEADERS.CSRF_TOKEN] = csrfToken
          }
        }

        // Add user email header if requested
        if (config.includeUserEmail) {
          const userEmail = this.getCurrentUserEmail()
          if (userEmail && config.headers) {
            config.headers[API_HEADERS.USER_EMAIL] = userEmail
          }
        }

        // Add custom headers if provided
        if (config.customHeaders && config.headers) {
          Object.entries(config.customHeaders).forEach(([key, value]) => {
            if (config.headers) {
              config.headers[key] = value
            }
          })
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response Interceptor  
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle authentication errors
          this.handleAuthError()
        }
        return Promise.reject(error)
      }
    )
  }

  // ===============================================================================
  // USER EMAIL HELPER
  // ===============================================================================

  private getCurrentUserEmail(): string | null {
    try {
      // Méthode 1: Accès direct au store (recommandée)
      if (typeof window !== 'undefined' && (window as any).__REDUX_STORE__) {
        const state = (window as any).__REDUX_STORE__.getState()
        return state?.auth?.user?.email || null
      }
      
      // Méthode 2: Fallback via localStorage si disponible
      const userDataStr = localStorage.getItem('currentUser')
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        return userData?.email || null
      }
      
      return null
    } catch (error) {
      console.warn('Failed to get current user email:', error)
      return null
    }
  }

  // ===============================================================================
  // AUTH ERROR HANDLER
  // ===============================================================================

  private handleAuthError() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("csrfToken")
      window.location.href = "/login"
    }
  }

  // ===============================================================================
  // UTILITY METHODS
  // ===============================================================================

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
  // CORE HTTP METHODS
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
  // Ne PAS définir Content-Type pour FormData - le navigateur le fait automatiquement
  const formConfig: ApiClientConfig = {
    ...config,
    // Supprimer complètement la section headers pour FormData
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
        // Note: Content-Type will be set automatically by browser for FormData
        // Do not set it manually as it will break the boundary parameter
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
  // METHODS WITH AUTO USER EMAIL
  // ===============================================================================

  async postWithUserEmail<T = any>(
    url: string, 
    data?: any, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.post<T>(url, data, { ...config, includeUserEmail: true })
  }

  async putWithUserEmail<T = any>(
    url: string, 
    data?: any, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.put<T>(url, data, { ...config, includeUserEmail: true })
  }

  async deleteWithUserEmail<T = any>(
    url: string, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.delete<T>(url, { ...config, includeUserEmail: true })
  }

  // ===============================================================================
  // MANUAL USER EMAIL METHODS
  // ===============================================================================

  async postWithCustomUserEmail<T = any>(
    url: string, 
    userEmail: string,
    data?: any, 
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    const customHeadersConfig: ApiClientConfig = {
      ...config,
      customHeaders: { 
        ...config?.customHeaders, 
        [API_HEADERS.USER_EMAIL]: userEmail 
      }
    }
    
    return this.post<T>(url, data, customHeadersConfig)
  }

  // ===============================================================================
  // RETRY LOGIC
  // ===============================================================================

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    let lastError: AxiosError
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as AxiosError
        
        if (attempt === this.retryConfig.maxRetries || !this.retryConfig.retryCondition(lastError)) {
          break
        }
        
        await this.delay(this.retryConfig.retryDelay * Math.pow(2, attempt))
      }
    }
    
    throw lastError!
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ===============================================================================
// SINGLETON EXPORT
// ===============================================================================

export const apiClient = new ApiClient()
export default apiClient