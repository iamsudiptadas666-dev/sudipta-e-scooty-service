import React, { useState } from "react";
import { Plus, Check, Battery, User, ShieldCheck, DollarSign, Sparkles, X, Calculator, Calendar } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { EmiRecord, Customer } from "../types";

interface AdminEMIProps {
  emiRecords: EmiRecord[];
  customers: Customer[];
  onAddEMI: (record: Omit<EmiRecord, "id">) => Promise<void>;
  onRecordPayment: (emiId: string, amount: number, method: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminEMI({ emiRecords, customers, onAddEMI, onRecordPayment, lang, t }: AdminEMIProps) {
  const isBng = lang === "bn";
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEmiId, setSelectedEmiId] = useState<string | null>(null);

  // Form States for New Account
  const [customerId, setCustomerId] = useState("");
  const [assetName, setAssetName] = useState("Sudipta Premium LFP Battery 60V");
  const [totalPrice, setTotalPrice] = useState(32000);
  const [downPayment, setDownPayment] = useState(10000);
  const [months, setMonths] = useState(6);
  const [monthlyEmi, setMonthlyEmi] = useState(3666);
  const [nextDue, setNextDue] = useState("2026-07-10");

  // Payment popup state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("GPay");

  const handleCalculate = () => {
    const loan = Math.max(0, totalPrice - downPayment);
    if (loan <= 0) {
      setMonthlyEmi(0);
    } else {
      setMonthlyEmi(Math.round(loan / months));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerObj = customers.find(c => c.id === customerId);
    if (!customerObj) return;

    const remaining = totalPrice - downPayment;
    await onAddEMI({
      customerId,
      customerName: customerObj.name,
      customerPhone: customerObj.phone,
      batteryOrVehicleName: assetName,
      totalPrice,
      downPayment,
      monthlyEmi,
      remainingBalance: remaining,
      paidAmount: downPayment,
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
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmiId || paymentAmount <= 0) return;

    await onRecordPayment(selectedEmiId, paymentAmount, paymentMethod);
    setSelectedEmiId(null);
    setPaymentAmount(0);
  };

  return (
    <div id="admin-emi-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secEMI}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "গ্রাহকদের ইএমআই হিসাব খাতা, কিস্তি জমার হিসেব এবং বকেয়া লেজার" : "Record deposits, compute balances, log installments, and trace overdue accounts"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setSelectedEmiId(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnCreateEMIPlan}
          </button>
        )}
      </div>

      {/* Setup New Account */}
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
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
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
              <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.emiCalcDownPayment} (₹)</label>
              <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "কিস্তির মেয়াদ (মাস)" : "Tenure (Months)"}</label>
              <input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.emiCalcMonthlyEMI} (₹)</label>
              <input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-indigo-600" required />
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

      {/* Active Ledgers list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <th className="p-4 rounded-l-lg">{t.thCustomer}</th>
                <th className="p-4">Item Details</th>
                <th className="p-4 text-right">Total Price (₹)</th>
                <th className="p-4 text-right">Paid (₹)</th>
                <th className="p-4 text-right">Balance Due (₹)</th>
                <th className="p-4 text-center">Next Due</th>
                <th className="p-4 rounded-r-lg text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emiRecords.map((rec) => {
                const isPaidOff = rec.remainingBalance <= 0;
                return (
                  <tr key={rec.id} className={`hover:bg-slate-50/50 transition ${isPaidOff ? "bg-emerald-50/15" : ""}`}>
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
                    <td className="p-4 text-right font-mono font-medium">₹ {rec.totalPrice.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono font-medium text-emerald-600">₹ {rec.paidAmount.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono font-bold text-rose-600">
                      ₹ {rec.remainingBalance.toLocaleString()}
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
                    <td className="p-4 text-center">
                      {!isPaidOff && (
                        <button
                          onClick={() => { setSelectedEmiId(rec.id); setPaymentAmount(rec.monthlyEmi); }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition border border-indigo-200 cursor-pointer"
                        >
                          Record Installment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit Installment Popup */}
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
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
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
