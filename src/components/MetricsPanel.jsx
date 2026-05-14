import { Activity, Clock, Radio, Server, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import StatusBadge from "./StatusBadge"
import { formatEpoch } from "../lib/utils"

function MetricCard({ icon: Icon, label, value, detail, children }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-2xl tabular-nums">{value}</CardTitle>
        </div>
        <div className="rounded-md border border-terminal-line bg-terminal-teal/10 p-2 text-terminal-teal">
          <Icon aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children || <p className="text-xs text-terminal-muted">{detail}</p>}
      </CardContent>
    </Card>
  )
}

export default function MetricsPanel({ metrics, symbolsCount, websocketStatus, lastTickTime }) {
  const activeSubscriptions =
    metrics?.active_subscriptions ?? metrics?.event_recorder?.active_subscriptions ?? symbolsCount
  const ticksPerSecond = metrics?.live_ticks_per_sec ?? 0

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon={Server} label="Active Symbols" value={symbolsCount} detail="Registry enabled rows" />
      <MetricCard
        icon={Radio}
        label="Active Subscriptions"
        value={activeSubscriptions}
        detail="Runtime subscription manager"
      />
      <MetricCard icon={Wifi} label="WebSocket Status" value="">
        <div className="flex items-center gap-2">
          <StatusBadge status={websocketStatus} />
          <span className="text-xs text-terminal-muted">Live feed channel</span>
        </div>
      </MetricCard>
      <MetricCard icon={Activity} label="Ticks/sec" value={Number(ticksPerSecond).toFixed(1)} detail="FastAPI runtime" />
      <MetricCard icon={Clock} label="Last Tick Time" value={formatEpoch(lastTickTime)} detail="Latest websocket tick" />
    </section>
  )
}
