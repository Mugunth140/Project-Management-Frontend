import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_45%)] text-slate-100 font-['Space_Grotesk',sans-serif]">
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
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.05),0_20px_60px_rgba(2,6,23,0.6)] backdrop-blur">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-cyan-100">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus-visible:ring-cyan-300',
  secondary:
    'bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus-visible:ring-emerald-300',
  danger: 'bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-300',
  ghost:
    'border border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400',
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
        'w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2',
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
        'w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2',
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
        'w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:border-cyan-300 focus:ring-2',
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

  return <p className="mt-1 text-xs text-rose-300">{message}</p>
}

export function Pill({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'bg-slate-700/60 text-slate-100',
    success: 'bg-emerald-500/20 text-emerald-200',
    warning: 'bg-amber-500/20 text-amber-200',
    danger: 'bg-rose-500/20 text-rose-200',
  }

  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  )
}

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-200 border-r-transparent" />
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
    <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </div>
  )
}
