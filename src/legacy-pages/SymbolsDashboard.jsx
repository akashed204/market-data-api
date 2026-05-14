import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { KeyRound, RefreshCcw, ShieldCheck } from "lucide-react"
import { Toaster, toast } from "sonner"
import {
  addSymbol,
  buildLiveWebSocketUrl,
  getRuntimeMetrics,
  getStoredApiKey,
  getSymbols,
  removeSymbol,
  setStoredApiKey,
  toUserMessage,
} from "../api/symbols"
import AddSymbolModal from "../components/AddSymbolModal"
import MetricsPanel from "../components/MetricsPanel"
import SearchBar from "../components/SearchBar"
import SymbolTable from "../components/SymbolTable"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Separator } from "../components/ui/separator"
import StatusBadge from "../components/StatusBadge"

function normalizeSymbolsResponse(payload) {
  const watchlists = payload?.watchlists || {}
  const symbolToWatchlists = new Map()

  Object.entries(watchlists).forEach(([watchlistName, symbols]) => {
    ;(symbols || []).forEach((symbol) => {
      const normalized = String(symbol).toUpperCase()
      const current = symbolToWatchlists.get(normalized) || []
      current.push(watchlistName)
      symbolToWatchlists.set(normalized, current)
    })
  })

  return (payload?.active_symbols || []).map((item) => {
    const symbol = String(item.symbol || "").toUpperCase()
    return {
      ...item,
      symbol,
      exchange: item.exchange || "NSE",
      instrument_type: item.instrument_type || "EQUITY",
      watchlist: (symbolToWatchlists.get(symbol) || []).join(", "),
      added_time: item.created_at ? new Date(Number(item.created_at) * 1000).toLocaleString() : "",
    }
  })
}

