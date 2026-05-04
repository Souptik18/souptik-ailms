import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { acquisitionSeries, analyticsCards } from '../data/mock-data'

function AnalyticsPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {analyticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-3xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{card.note}</CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="acquisition">
        <TabsList>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>
        <TabsContent value="acquisition">
          <Card>
            <CardHeader>
              <CardTitle>Weekly acquisition mix</CardTitle>
              <CardDescription>Organic, referral, and paid channel contribution.</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={acquisitionSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="organic" stackId="a" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="referral" stackId="a" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="paid" stackId="a" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Retention cohort view can plug into the same analytics shell without changing the surrounding layout.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

export { AnalyticsPage }
