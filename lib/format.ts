export function formatNumber(value?: number, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatTime(epoch?: number) {
  if (!epoch) return "-";
  const millis = epoch > 10_000_000_000 ? epoch : epoch * 1000;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(millis));
}

export function ageSeconds(epoch?: number) {
  if (!epoch) return Infinity;
  const millis = epoch > 10_000_000_000 ? epoch : epoch * 1000;
  return Math.max(0, (Date.now() - millis) / 1000);
}
