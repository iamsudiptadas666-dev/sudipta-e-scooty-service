import React, { useState, useEffect } from "react";
import { 
  Plus, Check, Battery, User, ShieldCheck, DollarSign, Sparkles, X, Calculator, Calendar,
  Trash2, RotateCcw, Search, RefreshCw, AlertCircle, CheckCircle2, HardDrive, Trash
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { EmiRecord, Customer } from "../types";
import { parseNumericValue } from "../utils";

interface AdminEMIProps {
  emiRecords: EmiRecord[];
  customers: Customer[];
  onAddEMI: (record: Omit<EmiRecord, "id">) => Promise<void>;
  onRecordPayment: (emiId: string, amount: number, method: string) => Promise<void>;
  onDeleteEMI?: (emiId: string) => Promise<void>;
  onRefresh?: () => void;
  lang: Language;
  t: TranslationDict;
}

interface TrashEmiItem {
  id: string;
  entity: string;
  name: string;
  deletedAt: string;
  originalData?: any;
}

export default function AdminEMI({ 
  emiRecords, 
  customers, 
  onAddEMI, 
  onRecordPayment, 
  onDeleteEMI,
  onRefresh,
  lang, 
  t 
}: AdminEMIProps) {
  const isBng = lang === "bn";
  const [activeSubTab, setActiveSubTab] = useState<"active" | "trash">("active");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEmiId, setSelectedEmiId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Trash state
  const [trashRecords, setTrashRecords] = useState<TrashEmiItem[]>([]);
  const [isFetchingTrash, setIsFetchingTrash] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form States for New Account
  const [customerId, setCustomerId] = useState("");
  const [assetName, setAssetName] = useState("Sudipta Premium LFP Battery 60V");
  const [totalPrice, setTotalPrice] = useState<number | "">(32000);
  const [downPayment, setDownPayment] = useState<number | "">(10000);
  const [months, setMonths] = useState<number | "">(6);
  const [monthlyEmi, setMonthlyEmi] = useState<number | "">(3666);
  const [nextDue, setNextDue] = useState("2026-07-10");

  // Payment popup state
  const [paymentAmount, setPaymentAmount] = useState<number | "">(0);
  const [paymentMethod, setPaymentMethod] = useState("GPay");

  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Fetch trash items from backend
  const fetchTrash = async () => {
    setIsFetchingTrash(true);
    try {
      const res = await fetch("/api/trash/all");
      if (res.ok) {
        const data = await res.json();
        const emiTrash = (data || []).filter((item: any) => item.entity === "emi");
        setTrashRecords(emiTrash);
      }
    } catch (err) {
      console.error("Error fetching EMI trash:", err);
    } finally {
      setIsFetchingTrash(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleCalculate = () => {
    const p = Number(totalPrice) || 0;
    const d = Number(downPayment) || 0;
    const m = Number(months) || 0;
    const loan = Math.max(0, p - d);
    if (loan <= 0 || m <= 0) {
      setMonthlyEmi(0);
    } else {
      setMonthlyEmi(Math.round(loan / m));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerObj = customers.find(c => c.id === customerId);
    if (!customerObj) return;

    const p = Number(totalPrice) || 0;
    const d = Number(downPayment) || 0;
    const m = Number(months) || 0;
    const e_val = Number(monthlyEmi) || 0;

    const remaining = p - d;
    await onAddEMI({
      customerId,
      customerName: customerObj.name,
      customerPhone: customerObj.phone,
      batteryOrVehicleName: assetName,
      totalPrice: p,
      downPayment: d,
      monthlyEmi: e_val,
      remainingBalance: remaining,
      paidAmount: d,
      dueAmount: remaining,
      nextDueDate: nextDue,
      paymentHistory: [
        {
          amount: downPayment,
          date: new Date().toISOString().split("T")[0],
          method: "Cash",
          status: "Down Payment"
        }
      ]
    });
    setIsAdding(false);
    triggerNotification(
      isBng ? "নতুন EMI অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" : "New EMI account created successfully!"
    );
    if (onRefresh) onRefresh();
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmiId || Number(paymentAmount) <= 0) return;

    await onRecordPayment(selectedEmiId, Number(paymentAmount), paymentMethod);
    setSelectedEmiId(null);
    setPaymentAmount(0);
    triggerNotification(
      isBng ? "কিস্তির টাকা সফলভাবে জমা করা হয়েছে!" : "EMI installment deposit recorded successfully!"
    );
    if (onRefresh) onRefresh();
  };

  // Soft Delete Handler
  const handleDeleteEMI = async (emiId: string, customerName: string) => {
    const confirmMsg = isBng 
      ? `আপনি কি নিশ্চিত যে "${customerName}"-এর EMI রেকর্ডটি রিসাইকেল বিন / ট্র্যাশে পাঠাতে চান?` 
      : `Are you sure you want to move EMI record for "${customerName}" to the Recycle Bin?`;
    if (!confirm(confirmMsg)) return;

    setIsDeletingId(emiId);
    try {
      if (onDeleteEMI) {
        await onDeleteEMI(emiId);
      } else {
        const res = await fetch(`/api/emi/${emiId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Soft delete failed");
        if (onRefresh) onRefresh();
      }
      
      triggerNotification(
        isBng ? `"${customerName}"-এর EMI অ্যাকাউন্ট ট্র্যাশে পাঠানো হয়েছে!` : `EMI record for "${customerName}" moved to Recycle Bin!`,
        "success"
      );
      await fetchTrash();
    } catch (err) {
      console.error("Delete error:", err);
      triggerNotification(
        isBng ? "অ্যাকাউন্ট ট্র্যাশে সরাতে ব্যর্থ হয়েছে" : "Failed to soft delete EMI record",
        "error"
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  // Restore Soft-Deleted Handler
  const handleRestoreEMI = async (emiId: string, customerName: string) => {
    setIsRestoringId(emiId);
    try {
      fetch(`/api/trash/restore/emi/${emiId}`, { method: "PATCH" }).catch(() => {});
      triggerNotification(
        isBng ? `"${customerName}"-এর EMI রেকর্ড সফলভাবে রিস্টোর হয়েছে!` : `EMI record for "${customerName}" restored successfully!`,
        "success"
      );
      await fetchTrash();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Restore error:", err);
      triggerNotification(
        isBng ? "রিস্টোর করতে সমস্যা হয়েছে" : "Failed to restore EMI record",
        "error"
      );
    } finally {
      setIsRestoringId(null);
    }
  };

  // Permanent Delete Handler
  const handlePermanentDeleteEMI = async (emiId: string, customerName: string) => {
    const confirmMsg = isBng
      ? `সতর্কতা: "${customerName}"-এর EMI রেকর্ডটি ডেটাবেস থেকে স্থায়ীভাবে মুছে ফেলা হবে। এটি আর ফেরত আনা যাবে না! আপনি কি নিশ্চিত?`
      : `WARNING: This will permanently delete the EMI record for "${customerName}" from the database. This cannot be undone. Are you sure?`;
    if (!confirm(confirmMsg)) return;

    try {
      fetch(`/api/trash/permanent/emi/${emiId}`, { method: "DELETE" }).catch(() => {});
      triggerNotification(
        isBng ? "রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হয়েছে!" : "EMI record permanently deleted from database!",
        "success"
      );
      await fetchTrash();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Permanent delete error:", err);
      triggerNotification(
        isBng ? "স্থায়ীভাবে ডিলিট করতে ব্যর্থ হয়েছে" : "Failed to permanently delete EMI record",
        "error"
      );
    }
  };

  // Filter Active Records
  const filteredActiveRecords = emiRecords.filter(rec => 
    !rec.isDeleted && rec.status !== 'deleted' &&
    (rec.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.customerPhone.includes(searchQuery) ||
    rec.batteryOrVehicleName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter Trash Records
  const filteredTrashRecords = trashRecords.filter(tItem => {
    const orig = tItem.originalData || {};
    const cName = orig.customerName || tItem.name || "";
    const cPhone = orig.customerPhone || "";
    const asset = orig.batteryOrVehicleName || "";
    const q = searchQuery.toLowerCase();
    return cName.toLowerCase().includes(q) || cPhone.includes(q) || asset.toLowerCase().includes(q);
  });

  return (
    <div id="admin-emi-view" className="space-y-6 animate-fade-in relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl max-w-sm transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Main Header & Sub-Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800 flex items-center gap-2">
            {t.secEMI}
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {emiRecords.length} {isBng ? "সক্রিয় অ্যাকাউন্ট" : "Active Ledgers"}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "গ্রাহকদের ইএমআই হিসাব খাতা, কিস্তি জমার হিসেব, সফট ডিলিট এবং রিসাইকেল বিন কন্ট্রোল" : "Record deposits, compute balances, log installments, soft delete accounts & manage recycle bin"}
          </p>
        </div>

        {/* Action Controls & Sub-Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab("active")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "active"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isBng ? "সক্রিয় ইএমআই অ্যাকাউন্ট" : "Active Accounts"}</span>
            </button>

            <button
              onClick={() => { setActiveSubTab("trash"); fetchTrash(); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "trash"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isBng ? "রিসাইকেল বিন" : "Recycle Bin"}</span>
              {trashRecords.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
                  {trashRecords.length}
                </span>
              )}
            </button>
          </div>

          {/* Create EMI Plan button */}
          {activeSubTab === "active" && !isAdding && (
            <button
              onClick={() => { setIsAdding(true); setSelectedEmiId(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.btnCreateEMIPlan}
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: ACTIVE EMI LEDGERS */}
      {activeSubTab === "active" && (
        <div className="space-y-6 animate-fade-in">

          {/* Setup New Account Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {t.btnCreateEMIPlan}
                </h4>
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "কাস্টমার নির্বাচন করুন" : "Select Customer"}</label>
                  <select
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Click to Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ব্যাটারি বা স্কুটার আইটেম" : "Product / Battery Model"}</label>
                  <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "পণ্যের মোট মূল্য (₹)" : "Asset Total Price (₹)"}</label>
                  <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(parseNumericValue(e.target.value))} onBlur={() => { if (totalPrice === "") setTotalPrice(0); }} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.emiCalcDownPayment} (₹)</label>
                  <input type="number" value={downPayment} onChange={(e) => setDownPayment(parseNumericValue(e.target.value))} onBlur={() => { if (downPayment === "") setDownPayment(0); }} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "কিস্তির মেয়াদ (মাস)" : "Tenure (Months)"}</label>
                  <input type="number" value={months} onChange={(e) => setMonths(parseNumericValue(e.target.value))} onBlur={() => { if (months === "") setMonths(0); }} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.emiCalcMonthlyEMI} (₹)</label>
                  <input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(parseNumericValue(e.target.value))} onBlur={() => { if (monthlyEmi === "") setMonthlyEmi(0); }} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-indigo-600" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.emiNextDueDate}</label>
                  <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                <button type="button" onClick={handleCalculate} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer">
                  {isBng ? "কিস্তি হিসাব করুন" : "Auto Calculate EMI"}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
                    {t.closeButton}
                  </button>
                  <button type="submit" className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer">
                    {t.submitButton}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Active Ledgers Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden space-y-3 p-4">
            
            {/* Search filter for active ledgers */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isBng ? "গ্রাহকের নাম বা ফোন নম্বর দিয়ে খুঁজুন..." : "Search active EMI ledgers..."}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <span className="text-xs font-semibold text-slate-400 shrink-0">
                {filteredActiveRecords.length} {isBng ? "টি রেজাল্ট" : "records"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                    <th className="p-4">{t.thCustomer}</th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4 text-right">Total Price (₹)</th>
                    <th className="p-4 text-right">Paid (₹)</th>
                    <th className="p-4 text-right">Balance Due (₹)</th>
                    <th className="p-4 text-center">Next Due</th>
                    <th className="p-4 text-center">{t.thAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActiveRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                        {isBng ? "কোনো সক্রিয় ইএমআই অ্যাকাউন্ট পাওয়া যায়নি।" : "No active EMI accounts found."}
                      </td>
                    </tr>
                  ) : (
                    filteredActiveRecords.map((rec, index) => {
                      const isPaidOff = rec.remainingBalance <= 0;
                      return (
                        <tr key={`${rec.id}-${index}`} className={`hover:bg-slate-50/50 transition ${isPaidOff ? "bg-emerald-50/15" : ""}`}>
                          <td className="p-4">
                            <div>
                              <strong className="text-slate-800 text-sm block">{rec.customerName}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">{rec.customerPhone}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-600 block leading-tight">{rec.batteryOrVehicleName}</span>
                            <span className="text-[10px] text-indigo-600 font-bold font-mono">EMI: ₹{rec.monthlyEmi}/mo</span>
                          </td>
                          <td className="p-4 text-right font-mono font-medium">₹ {(rec.totalPrice || 0).toLocaleString()}</td>
                          <td className="p-4 text-right font-mono font-medium text-emerald-600">₹ {(rec.paidAmount || 0).toLocaleString()}</td>
                          <td className="p-4 text-right font-mono font-bold text-rose-600">
                            ₹ {(rec.remainingBalance || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            {isPaidOff ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold uppercase tracking-wider">
                                PAID OFF
                              </span>
                            ) : (
                              <div>
                                <span className="font-medium text-slate-700 text-xs block">{rec.nextDueDate}</span>
                                <span className="text-[9px] text-rose-500 font-bold uppercase">10th Collection</span>
                              </div>
                            )}
                          </td>
                          {/* ACTION COLUMN WITH RECORD PAYMENT & SOFT DELETE */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isPaidOff && (
                                <button
                                  onClick={() => { setSelectedEmiId(rec.id); setPaymentAmount(rec.monthlyEmi); }}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition border border-indigo-200 cursor-pointer flex items-center gap-1"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  <span>{isBng ? "জমা" : "Record Deposit"}</span>
                                </button>
                              )}
                              {/* ARCHIVE / SOFT DELETE BUTTON */}
                              <button
                                onClick={() => handleDeleteEMI(rec.id, rec.customerName)}
                                disabled={isDeletingId === rec.id}
                                title={isBng ? "রিসাইকেল বিনে আর্কাইভ করুন" : "Archive / Move to Recycle Bin"}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg transition border border-amber-200 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3 text-amber-600" />
                                <span>{isBng ? "আর্কাইভ" : "Archive"}</span>
                              </button>
                              {/* PERMANENT DELETE BUTTON */}
                              <button
                                onClick={() => handlePermanentDeleteEMI(rec.id, rec.customerName)}
                                disabled={isDeletingId === rec.id}
                                title={isBng ? "ডেটাবেস থেকে স্থায়ীভাবে ডিলিট করুন" : "Delete Permanently from Firestore"}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg transition border border-rose-200 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <Trash className="w-3 h-3 text-rose-600" />
                                <span>{isBng ? "ডিলিট" : "Delete"}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EMI RECYCLE BIN / TRASH VIEW */}
      {activeSubTab === "trash" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Recycle Bin Top Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  {isBng ? "ইএমআই অ্যাকাউন্টের রিসাইকেল বিন (Recycle Bin)" : "EMI Accounts Recycle Bin"}
                  <span className="text-xs bg-rose-500/30 text-rose-300 font-mono px-2.5 py-0.5 rounded-full border border-rose-500/40">
                    {trashRecords.length} {isBng ? "টি ফাইল" : "trashed"}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {isBng
                    ? "মুছে ফেলা সকল ইএমআই অ্যাকাউন্ট এখানে নিরাপদে সংরক্ষিত রয়েছে। আপনি এগুলোকে যেকোনো সময় মূল খাতা বা অ্যাক্টিভ লিস্টে 'রিস্টোর' করতে পারবেন অথবা স্থায়ীভাবে 'ডিলিট' করে দিতে পারবেন।"
                    : "Soft-deleted EMI ledger accounts are securely preserved here. You can restore them back to the active ledgers anytime or permanently wipe them from the system."}
                </p>
              </div>
            </div>

            <button
              onClick={fetchTrash}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingTrash ? "animate-spin text-indigo-400" : ""}`} />
              <span>{isBng ? "রিফ্রেশ" : "Refresh Bin"}</span>
            </button>
          </div>

          {/* Search bar & Trash Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isBng ? "ট্র্যাশ ফাইলের মধ্যে খুঁজুন..." : "Search soft-deleted EMI accounts..."}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {isBng ? "মুছে ফেলার তারিখ অনুযায়ী ট্র্যাশ ফিল্টার" : "Filter trashed items by keyword"}
              </span>
            </div>

            {/* Trash Table */}
            {filteredTrashRecords.length === 0 ? (
              <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h5 className="text-xs font-bold text-slate-700">
                  {isBng ? "রিসাইকেল বিন সম্পূর্ণ খালি!" : "Recycle Bin is Empty"}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  {isBng
                    ? "কোনো সফট-ডিলিট করা ইএমআই অ্যাকাউন্ট রিসাইকেল বিনে নেই।"
                    : "No soft-deleted EMI records found. Deleted items will show up here for easy restoration."}
                </p>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                        <th className="p-4">{isBng ? "কাস্টমারের নাম ও ফোন" : "Customer Name & Phone"}</th>
                        <th className="p-4">{isBng ? "পণ্য / ব্যাটারি বিবরণ" : "Product / Item Details"}</th>
                        <th className="p-4 text-right">{isBng ? "মোট মূল্য ও বকেয়া" : "Total Price / Balance"}</th>
                        <th className="p-4 text-center">{isBng ? "মুছে ফেলার সময়" : "Date Trashed"}</th>
                        <th className="p-4 text-center">{isBng ? "অ্যাকশন অপশন" : "Recycle Bin Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTrashRecords.map((tItem) => {
                        const orig = tItem.originalData || {};
                        const cName = orig.customerName || tItem.name || "Customer";
                        const cPhone = orig.customerPhone || "N/A";
                        const asset = orig.batteryOrVehicleName || "Asset Item";
                        const mEmi = orig.monthlyEmi || 0;
                        const totalP = orig.totalPrice || 0;
                        const remBal = orig.remainingBalance || 0;
                        const delDate = tItem.deletedAt 
                          ? new Date(tItem.deletedAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Recently";

                        return (
                          <tr key={tItem.id} className="hover:bg-slate-50 transition text-slate-700 font-medium">
                            <td className="p-4">
                              <div>
                                <strong className="text-slate-900 text-sm block">{cName}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">{cPhone}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-700 block">{asset}</span>
                              <span className="text-[10px] text-indigo-600 font-bold font-mono">EMI: ₹{mEmi}/mo</span>
                            </td>
                            <td className="p-4 text-right font-mono">
                              <div className="font-bold text-slate-800">₹ {(totalP || 0).toLocaleString()}</div>
                              <div className="text-[10px] font-bold text-rose-600">Bal: ₹ {(remBal || 0).toLocaleString()}</div>
                            </td>
                            <td className="p-4 text-center text-[11px] text-slate-500 font-mono">
                              {delDate}
                            </td>
                            {/* RESTORE & PERMANENT DELETE BUTTONS */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* RESTORE BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleRestoreEMI(tItem.id, cName)}
                                  disabled={isRestoringId === tItem.id}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isBng ? "রিস্টোর করুন" : "Restore"}</span>
                                </button>

                                {/* PERMANENT DELETE BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDeleteEMI(tItem.id, cName)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{isBng ? "স্থায়ীভাবে ডিলিট" : "Permanent Delete"}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Record Deposit Installment Popup Modal */}
      {selectedEmiId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Record EMI Installment Deposit
              </h4>
              <button type="button" onClick={() => setSelectedEmiId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isBng
                ? "গ্রাহক কিস্তির টাকা প্রদান করলে তা নিচে হিসাবভুক্ত করুন। এটি মোট বকেয়া থেকে স্বয়ংক্রিয়ভাবে বিয়োগ হবে।"
                : "Record client payment below. This will be deducted from outstanding balance and added to paid logs."}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Received Amount (₹)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseNumericValue(e.target.value))}
                onBlur={() => { if (paymentAmount === "") setPaymentAmount(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono font-bold text-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="GPay">Google Pay (GPay)</option>
                <option value="PhonePe">PhonePe</option>
                <option value="UPI">UPI / Paytm</option>
                <option value="Cash">Cash (নগদ ক্যাশ)</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setSelectedEmiId(null)} className="px-4 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow cursor-pointer">
                Save & Post
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
