import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
