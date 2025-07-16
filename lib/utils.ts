import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers with appropriate units
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format bytes with appropriate units
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format rate (per second)
export function formatRate(rate: number): string {
  return formatNumber(rate) + '/s'
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Color utilities for node types
export function getNodeColor(nodeType: string): string {
  const colors = {
    producer: 'rgb(from var(--node-producer) r g b)',
    exchange: 'rgb(from var(--node-exchange) r g b)',
    queue: 'rgb(from var(--node-queue) r g b)',
    consumer: 'rgb(from var(--node-consumer) r g b)',
  }
  return colors[nodeType as keyof typeof colors] || colors.queue
}

// Status color utilities
export function getStatusColor(status: string): string {
  const colors = {
    active: 'text-green-500',
    idle: 'text-yellow-500',
    error: 'text-red-500',
    running: 'text-green-500',
    blocked: 'text-red-500',
    flow: 'text-yellow-500',
  }
  return colors[status as keyof typeof colors] || 'text-gray-500'
}

// Validate routing key patterns
export function isValidRoutingKey(key: string, exchangeType: string): boolean {
  if (exchangeType === 'fanout') {
    return true // Fanout ignores routing keys
  }
  
  if (exchangeType === 'direct') {
    return key.length > 0 // Direct requires exact match
  }
  
  if (exchangeType === 'topic') {
    // Topic allows wildcards (* and #)
    const parts = key.split('.')
    return parts.every(part => 
      part === '*' || 
      part === '#' || 
      /^[a-zA-Z0-9_-]+$/.test(part)
    )
  }
  
  return true // Headers exchange uses arguments
}

// Parse message payload safely
export function parseMessagePayload(payload: string): unknown {
  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

// Format timestamp
export function formatTimestamp(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
  return date.toLocaleString()
}

// Calculate message rate from stats
export function calculateRate(current: number, previous: number, timeInterval: number): number {
  if (timeInterval <= 0) return 0
  return Math.max(0, (current - previous) / (timeInterval / 1000))
}
