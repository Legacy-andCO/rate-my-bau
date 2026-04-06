import { reportSnapshot, inventoryItems } from "@/src/data/mock/seedData";

export function getSalesToday() {
  return reportSnapshot.salesTodayCents;
}

export function getTopSellingItems() {
  return reportSnapshot.topSellingItems;
}

export function getLeastSellingItems() {
  return reportSnapshot.leastSellingItems;
}

export function getHourlySales() {
  return reportSnapshot.hourlyTraffic;
}

export function getInventoryAlerts() {
  return inventoryItems.filter((item) => item.quantity <= item.threshold);
}

export function getWeeklySalesComparison() {
  return {
    currentWeekCents: 2011200,
    previousWeekCents: 1844300,
    deltaPct: 9.05,
  };
}