export default function SymbolsDashboard() {
  const [symbols, setSymbols] = useState([])
  const [watchlists, setWatchlists] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [search, setSearch] = useState("")
  const [watchlist, setWatchlist] = useState("all")
  const [instrumentType, setInstrumentType] = useState("all")
  const [websocketStatus, setWebsocketStatus] = useState("DISCONNECTED")
  const [liveSymbols, setLiveSymbols] = useState(new Set())
  const [lastTickTime, setLastTickTime] = useState(null)
  const [apiKeyDraft, setApiKeyDraft] = useState(getStoredApiKey())
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removingSymbol, setRemovingSymbol] = useState("")
  const reconnectTimer = useRef(null)
  const wsRef = useRef(null)

  const fetchSymbols = useCallback(async ({ quiet = false } = {}) => {
    setLoading(true)
    try {
      const payload = await getSymbols()
      setSymbols(normalizeSymbolsResponse(payload))
      setWatchlists(Object.keys(payload?.watchlists || {}).sort())
      if (!quiet) toast.success("Symbol registry refreshed.")
    } catch (error) {
      toast.error(toUserMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const payload = await getRuntimeMetrics()
      setMetrics(payload)
    } catch {
      setMetrics((current) => current)
    }
  }, [])

  useEffect(() => {
    fetchSymbols({ quiet: true })
    fetchMetrics()
    const interval = window.setInterval(() => {
      fetchSymbols({ quiet: true })
      fetchMetrics()
    }, 10_000)
    return () => window.clearInterval(interval)
  }, [fetchMetrics, fetchSymbols])

  useEffect(() => {
    let closedByEffect = false

    function connect() {
      const apiKey = getStoredApiKey()
      if (!apiKey) {
        setWebsocketStatus("DISCONNECTED")
        return
      }

      setWebsocketStatus("CONNECTING")
      const ws = new WebSocket(buildLiveWebSocketUrl())
      wsRef.current = ws

      ws.onopen = () => setWebsocketStatus("LIVE")
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === "tick" && payload.symbol) {
            const symbol = String(payload.symbol).toUpperCase()
            setLiveSymbols((current) => {
              const next = new Set(current)
              next.add(symbol)
              return next
            })
            setLastTickTime(Date.now() / 1000)
          }
          if (payload.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", ts: Date.now() / 1000 }))
          }
        } catch {
          // Ignore non-JSON websocket frames from diagnostics.
        }
      }
      ws.onerror = () => setWebsocketStatus("DISCONNECTED")
      ws.onclose = () => {
        if (closedByEffect) return
        setWebsocketStatus("DISCONNECTED")
        reconnectTimer.current = window.setTimeout(connect, 3_000)
      }
    }

    connect()

    return () => {
      closedByEffect = true
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [apiKeyDraft])

  const instrumentTypes = useMemo(
    () => [...new Set(symbols.map((item) => item.instrument_type).filter(Boolean))].sort(),
    [symbols],
  )

  const filteredSymbols = useMemo(() => {
    const query = search.trim().toLowerCase()
    return symbols.filter((item) => {
      const matchesSearch =
        !query ||
        [item.symbol, item.exchange, item.instrument_type, item.token, item.watchlist]
          .join(" ")
          .toLowerCase()
          .includes(query)
      const matchesWatchlist = watchlist === "all" || item.watchlist.split(", ").includes(watchlist)
      const matchesInstrument = instrumentType === "all" || item.instrument_type === instrumentType
      return matchesSearch && matchesWatchlist && matchesInstrument
    })
  }, [instrumentType, search, symbols, watchlist])

  async function handleAddSymbol(payload) {
    setAdding(true)
    try {
      const response = await addSymbol(payload)
      const subscription = response?.subscription
      if (subscription?.duplicate) {
        toast.warning(`${payload.symbol} already exists. Duplicate subscription prevented.`)
      } else {
        toast.success(`${payload.symbol} added and subscription requested.`)
      }
      await fetchSymbols({ quiet: true })
      await fetchMetrics()
    } catch (error) {
      toast.error(toUserMessage(error))
      throw error
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveSymbol(item) {
    const symbol = item.symbol
    setRemovingSymbol(symbol)
    setSymbols((current) => current.filter((row) => row.symbol !== symbol))
    try {
      await removeSymbol({ symbol, exchange: item.exchange })
      setLiveSymbols((current) => {
        const next = new Set(current)
        next.delete(symbol)
        return next
      })
      toast.success(`${symbol} removed from active subscriptions.`)
      await fetchSymbols({ quiet: true })
      await fetchMetrics()
    } catch (error) {
      toast.error(toUserMessage(error))
      await fetchSymbols({ quiet: true })
    } finally {
      setRemovingSymbol("")
    }
  }

  function saveApiKey() {
    setStoredApiKey(apiKeyDraft)
    toast.success("API key saved for this browser.")
  }

  return (
    <main className="terminal-grid min-h-screen p-4 text-terminal-text md:p-6">
      <Toaster richColors theme="dark" position="top-right" />

      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-[12px] border border-terminal-line bg-terminal-panel p-5 shadow-terminal lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-terminal-teal/30 bg-terminal-teal/15 p-2 text-terminal-teal">
                <ShieldCheck aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal text-terminal-text md:text-3xl">
                  Symbol Management Dashboard
                </h1>
                <p className="text-sm text-terminal-muted">
                  Runtime subscription control for the FastAPI primary-writer market data platform.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <StatusBadge status={websocketStatus} />
            <div className="flex min-w-0 items-center gap-2">
              <KeyRound className="shrink-0 text-terminal-muted" aria-hidden="true" />
              <Input
                type="password"
                value={apiKeyDraft}
                onChange={(event) => setApiKeyDraft(event.target.value)}
                placeholder="X-API-Key"
                className="w-full md:w-64"
                aria-label="API key"
              />
              <Button type="button" variant="secondary" onClick={saveApiKey}>
                Save
              </Button>
            </div>
          </div>
        </header>

        <MetricsPanel
          metrics={metrics}
          symbolsCount={symbols.length}
          websocketStatus={websocketStatus}
          lastTickTime={lastTickTime}
        />

        <Card>
          <CardHeader className="flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Runtime Controls</CardTitle>
              <CardDescription>
                Add, filter, and remove live symbols without restarting FastAPI.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => fetchSymbols()} disabled={loading}>
                <RefreshCcw data-icon="inline-start" aria-hidden="true" />
                {loading ? "Refreshing" : "Refresh"}
              </Button>
              <AddSymbolModal watchlists={watchlists} onSubmit={handleAddSymbol} busy={adding} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SearchBar
              search={search}
              setSearch={setSearch}
              watchlist={watchlist}
              setWatchlist={setWatchlist}
              instrumentType={instrumentType}
              setInstrumentType={setInstrumentType}
              watchlists={watchlists}
              instrumentTypes={instrumentTypes}
            />
            <Separator />
            <div className="flex flex-wrap items-center gap-3 text-xs text-terminal-muted">
              <span>{filteredSymbols.length} visible</span>
              <span>{liveSymbols.size} symbols have live ticks in this browser session</span>
              <span>{metrics?.queue_depth ?? 0} runtime queue depth</span>
            </div>
          </CardContent>
        </Card>

        <SymbolTable
          symbols={filteredSymbols}
          liveSymbols={liveSymbols}
          websocketStatus={websocketStatus}
          onRemove={handleRemoveSymbol}
          removingSymbol={removingSymbol}
        />
      </div>
    </main>
  )
}