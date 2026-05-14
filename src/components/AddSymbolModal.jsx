import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const DEFAULT_FORM = {
  symbol: "",
  exchange: "NSE",
  instrument_type: "EQUITY",
  token: "",
  expiry: "",
  strike: "",
  option_type: "",
  watchlist_name: "default",
}

const EXCHANGES = ["NSE", "BSE", "NFO", "BFO", "INDICES"]
const INSTRUMENT_TYPES = ["EQUITY", "INDEX", "FUTURE", "OPTION", "ETF"]
const OPTION_TYPES = ["", "CE", "PE"]

export default function AddSymbolModal({ watchlists, onSubmit, busy }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  const watchlistOptions = useMemo(() => {
    const merged = new Set(["default", "production_nse", ...watchlists])
    return [...merged].filter(Boolean).sort()
  }, [watchlists])

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (!nextOpen) setForm(DEFAULT_FORM)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...form,
      symbol: form.symbol.trim().toUpperCase(),
      token: form.token.trim(),
      expiry: form.expiry.trim() || null,
      strike: form.strike ? Number(form.strike) : null,
      option_type: form.option_type || null,
    }
    await onSubmit(payload)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add Symbol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add runtime symbol</DialogTitle>
          <DialogDescription>
            Adds the symbol to the registry and requests a live Alice websocket subscription immediately.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Symbol" htmlFor="symbol">
              <Input
                id="symbol"
                value={form.symbol}
                onChange={(event) => updateField("symbol", event.target.value)}
                placeholder="RELIANCE"
                required
              />
            </Field>

            <Field label="Token" htmlFor="token">
              <Input
                id="token"
                value={form.token}
                onChange={(event) => updateField("token", event.target.value)}
                placeholder="2885"
                required
              />
            </Field>

            <Field label="Exchange">
              <Select value={form.exchange} onValueChange={(value) => updateField("exchange", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EXCHANGES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Instrument Type">
              <Select
                value={form.instrument_type}
                onValueChange={(value) => updateField("instrument_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {INSTRUMENT_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Expiry" htmlFor="expiry">
              <Input
                id="expiry"
                value={form.expiry}
                onChange={(event) => updateField("expiry", event.target.value)}
                placeholder="2026-05-28"
              />
            </Field>

            <Field label="Strike" htmlFor="strike">
              <Input
                id="strike"
                type="number"
                value={form.strike}
                onChange={(event) => updateField("strike", event.target.value)}
                placeholder="22500"
              />
            </Field>

            <Field label="Option Type">
              <Select value={form.option_type || "none"} onValueChange={(value) => updateField("option_type", value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
                    {OPTION_TYPES.filter(Boolean).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Watchlist">
              <Select value={form.watchlist_name} onValueChange={(value) => updateField("watchlist_name", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {watchlistOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {busy ? "Adding..." : "Add Symbol"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
