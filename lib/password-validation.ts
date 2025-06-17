export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  
  // Minimum 10 characters
  if (password.length < 10) {
    errors.push("Password must be at least 10 characters long")
  }
  
  // At least 1 uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter")
  }
  
  // At least 1 lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter")
  }
  
  // At least 1 number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least 1 number")
  }
  
  // At least 1 special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least 1 special character")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}