// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine and intelligently merge Tailwind + conditional class names.
 *
 * - Uses `clsx` for flexible conditional logic.
 * - Uses `twMerge` to resolve Tailwind conflicts (e.g. "p-2" vs "p-4").
 *
 * Example:
 * ```tsx
 * <div className={cn(
 *   'p-2 text-gray-600',
 *   isActive && 'text-white bg-blue-500',
 *   'px-4'
 * )} />
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs))
}
