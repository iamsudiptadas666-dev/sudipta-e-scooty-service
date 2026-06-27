import { TrendingUp, AlertTriangle, Battery, User, Wrench, FileText, Sparkles, Zap, ShieldAlert, MessageSquare } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { DashboardStats, Product, Vehicle, Enquiry } from "../types";

interface AdminDashboardProps {
  stats: DashboardStats;
  products: Product[];
  vehicles: Vehicle[];
  enquiries: Enquiry[];
  onNavigate: (section: string) => void;
  lang: Language;
  t: TranslationDict;
}

export default function AdminDashboard({ stats, products, vehicles, enquiries, onNavigate, lang, t }: AdminDashboardProps) {
  const isBng = lang === "bn";

  // Filter low stock
  const lowStockParts = products.filter(p => p.stock <= 5);
  const lowStockScooters = vehicles.filter(v => v.stockQuantity <= 2);
  const activeEnquiries = enquiries.filter(e => e.status === "New");

  return (
    <div id="admin-dashboard-view" className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-44 h-44 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full w-fit mb-3">
            <Zap className="w-3.5 h-3.5" />
            {isBng ? "ইআরপি লাইভ" : "ERP Systems Online"}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
            {isBng ? `স্বাগতম, ${t.ownerName}!` : `Welcome back, ${t.ownerName}!`}
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            {t.erpDashboardSubtitle}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">{t.statsTotalSales}</span>
            <span className="text-2xl font-mono font-bold text-slate-800 mt-1 block">₹ {stats.totalSales.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">{t.statsActiveEMI}</span>
            <span className="text-2xl font-mono font-bold text-slate-800 mt-1 block">{stats.activeEmiCount} Accounts</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Battery className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">{t.statsPendingBookings}</span>
            <span className="text-2xl font-mono font-bold text-slate-800 mt-1 block">{stats.pendingBookings} Active</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">{t.statsLowStock}</span>
            <span className="text-2xl font-mono font-bold text-slate-800 mt-1 block">{stats.lowStockCount} Alerts</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              {t.statsLowStock}
            </h3>
            <button
              onClick={() => onNavigate("spare_parts")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              {isBng ? "স্টক ম্যানেজ করুন →" : "Manage Spares →"}
            </button>
          </div>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {lowStockParts.length === 0 && lowStockScooters.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center italic">
                {isBng ? "সব পণ্য পর্যাপ্ত পরিমাণে স্টকে আছে।" : "All inventory stock levels are healthy!"}
              </p>
            ) : (
              <>
                {lowStockParts.map(part => (
                  <div key={part.id} className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div>
                      <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-mono mr-2">
                        {part.category}
                      </span>
                      <strong className="text-xs text-slate-700 block mt-1.5">{isBng ? part.titleBen : part.titleEng}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Stock Left</span>
                      <span className="font-mono font-bold text-rose-600 text-sm">{part.stock} Units</span>
                    </div>
                  </div>
                ))}
                {lowStockScooters.map(scooter => (
                  <div key={scooter.id} className="flex items-center justify-between p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono mr-2">
                        E-Scooter
                      </span>
                      <strong className="text-xs text-slate-700 block mt-1.5">{scooter.brand} {scooter.model}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Stock Left</span>
                      <span className="font-mono font-bold text-amber-600 text-sm">{scooter.stockQuantity} Units</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Live Leads / Enquiries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              {isBng ? "সাম্প্রতিক অনলাইন কাস্টমার অনুসন্ধান" : "Recent Showroom Leads"}
            </h3>
            <button
              onClick={() => onNavigate("enquiries")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              {isBng ? "সব লিড দেখুন →" : "View All Leads →"}
            </button>
          </div>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {activeEnquiries.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center italic">
                {isBng ? "কোনো নতুন অনুসন্ধান বকেয়া নেই।" : "No pending customer inquiries!"}
              </p>
            ) : (
              activeEnquiries.map(enq => (
                <div key={enq.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong className="text-sm text-slate-800">{enq.name}</strong>
                      <span className="text-xs text-slate-500 block">{enq.phone}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-mono">
                      {enq.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">"{enq.message}"</p>
                  <span className="text-[9px] text-slate-400 font-mono block mt-2 text-right">
                    {new Date(enq.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
