import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-['Poppins',sans-serif]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-300',
  secondary:
    'bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-300',
  danger: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:ring-zinc-300',
  ghost:
    'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-300',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        buttonClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-200 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-200 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-200 focus:border-blue-500 focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-xs text-zinc-700">{message}</p>
}

export function Pill({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'bg-zinc-100 text-zinc-700',
    success: 'bg-blue-50 text-blue-700',
    warning: 'bg-zinc-100 text-zinc-700',
    danger: 'bg-zinc-900 text-white',
  }

  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  )
}

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-700">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
      {label}
    </div>
  )
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
      {message}
    </div>
  )
}
