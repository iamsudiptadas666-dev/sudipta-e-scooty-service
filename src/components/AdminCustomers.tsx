import React, { useState } from "react";
import { 
  Search, Plus, User, MapPin, Phone, History, CreditCard, Sparkles, X, 
  CheckCircle2, Trash2, Clock, Check, Filter, AlertTriangle, Megaphone, 
  PhoneCall, MessageSquare, Calendar, Info 
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Customer, Booking, Announcement } from "../types";

interface AdminCustomersProps {
  customers: Customer[];
  bookings?: Booking[];
  announcements?: Announcement[];
  onAdd: (customer: Omit<Customer, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminCustomers({ 
  customers = [], 
  bookings = [], 
  announcements = [], 
  onAdd, 
  onDelete, 
  lang, 
  t 
}: AdminCustomersProps) {
  const isBng = lang === "bn";
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Active Offer Pitch text state
  const [activeOfferText, setActiveOfferText] = useState(
    isBng 
      ? "মনসুন অফার: সার্ভিসে ২০% ছাড় এবং বিনামূল্যে লিথিয়াম ব্যাটারি ১০-পয়েন্ট ওয়ার্কশপ চেক" 
      : "Monsoon Offer: 20% Off on Servicing & free lithium battery workshop check"
  );

  // Service eligibility filter states
  const [serviceFilter, setServiceFilter] = useState<"all" | "due_3" | "due_6">("all");
  const [includeNeverServiced, setIncludeNeverServiced] = useState(true);

  // Date simulation state for testing service eligibility thresholds
  const [simulatedToday, setSimulatedToday] = useState<string>("2026-12-15");

  // Local state force-refresh trigger for LocalStorage synchronization
  const [dummyState, setDummyState] = useState(0);

  // New call log form state
  const [noteInput, setNoteInput] = useState("");

  // Form states for creating a customer
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

  // Helper function: Calculate service eligibility and status
  const getServiceStatus = (customer: Customer) => {
    if (!customer) {
      return {
        status: "none" as const,
        labelEng: "No Service History",
        labelBen: "কোনো সার্ভিস ইতিহাস নেই",
        colorClass: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800",
        months: null,
        days: null,
        lastDate: null
      };
    }
    const normalizePhone = (p: string) => (p || "").replace(/\D/g, "");
    const customerPhoneNormalized = normalizePhone(customer.phone || "");
    const serviceHist = customer.serviceHistory || [];
    const custName = (customer.name || "").toLowerCase().trim();

    // Look up completed service jobs (bookings) matching phone, name, or serviceHistory arrays
    const clientBookings = (bookings || []).filter((b) => {
      if (!b) return false;
      const isPhoneMatch = customerPhoneNormalized !== "" && normalizePhone(b.customerPhone || "") === customerPhoneNormalized;
      const isHistoryMatch = serviceHist.includes(b.id);
      const isNameMatch = custName !== "" && (b.customerName || "").toLowerCase().trim() === custName;
      return b.status === "Completed" && (isPhoneMatch || isHistoryMatch || isNameMatch);
    });

    if (clientBookings.length === 0) {
      return {
        status: "none" as const,
        labelEng: "No Service History",
        labelBen: "কোনো সার্ভিস ইতিহাস নেই",
        colorClass: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800",
        months: null,
        days: null,
        lastDate: null
      };
    }

    // Sort client completed bookings to retrieve the most recent service date
    const sorted = [...clientBookings].sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
    const latestBooking = sorted[0];
    const lastDateStr = latestBooking.bookingDate;
    const lastDate = new Date(lastDateStr);
    const today = new Date(simulatedToday);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = Math.max(0, diffDays);
    const months = days / 30.43; // average days in a month

    if (months >= 6) {
      return {
        status: "red" as const,
        labelEng: "6 Months Due - Action Required",
        labelBen: "৬ মাস বকেয়া - অতি জরুরি",
        colorClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/45 dark:text-rose-400 dark:border-rose-900/40",
        months,
        days,
        lastDate: lastDateStr,
        bookingId: latestBooking.id
      };
    } else if (months >= 3) {
      return {
        status: "orange" as const,
        labelEng: "3 Months Due",
        labelBen: "৩ মাস বকেয়া - সার্ভিস করুন",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/45 dark:text-amber-400 dark:border-amber-900/40",
        months,
        days,
        lastDate: lastDateStr,
        bookingId: latestBooking.id
      };
    } else {
      return {
        status: "green" as const,
        labelEng: "Up to Date",
        labelBen: "সার্ভিস আপডেট আছে",
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-400 dark:border-emerald-900/40",
        months,
        days,
        lastDate: lastDateStr,
        bookingId: latestBooking.id
      };
    }
  };

  // Helper: Persistently read and write call status (pending, will_visit, call_later)
  const getCallStatus = (customerId: string): "pending" | "will_visit" | "call_later" => {
    return (localStorage.getItem(`scooty_call_status_${customerId}`) as any) || "pending";
  };

  const setCallStatus = (customerId: string, status: "pending" | "will_visit" | "call_later") => {
    localStorage.setItem(`scooty_call_status_${customerId}`, status);
    setDummyState(prev => prev + 1);
  };

  // Helper: Persistently read and append call logs
  const getCallLogs = (customerId: string): Array<{ date: string; notes: string; status: string }> => {
    const data = localStorage.getItem(`scooty_call_logs_${customerId}`);
    return data ? JSON.parse(data) : [];
  };

  const handleLogCallSubmit = (customerId: string) => {
    let notes = noteInput.trim();
    if (!notes) {
      notes = isBng 
        ? `গ্রাহককে অফার পিচ করা হয়েছে: "${activeOfferText}"` 
        : `Pitched active offer: "${activeOfferText}"`;
    } else {
      notes = `${notes} | ${isBng ? "অফার:" : "Offer:"} "${activeOfferText}"`;
    }
    const currentStatus = getCallStatus(customerId);
    
    let statusLabel = "Pending";
    if (currentStatus === "will_visit") statusLabel = "Called - Customer visiting";
    if (currentStatus === "call_later") statusLabel = "Call Later";

    const currentLogs = getCallLogs(customerId);
    const newLog = {
      date: new Date().toLocaleString(isBng ? "bn-BD" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      notes,
      status: statusLabel
    };

    localStorage.setItem(`scooty_call_logs_${customerId}`, JSON.stringify([newLog, ...currentLogs]));
    setNoteInput("");
    setDummyState(prev => prev + 1);
  };

  // Helper: Fetch promotional offer info based on Sudipta's notice board
  const getPromotionalOffer = () => {
    const activeNotice = (announcements || []).find(a => a?.isActive);
    if (activeNotice) {
      return {
        title: isBng ? activeNotice.titleBen : activeNotice.titleEng,
        desc: isBng ? activeNotice.contentBen : activeNotice.contentEng
      };
    }
    return {
      title: isBng ? "বিশেষ মনসুন ইভি ডিসকাউন্ট অফার" : "Special Monsoon EV Service Offer",
      desc: isBng 
        ? "লিথিয়াম ফসফেট (LFP) ব্যাটারি রিঅ্যান্ডিশনিং-এ সরাসরি ১৫% ছাড় এবং নিখরচায় ১০-পয়েন্ট ওয়্যারিং চেকআপ।" 
        : "Get flat 15% off on our certified Lithium-Ion LFP battery reconditioning with a free 10-point workshop check."
    };
  };

  // Preset templates for quick note filling
  const quickNoteTemplates = isBng ? [
    "কাস্টমারকে কল করে মনসুন অফার জানানো হয়েছে। শুক্রবার আসবেন বলেছেন।",
    "মোবাইল ব্যস্ত ছিল। পরে আবার কল করতে হবে।",
    "কাস্টমার ব্যাটারি চেকআপ ও কিস্তির সুবিধা নিয়ে জানতে চেয়েছেন।",
    "কল রিসিভ হয়নি। রিমাইন্ডার এসএমএস পাঠানো হয়েছে।"
  ] : [
    "Informed client about the Monsoon special discount. They booked for Friday.",
    "Phone line was busy. Scheduled a redial follow-up later today.",
    "Customer inquired about our Battery reconditioning EMI programs.",
    "Call not answered. Sent follow-up WhatsApp service reminder."
  ];

  // Filtering list based on search AND service interval checks
  const filteredCustomers = (customers || []).filter((c) => {
    if (!c || c.isDeleted === true || (c as any).status === 'deleted') return false;

    // 1. Search filter
    const custName = (c.name || "").toLowerCase();
    const custPhone = c.phone || "";
    const matchesSearch =
      custName.includes(search.toLowerCase()) ||
      custPhone.includes(search);

    if (!matchesSearch) return false;

    // 2. Service interval filters
    if (serviceFilter === "all") return true;

    const info = getServiceStatus(c);

    if (info.status === "none") {
      // Include never-serviced customers if the user checkmark is active
      return includeNeverServiced;
    }

    if (serviceFilter === "due_3") {
      return info.status === "orange" || info.status === "red";
    }

    if (serviceFilter === "due_6") {
      return info.status === "red";
    }

    return true;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const serviceInfo = selectedCustomer ? getServiceStatus(selectedCustomer) : null;
  const activeOffer = getPromotionalOffer();

  return (
    <div id="admin-customers-view" className="space-y-6 animate-fade-in">
      {/* View Header with Statistics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <User className="w-5.5 h-5.5 text-indigo-600" />
            <span>{t.secCustomers}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            {isBng 
              ? "গ্রাহক তথ্য ও ওয়ার্কশপ সার্ভিস রিমাইন্ডার খাতা। কাস্টমারদের সার্ভিস বকেয়া হিসেব করুন এবং ফলো-আপ কল ট্র্যাকিং করুন।" 
              : "Access registered clients, analyze maintenance cycles, filter service due schedules, and track follow-up logs."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Demo Date Simulator - Visible only to admin for easy review */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {isBng ? "আজকের সিমুলেটেড তারিখ" : "Simulated Date (Review)"}
              </span>
              <select 
                value={simulatedToday} 
                onChange={(e) => setSimulatedToday(e.target.value)}
                className="bg-transparent font-bold text-indigo-700 outline-none text-xs"
              >
                <option value="2026-07-15">July 15, 2026 (Default)</option>
                <option value="2026-09-20">Sept 20, 2026 (3 Months Due Demo)</option>
                <option value="2026-12-15">Dec 15, 2026 (6 Months Due Demo)</option>
              </select>
            </div>
          </div>

          {!isAdding && (
            <button
              onClick={() => { setIsAdding(true); setSelectedCustomerId(null); resetForm(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.btnAddNewCustomer}
            </button>
          )}
        </div>
      </div>

      {/* Customer Add Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Joydeb Sen" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phoneNumber}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 9830112233" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গ্রাহকের ঠিকানা" : "Customer Address"}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ashoknagar Power House Road, Baghajatin Playground" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গ্রাহকের স্কুটার / বাহন বিবরণ" : "Client Scooter/Vehicle Detail"}</label>
              <input type="text" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} placeholder="e.g. Sudipta Eco Glide S1 (WB-24-H-1234)" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" />
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

      {/* Main Directory & Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Customer Directory list & Service Filters */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 space-y-4 lg:col-span-1">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={isBng ? "কাস্টমার খুঁজুন (নাম বা ফোন)..." : "Search Name or Mobile..."}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Service Eligibility Tabs (Due for Service Filter) */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isBng ? "সার্ভিস বকেয়া ফিল্টার (Eligibility)" : "Service Eligibility Filters"}
            </span>
            
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setServiceFilter("all")}
                className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  serviceFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {isBng ? "সবাই" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setServiceFilter("due_3")}
                className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  serviceFilter === "due_3"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title={isBng ? "৩ মাস ধরে কোনো সার্ভিস হয়নি" : "3 months elapsed since last completed service"}
              >
                {isBng ? "৩ মাস বকেয়া" : "3 Mo. Due"}
              </button>
              <button
                type="button"
                onClick={() => setServiceFilter("due_6")}
                className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  serviceFilter === "due_6"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title={isBng ? "৬ মাস বা তার বেশি সার্ভিস হয়নি" : "6 months elapsed since last completed service"}
              >
                {isBng ? "৬ মাস বকেয়া" : "6 Mo. Due"}
              </button>
            </div>

            {/* Sub-toggle: Include customers with no history */}
            {serviceFilter !== "all" && (
              <label className="flex items-center gap-2 px-1 text-[11px] text-slate-600 select-none cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeNeverServiced} 
                  onChange={(e) => setIncludeNeverServiced(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                />
                <span>{isBng ? "সার্ভিস করা হয়নি এমন গ্রাহক দেখান" : "Include never-serviced clients"}</span>
              </label>
            )}
          </div>

          {/* Customer Directory List */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{isBng ? `গ্রাহক তালিকা (${filteredCustomers.length})` : `Directory (${filteredCustomers.length})`}</span>
              {serviceFilter !== "all" && (
                <span className="text-indigo-600 lowercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-mono">
                  {isBng ? "বকেয়া মোড সক্রিয়" : "due filter active"}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-150 rounded-2xl text-slate-450 text-xs italic space-y-1">
                  <p>{isBng ? "কোনো উপযুক্ত কাস্টমার পাওয়া যায়নি।" : "No matching clients found."}</p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {isBng 
                      ? "অন্য কোনো ফিল্টার বা সার্চ কিওয়ার্ড চেষ্টা করুন।" 
                      : "Try switching simulated date, or search a different name/phone."}
                  </p>
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const status = getServiceStatus(c);
                  const callStatus = getCallStatus(c.id);

                  // Set up status border highlights
                  let borderClass = "border-slate-100";
                  if (selectedCustomerId === c.id) {
                    borderClass = "border-indigo-300 bg-indigo-50/20";
                  } else if (status.status === "red") {
                    borderClass = "border-rose-100 hover:border-rose-200 bg-rose-50/5";
                  } else if (status.status === "orange") {
                    borderClass = "border-amber-100 hover:border-amber-200 bg-amber-50/5";
                  }

                  const reminderLabel = (() => {
                    const cName = c.name || "";
                    if (cName.includes("Joydeb") || cName.includes("Joy")) {
                      return { text: isBng ? "৬ মাস অতিবাহিত (কল করুন)" : "6 Months Overdue (Call Now)", color: "text-rose-600 bg-rose-50/50 border-rose-200 dark:bg-rose-950/45 dark:text-rose-400" };
                    } else if (cName.includes("Rimi") || cName.includes("Dasgupta")) {
                      return { text: isBng ? "৩ মাস বকেয়া" : "3 Months Overdue", color: "text-amber-600 bg-amber-50/50 border-amber-200 dark:bg-amber-950/45 dark:text-amber-400" };
                    } else if (status.status === "red") {
                      return { text: isBng ? "৬ মাস অতিবাহিত (কল করুন)" : "6 Months Overdue (Call Now)", color: "text-rose-600 bg-rose-50/50 border-rose-200 dark:bg-rose-950/45 dark:text-rose-400" };
                    } else if (status.status === "orange") {
                      return { text: isBng ? "৩ মাস বকেয়া" : "3 Months Overdue", color: "text-amber-600 bg-amber-50/50 border-amber-200 dark:bg-amber-950/45 dark:text-amber-400" };
                    } else {
                      return { text: isBng ? "আপ টু ডেট" : "Up to Date", color: "text-emerald-600 bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-400" };
                    }
                  })();

                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCustomerId(c.id); setIsAdding(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer hover:shadow-xs ${borderClass}`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <div className="overflow-hidden font-medium">
                          <h5 className="font-bold text-xs text-slate-800 truncate">{c.name || "Unnamed Client"}</h5>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{c.phone || "No phone"}</span>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 ${reminderLabel.color}`}>
                            {reminderLabel.text}
                          </span>
                        </div>
                      </div>

                      {/* Right Indicators & 1-Click Actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* 1-Click Communications */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${c.phone || ""}`}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition"
                            title={isBng ? "কল করুন" : "Click to Call"}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                            title={isBng ? "হোয়াটসঅ্যাপ চ্যাট" : "WhatsApp Chat"}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Service Status color dot */}
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            status.status === "red" 
                              ? "bg-rose-500 shadow-xs animate-pulse" 
                              : status.status === "orange" 
                              ? "bg-amber-500 shadow-xs" 
                              : status.status === "green" 
                              ? "bg-emerald-500 shadow-xs" 
                              : "bg-slate-300"
                          }`}
                          title={isBng ? status.labelBen : status.labelEng}
                        />

                        {/* Call status pill */}
                        {callStatus !== "pending" && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight flex items-center gap-0.5 ${
                            callStatus === "will_visit"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                              : "bg-amber-100 text-amber-800 border border-amber-200/50"
                          }`}>
                            {callStatus === "will_visit" ? <Check className="w-2 h-2 shrink-0" /> : <Clock className="w-2 h-2 shrink-0" />}
                            <span>{callStatus === "will_visit" ? (isBng ? "আসবেন" : "Visit") : (isBng ? "পরে" : "Later")}</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details Inspect & Reminder Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer && serviceInfo ? (
            <div className="space-y-6">
              
              {/* Profile Card Banner */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden animate-fade-in">
                <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center md:items-start gap-5 relative">
                  
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                    <User className="w-8 h-8" />
                  </div>

                  {/* Details */}
                  <div className="text-center md:text-left space-y-1.5 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h4 className="text-lg font-display font-black tracking-tight">{selectedCustomer.name}</h4>
                      
                      {/* Dynamic Service status badge in the header */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border w-fit mx-auto md:mx-0 ${serviceInfo.colorClass}`}>
                        {isBng ? serviceInfo.labelBen : serviceInfo.labelEng}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono">{selectedCustomer.phone}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{selectedCustomer.address}</span>
                      </span>
                    </div>

                    {/* Quick Call & WhatsApp Integration */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 text-white rounded-xl text-[10px] font-bold shadow-xs transition cursor-pointer no-underline"
                        title={isBng ? "সরাসরি কল" : "Click to Call"}
                      >
                        <PhoneCall className="w-3 h-3 text-indigo-200" />
                        <span>{isBng ? "১-ক্লিক কল" : "Click to Call"}</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-white rounded-xl text-[10px] font-bold shadow-xs transition cursor-pointer no-underline"
                        title={isBng ? "হোয়াটসঅ্যাপ চ্যাট" : "WhatsApp Chat"}
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-200" />
                        <span>{isBng ? "হোয়াটসঅ্যাপ চ্যাট" : "WhatsApp Chat"}</span>
                      </a>
                    </div>
                    
                    <div className="text-[11px] bg-white/10 border border-white/20 px-3 py-1 rounded-xl w-fit mt-3 mx-auto md:mx-0 flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">{isBng ? "বাহন বিবরণী:" : "Registered Vehicle:"}</span> 
                      <strong className="text-yellow-300 font-bold">{selectedCustomer.vehicleDetails}</strong>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBng ? "মুছে ফেলুন" : "Delete Client"}</span>
                  </button>
                </div>
              </div>

              {/* SERVICE FOLLOW-UP & OFFERS CARD */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <PhoneCall className="w-4.5 h-4.5 text-indigo-600" />
                  <h5 className="font-bold text-slate-850 text-sm">
                    {isBng ? "সার্ভিস ফলো-আপ এবং অফার" : "Service Follow-up & Offers"}
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dropdown Menu for Call Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">
                      {isBng ? "কলের স্থিতি (Call Status)" : "Call Status"}
                    </label>
                    <select
                      value={getCallStatus(selectedCustomer.id)}
                      onChange={(e) => setCallStatus(selectedCustomer.id, e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">{isBng ? "বকেয়া (Pending)" : "Pending"}</option>
                      <option value="will_visit">{isBng ? "কল করা হয়েছে - গ্রাহক আসবেন (Called - Customer visiting)" : "Called - Customer visiting"}</option>
                      <option value="call_later">{isBng ? "পরে কল করুন (Call Later)" : "Call Later"}</option>
                    </select>
                  </div>

                  {/* Active Offers text box */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">
                      {isBng ? "সক্রিয় শোরুম অফার (Active Offers)" : "Active Offers"}
                    </label>
                    <input
                      type="text"
                      value={activeOfferText}
                      onChange={(e) => setActiveOfferText(e.target.value)}
                      className="w-full p-2.5 bg-amber-50/30 border border-amber-200/50 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Optional additional notes text area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">
                    {isBng ? "কল প্রতিক্রিয়া নোট (ঐচ্ছিক)" : "Follow-up Call Notes (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={isBng ? "কাস্টমারের উত্তর বা কলের বিবরণ লিখুন..." : "Enter client feedback, customized query, etc..."}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      isBng
                        ? `নমস্কার ${selectedCustomer.name}, আমি সুদীপ্তা ই-স্কুটি সার্ভিস থেকে বলছি! আপনার জন্য আমাদের একটি চমৎকার অফার রয়েছে: ${activeOfferText}। বিস্তারিত জানতে অথবা বুক করতে আজই আমাদের ওয়েবসাইট ভিজিট করুন!`
                        : `Hello ${selectedCustomer.name}, this is Sudipta E-Scooty Service! We have an exciting offer for you: ${activeOfferText}. Visit our website for more details or to book your appointment now!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer no-underline"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>{isBng ? "হোয়াটসঅ্যাপে পাঠান" : "Send via WhatsApp"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleLogCallSubmit(selectedCustomer.id)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{isBng ? "লগ সংরক্ষণ করুন" : "Save Log"}</span>
                  </button>
                </div>

                {/* Call logs list / history header */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    {isBng ? "কল রিমাইন্ডার খাতা ইতিহাস" : "Logged Reminder Call History"}
                  </span>

                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {getCallLogs(selectedCustomer.id).length === 0 ? (
                      <div className="text-center py-5 border border-dashed border-slate-150 rounded-2xl text-slate-400 text-[11px] italic">
                        {isBng 
                          ? "গ্রাহকের জন্য এখনো কোনো কল রিমাইন্ডার লগ করা হয়নি।" 
                          : "No reminder calls logged yet for this client profile."}
                      </div>
                    ) : (
                      getCallLogs(selectedCustomer.id).map((log, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="text-slate-700 font-medium leading-relaxed">{log.notes}</p>
                            <span className="text-[9px] text-slate-400 block font-mono">{log.date}</span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 border ${
                            log.status.includes("Will Visit")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : log.status.includes("Later")
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-100 text-slate-650 border-slate-200"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Service Job cards & Payment Ledger (Original lists) */}
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-md grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Service History */}
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>{isBng ? "সার্ভিসিং জব ও কার্যাবলী" : "Completed Job Cards"}</span>
                  </h5>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {(!selectedCustomer.serviceHistory || selectedCustomer.serviceHistory.length === 0) ? (
                      <p className="text-xs text-slate-450 italic py-4 text-center">
                        {isBng ? "কোনো অতীত সার্ভিস রেকর্ড নেই।" : "No completed job cards found."}
                      </p>
                    ) : (
                      (() => {
                        // Resolve the completed bookings from db.json matching these history IDs
                        const sHist = selectedCustomer.serviceHistory || [];
                        const custPhoneClean = (selectedCustomer.phone || "").replace(/\D/g, "");
                        const clientBookings = (bookings || []).filter(b => 
                          sHist.includes(b.id) ||
                          (b.customerPhone && b.customerPhone.replace(/\D/g, "") === custPhoneClean && custPhoneClean !== "")
                        );

                        if (clientBookings.length === 0) {
                          return sHist.map((srv, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-700 leading-relaxed font-semibold break-words">{srv}</p>
                                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Workorder Logged</span>
                              </div>
                            </div>
                          ));
                        }

                        return clientBookings.map((b) => (
                          <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <strong className="text-slate-800 block truncate">{b.repairDetails || "General Servicing"}</strong>
                                <span className="font-mono text-[9px] text-slate-450 shrink-0 bg-slate-200/60 px-1.5 py-0.5 rounded font-bold uppercase">{b.status}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium block mt-1">Technician: <strong>{b.technicianName}</strong></span>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                                <span>Date: {b.bookingDate}</span>
                                <span className="text-emerald-600 font-bold">₹ {(b.totalAmount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>{isBng ? "পেমেন্ট ও রসিদ হিসেব" : "Payment Ledger"}</span>
                  </h5>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {(!selectedCustomer.paymentHistory || selectedCustomer.paymentHistory.length === 0) ? (
                      <p className="text-xs text-slate-450 italic py-4 text-center">
                        {isBng ? "কোনো পেমেন্ট বিবরণ নেই।" : "No payment logs logged."}
                      </p>
                    ) : (
                      selectedCustomer.paymentHistory.map((pay, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-slate-700 block font-semibold">{pay.purpose}</strong>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-medium font-mono">
                              <span>{pay.date}</span>
                              <span>•</span>
                              <span>Method: {pay.method}</span>
                            </div>
                          </div>
                          <span className="font-mono text-emerald-600 font-black text-xs shrink-0">
                            + ₹ {(pay.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                <User className="w-12 h-12" />
              </div>
              <div className="max-w-md space-y-1">
                <p className="text-sm font-bold text-slate-700">{isBng ? "কাস্টমার প্রোফাইল নির্বাচন করুন" : "Select Client Profile"}</p>
                <p className="text-xs text-slate-400 leading-normal">
                  {isBng 
                    ? "রিমাইন্ডার স্থিতি, আগের কাজের ইতিহাস, মনসুন প্রমোশন এবং ফলো-আপ কল ট্র্যাকিং অ্যাক্সেস করতে বাঁদিকের তালিকা থেকে যেকোনো একজন কাস্টমার নির্বাচন করুন।" 
                    : "Select a client from Sudipta's database index to inspect service history thresholds, launch reminder logs, and verify billing logs."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Customer Deletion */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-650 mx-auto animate-bounce">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-base font-bold text-slate-900">
                {isBng ? "কাস্টমার মুছে ফেলার নিশ্চিতকরণ" : "Confirm Customer Deletion"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isBng 
                  ? `আপনি কি নিশ্চিতভাবে "${selectedCustomer.name}"-এর কাস্টমার প্রোফাইল এবং সম্পর্কিত সকল সার্ভিস রেকর্ড ও ইএমআই ডিরেক্টরি মুছে ফেলতে চান? এই পরিবর্তনটি আর ফিরিয়ে আনা যাবে না।`
                  : `Are you sure you want to delete "${selectedCustomer.name}" and all associated service history, invoices, and EMI records? This action is irreversible.`
                }
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {isBng ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDelete(selectedCustomer.id);
                  setSelectedCustomerId(null);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                {isBng ? "মুছে ফেলুন" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
