import { calculateChange, percentageOf } from "@/src/lib/money";

export function calculateOrderTotals(lines, { taxRate = 8, discountCents = 0 } = {}) {
  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const taxCents = percentageOf(Math.max(subtotalCents - discountCents, 0), taxRate);
  const totalCents = Math.max(subtotalCents - discountCents, 0) + taxCents;
  return { subtotalCents, taxCents, discountCents, totalCents };
}

export function validateCashPayment({ amountDueCents, moneyReceivedCents }) {
  const changeCents = calculateChange(amountDueCents, moneyReceivedCents);
  return {
    valid: changeCents >= 0,
    changeCents,
    error: changeCents < 0 ? "Money received is less than amount due." : null,
  };
}
