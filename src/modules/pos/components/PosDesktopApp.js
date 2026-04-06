"use client";

import { useMemo, useState } from "react";
import { categories, currentSession, inventoryItems, menuItems, reportSnapshot } from "@/src/data/mock/seedData";
import { centsToCurrency, parseMoneyInput } from "@/src/lib/money";
import { PERMISSIONS, ROLES, hasPermission } from "@/src/modules/auth/permissions";
import { calculateOrderTotals, validateCashPayment } from "@/src/modules/pos/services/orderService";
import {
  getHourlySales,
  getInventoryAlerts,
  getLeastSellingItems,
  getSalesToday,
  getTopSellingItems,
  getWeeklySalesComparison,
} from "@/src/modules/pos/services/reportingService";

const SCREENS = [
  { id: "cashier", label: "Cashier POS" },
  { id: "manager", label: "Manager Dashboard" },
  { id: "inventory", label: "Inventory" },
  { id: "menu", label: "Menu" },
  { id: "employees", label: "Attendance" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"];
const QUICK_CASH = [1000, 2000, 5000, 10000];

export function PosDesktopApp() {
  const [screen, setScreen] = useState("cashier");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("DINE_IN");
  const [discountCents, setDiscountCents] = useState(0);
  const [moneyReceived, setMoneyReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [roleView, setRoleView] = useState(currentSession.role);

  const filteredMenu = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    return menuItems.filter((item) => item.isActive && (!normalized || item.name.toLowerCase().includes(normalized)));
  }, [search]);

  const totals = useMemo(() => calculateOrderTotals(cart, { taxRate: 8, discountCents }), [cart, discountCents]);
  const moneyReceivedCents = parseMoneyInput(moneyReceived);
  const paymentState = validateCashPayment({ amountDueCents: totals.totalCents, moneyReceivedCents });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === item.id);
      if (existing) {
        return prev.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
      }
      return [...prev, { ...item, qty: 1, note: "", modifiers: [] }];
    });
  };

  const updateQty = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((line) => (line.id === itemId ? { ...line, qty: Math.max(0, line.qty + delta) } : line))
        .filter((line) => line.qty > 0)
    );
  };

  const completeOrder = () => {
    if (paymentMethod === "cash" && !paymentState.valid) return;
    alert(`Order completed. Change: ${centsToCurrency(paymentState.changeCents > 0 ? paymentState.changeCents : 0)}`);
    setCart([]);
    setMoneyReceived("");
    setDiscountCents(0);
  };

  return (
    <div className="pos-shell">
      <aside className="sidebar">
        <h1>BauPOS</h1>
        <p>Windows-first restaurant OS</p>
        <label>
          Role View
          <select value={roleView} onChange={(e) => setRoleView(e.target.value)}>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        {SCREENS.map((item) => (
          <button key={item.id} className={item.id === screen ? "active" : ""} onClick={() => setScreen(item.id)}>
            {item.label}
          </button>
        ))}
      </aside>

      <main className="content">
        {screen === "cashier" && (
          <section className="screen cashier-grid">
            <div className="card">
              <h2>Menu</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." />
              <div className="chips">{categories.map((category) => <span key={category.id}>{category.name}</span>)}</div>
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <button key={item.id} className="menu-item" onClick={() => addToCart(item)}>
                    <strong>{item.name}</strong>
                    <small>{centsToCurrency(item.priceCents)}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Order</h2>
              <div className="order-type-switch">
                {ORDER_TYPES.map((type) => (
                  <button key={type} onClick={() => setOrderType(type)} className={orderType === type ? "selected" : ""}>
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>
              <div className="cart-lines">
                {cart.length === 0 && <p className="muted">Add menu items to create an order.</p>}
                {cart.map((line) => (
                  <div key={line.id} className="line">
                    <div>
                      <strong>{line.name}</strong>
                      <small>{centsToCurrency(line.priceCents)}</small>
                    </div>
                    <div className="qty-actions">
                      <button onClick={() => updateQty(line.id, -1)}>-</button>
                      <span>{line.qty}</span>
                      <button onClick={() => updateQty(line.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <label>
                Discount
                <input value={(discountCents / 100).toString()} onChange={(e) => setDiscountCents(parseMoneyInput(e.target.value))} />
              </label>

              <div className="totals">
                <p><span>Subtotal</span><strong>{centsToCurrency(totals.subtotalCents)}</strong></p>
                <p><span>Tax</span><strong>{centsToCurrency(totals.taxCents)}</strong></p>
                <p><span>Discount</span><strong>-{centsToCurrency(totals.discountCents)}</strong></p>
                <p className="grand"><span>Total</span><strong>{centsToCurrency(totals.totalCents)}</strong></p>
              </div>

              <label>
                Payment Method
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </label>

              {paymentMethod === "cash" && (
                <div className="cash-box">
                  <label>
                    Amount Due
                    <input disabled value={centsToCurrency(totals.totalCents)} />
                  </label>
                  <label>
                    Money Received
                    <input value={moneyReceived} onChange={(e) => setMoneyReceived(e.target.value)} placeholder="0.00" />
                  </label>
                  <div className="quick-cash">
                    {QUICK_CASH.map((value) => (
                      <button key={value} onClick={() => setMoneyReceived((value / 100).toString())}>
                        {centsToCurrency(value)}
                      </button>
                    ))}
                  </div>
                  <p className={paymentState.valid ? "ok" : "error"}>
                    Change to Return: {centsToCurrency(paymentState.changeCents > 0 ? paymentState.changeCents : 0)}
                  </p>
                  {!paymentState.valid && <p className="error">{paymentState.error}</p>}
                </div>
              )}

              <button className="primary" onClick={completeOrder} disabled={paymentMethod === "cash" && !paymentState.valid}>
                Complete Order
              </button>
              <small className="muted">Suspend / split payment / receipt printing are wired with service placeholders.</small>
            </div>
          </section>
        )}

        {screen === "manager" && (
          <section className="screen">
            <h2>Manager Dashboard</h2>
            <div className="stats-grid">
              <article><span>Sales Today</span><strong>{centsToCurrency(getSalesToday())}</strong></article>
              <article><span>Orders Today</span><strong>{reportSnapshot.ordersToday}</strong></article>
              <article><span>Avg Ticket</span><strong>{centsToCurrency(reportSnapshot.avgTicketCents)}</strong></article>
              <article><span>Weekly Delta</span><strong>{getWeeklySalesComparison().deltaPct}%</strong></article>
            </div>
            <div className="panel-grid">
              <div className="card"><h3>Top Sellers</h3>{getTopSellingItems().map((item) => <p key={item.name}>{item.name} <strong>{item.qty}</strong></p>)}</div>
              <div className="card"><h3>Low Stock Alerts</h3>{getInventoryAlerts().map((item) => <p key={item.id}>{item.name} <strong>{item.quantity}{item.unit}</strong></p>)}</div>
            </div>
          </section>
        )}

        {screen === "inventory" && (
          <section className="screen card">
            <h2>Inventory</h2>
            {inventoryItems.map((item) => (
              <div key={item.id} className="table-row">
                <span>{item.name}</span>
                <span>{item.quantity} {item.unit}</span>
                <span>Threshold: {item.threshold}</span>
                <button disabled={!hasPermission(roleView, PERMISSIONS.INVENTORY_MANAGE)}>Adjust</button>
              </div>
            ))}
          </section>
        )}

        {screen === "menu" && (
          <section className="screen card">
            <h2>Menu Management</h2>
            {menuItems.map((item) => (
              <div key={item.id} className="table-row">
                <span>{item.name}</span>
                <span>{centsToCurrency(item.priceCents)}</span>
                <span>{item.isActive ? "Active" : "Inactive"}</span>
                <button disabled={!hasPermission(roleView, PERMISSIONS.MENU_MANAGE)}>Edit</button>
              </div>
            ))}
          </section>
        )}

        {screen === "employees" && (
          <section className="screen card">
            <h2>Employee Attendance</h2>
            <p>Clock in/out events, overtime, lateness, and edit trails are tracked in `employee_time_logs` + `audit_logs`.</p>
            <button>Clock In</button> <button>Clock Out</button>
          </section>
        )}

        {screen === "reports" && (
          <section className="screen card">
            <h2>Reports</h2>
            <h3>Hourly Traffic</h3>
            {getHourlySales().map((slot) => <p key={slot.hour}>{slot.hour}: {slot.orders} orders</p>)}
            <h3>Least Selling</h3>
            {getLeastSellingItems().map((item) => <p key={item.name}>{item.name}: {item.qty}</p>)}
          </section>
        )}

        {screen === "settings" && (
          <section className="screen card">
            <h2>Settings</h2>
            <p>Restaurant profile, taxes, receipt template, role policies, branch settings, delivery/AI integration config live here.</p>
            <div className="table-row"><span>Tax Rate</span><span>8%</span><button disabled={!hasPermission(roleView, PERMISSIONS.SETTINGS_MANAGE)}>Update</button></div>
            <div className="table-row"><span>Currency</span><span>USD</span><button disabled={!hasPermission(roleView, PERMISSIONS.SETTINGS_MANAGE)}>Update</button></div>
          </section>
        )}
      </main>
    </div>
  );
}
