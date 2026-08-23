import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, AlertTriangle, Battery, User, Wrench, FileText, 
  Sparkles, Zap, ShieldAlert, MessageSquare, Package, Clock, 
  Truck, CheckCircle2, ArrowRight, Printer, ShieldCheck, X, LifeBuoy, HardDrive 
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { DashboardStats, Product, Vehicle, Enquiry, Order, SupportTicket } from "../types";
import { triggerDashboardRefresh } from "../hooks/useDashboardRefresh";
import { updateOrderInSupabase } from "../lib/supabase";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  stats: DashboardStats;
  products: Product[];
  vehicles: Vehicle[];
  enquiries: Enquiry[];
  orders: Order[];
  supportTickets?: SupportTicket[];
  onNavigate: (section: string) => void;
  lang: Language;
  t: TranslationDict;
}

export default function AdminDashboard({ 
  stats, 
  products, 
  vehicles, 
  enquiries, 
  orders = [], 
  supportTickets = [],
  onNavigate, 
  lang, 
  t 
}: AdminDashboardProps) {
  const isBng = lang === "bn";
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'to-confirm' | 'payment-log' | 'to-print'>('to-confirm');
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);

  const getFilteredOrders = () => {
    return orders.filter(o => {
      if (activeTab === 'to-confirm') {
        return o.status === "Pending Verification" && !o.utrNumber && !o.paymentScreenshot;
      }
      if (activeTab === 'payment-log') {
        return o.status === "Pending Verification" && (!!o.utrNumber || !!o.paymentScreenshot);
      }
      if (activeTab === 'to-print') {
        return o.status === "Order Confirmed";
      }
      return false;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleBulkPrint = () => {
    const doc = new jsPDF();
    doc.text("Bulk Print Orders Summary", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const filtered = orders.filter(o => o.status === "Order Confirmed");
    const tableData = filtered.map(o => [
      o.id.slice(-6).toUpperCase(),
      o.customerName,
      o.customerPhone,
      (o.totalAmount || 0).toLocaleString(),
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      head: [['Order ID', 'Customer', 'Phone', 'Total', 'Date']],
      body: tableData,
      startY: 30,
    });

    doc.save("bulk-order-summary.pdf");
  };

  // Filter low stock
  const lowStockParts = products.filter(p => p.stock <= 5);
  const lowStockScooters = vehicles.filter(v => v.stockQuantity <= 2);
  const activeEnquiries = enquiries.filter(e => e.status === "New");

  const newOrders = orders.filter(o => o.status === "Pending Verification" || o.status === "Order Placed");

  // Handler for quick status progression
  const handleQuickStatusProgress = async (orderId: string, currentStatus: Order["status"]) => {
    setUpdatingId(orderId);
    let nextStatus: Order["status"] = "Order Confirmed";
    
    if (currentStatus === "Pending Verification" || currentStatus === "Order Placed") {
      nextStatus = "Order Confirmed";
    } else if (currentStatus === "Order Confirmed") {
      nextStatus = "Dispatched";
    } else if (currentStatus === "Dispatched") {
      nextStatus = "Out for Delivery";
    } else if (currentStatus === "Out for Delivery") {
      nextStatus = "Delivered";
    }

    const isVerifiedStatus = (nextStatus as string) !== "Pending Verification" && (nextStatus as string) !== "Pending Verify";
    const patchData = {
      status: nextStatus,
      order_status: nextStatus,
      is_verified: isVerifiedStatus,
      isVerified: isVerifiedStatus
    };

    try {
      const result = await updateOrderInSupabase(orderId, patchData);
      if (result.ok || result.notFound) {
        triggerDashboardRefresh();
      }
    } catch (err) {
      console.error("Quick status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div id="admin-dashboard-view" className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 p-6 md:p-6 lg:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-28 h-28 md:w-32 md:h-32 lg:w-44 lg:h-44 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full w-fit mb-3">
            <Zap className="w-3.5 h-3.5" />
            {isBng ? "ইআরপি লাইভ" : "ERP Systems Online"}
          </div>
          <h2 className="text-2xl md:text-2xl lg:text-3xl font-display font-bold tracking-tight">
            {isBng ? `স্বাগতম, ${t.ownerName}!` : `Welcome back, ${t.ownerName}!`}
          </h2>
          <p className="text-sm text-slate-350 mt-2 max-w-2xl">
            {t.erpDashboardSubtitle}
          </p>

          {/* New Orders Count badge inside overview welcome banner */}
          {newOrders.length > 0 && (
            <div 
              onClick={() => onNavigate("orders")}
              className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3.5 py-1.5 rounded-full w-fit border border-rose-500/20 animate-pulse cursor-pointer transition-all shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>
                {isBng 
                  ? `সরাসরি অ্যাক্সেস: ${newOrders.length}টি নতুন অর্ডার পেন্ডিং` 
                  : `Direct Access: ${newOrders.length} New Orders Pending`}
              </span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards (Now 5-column layout on wide screens to fit Live Orders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-2.5 lg:gap-4">
        <div className="bg-white rounded-2xl p-5 md:p-3 lg:p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-[10px] lg:text-xs font-semibold text-slate-400 block uppercase whitespace-normal break-words leading-tight">{t.statsTotalSales}</span>
            <span className="text-xl md:text-sm lg:text-2xl font-mono font-bold text-slate-800 mt-1 block whitespace-nowrap truncate">₹ {(stats.totalSales || 0).toLocaleString()}</span>
          </div>
          <div className="p-3 md:p-1.5 lg:p-3 bg-emerald-50 text-emerald-600 rounded-xl ml-2 shrink-0">
            <TrendingUp className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6" />
          </div>
        </div>

        {/* Live Orders Stats Card with Pulse Badge */}
        <div 
          onClick={() => onNavigate("orders")}
          className="bg-white rounded-2xl p-5 md:p-3 lg:p-5 border border-slate-100 shadow-md flex items-center justify-between cursor-pointer hover:border-rose-200 transition-all group"
        >
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-[10px] lg:text-xs font-semibold text-slate-400 block uppercase group-hover:text-rose-500 transition-colors whitespace-normal break-words leading-tight">
              {isBng ? "নতুন লাইভ অর্ডার" : "Live Orders"}
            </span>
            <span className="text-xl md:text-sm lg:text-2xl font-mono font-bold text-slate-800 mt-1 block flex items-center gap-1.5 whitespace-nowrap truncate">
              {newOrders.length} {isBng ? "নতুন" : "New"}
              {newOrders.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
              )}
            </span>
          </div>
          <div className="p-3 md:p-1.5 lg:p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100 transition-all ml-2 shrink-0">
            <Package className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-3 lg:p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-[10px] lg:text-xs font-semibold text-slate-400 block uppercase whitespace-normal break-words leading-tight">{t.statsActiveEMI}</span>
            <span className="text-xl md:text-sm lg:text-2xl font-mono font-bold text-slate-800 mt-1 block whitespace-nowrap truncate">{stats.activeEmiCount} Accounts</span>
          </div>
          <div className="p-3 md:p-1.5 lg:p-3 bg-indigo-50 text-indigo-600 rounded-xl ml-2 shrink-0">
            <Battery className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-3 lg:p-5 border border-slate-100 shadow-md flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-[10px] lg:text-xs font-semibold text-slate-400 block uppercase whitespace-normal break-words leading-tight">{t.statsPendingBookings}</span>
            <span className="text-xl md:text-sm lg:text-2xl font-mono font-bold text-slate-800 mt-1 block whitespace-nowrap truncate">{stats.pendingBookings} Active</span>
          </div>
          <div className="p-3 md:p-1.5 lg:p-3 bg-amber-50 text-amber-600 rounded-xl ml-2 shrink-0">
            <Wrench className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-3 lg:p-5 border border-slate-100 shadow-md flex items-center justify-between col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-[10px] lg:text-xs font-semibold text-slate-400 block uppercase whitespace-normal break-words leading-tight">{t.statsLowStock}</span>
            <span className="text-xl md:text-sm lg:text-2xl font-mono font-bold text-slate-800 mt-1 block whitespace-nowrap truncate">{stats.lowStockCount} Alerts</span>
          </div>
          <div className="p-3 md:p-1.5 lg:p-3 bg-rose-50 text-rose-600 rounded-xl ml-2 shrink-0">
            <ShieldAlert className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6" />
          </div>
        </div>
      </div>

      {/* Dedicated Documents & Drive Storage Section */}
      <div 
        onClick={() => onNavigate("documents_drive")}
        className="bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 hover:from-indigo-100/50 hover:to-indigo-200/30 border border-indigo-150 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl group-hover:scale-105 transition duration-300 shadow-sm shrink-0">
            <HardDrive className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span>{isBng ? "📁 ডকুমেন্টস ও ড্রাইভ স্টোরেজ" : "📁 Secure Cloud-Drive & Documents Portal"}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {isBng ? "সুরক্ষিত সিঙ্ক" : "Sync On"}
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {isBng 
                ? "গ্রাহকের স্কুটার রেজিস্ট্রেশন, বীমা পলিসি এবং ব্যাটারী ওয়ারেন্টি কার্ডের স্ক্যান কপি বা ছবি নিরাপদে আপলোড করুন ও সংরক্ষণ করুন।" 
                : "Securely upload and manage customer scooter registrations, insurance policies, or LFP battery warranty files across both computer & phone systems."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all duration-300 shrink-0 group-hover:translate-x-1">
          <span>{isBng ? "ড্রাইভ খুলুন" : "Access Drive Storage"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* PRIORITY VIEW - Live Order Updates & Workflow */}
      <div className="bg-white rounded-3xl p-4 md:p-5 lg:p-6 border border-slate-100 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600 animate-bounce" />
              <span>{isBng ? "প্রায়োরিটি ভিউ: লাইভ অর্ডার আপডেট" : "Priority View: Live Order Updates"}</span>
              <span className="flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBng 
                ? "গ্রাহকদের থেকে আসা সাম্প্রতিক অর্ডারের লাইভ তালিকা এবং ওয়ান-ক্লিক স্ট্যাটাস প্রসেসিং।" 
                : "Real-time queue of incoming orders with one-click workflow status processing."}
            </p>
          </div>
          <button
            onClick={() => onNavigate("orders")}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>{isBng ? "সম্পূর্ণ অর্ডার ওয়ার্কস্পেস খুলুন" : "Open Full Workspace"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
            <button 
                onClick={() => setActiveTab('to-confirm')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'to-confirm' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                <Clock className="w-3.5 h-3.5" />
                {isBng ? 'অপেক্ষিত যাচাইকরণ' : 'Manual Verification'}
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">
                  {orders.filter(o => o.status === "Pending Verification" && !o.utrNumber && !o.paymentScreenshot).length}
                </span>
            </button>
            <button 
                onClick={() => setActiveTab('payment-log')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'payment-log' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                <FileText className="w-3.5 h-3.5" />
                {isBng ? 'পেমেন্ট লগ' : 'Payment Log'}
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">
                  {orders.filter(o => o.status === "Pending Verification" && (!!o.utrNumber || !!o.paymentScreenshot)).length}
                </span>
            </button>
            <button 
                onClick={() => setActiveTab('to-print')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'to-print' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isBng ? 'নিশ্চিত অর্ডার' : 'Confirmed'}
            </button>
            {activeTab === 'to-print' && (
                <button 
                    onClick={handleBulkPrint}
                    className="ml-auto px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2"
                >
                    <Printer className="w-3.5 h-3.5" />
                    {isBng ? 'বাল্ক প্রিন্ট' : 'Bulk Print'}
                </button>
            )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">{isBng ? "কোনো অর্ডার খুঁজে পাওয়া যায়নি।" : "No orders found in this category!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3 lg:gap-6">
            {filteredOrders.slice(0, 6).map(order => {
              const orderIdTrim = order.id.slice(-6).toUpperCase();
              
              // Define beautiful status styling
              let statusBg = "bg-slate-50 text-slate-600 border-slate-200";
              let statusLabel: string = order.status;
              let nextActionLabel = "";

              if (order.status === "Pending Verification") {
                statusBg = "bg-amber-50 text-amber-700 border-amber-200";
                statusLabel = isBng ? "যাচাইকরণ বকেয়া" : "Pending Verification";
                nextActionLabel = isBng ? "ভেরিফাই এবং কনফার্ম করুন" : "Verify & Confirm Order";
              } else if (order.status === "Order Placed") {
                statusBg = "bg-indigo-50 text-indigo-700 border-indigo-200";
                statusLabel = isBng ? "অর্ডার প্লেসড" : "Order Placed";
                nextActionLabel = isBng ? "অর্ডার কনফার্ম করুন" : "Confirm Order";
              } else if (order.status === "Order Confirmed") {
                statusBg = "bg-teal-50 text-teal-700 border-teal-200";
                statusLabel = isBng ? "অর্ডার নিশ্চিত" : "Order Confirmed";
                nextActionLabel = isBng ? "ডিসপ্যাচ হিসেবে চিহ্নিত করুন" : "Mark Dispatched";
              } else if (order.status === "Dispatched") {
                statusBg = "bg-sky-50 text-sky-700 border-sky-200";
                statusLabel = isBng ? "পাঠানো হয়েছে" : "Dispatched";
                nextActionLabel = isBng ? "ডেলিভারির জন্য বের করুন" : "Set Out for Delivery";
              } else if (order.status === "Out for Delivery") {
                statusBg = "bg-purple-50 text-purple-700 border-purple-200";
                statusLabel = isBng ? "ডেলিভারির পথে" : "Out for Delivery";
                nextActionLabel = isBng ? "ডেলিভার্ড হিসেবে চিহ্নিত করুন" : "Mark as Delivered";
              } else if (order.status === "Delivered") {
                statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                statusLabel = isBng ? "ডেলিভার্ড" : "Delivered";
              }

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-2xl border p-3 md:p-3 lg:p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                    order.status === "Pending Verification" || order.status === "Order Placed"
                      ? "border-amber-105 ring-2 ring-amber-50/30 bg-gradient-to-b from-white to-amber-50/5"
                      : "border-slate-100"
                  }`}
                >
                  <div>
                    {/* Header: ID & Status */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #ORD-{orderIdTrim}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Customer details */}
                    <div className="mb-3 space-y-1">
                      <strong className="text-sm text-slate-800 block leading-snug">{order.customerName}</strong>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        <a href={`tel:${order.customerPhone}`} className="hover:underline hover:text-indigo-600 font-mono">
                          {order.customerPhone}
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 italic mt-1">
                        {order.customerAddress}
                      </p>
                    </div>

                    {/* Items & Pricing */}
                    <div className="bg-slate-50/60 p-2.5 rounded-xl mb-3 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Items Ordered</span>
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span className="line-clamp-1 font-medium">{item.name}</span>
                            <span className="font-mono text-slate-400 font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">₹ {(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Manual Verification Details (if any) */}
                    {(order.utrNumber || order.paymentScreenshot) && (
                      <div className="mb-3 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{isBng ? "পেমেন্ট ভেরিফিকেশন তথ্য" : "Payment Verification Info"}</span>
                        </div>
                        {order.utrNumber && (
                          <p className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-emerald-100">
                            UTR: <span className="text-indigo-600">{order.utrNumber}</span>
                          </p>
                        )}
                        {order.paymentScreenshot && (
                          <div 
                            onClick={() => setSelectedScreenshotUrl(order.paymentScreenshot || null)}
                            className="relative w-full h-32 rounded-lg overflow-hidden border border-emerald-200 group cursor-pointer hover:border-emerald-500 transition-all duration-200"
                          >
                             <img src={order.paymentScreenshot} alt="Payment Proof" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold gap-1">
                               <FileText className="w-4 h-4" />
                               {isBng ? "ফুল স্ক্রিন ভিউ" : "View Full Proof"}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-2 pt-2 border-t border-slate-150">
                    {nextActionLabel ? (
                      <button
                        onClick={() => handleQuickStatusProgress(order.id, order.status)}
                        disabled={updatingId === order.id}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {updatingId === order.id ? (
                          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {order.status === "Pending Verification" || order.status === "Order Placed" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" />
                            )}
                            <span>{nextActionLabel}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{isBng ? "অর্ডারটি সফলভাবে ডেলিভার্ড" : "Order Fully Completed"}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Low Stock Alert and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-8">
        {/* Low Stock Panel */}
        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-slate-100 shadow-md">
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
        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-slate-100 shadow-md">
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
                  <p className="text-xs text-slate-650 line-clamp-2 italic">"{enq.message}"</p>
                  <span className="text-[9px] text-slate-400 font-mono block mt-2 text-right">
                    {new Date(enq.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* High-Resolution Screenshot Zoom Modal */}
      <AnimatePresence>
        {selectedScreenshotUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshotUrl(null)}
            className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isBng ? 'পেমেন্ট স্ক্রিনশট প্রিভিউ' : 'Payment Screenshot Preview'}
                </span>
                <button 
                  onClick={() => setSelectedScreenshotUrl(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-slate-950 max-h-[75vh] overflow-y-auto">
                <img 
                  src={selectedScreenshotUrl} 
                  alt="Payment Verification Screenshot" 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-800"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
