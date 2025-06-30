// lib/validators.ts

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// ===============================================================================
// EMAIL VALIDATION
// ===============================================================================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateEmail = (email: string | null | undefined): ValidationResult => {
  const errors: string[] = []

  if (!email?.trim()) {
    errors.push("Email requis")
  } else if (!isValidEmail(email)) {
    errors.push("Format d'email invalide")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// FILE UPLOAD VALIDATION
// ===============================================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_RECEIPT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export const validateFileUpload = (
  file: File | null | undefined,
  type: 'receipt' | 'document' = 'receipt'
): ValidationResult => {
  const errors: string[] = []

  if (!file) {
    errors.push("Fichier requis")
    return { isValid: false, errors }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Fichier trop volumineux. Taille maximale: 5MB`)
  }

  // Check file type
  const allowedTypes = type === 'receipt' ? ALLOWED_RECEIPT_TYPES : ALLOWED_DOCUMENT_TYPES

  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      switch (type) {
        case 'application/pdf': return 'PDF'
        case 'image/jpeg':
        case 'image/jpg': return 'JPG'
        case 'image/png': return 'PNG'
        case 'application/msword': return 'DOC'
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX'
        default: return type
      }
    }).join(', ')
    
    errors.push(`Format de fichier non supporté. Formats acceptés: ${allowedExtensions}`)
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("Le fichier est vide")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// PLAN VALIDATION
// ===============================================================================
export const validatePlanData = (planData: any): ValidationResult => {
  const errors: string[] = []

  // Required fields
  if (!planData.planName?.trim()) {
    errors.push("Nom du plan requis")
  }

  if (!planData.description?.trim()) {
    errors.push("Description du plan requise")
  }

  if (!planData.category) {
    errors.push("Catégorie du plan requise")
  }

  if (!planData.currency) {
    errors.push("Devise requise")
  }

  // Price validation
  if (planData.monthlyPrice === null || planData.monthlyPrice === undefined || planData.monthlyPrice < 0) {
    errors.push("Prix mensuel requis et doit être positif")
  }

  if (planData.yearlyPrice === null || planData.yearlyPrice === undefined || planData.yearlyPrice < 0) {
    errors.push("Prix annuel requis et doit être positif")
  }

  // Limits validation
  if (planData.maxUsers === null || planData.maxUsers === undefined || planData.maxUsers <= 0) {
    errors.push("Nombre maximum d'utilisateurs requis et doit être positif")
  }

  if (planData.maxEmployees === null || planData.maxEmployees === undefined || planData.maxEmployees <= 0) {
    errors.push("Nombre maximum d'employés requis et doit être positif")
  }

  if (planData.maxDatabaseStorageMB === null || planData.maxDatabaseStorageMB === undefined || planData.maxDatabaseStorageMB <= 0) {
    errors.push("Stockage base de données requis et doit être positif")
  }

  if (planData.maxS3StorageMB === null || planData.maxS3StorageMB === undefined || planData.maxS3StorageMB <= 0) {
    errors.push("Stockage S3 requis et doit être positif")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// PAYMENT VALIDATION
// ===============================================================================
export const validatePaymentInfo = (
  amount: number | null | undefined,
  paymentMethod: string | null | undefined,
  paymentReference: string | null | undefined
): ValidationResult => {
  const errors: string[] = []

  if (amount === null || amount === undefined || amount <= 0) {
    errors.push("Montant requis et doit être positif")
  }

  if (!paymentMethod?.trim()) {
    errors.push("Méthode de paiement requise")
  }

  if (!paymentReference?.trim()) {
    errors.push("Référence de paiement requise")
  } else if (paymentReference.length < 3) {
    errors.push("Référence de paiement trop courte (minimum 3 caractères)")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// TENANT VALIDATION
// ===============================================================================
// Ajout dans lib/validators.ts

export const validateTenantData = (data: any) => {
  const errors: string[] = []

  // Required fields validation
  if (!data.tenantName?.trim()) errors.push("Le nom du tenant est requis")
  if (!data.industry?.trim()) errors.push("L'industrie est requise")
  if (!data.region?.trim()) errors.push("La région est requise")
  if (!data.country?.trim()) errors.push("Le pays est requis")
  if (!data.city?.trim()) errors.push("La ville est requise")
  if (!data.address?.trim()) errors.push("L'adresse est requise")
  if (!data.phone?.trim()) errors.push("Le téléphone est requis")
  if (!data.billingEmail?.trim()) errors.push("L'email de facturation est requis")
  if (!data.timeZone?.trim()) errors.push("Le fuseau horaire est requis")
  if (!data.language?.trim()) errors.push("La langue est requise")

  // Admin fields validation
  if (!data.adminEmail?.trim()) errors.push("L'email administrateur est requis")
  if (!data.adminFirstName?.trim()) errors.push("Le prénom administrateur est requis")
  if (!data.adminLastName?.trim()) errors.push("Le nom administrateur est requis")
  if (!data.adminPassword?.trim()) errors.push("Le mot de passe administrateur est requis")

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (data.billingEmail && !emailRegex.test(data.billingEmail)) {
    errors.push("L'email de facturation n'est pas valide")
  }
  if (data.adminEmail && !emailRegex.test(data.adminEmail)) {
    errors.push("L'email administrateur n'est pas valide")
  }

  // Phone validation (international format)
  const phoneRegex = /^\+\d{1,4}\d{6,14}$/
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push("Le format du téléphone n'est pas valide (ex: +212524789123)")
  }

  // Password validation
  if (data.adminPassword && data.adminPassword.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères")
  }

  // Postal code validation (optional but format check if provided)
  if (data.postalCode && data.postalCode.length > 10) {
    errors.push("Le code postal ne peut pas dépasser 10 caractères")
  }

  // Legal numbers validation (optional but format check if provided)
  if (data.legalNumbers && typeof data.legalNumbers === 'object') {
    Object.entries(data.legalNumbers).forEach(([key, value]) => {
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`La valeur pour ${key} ne peut pas être vide`)
      }
      if (key.length < 2) {
        errors.push(`Le nom du numéro légal '${key}' est trop court`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// PHONE NUMBER VALIDATION
// ===============================================================================
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '')
  const phoneRegex = /^[\+]?[1-9]\d{1,14}$/
  return phoneRegex.test(cleanPhone)
}

// ===============================================================================
// PASSWORD VALIDATION
// ===============================================================================
export const validatePassword = (password: string | null | undefined): ValidationResult => {
  const errors: string[] = []

  if (!password?.trim()) {
    errors.push("Mot de passe requis")
    return { isValid: false, errors }
  }

  if (password.length < 8) {
    errors.push("Mot de passe trop court (minimum 8 caractères)")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Mot de passe doit contenir au moins une lettre minuscule")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mot de passe doit contenir au moins une lettre majuscule")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Mot de passe doit contenir au moins un chiffre")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===============================================================================
// UTILITY FUNCTIONS
// ===============================================================================
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = []

  if (value === null || value === undefined || value === '' || (typeof value === 'string' && !value.trim())) {
    errors.push(`${fieldName} requis`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(validation => validation.errors)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}