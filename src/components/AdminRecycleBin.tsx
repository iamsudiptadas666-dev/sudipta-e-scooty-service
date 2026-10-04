import React, { useState, useEffect } from "react";
import { 
  Trash, RotateCcw, AlertTriangle, Search, Info, Loader2, CheckCircle2, AlertCircle, X, ShieldAlert 
} from "lucide-react";
import { Language } from "../translations";
import { 
  getTrashFromSupabase, restoreItemInSupabase, permanentDeleteItemFromSupabase, isSupabaseConfigured 
} from "../lib/supabase";

interface TrashItem {
  id: string;
  entity: string;
  name: string;
  deletedAt: string;
  originalData: any;
}

interface AdminRecycleBinProps {
  lang: Language;
  onRefresh: () => void;
}

export default function AdminRecycleBin({ lang, onRefresh }: AdminRecycleBinProps) {
  const isBng = lang === "bn";
  
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Dialog state for permanent delete confirmation
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "single" | "bulk_delete" | "bulk_restore";
    item?: TrashItem;
  }>({
    isOpen: false,
    type: "single"
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch trash items on mount
  const fetchTrash = async () => {
    setIsLoading(true);
    try {
      let serverTrash: TrashItem[] = [];
      try {
        let res = await fetch("/api/trash/all");
        if (!res.ok && res.status === 404) {
          res = await fetch("/api/recycle-bin");
        }
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          serverTrash = await res.json();
        }
      } catch (e) {
        console.warn("Server trash fetch error:", e);
      }

      let supabaseTrash: TrashItem[] = [];
      try {
        if (isSupabaseConfigured) {
          supabaseTrash = await getTrashFromSupabase();
        }
      } catch (e) {
        console.warn("Supabase trash fetch error:", e);
      }

      const mergedMap = new Map<string, TrashItem>();
      (serverTrash || []).forEach(item => {
        if (item && item.id && item.entity) {
          mergedMap.set(`${item.entity}:${item.id}`, item);
        }
      });
      (supabaseTrash || []).forEach(item => {
        if (item && item.id && item.entity) {
          mergedMap.set(`${item.entity}:${item.id}`, item);
        }
      });

      setItems(Array.from(mergedMap.values()));
      setError(null);
    } catch (err: any) {
      console.error("Recycle Bin fetch error:", err);
      setError(err.message || "Something went wrong while fetching recycle bin items");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Restore single item
  const handleRestore = async (item: TrashItem) => {
    try {
      if (isSupabaseConfigured) {
        await restoreItemInSupabase(item.entity, item.id, item.originalData);
      }

      fetch(`/api/trash/restore/${item.entity}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      }).catch(() => {});
      
      triggerNotification(
        isBng 
          ? `"${item.name}" সফলভাবে পুনরুদ্ধার করা হয়েছে!` 
          : `"${item.name}" restored successfully!`
      );
      
      // Update local state & trigger parent dashboard refresh
      setItems(prev => prev.filter(x => !(x.id === item.id && x.entity === item.entity)));
      onRefresh();
    } catch (err: any) {
      triggerNotification(err.message || "Failed to restore item", "error");
    }
  };

  // Permanent single delete
  const handlePermanentDelete = async (item: TrashItem) => {
    try {
      if (isSupabaseConfigured) {
        await permanentDeleteItemFromSupabase(item.entity, item.id);
      }

      fetch(`/api/trash/permanent/${item.entity}/${item.id}`, {
        method: "DELETE"
      }).catch(() => {});
      
      triggerNotification(
        isBng 
          ? `"${item.name}" চিরতরে মুছে ফেলা হয়েছে!` 
          : `"${item.name}" deleted permanently!`
      );
      
      setItems(prev => prev.filter(x => !(x.id === item.id && x.entity === item.entity)));
      onRefresh();
    } catch (err: any) {
      triggerNotification(err.message || "Failed to delete item", "error");
    } finally {
      setConfirmDialog({ isOpen: false, type: "single" });
    }
  };

  // Bulk restore filtered items
  const handleBulkRestore = async () => {
    const filtered = getFilteredItems();
    if (filtered.length === 0) return;

    let successCount = 0;
    for (const item of filtered) {
      try {
        if (isSupabaseConfigured) {
          await restoreItemInSupabase(item.entity, item.id, item.originalData);
        }
        fetch(`/api/trash/restore/${item.entity}/${item.id}`, { method: "PATCH" }).catch(() => {});
        successCount++;
      } catch (err) {
        console.warn("Bulk restore error for: ", item, err);
      }
    }

    triggerNotification(
      isBng
        ? `${successCount} টি আইটেম সফলভাবে পুনরুদ্ধার করা হয়েছে!`
        : `${successCount} items restored successfully!`
    );

    fetchTrash();
    onRefresh();
    setConfirmDialog({ isOpen: false, type: "bulk_restore" });
  };

  // Bulk permanent delete (Empty filtered trash)
  const handleBulkDelete = async () => {
    const filtered = getFilteredItems();
    if (filtered.length === 0) return;

    let successCount = 0;
    for (const item of filtered) {
      try {
        if (isSupabaseConfigured) {
          await permanentDeleteItemFromSupabase(item.entity, item.id);
        }
        fetch(`/api/trash/permanent/${item.entity}/${item.id}`, { method: "DELETE" }).catch(() => {});
        successCount++;
      } catch (err) {
        console.warn("Bulk delete error for: ", item, err);
      }
    }

    triggerNotification(
      isBng
        ? `${successCount} টি আইটেম চিরতরে মুছে ফেলা হয়েছে!`
        : `${successCount} items permanently deleted!`
    );

    fetchTrash();
    onRefresh();
    setConfirmDialog({ isOpen: false, type: "bulk_delete" });
  };

  // Categorize helper
  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case "vehicles": return isBng ? "গাড়ি ও শোরুম" : "Vehicles & CMS";
      case "products": return isBng ? "পার্টস ও ইনভেন্টরি" : "Products & Parts";
      case "orders": return isBng ? "বাতিলকৃত অর্ডার" : "Deleted Orders";
      case "customers": return isBng ? "গ্রাহক ডাটাবেস" : "Customers";
      case "emi": return isBng ? "ইএমআই লেজার" : "EMI & Ledgers";
      case "bookings": return isBng ? "সার্ভিস জব কার্ড" : "Service Job Cards";
      case "enquiries": return isBng ? "শোরুম লিডস" : "Showroom Leads";
      case "expenses": return isBng ? "দৈনিক খরচ" : "Expenses";
      case "invoices": return isBng ? "ইনভয়েস" : "Invoices";
      case "announcements": return isBng ? "নোটিশ" : "Notices";
      case "documents": return isBng ? "ডকুমেন্টস" : "Documents";
      default: return entity;
    }
  };

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case "vehicles": return "bg-purple-50 text-purple-700 border-purple-100";
      case "products": return "bg-blue-50 text-blue-700 border-blue-100";
      case "orders": return "bg-orange-50 text-orange-700 border-orange-100";
      case "customers": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "emi": return "bg-cyan-50 text-cyan-700 border-cyan-100";
      case "bookings": return "bg-pink-50 text-pink-700 border-pink-100";
      case "enquiries": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "expenses": return "bg-rose-50 text-rose-700 border-rose-100";
      case "invoices": return "bg-teal-50 text-teal-700 border-teal-100";
      case "announcements": return "bg-amber-50 text-amber-700 border-amber-100";
      case "documents": return "bg-sky-50 text-sky-700 border-sky-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  // Get active entities list for filters
  const filterCategories = [
    { key: "all", label: isBng ? "সব আইটেম" : "All Items" },
    { key: "vehicles", label: isBng ? "শোরুম গাড়ি" : "Vehicles" },
    { key: "products", label: isBng ? "পার্টস" : "Parts / Products" },
    { key: "orders", label: isBng ? "বাতিলকৃত অর্ডার" : "Deleted Orders" },
    { key: "customers", label: isBng ? "গ্রাহক" : "Customers" },
    { key: "emi", label: isBng ? "ইএমআই" : "EMI Ledger" },
    { key: "bookings", label: isBng ? "সার্ভিস জব" : "Service Jobs" },
    { key: "enquiries", label: isBng ? "লিডস ও কল" : "Enquiries" },
    { key: "expenses", label: isBng ? "খরচ" : "Expenses" },
    { key: "invoices", label: isBng ? "ইনভয়েস" : "Invoices" },
    { key: "announcements", label: isBng ? "নোটিশ" : "Notices" },
    { key: "documents", label: isBng ? "ডকুমেন্টস" : "Documents" }
  ];

  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeFilter === "all" || item.entity === activeFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredItems = getFilteredItems();

  const getCountByFilter = (filterKey: string) => {
    if (filterKey === "all") return items.length;
    return items.filter(item => item.entity === filterKey).length;
  };

  return (
    <div id="admin-recycle-bin" className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
              <Trash className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isBng ? "রিসাইকেল বিন ও ট্র্যাশ সিস্টেম" : "Centralized Recycle Bin"}
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {items.length} {isBng ? "টি বাতিলকৃত" : "deleted"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isBng 
                  ? "মুছে ফেলা আইটেমগুলি ৩০ দিনের জন্য ট্র্যাশে থাকে। ভুলবশত মুছে ফেলা রেকর্ড পুনরুদ্ধার করুন।" 
                  : "Soft-deleted records wait here. Restore them back to respective modules with full database relational integrity."}
              </p>
            </div>
          </div>
        </div>

        {/* Security / Owner Accent badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50/70 border border-indigo-100/50 rounded-2xl text-[10px] text-indigo-700 font-bold tracking-wider uppercase">
          <ShieldAlert className="w-3.5 h-3.5" />
          {isBng ? "মালিকানা অ্যাক্সেস স্তর" : "Authorized Admin Panel Only"}
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl max-w-sm transition-all duration-300 animate-slide-up ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Control Actions Panel */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            placeholder={isBng ? "আইডি বা নাম দিয়ে খুঁজুন..." : "Search soft-deleted records..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={() => setConfirmDialog({ isOpen: true, type: "bulk_restore" })}
            disabled={filteredItems.length === 0}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none text-slate-700 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isBng ? "সব পুনরুদ্ধার করুন" : "Restore Filtered"}
          </button>
          
          <button
            onClick={() => setConfirmDialog({ isOpen: true, type: "bulk_delete" })}
            disabled={filteredItems.length === 0}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:pointer-events-none border border-rose-100 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            {isBng ? "ট্র্যাশ খালি করুন" : "Empty Trash (Filtered)"}
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex gap-2 pb-2 overflow-x-auto max-w-full custom-scrollbar">
        {filterCategories.map(cat => {
          const count = getCountByFilter(cat.key);
          const isActive = activeFilter === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? "bg-slate-900 border-slate-950 text-white shadow-sm" 
                  : "bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Data Table Panel */}
      {isLoading ? (
        <div className="bg-white p-20 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500">
            {isBng ? "পুনরুদ্ধার কেন্দ্র লোড হচ্ছে..." : "Accessing secure Recycle Bin..."}
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-800 text-sm">{isBng ? "লোড ব্যর্থ হয়েছে" : "Connection Error"}</h4>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {isBng ? "বিন সম্পূর্ণ খালি বা কোনো মিল পাওয়া যায়নি" : "Recycle Bin is Empty"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5">
            {isBng 
              ? "বর্তমানে কোনো ডেটা ট্র্যাশে নেই। আপনার ডাটাবেস সম্পূর্ণ সুসংগঠিত রয়েছে।" 
              : "No deleted files or records match your current filter. Deleting primary dashboard cards will put them here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[11px] font-black uppercase text-slate-400 tracking-wider w-1/5">
                    {isBng ? "আইটেম টাইপ" : "Module Type"}
                  </th>
                  <th className="p-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {isBng ? "বিবরণ / নাম" : "Deleted Item Reference / Description"}
                  </th>
                  <th className="p-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {isBng ? "বাতিলকৃত আইডি" : "System Identifier"}
                  </th>
                  <th className="p-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {isBng ? "মুছে ফেলার তারিখ" : "Soft Deleted Date"}
                  </th>
                  <th className="p-4 text-[11px] font-black uppercase text-slate-400 tracking-wider text-right w-1/4">
                    {isBng ? "ব্যবস্থাপনা" : "Unified Commands"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={`${item.entity}-${item.id}`} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${getEntityBadgeColor(item.entity)}`}>
                        {getEntityLabel(item.entity)}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-xs max-w-md">
                      <div className="truncate">{item.name}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-400 text-[10px]">
                      {item.id}
                    </td>
                    <td className="p-4 font-medium text-slate-500 text-[11px]">
                      {new Date(item.deletedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-700 font-bold text-[11px] rounded-lg shadow-sm transition cursor-pointer"
                          title={isBng ? "পুনরুদ্ধার করুন" : "Restore Record"}
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-600" />
                          <span>{isBng ? "পুনরুদ্ধার" : "Restore"}</span>
                        </button>
                        
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, type: "single", item })}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-lg shadow-sm transition border border-rose-100 cursor-pointer"
                          title={isBng ? "চিরতরে মুছুন" : "Destroy Permanently"}
                        >
                          <Trash className="w-3 h-3 text-rose-500" />
                          <span>{isBng ? "স্থায়ী ডিলিট" : "Destroy"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal Container */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setConfirmDialog({ isOpen: false, type: "single" })}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-50 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3.5 items-start">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {confirmDialog.type === "single" && (isBng ? "স্থায়ীভাবে ডিলিট করার সতর্কতা" : "Destroy Record Permanently")}
                  {confirmDialog.type === "bulk_delete" && (isBng ? "ট্র্যাশ সম্পূর্ণ খালি করার সতর্কতা" : "Empty Filtered Recycle Bin")}
                  {confirmDialog.type === "bulk_restore" && (isBng ? "সব রেকর্ড পুনরুদ্ধারের সতর্কতা" : "Bulk Restore Filtered Records")}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {confirmDialog.type === "single" && (
                    isBng 
                      ? `আপনি কি নিশ্চিত যে "${confirmDialog.item?.name}" চিরতরে মুছে ফেলবেন? এটি পুনরায় আর কখনো উদ্ধার করা যাবে না!` 
                      : `Are you absolutely sure you want to destroy "${confirmDialog.item?.name}"? This action bypasses safeguards and permanently wipes the database row.`
                  )}
                  {confirmDialog.type === "bulk_delete" && (
                    isBng 
                      ? "আপনি কি নিশ্চিত যে ফিল্টার করা সমস্ত বাতিল রেকর্ড চিরতরে ধ্বংস করবেন? এটি পুনরায় আর উদ্ধার করা যাবে না!" 
                      : "Are you sure you want to empty the bin for all currently filtered items? This executes a cascade hard delete in the server."
                  )}
                  {confirmDialog.type === "bulk_restore" && (
                    isBng 
                      ? "আপনি কি ফিল্টার করা সমস্ত বাতিল রেকর্ডগুলিকে তাদের স্ব-স্ব মডিউলে ফিরিয়ে নিতে চান?" 
                      : "Would you like to bulk restore all filtered records back to active queues?"
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: "single" })}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
              >
                {isBng ? "বাতিল" : "Cancel"}
              </button>

              {confirmDialog.type === "single" && (
                <button
                  onClick={() => handlePermanentDelete(confirmDialog.item!)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isBng ? "হ্যাঁ, চিরতরে মুছুন" : "Yes, Purge Permanently"}
                </button>
              )}

              {confirmDialog.type === "bulk_delete" && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isBng ? "হ্যাঁ, সব মুছুন" : "Purge All"}
                </button>
              )}

              {confirmDialog.type === "bulk_restore" && (
                <button
                  onClick={handleBulkRestore}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isBng ? "হ্যাঁ, পুনরুদ্ধার করুন" : "Restore All"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Help Footer Guide */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-normal font-semibold">
          {isBng 
            ? "নিরাপত্তা নীতি: কোনো কাস্টমার রেকর্ড মুছে ফেললে তার সাথে সম্পর্কিত সমস্ত বকেয়া ইএমআই ট্র্যাক, চালান ও সার্ভিস জব কার্ড স্বয়ংক্রিয়ভাবে ট্র্যাশে চলে যাবে এবং কাস্টমার পুনরুদ্ধার করা হলে সেগুলোও সচল মডিউলে ফিরে যাবে।" 
            : "Relational Cascade Safeguards: Soft-deleting a customer automatically flags their associated EMI files, invoices, and job cards as deleted to protect active workflows from orphaned state exceptions. Restoring a customer seamlessly revives associated data blocks."}
        </p>
      </div>

    </div>
  );
}
