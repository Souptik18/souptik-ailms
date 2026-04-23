import { useState } from 'react'
import { DataTable } from '../components/ui/data-table'
import { sortableHeader } from '../components/ui/data-table-utils'
import { Pagination } from '../components/ui/pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { students } from '../data/mock-data'

function StudentsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = Math.ceil(students.length / pageSize)
  const pagedStudents = students.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { accessorKey: 'id', header: sortableHeader('ID') },
    { accessorKey: 'name', header: sortableHeader('Student') },
    { accessorKey: 'cohort', header: sortableHeader('Cohort') },
    {
      accessorKey: 'progress',
      header: sortableHeader('Progress'),
      cell: ({ row }) => `${row.original.progress}%`,
    },
    { accessorKey: 'streak', header: sortableHeader('Streak') },
    { accessorKey: 'status', header: sortableHeader('Status') },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>Track cohorts, streaks, and completion signals with reusable pagination and table patterns.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable columns={columns} data={pagedStudents} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </CardContent>
    </Card>
  )
}

export { StudentsPage }
