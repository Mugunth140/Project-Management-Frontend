import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from './auth-context'
import { parseApiError } from '../../shared/lib/errors'
import { applyApiValidationErrors } from '../../shared/lib/forms'
import { Button, ErrorState, FieldError, Input, PageShell } from '../../shared/ui/base'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      applyApiValidationErrors(parsed, setError)
      setSubmitError(parsed.message)
    }
  })

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-blue-600">Project OS</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-950">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600">Access your dashboard and active projects.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-zinc-700" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="jane@company.dev" {...register('email')} />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-700" htmlFor="password">
                Password
              </label>
              <Input id="password" type="password" placeholder="********" {...register('password')} />
              <FieldError message={errors.password?.message} />
            </div>

            {submitError && <ErrorState message={submitError} />}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-zinc-700">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}
