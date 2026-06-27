import { TrendingUp, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Building, ClipboardList, Layers } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { ReportData } from "../types";

interface AdminReportsProps {
  report: ReportData | null;
  lang: Language;
  t: TranslationDict;
}

export default function AdminReports({ report, lang, t }: AdminReportsProps) {
  const isBng = lang === "bn";

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 italic">
        Loading ERP report logs...
      </div>
    );
  }

  const { financialSummary, revenueItems, expenses, emiSummary } = report;
  const isProfit = financialSummary.netProfit >= 0;

  return (
    <div id="admin-reports-view" className="space-y-8 animate-fade-in">
      {/* Financial Statement Overview */}
      <div>
        <h3 className="text-xl font-display font-semibold text-slate-800">{t.secReports}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isBng ? "আপনার সুদীপ্ত ই-স্কুটি সার্ভিসের লাভ-ক্ষতি খাতা, মজুদ মালের বাজার মূল্য এবং ট্যাক্স স্টেটমেন্ট" : "Consolidated income ledgers, warehouse asset valuations, and audit-ready fiscal summaries"}
        </p>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {financialSummary.totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1.5">Includes cash parts & deposits</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenditures</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {financialSummary.totalExpense.toLocaleString()}</span>
          <span className="text-[10px] text-rose-500 font-medium block mt-1.5">Consumables & labor wages</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Business Profit</span>
            <div className={`p-2 rounded-lg ${isProfit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-2xl font-mono font-bold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
            ₹ {financialSummary.netProfit.toLocaleString()}
          </span>
          <span className={`text-[10px] font-medium block mt-1.5 ${isProfit ? "text-emerald-600" : "text-rose-500"}`}>
            {isProfit ? "In overall surplus" : "Running in deficit"}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Asset Value</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {financialSummary.inventoryAssetValue.toLocaleString()}</span>
          <span className="text-[10px] text-indigo-600 font-medium block mt-1.5">Warehouse stock value cost</span>
        </div>
      </div>

      {/* Grid for Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chronological Entries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Incoming Cash Flow Logs</h4>
            <p className="text-[10px] text-slate-400">Chronological list of payments received</p>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {revenueItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <strong className="text-slate-800 block">{item.customer}</strong>
                  <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="uppercase font-bold text-indigo-600">{item.type}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600">
                  + ₹ {item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EMI Outstanding Balances */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Outstanding EMI Receivables</h4>
            <p className="text-[10px] text-slate-400">Summary of active battery & scooter loans</p>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {emiSummary.map((emi, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <strong className="text-slate-800 block">{emi.customer}</strong>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Asset: <span className="font-semibold text-slate-600">{emi.item}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600 block">₹ {emi.due.toLocaleString()} Due</span>
                  <span className="text-[9px] text-slate-400 font-mono">Paid ₹{emi.paid} / ₹{emi.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
