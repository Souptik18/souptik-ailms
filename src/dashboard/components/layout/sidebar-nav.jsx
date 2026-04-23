import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { brandMeta, navItems } from '../../data/mock-data'
import { cn } from '../../../lib/utils'

const MotionDiv = motion.div

function SidebarNav() {
  const BrandIcon = brandMeta.icon

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-[2rem] border border-border bg-card/90 p-5 shadow-sm backdrop-blur lg:block">
      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-secondary/70 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <BrandIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-semibold">{brandMeta.name}</p>
          <p className="text-xs text-muted-foreground">{brandMeta.descriptor}</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <MotionDiv
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            </MotionDiv>
          )
        })}
      </nav>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-primary to-chart-2 p-5 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.25em] opacity-80">Workspace</p>
        <div className="mt-3 grid gap-1">
          <strong className="text-3xl">{brandMeta.learners}</strong>
          <span className="text-sm opacity-85">Active learners across all programs</span>
        </div>
        <div className="mt-4 text-sm opacity-90">{brandMeta.mentors} mentors active this month</div>
      </div>
    </aside>
  )
}

export { SidebarNav }
