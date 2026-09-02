import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  Package,
  AlertTriangle,
  Flame,
  Shield,
  Activity,
  Compass,
  BarChart3,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CommandCenterDirectory } from "./CommandCenterDirectory";

export const AdminDashboard: React.FC = () => {
  const { products, orders, users, auditLogs, settings, setAdminView, activeRole } = useStore();
  const [dashboardMode, setDashboardMode] = useState<"directory" | "kpis" | "all">("all");

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled").length;

  const lowStockProducts = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5);
  const outOfStockProducts = products.filter((p) => p.totalStock <= 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Command Center Executive Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Command Center</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enterprise control center for catalog operations, warehouse logistics, orders & system governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setAdminView("reports")}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Reports</span>
            </button>
            <button
              onClick={() => setAdminView("products")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDashboardMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardMode === "all"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview & Directory
            </button>
            <button
              onClick={() => setDashboardMode("directory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardMode === "directory"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Command Directory Only
            </button>
            <button
              onClick={() => setDashboardMode("kpis")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardMode === "kpis"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              KPIs & Charts Only
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:block">
            Logged in as <strong className="text-slate-700 font-bold">{activeRole}</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-slate-500 text-xs font-medium">Total Revenue</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold font-mono text-slate-900">
                {settings.currencySymbol}{totalRevenue.toLocaleString()}
              </h3>
              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +12.4% ↑
              </span>
            </div>
          </div>

          <div className="stat-card">
            <p className="text-slate-500 text-xs font-medium">Pending Orders</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold font-mono text-slate-900">{pendingOrders}</h3>
              <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {pendingOrders} action required
              </span>
            </div>
          </div>

          <div className="stat-card">
            <p className="text-slate-500 text-xs font-medium">Delivered Orders</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold font-mono text-slate-900">{deliveredOrders}</h3>
              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +2.1% ↑
              </span>
            </div>
          </div>

          <div className="stat-card">
            <p className="text-slate-500 text-xs font-medium">Low Stock Items</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold font-mono text-rose-600">
                {lowStockProducts.length + outOfStockProducts.length}
              </h3>
              <span className="text-rose-600 text-xs font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Refill now
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Structured Category → Subcategory → Feature Command Center Directory */}
      {(dashboardMode === "all" || dashboardMode === "directory") && (
        <CommandCenterDirectory onSelectFeature={(view) => setAdminView(view)} />
      )}

      {/* Chart & Recent Orders Layout */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Overview Chart */}
          <div className="lg:col-span-2 stat-card flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Sales Performance Overview</span>
              </h4>
              <select className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 bg-slate-50 focus:outline-none">
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Year To Date</option>
              </select>
            </div>

            <div className="h-60 w-full flex items-end justify-between gap-3 pt-6 px-2 pb-2">
              {[
                { day: "Mon", val: 40, amt: 42000 },
                { day: "Tue", val: 65, amt: 68000 },
                { day: "Wed", val: 85, amt: 89000 },
                { day: "Thu", val: 55, amt: 58000 },
                { day: "Fri", val: 95, amt: 105000 },
                { day: "Sat", val: 75, amt: 79000 },
                { day: "Sun", val: 30, amt: 31000 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {settings.currencySymbol}{(bar.amt / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all duration-300 shadow-2xs"
                    style={{ height: `${bar.val}%` }}
                  ></div>
                  <span className="text-[11px] font-medium text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Side Widget */}
          <div className="stat-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Recent Orders</span>
              </h4>
              <button
                onClick={() => setAdminView("orders")}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((order, idx) => {
                const statusClass =
                  order.orderStatus === "Delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : order.orderStatus === "Pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700";

                return (
                  <div key={order.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-none last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400">{order.customerName}</p>
                      </div>
                    </div>
                    <span className={`status-pill ${statusClass}`}>{order.orderStatus}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats & Low Stock Grid */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Recent Administrative Activity
              </h3>
              <button onClick={() => setAdminView("audit-logs")} className="text-xs text-indigo-600 font-semibold hover:underline">
                Full Log
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{log.action}</span>
                      <span className="text-slate-400 text-[11px]">By {log.userName} ({log.userRole}) • {log.module}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Inventory Stock Warnings
              </h3>
              <button onClick={() => setAdminView("inventory")} className="text-xs text-indigo-600 font-semibold hover:underline">
                Inventory
              </button>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">All inventory stock levels are healthy.</p>
              ) : (
                lowStockProducts.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={prod.mainImage} alt={prod.name} className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200" />
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">{prod.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                      </div>
                    </div>

                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {prod.totalStock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

