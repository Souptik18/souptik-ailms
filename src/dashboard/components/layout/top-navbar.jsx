import { Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { notify } from '../ui/notifications'

function TopNavbar({ onLogout }) {
  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/85 px-5 py-4 shadow-sm backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">SaaS LMS dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Operate content, learners, and analytics from one system.</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search courses, learners, metrics" />
        </div>
        <Button variant="secondary" onClick={() => notify.success('Notification sent', 'A new digest was queued for all active mentors.')}>
          Send digest
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-11 items-center gap-3 rounded-2xl border border-border bg-background px-3 text-sm font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">KS</div>
              <div className="text-left">
                <p>KIITX Admin</p>
                <p className="text-xs text-muted-foreground">Workspace owner</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => notify.info('Profile synced', 'Workspace profile was refreshed.')}>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export { TopNavbar }
