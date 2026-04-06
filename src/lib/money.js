export function parseMoneyInput(value) {
  if (typeof value === "number") return Math.round(value * 100);
  const normalized = String(value || "").replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function centsToCurrency(cents, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100);
}

export function calculateChange(amountDueCents, moneyReceivedCents) {
  return (moneyReceivedCents || 0) - (amountDueCents || 0);
}

export function percentageOf(baseCents, ratePercent) {
  return Math.round((baseCents * (ratePercent || 0)) / 100);
}
