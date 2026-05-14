import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatEpoch(value) {
  if (!value) return "—"
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return new Date(numeric * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
