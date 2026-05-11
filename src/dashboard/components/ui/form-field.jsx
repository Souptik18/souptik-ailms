import { cn } from '../../../lib/utils'

function FormField({ label, hint, error, className, children }) {
  return (
    <label className={cn('grid gap-2', className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  )
}

export { FormField }
