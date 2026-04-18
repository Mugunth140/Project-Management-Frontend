import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ParsedApiError } from './errors'

export function applyApiValidationErrors<TFieldValues extends FieldValues>(
  error: ParsedApiError,
  setError: UseFormSetError<TFieldValues>,
): void {
  if (!error.fieldErrors) {
    return
  }

  Object.entries(error.fieldErrors).forEach(([field, message]) => {
    setError(field as Path<TFieldValues>, {
      type: 'server',
      message,
    })
  })
}
