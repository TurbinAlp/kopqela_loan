/**
 * Timezone utility functions for East Africa
 * Supports both Nairobi (Kenya) and Dar es Salaam (Tanzania) timezones
 */

// East Africa timezone (UTC+3)
const EAST_AFRICA_TIMEZONE = 'Africa/Nairobi' // Same as Africa/Dar_es_Salaam

/**
 * Get current date/time in East Africa timezone
 * @returns Date object representing current time in East Africa
 */
export function getEastAfricaTime(): Date {
  // Create date in East Africa timezone
  const now = new Date()
  
  // Convert to East Africa timezone
  const eastAfricaTime = new Date(now.toLocaleString("en-US", {
    timeZone: EAST_AFRICA_TIMEZONE
  }))
  
  return eastAfricaTime
}

/**
 * Convert any date to East Africa timezone
 * @param date - Date to convert (defaults to current time)
 * @returns Date object in East Africa timezone
 */
export function toEastAfricaTime(date: Date = new Date()): Date {
  return new Date(date.toLocaleString("en-US", {
    timeZone: EAST_AFRICA_TIMEZONE
  }))
}

/**
 * Get formatted timestamp for East Africa
 * @param date - Date to format (defaults to current time)
 * @returns Formatted string in East Africa timezone
 */
export function getEastAfricaTimestamp(date: Date = new Date()): string {
  return date.toLocaleString("en-US", {
    timeZone: EAST_AFRICA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Get East Africa timezone offset
 * @returns Timezone offset string (e.g., "+03:00")
 */
export function getEastAfricaOffset(): string {
  const date = new Date()
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const eastAfricaTime = new Date(utc + (3 * 3600000)) // UTC+3
  
  return '+03:00'
}

/**
 * Create a database-ready timestamp in East Africa timezone
 * This is what we'll use for lastLoginAt and other timestamp fields
 */
export function createEastAfricaTimestamp(): Date {
  return getEastAfricaTime()
}
