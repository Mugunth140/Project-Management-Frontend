import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,#27272a_0%,#09090b_45%)] text-zinc-100 font-['Space_Grotesk',sans-serif]">
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
    <section className="rounded-2xl border border-zinc-500/20 bg-zinc-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-400 text-zinc-950 hover:bg-zinc-300 focus-visible:ring-zinc-300',
  secondary:
    'bg-zinc-400 text-zinc-950 hover:bg-zinc-300 focus-visible:ring-zinc-300',
  danger: 'bg-zinc-500 text-white hover:bg-zinc-400 focus-visible:ring-zinc-300',
  ghost:
    'border border-zinc-600 bg-transparent text-zinc-100 hover:bg-zinc-800 focus-visible:ring-zinc-400',
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
        'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-300 placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-2',
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
        'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-300 placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-2',
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
        'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none ring-zinc-300 focus:border-zinc-300 focus:ring-2',
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

  return <p className="mt-1 text-xs text-zinc-300">{message}</p>
}

export function Pill({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'bg-zinc-700/60 text-zinc-100',
    success: 'bg-zinc-500/20 text-zinc-200',
    warning: 'bg-zinc-500/20 text-zinc-200',
    danger: 'bg-zinc-500/20 text-zinc-200',
  }

  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  )
}

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-300">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-r-transparent" />
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
    <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center">
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-zinc-400/30 bg-zinc-500/10 px-4 py-3 text-sm text-zinc-200">
      {message}
    </div>
  )
}
