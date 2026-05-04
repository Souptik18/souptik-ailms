import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { DataTable } from '../components/ui/data-table'
import { sortableHeader } from '../components/ui/data-table-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { FormField } from '../components/ui/form-field'
import { courses } from '../data/mock-data'
import { notify } from '../components/ui/notifications'

function CoursesPage() {
  const [search, setSearch] = useState('')
  const filtered = courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()) || course.category.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    {
      accessorKey: 'title',
      header: sortableHeader('Course'),
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.instructor}</p>
        </div>
      ),
    },
    { accessorKey: 'category', header: sortableHeader('Category') },
    { accessorKey: 'status', header: sortableHeader('Status') },
    { accessorKey: 'learners', header: sortableHeader('Learners') },
    {
      accessorKey: 'completion',
      header: sortableHeader('Completion'),
      cell: ({ row }) => `${row.original.completion}%`,
    },
    {
      id: 'actions',
      header: 'Open',
      cell: ({ row }) => (
        <Button asChild size="sm" variant="outline">
          <Link to={`/courses/${row.original.id}`}>View course</Link>
        </Button>
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage live, draft, and scheduled programs from one workspace.</CardDescription>
          </div>
          <div className="flex gap-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter courses" className="w-60" />
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" />New course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create course shell</DialogTitle>
                  <DialogDescription>Use reusable forms and dialogs to start a new LMS program.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <FormField label="Course title">
                    <Input placeholder="Advanced Systems Lab" />
                  </FormField>
                  <FormField label="Instructor">
                    <Input placeholder="Lead mentor" />
                  </FormField>
                  <Button onClick={() => notify.success('Draft created', 'A new course shell was created in drafts.')}>Save draft</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} />
        </CardContent>
      </Card>
    </section>
  )
}

export { CoursesPage }
