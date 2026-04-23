import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'
import { brandMeta, defaultLogin } from '../data/mock-data'
import { notify } from '../components/ui/notifications'

const MotionDiv = motion.div

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLogin,
  })

  const submit = form.handleSubmit((values) => {
    const allowed = onLogin(values)
    if (allowed === false) {
      form.setError('email', { message: 'Use the privileged admin email for this console.' })
      return
    }

    notify.success('Login successful', 'Dashboard access granted.')
    navigate('/url-admin/dashboard', { replace: true })
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.16),transparent_24%)]" />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card/95 shadow-2xl backdrop-blur xl:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="hidden bg-gradient-to-br from-primary to-chart-2 p-10 text-primary-foreground xl:block">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">Modern SaaS LMS</p>
          <h1 className="mt-6 max-w-md text-5xl font-semibold tracking-tight">Operate your academy with a sharp, reusable dashboard system.</h1>
          <p className="mt-4 max-w-xl text-base opacity-90">Tailwind-first structure, shadcn-style components, responsive layouts, charts, data tables, forms, and dark mode support.</p>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="pt-10">
            <CardTitle className="text-3xl">{brandMeta.name}</CardTitle>
            <CardDescription>Sign in to manage courses, learners, and analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={submit}>
              <FormField label="Email" error={form.formState.errors.email?.message}>
                <Input {...form.register('email')} placeholder="admin@kiitx.in" />
              </FormField>
              <FormField label="Password" error={form.formState.errors.password?.message}>
                <Input {...form.register('password')} type="password" placeholder="Enter password" />
              </FormField>
              <Button type="submit" className="w-full">Sign in</Button>
              <p className="text-center text-sm text-muted-foreground">Demo login is prefilled for fast testing.</p>
            </form>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}

export { LoginPage }
