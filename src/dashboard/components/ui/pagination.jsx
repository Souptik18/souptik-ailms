import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../../lib/utils'

function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition',
                pageNumber === page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-accent',
              )}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
