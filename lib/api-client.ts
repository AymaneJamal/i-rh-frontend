import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT: Pour envoyer les cookies HTTP-Only
})

// Liste des endpoints publics qui ne nécessitent pas de CSRF token
const PUBLIC_ENDPOINTS = [
  "/api/auth/public/login",
  "/api/auth/public/password-reset",
  "/api/auth/public/password-reset/confirm", 
  "/api/auth/public/password-reset/resend",
  "/api/auth/pre/login/mfa",
  "/api/auth/resend-mfa"
]

// Fonction pour vérifier si un endpoint est public
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

// Request interceptor to add CSRF token conditionally
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || ""
    
    // Seulement ajouter CSRF token pour les endpoints protégés
    if (!isPublicEndpoint(url)) {
      const csrfToken = localStorage.getItem("csrfToken")
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken
        console.log(`🛡️ Adding CSRF token to protected endpoint: ${url}`)
      } else {
        console.warn(`⚠️ No CSRF token found for protected endpoint: ${url}`)
      }
    } else {
      console.log(`🔓 Public endpoint, no CSRF required: ${url}`)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors and CSRF renewal
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ""
    
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || ""
      const responseType = error.response?.data?.responseType || ""
      
      // Pour les endpoints publics, ne pas forcer la déconnexion
      if (isPublicEndpoint(url)) {
        console.log(`🔓 Authentication error on public endpoint: ${url}`)
        return Promise.reject(error)
      }
      
      // Pour les endpoints protégés, vérifier les erreurs d'authentification
      const isAuthFailure = 
        errorMessage.toLowerCase().includes('no jwt token') ||
        errorMessage.toLowerCase().includes('invalid authentication') ||
        errorMessage.toLowerCase().includes('no authentication found') ||
        errorMessage.toLowerCase().includes('csrf validation failed') ||
        responseType === "INVALID_TOKEN" ||
        responseType === "TOKEN_EXPIRED" ||
        responseType === "UNAUTHORIZED"
        
      if (isAuthFailure) {
        console.log(`🚨 Authentication failure on protected endpoint: ${url}`)
        localStorage.removeItem("csrfToken")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)