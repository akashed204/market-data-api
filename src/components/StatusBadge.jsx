import { Badge } from "./ui/badge"

const VARIANT_BY_STATUS = {
  LIVE: "default",
  SUBSCRIBED: "subscribed",
  DISCONNECTED: "destructive",
  UNSUBSCRIBED: "secondary",
  CONNECTING: "warning",
}

export default function StatusBadge({ status }) {
  const normalized = String(status || "UNSUBSCRIBED").toUpperCase()
  return <Badge variant={VARIANT_BY_STATUS[normalized] || "secondary"}>{normalized}</Badge>
}
