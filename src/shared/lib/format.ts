export function formatDateTime(input: string | null | undefined): string {
  if (!input) {
    return 'N/A'
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDate(input: string | null | undefined): string {
  if (!input) {
    return 'N/A'
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function toDateInputValue(input: string | null | undefined): string {
  if (!input) {
    return ''
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().split('T')[0]
}

export function bytesToSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B'
  }

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}
