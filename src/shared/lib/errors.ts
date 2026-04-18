import axios from 'axios'
import type { ApiErrorResponse } from '../types/models'

export interface ParsedApiError {
  status?: number
  message: string
  fieldErrors?: Record<string, string>
}

function normalizeFieldErrors(input: unknown): Record<string, string> | undefined {
  if (!input || typeof input !== 'object') {
    return undefined
  }

  const entries = Object.entries(input)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')

  if (entries.length === 0) {
    return undefined
  }

  return Object.fromEntries(entries)
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    return {
      status,
      message: data?.message ?? error.message ?? 'Request failed',
      fieldErrors: normalizeFieldErrors(data?.fieldErrors),
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'Something went wrong. Please try again.' }
}
