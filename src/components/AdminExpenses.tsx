import React, { useState } from "react";
import { Plus, Trash, Edit3, DollarSign, Calendar, Tag, Sparkles, AlertCircle, X, Check } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Expense } from "../types";

interface AdminExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  onUpdateExpense?: (id: string, expense: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminExpenses({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense, lang, t }: AdminExpensesProps) {
  const isBng = lang === "bn";
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("Rent & Electricity");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit state
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

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

  const startEdit = (exp: Expense) => {
    setEditingExp(exp);
    setEditDesc(exp.description);
    setEditAmount(exp.amount);
    setEditCategory(exp.category || "Rent & Electricity");
    setEditDate(exp.date || new Date().toISOString().split("T")[0]);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !onUpdateExpense || !editDesc || editAmount <= 0) return;

    await onUpdateExpense(editingExp.id, {
      description: editDesc,
      amount: editAmount,
      category: editCategory,
      date: editDate
    });
    setEditingExp(null);
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
                    <td className="p-3 text-right font-mono font-bold text-rose-600">₹ {(exp.amount || 0).toLocaleString()}</td>
                    <td className="p-3 text-center flex items-center justify-center gap-1.5">
                      {onUpdateExpense && (
                        <button
                          onClick={() => startEdit(exp)}
                          className="p-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition cursor-pointer"
                          title={isBng ? "সম্পাদনা করুন" : "Edit Entry"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer"
                        title={isBng ? "মুছে ফেলুন" : "Delete Entry"}
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

      {/* Edit Expense Modal */}
      {editingExp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                {isBng ? "খরচের এন্ট্রি সম্পাদনা করুন" : "Edit Expense Entry"}
              </h4>
              <button
                onClick={() => setEditingExp(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খরচের খাত" : "Category"}</label>
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="Rent & Electricity">Rent & Electricity</option>
                  <option value="Labor & Staff Salary">Labor & Staff Salary</option>
                  <option value="Spares Procurement">Spares Procurement</option>
                  <option value="Tools & Scanners">Tools & Scanners</option>
                  <option value="Home Service Transport">Home Service Transport</option>
                  <option value="Tea & Refreshments">Tea & Refreshments</option>
                  <option value="Marketing & Postings">Marketing & Postings</option>
                  <option value="Other Misc">Other Misc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খরচের বিবরণ" : "Description"}</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.thAmount} (₹)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.thDate}</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  {isBng ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isBng ? "আপডেট করুন" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
