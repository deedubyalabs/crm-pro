import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return original if it doesn't match expected formats
  return phoneNumber
}

export function getInitials(firstName?: string | null, lastName?: string | null, businessName?: string | null): string {
  if (businessName) {
    // Use first letter of each word in business name, up to 2 letters
    const words = businessName.split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
  }

  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase()
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase()
  }

  if (lastName) {
    return lastName.substring(0, 2).toUpperCase()
  }

  return "??"
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
}
