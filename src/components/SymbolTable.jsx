import { memo, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import StatusBadge from "./StatusBadge"

const PAGE_SIZE = 50

function SymbolTable({ symbols, liveSymbols, websocketStatus, onRemove, removingSymbol }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(symbols.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const visibleSymbols = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return symbols.slice(start, start + PAGE_SIZE)
  }, [safePage, symbols])

  function statusFor(symbol) {
    if (websocketStatus === "DISCONNECTED") return "DISCONNECTED"
    return liveSymbols.has(symbol) ? "LIVE" : "SUBSCRIBED"
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Active Symbol Table</CardTitle>
          <CardDescription>
            {symbols.length} matching active subscriptions, paged at {PAGE_SIZE} rows for runtime responsiveness.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs text-terminal-muted">
          <span>
            Page {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Exchange</TableHead>
              <TableHead>Instrument Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Watchlist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleSymbols.map((item) => (
              <TableRow key={`${item.exchange}:${item.symbol}`}>
                <TableCell className="font-semibold">{item.symbol}</TableCell>
                <TableCell>
                  <Badge variant="exchange">{item.exchange || "NSE"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="instrument">{item.instrument_type || "EQUITY"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="token">{item.token || "—"}</Badge>
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-terminal-muted">
                  {item.watchlist || "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={statusFor(item.symbol)} />
                </TableCell>
                <TableCell className="text-terminal-muted">{item.added_time || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="destructive_gray"
                    size="sm"
                    onClick={() => onRemove(item)}
                    disabled={removingSymbol === item.symbol}
                  >
                    <Trash2 data-icon="inline-start" aria-hidden="true" />
                    {removingSymbol === item.symbol ? "Removing" : "Remove"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!visibleSymbols.length ? (
          <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-terminal-line text-sm text-terminal-muted">
            No active symbols match the current controls.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default memo(SymbolTable)
