import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FormField } from '../components/ui/form-field'
import { Input } from '../components/ui/input'
import { notify } from '../components/ui/notifications'
import { settingsSections } from '../data/mock-data'

const settingsSchema = z.object({
  workspaceName: z.string().min(3, 'Workspace name must be at least 3 characters'),
  adminEmail: z.email('Enter a valid email address'),
  digestTime: z.string().min(1, 'Digest time is required'),
})

function SettingsPage() {
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      workspaceName: 'KIITX NPTEL',
      adminEmail: 'admin@kiitx.in',
      digestTime: '08:30 AM',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    notify.success('Settings saved', `${values.workspaceName} updated successfully.`)
  })

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Reusable form patterns with validation and workspace controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-background/70 p-4">
              <h3 className="font-semibold">{section.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{section.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace preferences</CardTitle>
          <CardDescription>Update identity and operations defaults.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <FormField label="Workspace name" error={form.formState.errors.workspaceName?.message}>
              <Input {...form.register('workspaceName')} />
            </FormField>
            <FormField label="Admin email" error={form.formState.errors.adminEmail?.message}>
              <Input {...form.register('adminEmail')} />
            </FormField>
            <FormField label="Digest delivery time" error={form.formState.errors.digestTime?.message}>
              <Input {...form.register('digestTime')} />
            </FormField>
            <div className="flex gap-3">
              <Button type="submit">Save settings</Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

export { SettingsPage }
