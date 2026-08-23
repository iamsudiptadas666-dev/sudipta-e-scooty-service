import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Building, ClipboardList, Layers, Download, Plus, X, Trash2 } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { ReportData, OfflineTransaction, Vehicle, Product } from "../types";

interface AdminReportsProps {
  report: ReportData | null;
  onFilterChange: (startDate?: string, endDate?: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
  vehicles?: Vehicle[];
  products?: Product[];
}

export default function AdminReports({ report, onFilterChange, lang, t, vehicles = [], products = [] }: AdminReportsProps) {
  const isBng = lang === "bn";
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<Partial<OfflineTransaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    amount: 0,
    description: '',
    customerName: ''
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
      console.log("AdminReports: Initializing, fetching offline transactions...");
      fetchOffline();
  }, []);

  const fetchOffline = async () => {
      try {
        const res = await fetch("/api/offline-transactions");
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData)) {
            setOfflineTransactions(serverData);
          }
        }
      } catch (err) {
        console.error("AdminReports: Error fetching offline transactions", err);
      }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/offline-transactions/${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setConfirmDeleteId(null);
        setOfflineTransactions(prev => prev.filter(t => t.id !== id));
        await fetchOffline();
        await onFilterChange();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert("Failed to delete entry: " + (errorData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("AdminReports: Network error during delete:", err);
      alert("Network error while deleting entry.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTransaction,
        id: "ot_" + Date.now()
      };
      const res = await fetch("/api/offline-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedData = await res.json();
        setOfflineTransactions(prev => [savedData, ...prev.filter(t => t.id !== savedData.id)]);
        setShowModal(false);
        fetchOffline();
        onFilterChange();
        setNewTransaction({
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          amount: 0,
          description: '',
          customerName: ''
        });
      }
    } catch (err) {
      console.error("Failed to save offline transaction", err);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = now;

    if (value === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (value === "last30Days") {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
    } else if (value === "currentYear") {
      start = new Date(now.getFullYear(), 0, 1);
    }

    onFilterChange(start?.toISOString(), end?.toISOString());
  };

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 italic">
        Loading ERP report logs...
      </div>
    );
  }

  const { financialSummary, revenueItems, expenses, emiSummary } = report;
  const isProfit = financialSummary.netProfit >= 0;

  const calculatedAssetValue = useMemo(() => {
    const vVal = (vehicles || []).filter((v: any) => !v.isDeleted && v.status !== 'deleted').reduce((sum, v: any) => {
      const qty = Number(v.stockQuantity || v.stock || 0);
      const cost = Number(v.costPrice || v.purchasePrice || v.buyPrice || v.offerPrice || v.price || 0);
      return sum + (qty * cost);
    }, 0);

    const pVal = (products || []).filter((p: any) => !p.isDeleted && p.status !== 'deleted').reduce((sum, p: any) => {
      const qty = Number(p.stock || p.stockQuantity || 0);
      const cost = Number(p.costPrice || p.purchasePrice || p.buyPrice || Math.round((p.price || p.offerPrice || 0) * 0.7) || 0);
      return sum + (qty * cost);
    }, 0);

    return vVal + pVal;
  }, [vehicles, products]);

  const inventoryAssetValuation = (financialSummary?.inventoryAssetValue && financialSummary.inventoryAssetValue > 0)
    ? financialSummary.inventoryAssetValue
    : calculatedAssetValue;

  const downloadReport = () => {
    // Basic CSV download
    const csv = [
        ["Date", "Customer", "Type", "Item", "Amount"],
        ...revenueItems.map(item => [item.date, item.customer, item.type, item.item, item.amount])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${filter}_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div id="admin-reports-view" className="space-y-8 animate-fade-in">
      {/* Financial Statement Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secReports}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "আপনার সুদীপ্ত ই-স্কুটি সার্ভিসের লাভ-ক্ষতি খাতা, মজুদ মালের বাজার মূল্য এবং ট্যাক্স স্টেটমেন্ট" : "Consolidated income ledgers, warehouse asset valuations, and audit-ready fiscal summaries"}
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200">
                <Plus className="w-3 h-3" /> Add Offline Entry
            </button>
            <select value={filter} onChange={(e) => handleFilterChange(e.target.value)} className="text-xs p-2 rounded-lg border border-slate-200">
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="currentYear">Current Year</option>
            </select>
            <button onClick={downloadReport} className="flex items-center gap-1 p-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                <Download className="w-3 h-3" /> Report
            </button>
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
          style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1000 }}
        >
          {/* Transparent click-to-close backdrop area that avoids viewport jumps */}
          <div className="absolute inset-0 bg-transparent cursor-pointer" onClick={() => setShowModal(false)}></div>
          
          <form 
            onSubmit={handleSubmit} 
            className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative z-[1001] animate-fade-in border border-slate-100/80"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h4 className="font-bold text-slate-800 text-sm">Add Offline Entry</h4>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
            </div>
            <select value={newTransaction.type} onChange={e => setNewTransaction({...newTransaction, type: e.target.value as 'income'|'expense'})} className="w-full p-2 border rounded-lg text-xs">
                <option value="income">Income / Sale</option>
                <option value="expense">Expense</option>
            </select>
            <input type="text" placeholder="Description" required value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="w-full p-2 border rounded-lg text-xs" />
            <input type="number" placeholder="Amount" required value={newTransaction.amount || ""} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} className="w-full p-2 border rounded-lg text-xs" />
            <input type="date" required value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="w-full p-2 border rounded-lg text-xs" />
            <input type="text" placeholder="Customer Name (for income)" value={newTransaction.customerName} onChange={e => setNewTransaction({...newTransaction, customerName: e.target.value})} className="w-full p-2 border rounded-lg text-xs" />
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Submit</button>
          </form>
        </div>
      )}

      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {(financialSummary.totalRevenue || 0).toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1.5">Sum of Orders + Payments + Cash Flow</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenditures</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {(financialSummary.totalExpense || 0).toLocaleString()}</span>
          <span className="text-[10px] text-rose-500 font-medium block mt-1.5">Expenses module + Spare Parts costs</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Business Profit</span>
            <div className={`p-2 rounded-lg ${isProfit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-2xl font-mono font-bold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
            ₹ {(financialSummary.netProfit || 0).toLocaleString()}
          </span>
          <span className={`text-[10px] font-medium block mt-1.5 ${isProfit ? "text-emerald-600" : "text-rose-500"}`}>
            {isProfit ? "Net Profit = Sales Revenue - Expenditures" : "Deficit: Sales Revenue - Expenditures"}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Asset Value</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {(inventoryAssetValuation || 0).toLocaleString()}</span>
          <span className="text-[10px] text-indigo-600 font-medium block mt-1.5">Sum of (Stock Qty × Unit Cost Price)</span>
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
                  + ₹ {(item.amount || 0).toLocaleString()}
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
                  <span className="font-mono font-bold text-rose-600 block">₹ {(emi.due || 0).toLocaleString()} Due</span>
                  <span className="text-[9px] text-slate-400 font-mono">Paid ₹{emi.paid} / ₹{emi.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Offline Ledger */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4 lg:col-span-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Offline Ledger</h4>
            <p className="text-[10px] text-slate-400">Manual sales and expense entries</p>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                  <thead><tr className="text-slate-400 border-b border-slate-100">
                      <th className="p-2">Date</th><th className="p-2">Type</th><th className="p-2">Description</th><th className="p-2">Amount</th><th className="p-2">Action</th>
                  </tr></thead>
                  <tbody>
                      {offlineTransactions.map(t => (
                          <tr key={t.id} className="border-b border-slate-50">
                              <td className="p-2">{t.date}</td>
                              <td className="p-2 capitalize">{t.type}</td>
                              <td className="p-2">{t.description}</td>
                              <td className="p-2 font-bold">{(t.amount || 0).toLocaleString()}</td>
                              <td className="p-2 relative">
                                  {confirmDeleteId === t.id ? (
                                      <div className="flex items-center gap-1">
                                          <button 
                                              onClick={() => handleDelete(t.id)}
                                              className="bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-rose-700"
                                          >
                                              Confirm
                                          </button>
                                          <button 
                                              onClick={() => setConfirmDeleteId(null)}
                                              className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-slate-300"
                                          >
                                              Cancel
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                          type="button"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log("AdminReports: Trash icon clicked for ID:", t.id);
                                              setConfirmDeleteId(t.id);
                                          }} 
                                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center group"
                                          title="Delete Entry"
                                      >
                                          <Trash2 className="w-4 h-4 group-active:scale-90 transition-transform" />
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
}
