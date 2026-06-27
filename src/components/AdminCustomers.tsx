import React, { useState } from "react";
import { Search, Plus, User, MapPin, Phone, History, CreditCard, Sparkles, X, CheckCircle2 } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Customer } from "../types";

interface AdminCustomersProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, "id">) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminCustomers({ customers, onAdd, lang, t }: AdminCustomersProps) {
  const isBng = lang === "bn";
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setVehicleDetails("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    await onAdd({
      name,
      phone,
      address: address || "Ashoknagar, North 24 Parganas, West Bengal",
      vehicleDetails: vehicleDetails || "E-Cycle / General EV",
      serviceHistory: [],
      paymentHistory: [],
      emiRecords: []
    });
    setIsAdding(false);
    resetForm();
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div id="admin-customers-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secCustomers}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "আপনার ওয়ার্কশপের নিবন্ধিত গ্রাহক খাতা এবং সার্ভিস হিস্ট্রি" : "Search clients, view past services, outstanding payments, and profile catalogs"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setSelectedCustomerId(null); resetForm(); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnAddNewCustomer}
          </button>
        )}
      </div>

      {/* Customer Add Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.btnAddNewCustomer}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Joydeb Das" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phoneNumber}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 9830000000" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গ্রাহকের ঠিকানা" : "Customer Address"}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ashoknagar Power House Road, Baghajatin Playground" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গ্রাহকের স্কুটার / বাহন বিবরণ" : "Client Scooter/Vehicle Detail"}</label>
              <input type="text" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} placeholder="e.g. Sudipta Glide S1 / LFP 60V" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="px-5 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
              {t.closeButton}
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer">
              {t.submitButton}
            </button>
          </div>
        </form>
      )}

      {/* Main Directory & Detail split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Customers Search & List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 space-y-4 lg:col-span-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder={isBng ? "কাস্টমার খুঁজুন (নাম বা ফোন)..." : "Search Name or Mobile..."}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">{isBng ? "কোনো কাস্টমার খুঁজে পাওয়া যায়নি।" : "No customer found."}</p>
            ) : (
              filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomerId(c.id); setIsAdding(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedCustomerId === c.id
                      ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-bold text-xs text-slate-800 truncate">{c.name}</h5>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{c.phone}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Customer Complete Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden animate-fade-in">
              {/* Profile banner */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center md:items-start gap-5 relative">
                <div className="w-20 h-20 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                  <User className="w-10 h-10" />
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                  <h4 className="text-xl font-display font-bold tracking-tight">{selectedCustomer.name}</h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-mono">{selectedCustomer.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedCustomer.address}</span>
                    </span>
                  </div>
                  <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg w-fit mt-2 mx-auto md:mx-0">
                    {isBng ? "যানবাহন:" : "Vehicle:"} <strong>{selectedCustomer.vehicleDetails}</strong>
                  </div>
                </div>
              </div>

              {/* Service & Payment History tab grids */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100">
                {/* Service History */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    {isBng ? "সার্ভিসিং জব ও কার্যাবলী" : "Service & Maintenance History"}
                  </h5>
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {selectedCustomer.serviceHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">{isBng ? "কোনো অতীত সার্ভিস রেকর্ড নেই।" : "No past service records logged."}</p>
                    ) : (
                      selectedCustomer.serviceHistory.map((srv, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-700 leading-relaxed font-semibold">{srv}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Workorder Done</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    {isBng ? "পেমেন্ট ও রসিদ হিসেব" : "Payment & Cash Ledger"}
                  </h5>
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {selectedCustomer.paymentHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">{isBng ? "কোনো পেমেন্ট বিবরণ নেই।" : "No payment history found."}</p>
                    ) : (
                      selectedCustomer.paymentHistory.map((pay, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div>
                            <strong className="text-xs text-slate-700 block">{pay.purpose}</strong>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                              <span>{pay.date}</span>
                              <span>•</span>
                              <span>Method: {pay.method}</span>
                            </div>
                          </div>
                          <span className="font-mono text-emerald-600 font-bold text-xs">
                            + ₹ {pay.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm">{isBng ? "বিস্তারিত দেখতে বাঁদিকের কাস্টমার তালিকা থেকে যেকোনো একটি সিলেক্ট করুন।" : "Select any customer from the directory list on the left to inspect past history."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
