import { cn } from '../../../lib/utils'

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
