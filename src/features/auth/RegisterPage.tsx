import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from './auth-context'
import { USER_ROLES } from '../../shared/lib/constants'
import { parseApiError } from '../../shared/lib/errors'
import { applyApiValidationErrors } from '../../shared/lib/forms'
import { Button, ErrorState, FieldError, Input, PageShell, Select } from '../../shared/ui/base'
import type { UserRole } from '../../shared/types/models'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]).optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'DEVELOPER',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      await registerUser(values)
      navigate('/', { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      applyApiValidationErrors(parsed, setError)
      setSubmitError(parsed.message)
    }
  })

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-blue-600">Project OS</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-950">Create account</h1>
          <p className="mt-1 text-sm text-zinc-600">Join your team workspace and start managing work.</p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-zinc-700" htmlFor="fullName">
                Full name
              </label>
              <Input id="fullName" placeholder="Jane Doe" {...register('fullName')} />
              <FieldError message={errors.fullName?.message} />
            </div>

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

            <div>
              <label className="mb-1 block text-sm text-zinc-700" htmlFor="role">
                Role
              </label>
              <Select id="role" {...register('role')}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-zinc-9500">Backend may override this based on policy.</p>
            </div>

            {submitError && <ErrorState message={submitError} />}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-zinc-700">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}
