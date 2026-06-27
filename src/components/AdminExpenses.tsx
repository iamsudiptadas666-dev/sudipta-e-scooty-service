import React, { useState } from "react";
import { Plus, Trash, DollarSign, Calendar, Tag, Sparkles, AlertCircle } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Expense } from "../types";

interface AdminExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminExpenses({ expenses, onAddExpense, onDeleteExpense, lang, t }: AdminExpensesProps) {
  const isBng = lang === "bn";
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("Rent & Electricity");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0) return;

    await onAddExpense({
      description: desc,
      amount,
      category,
      date
    });
    setDesc("");
    setAmount(0);
  };

  return (
    <div id="admin-expenses-view" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      {/* Log Expense Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 lg:col-span-1">
        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          {t.btnLogExpense}
        </h4>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খরচের খাত (Category)" : "Expense Category"}</label>
            <select
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Rent & Electricity">Rent & Electricity (ভাড়া ও বিদ্যুৎ বিল)</option>
              <option value="Labor & Staff Salary">Labor & Staff Salary (কারিগর বেতন)</option>
              <option value="Spares Procurement">Spares Procurement (পার্টস ক্রয় খরচ)</option>
              <option value="Tools & Scanners">Tools & Scanners (যন্ত্রপাতি ক্রয়)</option>
              <option value="Home Service Transport">Home Service Transport (যাতায়াত খরচ)</option>
              <option value="Tea & Refreshments">Tea & Refreshments (চা ও আপ্যায়ন)</option>
              <option value="Marketing & Postings">Marketing & Postings (ফেসবুক বিজ্ঞাপন)</option>
              <option value="Other Misc">Other Misc (অন্যান্য খরচ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খরচের বিবরণ" : "Expense Details"}</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Electric bill for workshop June 2026"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.thAmount} (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.thDate}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {isBng ? "খরচ এন্ট্রি করুন" : "Post Expense"}
          </button>
        </form>
      </div>

      {/* Expenses Ledger List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 lg:col-span-2 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.secExpenses}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{isBng ? "আপনার কর্মশালার দৈনিক বা মাসিক খরচসমূহের বিবরণী খাতা" : "Audit trail of shop consumables, tools, electric grids, and labor payout logs"}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3">{t.thDate}</th>
                <th className="p-3">Category</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">Amount (₹)</th>
                <th className="p-3 text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">No expenses recorded yet.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-[10px] text-slate-400">{exp.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider font-mono">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate font-medium text-slate-700" title={exp.description}>{exp.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">₹ {exp.amount.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
