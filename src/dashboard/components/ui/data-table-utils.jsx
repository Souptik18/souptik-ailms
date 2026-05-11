import { ArrowUpDown } from 'lucide-react'
import { Button } from './button'

function sortableHeader(label) {
  return ({ column }) => (
    <Button
      variant="ghost"
      className="-ml-3 h-8 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  )
}

export { sortableHeader }
