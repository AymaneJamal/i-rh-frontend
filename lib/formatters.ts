// lib/formatters.ts
import { Currency, SubscriptionStatus, InvoiceStatus, PaymentStatus } from "@/lib/constants"

// ===============================================================================
// CURRENCY FORMATTING
// ===============================================================================

export const formatCurrency = (
  amount: number | null | undefined, 
  currency: Currency = 'EUR',
  locale: string = 'fr-FR'
): string => {
  if (amount === null || amount === undefined) {
    return "N/A"
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    console.error("Error formatting currency:", error)
    return `${amount} ${currency}`
  }
}

export const formatPrice = (
  amount: number | null | undefined,
  currency: Currency = 'EUR'
): string => {
  return formatCurrency(amount, currency)
}

export const formatRevenue = (
  amount: number | null | undefined,
  currency: Currency = 'EUR'
): string => {
  if (amount === null || amount === undefined) {
    return "N/A"
  }

  // Format large numbers with K, M suffixes
  if (amount >= 1000000) {
    return `${formatCurrency(amount / 1000000, currency).replace(/[€$]/, '')}M ${currency}`
  }
  if (amount >= 1000) {
    return `${formatCurrency(amount / 1000, currency).replace(/[€$]/, '')}K ${currency}`
  }
  
  return formatCurrency(amount, currency)
}

// ===============================================================================
// DATE FORMATTING
// ===============================================================================

export const formatDate = (
  timestamp: number | null | undefined,
  locale: string = 'fr-FR',
  options?: Intl.DateTimeFormatOptions
): string => {
  if (timestamp === null || timestamp === undefined) {
    return "N/A"
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }

    return new Date(timestamp).toLocaleDateString(locale, options || defaultOptions)
  } catch (error) {
    console.error("Error formatting date:", error)
    return new Date(timestamp).toLocaleDateString()
  }
}

