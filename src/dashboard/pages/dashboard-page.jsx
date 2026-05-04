import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { engagementBreakdown, kpiCards, recentActivity, revenueSeries } from '../data/mock-data'

const MotionSection = motion.section
const MotionDiv = motion.div

function DashboardPage() {
  return (
    <MotionSection initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => (
          <MotionDiv key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{card.delta}</span>
                <span className="text-xs text-muted-foreground">{card.hint}</span>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Growth overview</CardTitle>
            <CardDescription>Revenue and learner momentum across the last six months.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" fill="url(#revenueFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement mix</CardTitle>
            <CardDescription>How learners are spending time in the platform.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={engagementBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={4} fill="var(--color-chart-2)" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent operations</CardTitle>
          <CardDescription>Latest platform events and learner-facing releases.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {recentActivity.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background/70 p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </MotionSection>
  )
}

export { DashboardPage }
