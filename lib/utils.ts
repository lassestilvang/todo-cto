import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nanoid(size: number = 21): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let id = ''
  const randomValues = crypto.getRandomValues(new Uint8Array(size))
  for (let i = 0; i < size; i++) {
    id += alphabet[randomValues[i] % alphabet.length]
  }
  return id
}

const TIME_PATTERN = /^([0-1]\d|2[0-3]):([0-5]\d)$/

export function minutesToDuration(minutes?: number | null): string {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) {
    return ""
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.abs(minutes % 60)
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

export function durationToMinutes(value?: string | null): number | null {
  if (!value || !TIME_PATTERN.test(value)) {
    return null
  }
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value)
}

export function toDateTimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function parseDateTimeLocal(value: string): Date {
  return new Date(value)
}
