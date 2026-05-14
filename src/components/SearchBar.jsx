import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function SearchBar({
  search,
  setSearch,
  watchlist,
  setWatchlist,
  instrumentType,
  setInstrumentType,
  watchlists,
  instrumentTypes,
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" aria-hidden="true" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
          placeholder="Search symbol, token, exchange..."
          aria-label="Search symbols"
        />
      </label>

      <Select value={watchlist} onValueChange={setWatchlist}>
        <SelectTrigger aria-label="Filter by watchlist">
          <SelectValue placeholder="Watchlist" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All watchlists</SelectItem>
            {watchlists.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={instrumentType} onValueChange={setInstrumentType}>
        <SelectTrigger aria-label="Filter by instrument type">
          <SlidersHorizontal aria-hidden="true" />
          <SelectValue placeholder="Instrument type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All instruments</SelectItem>
            {instrumentTypes.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
