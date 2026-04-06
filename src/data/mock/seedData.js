import { ROLES } from "@/src/modules/auth/permissions";

export const currentSession = {
  userId: "u_cashier_1",
  employeeId: "emp_1",
  role: ROLES.CASHIER,
  branchId: "branch_main",
  fullName: "Mia Clark",
};

export const categories = [
  { id: "cat_1", name: "Burgers" },
  { id: "cat_2", name: "Drinks" },
  { id: "cat_3", name: "Sides" },
];

export const menuItems = [
  { id: "item_1", categoryId: "cat_1", name: "Classic Burger", priceCents: 1199, isActive: true },
  { id: "item_2", categoryId: "cat_1", name: "Cheese Burger", priceCents: 1299, isActive: true },
  { id: "item_3", categoryId: "cat_2", name: "Cola", priceCents: 299, isActive: true },
  { id: "item_4", categoryId: "cat_3", name: "Fries", priceCents: 399, isActive: true },
];

export const inventoryItems = [
  { id: "inv_1", name: "Beef Patty", quantity: 95, unit: "pcs", threshold: 25 },
  { id: "inv_2", name: "Bun", quantity: 82, unit: "pcs", threshold: 30 },
  { id: "inv_3", name: "Cola Syrup", quantity: 12, unit: "L", threshold: 8 },
  { id: "inv_4", name: "Potatoes", quantity: 15, unit: "kg", threshold: 20 },
];

export const reportSnapshot = {
  salesTodayCents: 324500,
  ordersToday: 186,
  avgTicketCents: 1745,
  topSellingItems: [
    { name: "Classic Burger", qty: 98 },
    { name: "Fries", qty: 88 },
    { name: "Cola", qty: 77 },
  ],
  leastSellingItems: [
    { name: "Cheese Burger", qty: 14 },
    { name: "Sparkling Water", qty: 9 },
  ],
  salesByPayment: [
    { type: "cash", amountCents: 112300 },
    { type: "card", amountCents: 212200 },
  ],
  hourlyTraffic: [
    { hour: "10:00", orders: 9 },
    { hour: "11:00", orders: 18 },
    { hour: "12:00", orders: 36 },
    { hour: "13:00", orders: 44 },
    { hour: "14:00", orders: 31 },
  ],
};
