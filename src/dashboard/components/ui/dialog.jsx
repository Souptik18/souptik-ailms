import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../../lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogPortal(props) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogOverlay({ className, ...props }) {
  return <DialogPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)} {...props} />
}

function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl', className)}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-5 flex flex-col gap-1', className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }
