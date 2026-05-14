export function formatNumber(value?: number, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  const abs = Math.abs(value);

  // ============================================
  // INDIAN MARKET FORMAT
  // ============================================

  // Crores
  if (abs >= 1_00_00_000) {
    return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  }

  // Lakhs
  if (abs >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(1)}L`;
  }

  // Thousands
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return formatNumber(value, 0);
}

export function formatVolume(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  const abs = Math.abs(value);

  // ============================================
  // STRICT INDIAN VOLUME FORMAT
  // ============================================

  if (abs >= 1_00_00_000) {
    return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  }

  if (abs >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(1)}L`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toFixed(0);
}

export function formatPercent(value?: number, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(digits)}%`;
}

export function formatPrice(value?: number, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return formatNumber(value, digits);
}

export function formatTime(epoch?: number) {
  if (!epoch) {
    return "-";
  }

  // seconds vs milliseconds safety
  const millis =
    epoch > 10_000_000_000
      ? epoch
      : epoch * 1000;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(millis));
}

export function ageSeconds(epoch?: number) {
  if (!epoch) {
    return Infinity;
  }

  const millis =
    epoch > 10_000_000_000
      ? epoch
      : epoch * 1000;

  return Math.max(
    0,
    (Date.now() - millis) / 1000
  );
}

export function isStaleTick(
  epoch?: number,
  staleAfterSeconds = 10
) {
  return ageSeconds(epoch) > staleAfterSeconds;
}

export function getTickState(epoch?: number) {
  const age = ageSeconds(epoch);

  if (age <= 2) {
    return "LIVE";
  }

  if (age <= 10) {
    return "DELAYED";
  }

  return "STALE";
}
