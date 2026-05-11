import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { courses } from '../data/mock-data'

function CourseViewerPage() {
  const { courseId } = useParams()
  const course = useMemo(() => courses.find((item) => item.id === courseId) ?? courses[0], [courseId])
  const [activeSection, setActiveSection] = useState(course.sections[0]?.title ?? '')

  return (
    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/80 bg-secondary/60">
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="aspect-video overflow-hidden rounded-[1.25rem] border border-border bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/MbjObHmDbZo?rel=0"
                title={course.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Resume session</Button>
              <Button variant="outline">Invite learners</Button>
              <Button variant="secondary">Mark module complete</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                This viewer is set up as a reusable learning stage with action controls, modular tabs, and a companion agenda.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resources">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Attach slide decks, practice briefs, and reading packets here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notes">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Add facilitator notes or learner prompts for each section.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course agenda</CardTitle>
          <CardDescription>Section-based navigation for the current program.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-background/80 p-4">
              <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setActiveSection(section.title)}>
                <div>
                  <p className="font-semibold">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.lessons.length} lessons</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeSection === section.title ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {activeSection === section.title ? 'Open' : 'View'}
                </span>
              </button>
              {activeSection === section.title ? (
                <div className="mt-3 grid gap-2">
                  {section.lessons.map((lesson) => (
                    <div key={lesson} className="rounded-xl bg-card px-3 py-2 text-sm">
                      {lesson}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

export { CourseViewerPage }