export const formatDateShort = (
  timestamp: number | null | undefined,
  locale: string = 'fr-FR'
): string => {
  return formatDate(timestamp, locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export const formatDateLong = (
  timestamp: number | null | undefined,
  locale: string = 'fr-FR'
): string => {
  return formatDate(timestamp, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

export const formatRelativeDate = (
  timestamp: number | null | undefined
): string => {
  if (timestamp === null || timestamp === undefined) {
    return "N/A"
  }

  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor(diff / (60 * 1000))

  if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  
  return "À l'instant"
}

export const formatTimeRemaining = (
  expiryTimestamp: number | null | undefined
): string => {
  if (expiryTimestamp === null || expiryTimestamp === undefined) {
    return "N/A"
  }

  const now = Date.now()
  const diff = expiryTimestamp - now
  
  if (diff <= 0) {
    return "Expiré"
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

  if (days > 0) {
    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} restante${minutes > 1 ? 's' : ''}`
  }
  
  return "Moins d'une minute"
}

export const formatDaysUntilExpiry = (
  expiryTimestamp: number | null | undefined
): number => {
  if (expiryTimestamp === null || expiryTimestamp === undefined) {
    return -1
  }

  const now = Date.now()
  const diff = expiryTimestamp - now
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

// ===============================================================================
// USAGE PERCENTAGE FORMATTING
// ===============================================================================

export const formatUsagePercentage = (
  current: number | null | undefined,
  limit: number | null | undefined
): string => {
  if (current === null || current === undefined || limit === null || limit === undefined || limit === 0) {
    return "N/A"
  }

  const percentage = (current / limit) * 100
  return `${percentage.toFixed(1)}%`
}

export const formatUsageWithLimit = (
  current: number | null | undefined,
  limit: number | null | undefined,
  unit: string = ""
): string => {
  if (current === null || current === undefined) {
    return "N/A"
  }

  if (limit === null || limit === undefined || limit === 0) {
    return `${current}${unit}`
  }

  const percentage = formatUsagePercentage(current, limit)
  return `${current}${unit} / ${limit}${unit} (${percentage})`
}

export const formatStorageUsage = (
  currentMB: number | null | undefined,
  limitMB: number | null | undefined
): string => {
  if (currentMB === null || currentMB === undefined) {
    return "N/A"
  }

  const formatSize = (sizeMB: number): string => {
    if (sizeMB >= 1024) {
      return `${(sizeMB / 1024).toFixed(1)} GB`
    }
    return `${sizeMB} MB`
  }

  if (limitMB === null || limitMB === undefined || limitMB === 0) {
    return formatSize(currentMB)
  }

  const percentage = formatUsagePercentage(currentMB, limitMB)
  return `${formatSize(currentMB)} / ${formatSize(limitMB)} (${percentage})`
}

export const getUsageColor = (
  current: number | null | undefined,
  limit: number | null | undefined
): string => {
  if (current === null || current === undefined || limit === null || limit === undefined || limit === 0) {
    return "gray"
  }

  const percentage = (current / limit) * 100

  if (percentage >= 95) return "red"      // Critical
  if (percentage >= 80) return "orange"  // Warning
  if (percentage >= 60) return "yellow"  // Caution
  return "green"                         // Normal
}

// ===============================================================================
// STATUS FORMATTING
// ===============================================================================

export const formatSubscriptionStatus = (status: SubscriptionStatus | string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Actif'
    case 'REMINDER':
      return 'Rappel'
    case 'CRITICAL':
      return 'Critique'
    case 'GRACE_PERIOD':
      return 'Période de grâce'
    case 'SUSPENDED':
      return 'Suspendu'
    default:
      return status
  }
}

export const formatInvoiceStatus = (status: InvoiceStatus | string): string => {
  switch (status.toUpperCase()) {
    case 'DRAFT':
      return 'Brouillon'
    case 'SENT':
      return 'Envoyée'
    case 'PAID':
      return 'Payée'
    case 'OVERDUE':
      return 'En retard'
    case 'CANCELLED':
      return 'Annulée'
    default:
      return status
  }
}

export const formatPaymentStatus = (status: PaymentStatus | string): string => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'En attente'
    case 'PAID':
      return 'Payé'
    case 'FAILED':
      return 'Échoué'
    case 'REFUNDED':
      return 'Remboursé'
    default:
      return status
  }
}

export const getStatusColor = (status: string, type: 'subscription' | 'invoice' | 'payment'): string => {
  switch (type) {
    case 'subscription':
      switch (status.toUpperCase()) {
        case 'ACTIVE': return 'green'
        case 'REMINDER': return 'orange'
        case 'CRITICAL': return 'red'
        case 'GRACE_PERIOD': return 'yellow'
        case 'SUSPENDED': return 'gray'
        default: return 'gray'
      }
    case 'invoice':
      switch (status.toUpperCase()) {
        case 'DRAFT': return 'gray'
        case 'SENT': return 'blue'
        case 'PAID': return 'green'
        case 'OVERDUE': return 'red'
        case 'CANCELLED': return 'gray'
        default: return 'gray'
      }
    case 'payment':
      switch (status.toUpperCase()) {
        case 'PENDING': return 'orange'
        case 'PAID': return 'green'
        case 'FAILED': return 'red'
        case 'REFUNDED': return 'yellow'
        default: return 'gray'
      }
    default:
      return 'gray'
  }
}

// ===============================================================================
// NUMBER FORMATTING
// ===============================================================================

export const formatNumber = (
  num: number | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (num === null || num === undefined) {
    return "N/A"
  }

  return new Intl.NumberFormat(locale).format(num)
}

export const formatPercentage = (
  value: number | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined) {
    return "N/A"
  }

  return `${value.toFixed(decimals)}%`
}

export const formatCompactNumber = (
  num: number | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (num === null || num === undefined) {
    return "N/A"
  }

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  
  return formatNumber(num, locale)
}

// ===============================================================================
// FILE SIZE FORMATTING
// ===============================================================================

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || bytes === 0) {
    return "0 B"
  }

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export const formatFileSizeFromMB = (mb: number | null | undefined): string => {
  if (mb === null || mb === undefined) {
    return "N/A"
  }

  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`
  }
  
  return `${mb} MB`
}

// ===============================================================================
// PLAN FORMATTING
// ===============================================================================

export const formatPlanFeatures = (features: string[]): string => {
  if (!features || features.length === 0) {
    return "Aucune fonctionnalité"
  }

  return features.join(', ')
}

export const formatPlanPrice = (
  monthlyPrice: number | null | undefined,
  yearlyPrice: number | null | undefined,
  currency: Currency = 'EUR'
): string => {
  if (monthlyPrice === null || monthlyPrice === undefined) {
    return "Prix non défini"
  }

  let result = `${formatCurrency(monthlyPrice, currency)}/mois`
  
  if (yearlyPrice && yearlyPrice > 0) {
    result += ` ou ${formatCurrency(yearlyPrice, currency)}/an`
    
    const monthlySavings = monthlyPrice * 12 - yearlyPrice
    if (monthlySavings > 0) {
      result += ` (économie: ${formatCurrency(monthlySavings, currency)})`
    }
  }

  return result
}

// ===============================================================================
// BUSINESS LOGIC FORMATTING
// ===============================================================================

export const formatRemainingTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const formatDaysPastDue = (days: number): string => {
  if (days <= 0) {
    return "À jour"
  }
  
  return `${days} jour${days > 1 ? 's' : ''} de retard`
}

export const formatNextBilling = (timestamp: number | null | undefined): string => {
  if (timestamp === null || timestamp === undefined) {
    return "Non programmée"
  }

  const daysUntil = formatDaysUntilExpiry(timestamp)
  
  if (daysUntil < 0) {
    return "Échu"
  }
  if (daysUntil === 0) {
    return "Aujourd'hui"
  }
  if (daysUntil === 1) {
    return "Demain"
  }
  
  return `Dans ${daysUntil} jours`
}

// ===============================================================================
// VALIDATION HELPERS
// ===============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}