import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Truck, CheckCircle, Clock, Phone, Search, 
  Filter, Edit2, Save, X, Printer, Trash,
  User, MapPin, Calendar, MessageSquare, AlertCircle,
  Eye, Camera, FileText, Copy, Check, ExternalLink, QrCode, Barcode, ChevronDown
} from 'lucide-react';
import { Order, OrderUpdate } from '../types';
import { useDashboardRefresh, triggerDashboardRefresh } from '../hooks/useDashboardRefresh';
import { updateOrderInSupabase, deleteOrderInSupabase, getOrdersFromSupabase, supabase, isSupabaseConfigured } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LogisticsConfigFormProps {
  order: any;
  isBng: boolean;
  onSuccess: (awb?: string) => void;
}

const LogisticsConfigForm: React.FC<LogisticsConfigFormProps> = ({ order, isBng, onSuccess }) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'API' | 'Self'>('API');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('Delhivery');
  const [customCarrier, setCustomCarrier] = useState<string>('');
  const [weight, setWeight] = useState<string>('1.5');
  const [dimensions, setDimensions] = useState<string>('20x15x10');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/globalConfig')
      .then(res => res.json())
      .then(data => {
        if (data && data.customCarrierName) {
          setCustomCarrier(data.customCarrierName);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const carriers = ['Delhivery', 'Xpressbees', 'Ecom Express'];
  if (customCarrier) {
    carriers.push(customCarrier);
  } else {
    carriers.push('Custom API');
  }
  carriers.push('DTDC');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (deliveryMethod === 'Self') {
        const result = await updateOrderInSupabase(order.id, {
          status: "Out for Delivery",
        });
        if (result.ok || result.notFound) {
          alert(isBng ? "নিজস্ব ফ্লিট ডেলিভারি সফলভাবে সেট করা হয়েছে!" : "Assigned to Self Delivery successfully!");
          onSuccess('INTERNAL-SELF');
        } else {
          alert(isBng ? "ডেলিভারি সেট করতে ব্যর্থ হয়েছে" : "Failed to assign self-delivery");
        }
      } else {
        const res = await fetch("/api/shipments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderId: order.id, 
            partner: selectedCarrier, 
            weight: weight || "1.5", 
            dimensions: dimensions || "20x15x10", 
            notes: notes || "" 
          })
        });
        if (res.ok) {
          const updatedOrder = await res.json();
          alert(isBng ? "শিপমেন্ট সফলভাবে তৈরি হয়েছে!" : "Shipment created successfully!");
          onSuccess(updatedOrder.awbNumber);
        } else {
          alert(isBng ? "শিপমেন্ট তৈরি করতে ব্যর্থ হয়েছে" : "Failed to create shipment via API");
        }
      }
    } catch (err) {
      console.error(err);
      alert(isBng ? "অনুরোধ সম্পন্ন করতে ত্রুটি হয়েছে" : "Error processing request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-200/50 dark:border-slate-800">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {isBng ? 'লজিস্টিক কনফিগারেশন' : 'Logistics Configuration'}
      </p>
      <div className="flex gap-2">
        <button 
          type="button"
          onClick={() => setDeliveryMethod('API')} 
          className={`flex-1 p-2 rounded-xl text-[10px] font-bold transition-all duration-150 ${deliveryMethod === 'API' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          {isBng ? 'কুরিয়ার API' : 'Courier API'}
        </button>
        <button 
          type="button"
          onClick={() => setDeliveryMethod('Self')} 
          className={`flex-1 p-2 rounded-xl text-[10px] font-bold transition-all duration-150 ${deliveryMethod === 'Self' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          {isBng ? 'নিজস্ব ফ্লিট' : 'Self Delivery'}
        </button>
      </div>
      {deliveryMethod === 'API' && (
        <>
          <select 
            value={selectedCarrier} 
            onChange={(e) => setSelectedCarrier(e.target.value)} 
            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            {carriers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder={isBng ? 'ওজন (কেজি)' : 'Weight (kg)'}
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" 
            />
            <input 
              type="text" 
              placeholder={isBng ? 'মাত্রা (সেমি)' : 'Dimensions (cm)'}
              value={dimensions} 
              onChange={(e) => setDimensions(e.target.value)} 
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
        </>
      )}
      <textarea 
        placeholder={isBng ? 'ডেলিভারি নোট...' : 'Logistics notes / instructions...'}
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 min-h-[60px] outline-none focus:ring-1 focus:ring-emerald-500" 
      />
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {isBng ? 'শিপমেন্ট পাঠানো হচ্ছে...' : 'Processing Dispatch...'}
          </>
        ) : (
          <>
            {deliveryMethod === 'API' ? (isBng ? 'শিপমেন্ট তৈরি করুন' : 'Create Shipment') : (isBng ? 'আউট ফর ডেলিভারি' : 'Mark Out for Delivery')}
          </>
        )}
      </button>
    </div>
  );
};

interface CourierBookingWidgetProps {
  order: any;
  isBng: boolean;
  onSuccess: () => void;
}

const CourierBookingWidget: React.FC<CourierBookingWidgetProps> = ({ order, isBng, onSuccess }) => {
  const [carrier, setCarrier] = useState<string>('Delhivery');
  const [weight, setWeight] = useState<string>('1.5');
  const [dimensions, setDimensions] = useState<string>('20x15x10');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [customCarrier, setCustomCarrier] = useState<string>('');

  useEffect(() => {
    fetch('/api/globalConfig')
      .then(res => res.json())
      .then(data => {
        if (data && data.customCarrierName) {
          setCustomCarrier(data.customCarrierName);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const carriers = ['Delhivery', 'Xpressbees', 'Ecom Express'];
  if (customCarrier) {
    carriers.push(customCarrier);
  } else {
    carriers.push('Custom API');
  }
  carriers.push('DTDC');

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shipments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          partner: carrier,
          weight: weight || "1.5",
          dimensions: dimensions || "20x15x10",
          notes: notes || ""
        })
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert(isBng ? "শিপমেন্ট তৈরি করতে ব্যর্থ হয়েছে" : "Failed to create shipment via API");
      }
    } catch (err) {
      console.error(err);
      alert(isBng ? "অনুরোধ সম্পন্ন করতে ত্রুটি হয়েছে" : "Error processing request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/40 space-y-3 shadow-xs">
      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {isBng ? 'কুরিয়ার বুকিং প্যানেল' : 'Courier Booking & Details'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isBng ? 'কুরিয়ার পার্টনার' : 'Select Courier Partner'}
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {carriers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="w-full sm:w-24 space-y-1">
          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isBng ? 'ওজন (কেজি)' : 'Weight (kg)'}
          </label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="1.5"
          />
        </div>

        <div className="w-full sm:w-36 space-y-1">
          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isBng ? 'মাত্রা (LxWxH)' : 'Dims (cm)'}
          </label>
          <input
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="20x15x10"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {isBng ? 'শিপমেন্ট নোট (ঐচ্ছিক)' : 'Shipment Notes (Optional)'}
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder={isBng ? 'যেমন: সাবধানে হ্যান্ডেল করুন' : 'e.g., Handle with care'}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
          {isBng ? '* রিয়েল-টাইম এপিআই ট্রিগার এবং এডব্লিউবি জেনারেশন' : '* Real-time API trigger & instant AWB generation'}
        </span>
        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isBng ? 'প্রক্রিয়াধীন...' : 'Processing...'}
            </>
          ) : (
            <>
              <Truck className="w-3.5 h-3.5" />
              {isBng ? 'শিপমেন্ট তৈরি করুন' : 'Create Shipment'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface AdminOrdersProps {
  lang: 'bn' | 'en';
  orders?: Order[];
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ lang, orders: initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const deletedIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const filterActive = (o: any) =>
        o && o.id &&
        !deletedIdsRef.current.has(o.id) &&
        !o.isDeleted &&
        !o.is_deleted &&
        o.status !== 'deleted';

      let serverOrders: Order[] = [];

      if (isSupabaseConfigured) {
        const dbOrders = await getOrdersFromSupabase();
        if (Array.isArray(dbOrders)) {
          serverOrders = dbOrders.filter(filterActive);
        }
      } else {
        const res = await fetch(`/api/orders?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            serverOrders = data.filter(filterActive);
          }
        }
      }

      setOrders(serverOrders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      const active = initialOrders.filter((o: any) => 
        o && o.id && 
        !deletedIdsRef.current.has(o.id) && 
        !o.isDeleted && 
        !o.is_deleted && 
        o.status !== 'deleted'
      );
      setOrders(prev => {
        const map = new Map<string, Order>();
        prev.filter((o: any) => !deletedIdsRef.current.has(o.id) && !o.isDeleted && !o.is_deleted && o.status !== 'deleted').forEach(o => {
          if (o && o.id) map.set(o.id, o);
        });
        active.forEach(o => {
          if (o && o.id) map.set(o.id, o);
        });
        return Array.from(map.values());
      });
    }
  }, [initialOrders]);
  
  // Subscribe to dashboard refresh updates
  useDashboardRefresh(() => {
    fetchOrders(false);
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<OrderUpdate>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'payment' | 'manual' | 'delivered'>('active');

  const handleSoftDeleteOrder = async (orderId: string) => {
    if (confirm(isBng ? "আপনি কি নিশ্চিতভাবে এই অর্ডারটি রিসাইকেল বিন-এ পাঠাতে চান?" : "Are you sure you want to move this order to Recycle Bin?")) {
      // Instantly track in ref to block background syncs from resurrecting it
      deletedIdsRef.current.add(orderId);

      // Instantly update local UI state
      setOrders(prev => prev.filter(o => o.id !== orderId));

      try {
        await deleteOrderInSupabase(orderId);
        triggerDashboardRefresh();
      } catch (err) {
        console.error("Delete order error:", err);
      }
    }
  };
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);
  const [selectedShipmentOrderId, setSelectedShipmentOrderId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'API' | 'Self'>('API');
  const [selectedCarrier, setSelectedCarrier] = useState<"Delhivery" | "Xpressbees" | "Ecom Express" | "DTDC" | "Own Fleet">('Delhivery');
  const [shipmentWeight, setShipmentWeight] = useState('');
  const [shipmentDimensions, setShipmentDimensions] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');
  const [selectedLabelAwb, setSelectedLabelAwb] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const [expandedDispatchIds, setExpandedDispatchIds] = useState<Set<string>>(new Set());

  const toggleCourierDispatch = (orderId: string) => {
    setExpandedDispatchIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const isBng = lang === 'bn';

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.text("Order Summary", 14, 15);
    
    // Add filtering info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = filteredOrders.map(o => [
      o.id.slice(-6).toUpperCase(),
      o.customerName,
      o.customerPhone,
      getOrderStatus(o),
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      head: [['Order ID', 'Customer', 'Phone', 'Status', 'Date']],
      body: tableData,
      startY: 30,
    });

    doc.save("order-summary.pdf");
  };

  // Helper to calculate or normalize status from different possible DB schemas (status, order_status, is_verified, partner_assigned)
  const getOrderStatus = (order: any): string => {
    // Prioritize order_status then status
    let currentStatus = order.order_status || order.status || "Pending Verification";
    
    // Normalize status names
    if (currentStatus === "Pending Verify") {
      currentStatus = "Pending Verification";
    }

    const isVerified = order.is_verified === true || order.is_verified === "true" || order.isVerified === true || order.isVerified === "true";
    const partnerAssigned = order.partner_assigned === true || order.partner_assigned === "true" || order.partnerAssigned === true || order.partnerAssigned === "true" || !!(order.deliveryPartnerName || order.delivery_partner_info?.name || order.delivery_partner_info?.deliveryPartnerName);

    // If is_verified is true, elevate from "Pending Verification" to "Processing"
    if (currentStatus === "Pending Verification") {
      if (partnerAssigned) {
        return "Out for Delivery";
      }
      if (isVerified) {
        return "Processing";
      }
    }

    // If partner is assigned, elevate "Processing" or "Pending Verification" to "Out for Delivery"
    if (partnerAssigned && (currentStatus === "Pending Verification" || currentStatus === "Processing" || currentStatus === "Order Confirmed" || currentStatus === "Order Placed")) {
      return "Out for Delivery";
    }

    return currentStatus;
  };

  // Setup initial fetch and Supabase Realtime Subscription (with clean unsubscription)
  useEffect(() => {
    let isMounted = true;

    fetchOrders(true);

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('admin-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload: any) => {
            if (isMounted) {
              if (payload.eventType === 'DELETE' || (payload.new && (payload.new.is_deleted || payload.new.status === 'deleted'))) {
                const deletedId = payload.old?.id || payload.new?.id;
                if (deletedId) {
                  deletedIdsRef.current.add(deletedId);
                  setOrders(prev => prev.filter(o => o.id !== deletedId));
                }
              } else {
                fetchOrders(false);
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel && isSupabaseConfigured) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchOrders]);

  const handleUpdate = async (id: string, updates: OrderUpdate) => {
    const hasPartner = !!(updates.deliveryPartnerName || updates.deliveryPartnerPhone);
    const isVerifiedStatus = (updates.status as string) !== "Pending Verification" && (updates.status as string) !== "Pending Verify";

    // Synchronize both standard (camelCase) and snake_case fields used by any backend model/database configuration
    const patchData: any = {
      ...updates,
      // Status mapping
      status: updates.status,
      order_status: updates.status,
      // Partner mapping
      deliveryPartnerName: updates.deliveryPartnerName,
      deliveryPartnerPhone: updates.deliveryPartnerPhone,
      delivery_partner_info: {
        name: updates.deliveryPartnerName,
        phone: updates.deliveryPartnerPhone,
        deliveryPartnerName: updates.deliveryPartnerName,
        deliveryPartnerPhone: updates.deliveryPartnerPhone
      },
      // Status overrides/flags
      is_verified: isVerifiedStatus,
      isVerified: isVerifiedStatus,
      partner_assigned: hasPartner,
      partnerAssigned: hasPartner,
      updatedAt: new Date().toISOString()
    };

    try {
      // Update local state immediately
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patchData } : o));

      const result = await updateOrderInSupabase(id, patchData);
      if (result.ok || result.notFound) {
        setEditingId(null);
        triggerDashboardRefresh();
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const activeOrdersCount = orders.filter(o => {
    if (o.isDeleted === true || o.is_deleted === true || o.status === 'deleted' || deletedIdsRef.current.has(o.id)) return false;
    const status = getOrderStatus(o);
    return status !== 'Delivered' && status !== 'Pending Verification' && status !== 'Pending Verify';
  }).length;

  const deliveredOrdersCount = orders.filter(o => {
    if (o.isDeleted === true || o.is_deleted === true || o.status === 'deleted' || deletedIdsRef.current.has(o.id)) return false;
    const status = getOrderStatus(o);
    return status === 'Delivered';
  }).length;

  const paymentLogCount = orders.filter(o => {
    if (o.isDeleted === true || o.is_deleted === true || o.status === 'deleted' || deletedIdsRef.current.has(o.id)) return false;
    const status = getOrderStatus(o);
    const hasProof = !!o.utrNumber || !!o.paymentScreenshot;
    return hasProof || status === 'Delivered' || (!!o.paymentMethod && o.paymentMethod !== 'COD');
  }).length;

  const manualVerificationCount = orders.filter(o => {
    if (o.isDeleted === true || o.is_deleted === true || o.status === 'deleted' || deletedIdsRef.current.has(o.id)) return false;
    const status = getOrderStatus(o);
    return status === 'Pending Verification' || status === 'Pending Verify';
  }).length;

  const filteredOrders = orders.filter(o => {
    if (o.isDeleted === true || o.is_deleted === true || o.status === 'deleted' || deletedIdsRef.current.has(o.id)) return false;
    const status = getOrderStatus(o);
    const hasProof = !!o.utrNumber || !!o.paymentScreenshot;

    let tabMatch = false;
    if (activeTab === 'manual') {
      tabMatch = (status === 'Pending Verification' || status === 'Pending Verify');
    } else if (activeTab === 'payment') {
      tabMatch = hasProof || status === 'Delivered' || (!!o.paymentMethod && o.paymentMethod !== 'COD');
    } else if (activeTab === 'delivered') {
      tabMatch = (status === 'Delivered');
    } else {
      tabMatch = status !== 'Delivered' && status !== 'Pending Verification' && status !== 'Pending Verify';
    }

    const searchLower = searchTerm.toLowerCase();
    const idMatch = o.id ? o.id.toLowerCase().includes(searchLower) : false;
    const nameMatch = o.customerName ? o.customerName.toLowerCase().includes(searchLower) : false;
    const phoneMatch = o.customerPhone ? o.customerPhone.includes(searchTerm) : false;
    const utrMatch = o.utrNumber ? o.utrNumber.toLowerCase().includes(searchLower) : false;
    
    const searchMatch = !searchTerm || idMatch || nameMatch || phoneMatch || utrMatch;

    let dateMatch = true;
    if (o.createdAt) {
      try {
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        if (startDate && orderDateStr < startDate) {
          dateMatch = false;
        }
        if (endDate && orderDateStr > endDate) {
          dateMatch = false;
        }
      } catch (e) {
        console.error("Date filtering error", e);
      }
    } else if (startDate || endDate) {
      dateMatch = false;
    }

    return tabMatch && searchMatch && dateMatch;
  });

  const statusColors: Record<string, string> = {
    "Pending Verification": "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/50",
    "Pending Verify": "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/50",
    "Processing": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/50",
    "Order Confirmed": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50",
    "Order Placed": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/50",
    "Dispatched": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/25 dark:text-indigo-400 dark:border-indigo-900/50",
    "Out for Delivery": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/50",
    "Delivered": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50",
  };

  return (
    <div className="space-y-6">
      {/* Heading Layer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Package className="w-5.5 h-5.5 text-indigo-500 animate-pulse" />
          <span>{isBng ? 'অর্ডার ম্যানেজমেন্ট' : 'Order Management'}</span>
        </h3>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          {isBng ? 'প্রিন্ট সামারি' : 'Print Summary'}
        </button>
      </div>

      {/* Segmented Control Tabs (Pill / Capsule layout with Count Badges) */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl w-fit border border-slate-200/40 dark:border-slate-800 flex flex-wrap gap-1">
        {(['active', 'payment', 'manual', 'delivered'] as const).map(tab => {
          const count = tab === 'active' ? activeOrdersCount : tab === 'payment' ? paymentLogCount : tab === 'manual' ? manualVerificationCount : deliveredOrdersCount;
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400 shadow-xs border border-slate-200/10 dark:border-slate-700/50' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>
                {tab === 'active' ? (isBng ? 'সক্রিয় অর্ডার' : 'Active Orders') : 
                 tab === 'payment' ? (isBng ? 'পেমেন্ট লগ' : 'Payment Log') : 
                 tab === 'manual' ? (isBng ? 'ম্যানুয়াল যাচাইকরণ' : 'Manual Verification') :
                 (isBng ? 'ডেলিভার্ড অর্ডার' : 'Delivered Orders')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Controls Layer (Search & Date Picker Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={isBng ? 'অর্ডার আইডি, নাম, ফোন বা ইউটিআর দিয়ে খুঁজুন...' : 'Search order ID, name, phone, or UTR...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full shadow-sm placeholder:text-slate-400 dark:text-white"
          />
        </div>
        <div className="lg:col-span-6 flex flex-wrap items-center gap-4 justify-start lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isBng ? 'থেকে' : 'From'}</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isBng ? 'পর্যন্ত' : 'To'}</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:text-white"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-850">
              <Package className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">{isBng ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const currentStatus = getOrderStatus(order);
              const partnerAssigned = order.partner_assigned === true || order.partner_assigned === "true" || order.partnerAssigned === true || order.partnerAssigned === "true" || !!(order.deliveryPartnerName || order.delivery_partner_info?.name || order.delivery_partner_info?.deliveryPartnerName);
              const partnerName = order.deliveryPartnerName || order.delivery_partner_info?.name || order.delivery_partner_info?.deliveryPartnerName || (partnerAssigned ? (isBng ? "ডেলিভারি রাইডার" : "Express Delivery Partner") : "");
              const partnerPhone = order.deliveryPartnerPhone || order.delivery_partner_info?.phone || order.delivery_partner_info?.deliveryPartnerPhone || (partnerAssigned ? "9064517009" : "");

              return (
                <motion.div 
                  key={order.id}
                  layout
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold shadow-2xs">
                          #{order.id.slice(-4).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</h4>
                            <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-150 dark:border-slate-850 select-all">
                              ID: {order.id.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {order.customerPhone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdate(order.id, { status: e.target.value })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border shadow-3xs transition cursor-pointer outline-none ${statusColors[currentStatus] || "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20"}`}
                          title={isBng ? "১-ক্লিকে স্ট্যাটাস আপডেট করুন" : "Quick change status in 1 click"}
                        >
                          <option value="Pending Verification">{isBng ? "⏳ ম্যানুয়াল যাচাইকরণ (Pending)" : "⏳ Pending Verification"}</option>
                          <option value="Order Confirmed">{isBng ? "✅ নিশ্চিত করা হয়েছে (Confirmed)" : "✅ Order Confirmed"}</option>
                          <option value="Processing">{isBng ? "⚙️ প্রসেসিং হচ্ছে (Processing)" : "⚙️ Processing"}</option>
                          <option value="Dispatched">{isBng ? "📦 কুরিয়ারে পাঠানো হয়েছে (Dispatched)" : "📦 Dispatched"}</option>
                          <option value="Out for Delivery">{isBng ? "🚚 ডেলিভারিতে বের হয়েছে (Out for Delivery)" : "🚚 Out for Delivery"}</option>
                          <option value="Delivered">{isBng ? "🎉 সফলভাবে ডেলিভার্ড (Delivered)" : "🎉 Delivered"}</option>
                        </select>
                        {currentStatus !== "Order Confirmed" && currentStatus !== "Delivered" && currentStatus !== "Out for Delivery" && (
                          <button
                            onClick={() => handleUpdate(order.id, { status: "Order Confirmed" })}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            title={isBng ? "অর্ডারটি নিশ্চিত করতে ক্লিক করুন" : "Click to confirm order directly in Firestore"}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isBng ? "কনফার্ম করুন" : "Confirm Order"}</span>
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (editingId === order.id) {
                              setEditingId(null);
                            } else {
                              setEditingId(order.id);
                              setEditForm({
                                status: currentStatus,
                                deliveryPartnerName: partnerName,
                                deliveryPartnerPhone: partnerPhone,
                                expectedDeliveryDate: order.expectedDeliveryDate,
                                expectedDeliveryTime: order.expectedDeliveryTime,
                                notes: order.notes,
                                utrNumber: order.utrNumber,
                                paymentScreenshot: order.paymentScreenshot
                              });
                            }
                          }}
                          className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl transition text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSoftDeleteOrder(order.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          title={isBng ? "রিসাইকেল বিনে পাঠান" : "Move to Recycle Bin"}
                        >
                          <Trash className="w-3.5 h-3.5 text-rose-500" />
                          <span>{isBng ? "রিসাইকেল বিনে পাঠান" : "Move to Recycle Bin"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-5 bg-slate-50/50 dark:bg-slate-950/30 p-4.5 rounded-2xl border border-slate-100/80 dark:border-slate-800/50 mb-1">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {isBng ? 'ঠিকানা' : 'Address'}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed" title={order.customerAddress}>
                          {order.customerAddress}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 md:border-l md:border-slate-200/50 md:dark:border-slate-800 md:pl-4">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          {isBng ? 'ইউটিআর (UTR)' : 'UTR Number'}
                        </p>
                        {order.utrNumber ? (
                          <span className="inline-block text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                            {order.utrNumber}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                            N/A
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 md:border-l md:border-slate-200/50 md:dark:border-slate-800 md:pl-4">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Camera className="w-3 h-3 text-indigo-500" />
                          {isBng ? 'পেমেন্ট প্রুফ' : 'Payment Proof'}
                        </p>
                        {(() => {
                          const screenshotUrl = order.paymentScreenshot || order.paymentProof || order.payment_screenshot;
                          return screenshotUrl ? (
                            <div 
                              onClick={() => setSelectedScreenshotUrl(screenshotUrl)}
                              className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/20 group shadow-sm bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500 transition-all duration-200"
                            >
                              <img src={screenshotUrl} alt="Proof" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[8px] text-white font-bold transition-all duration-200">
                                <Eye className="w-3.5 h-3.5 mb-0.5" />
                                {isBng ? 'দেখুন' : 'View'}
                              </div>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 text-[8px] font-semibold select-none leading-none">
                              <Camera className="w-4 h-4 mb-1 text-slate-300 dark:text-slate-700" />
                              N/A
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-1.5 md:border-l md:border-slate-200/50 md:dark:border-slate-800 md:pl-4">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Truck className="w-3 h-3 text-indigo-500" />
                          {isBng ? 'ডেলিভারি পার্টনার' : 'Delivery Partner'}
                        </p>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {order.awbNumber ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {order.carrier || order.selectedCarrier || "Express Delivery"}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30 w-fit">
                                AWB: {order.awbNumber}
                              </span>
                              {order.awbNumber !== "INTERNAL-SELF" && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLabelAwb(order.awbNumber || null);
                                  }}
                                  className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold mt-1 text-left flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  {isBng ? 'শিপিং লেবেল দেখুন' : 'View Shipping Label'}
                                </button>
                              )}
                            </div>
                          ) : partnerName ? (
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex flex-col gap-0.5">
                              <span>{partnerName}</span>
                              {partnerPhone && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">{partnerPhone}</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">
                              {isBng ? 'নিযুক্ত করা হয়নি' : 'Not assigned'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 md:border-l md:border-slate-200/50 md:dark:border-slate-800 md:pl-4">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {isBng ? 'প্রত্যাশিত সময়' : 'Expected'}
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {order.expectedDeliveryDate ? (
                            <span className="bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-800 dark:text-slate-200 text-[10px]">
                              {order.expectedDeliveryDate}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Accordion Toggle Bar for Courier Dispatch Hub */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleCourierDispatch(order.id)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition cursor-pointer border border-indigo-100 dark:border-indigo-900/30"
                      >
                        <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{isBng ? "কুরিয়ার ডিসপ্যাচ হাব ও লেবেল" : "Courier Dispatch Hub & Labels"}</span>
                        {order.awbNumber && (
                          <span className="text-[9px] font-mono bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold ml-1">
                            AWB: {order.awbNumber}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedDispatchIds.has(order.id) ? "rotate-180" : ""}`} />
                      </button>
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        {expandedDispatchIds.has(order.id)
                          ? (isBng ? "সংকুচিত করতে ক্লিক করুন" : "Click to collapse")
                          : (isBng ? "লেবেল ও কুরিয়ার হাব প্রসারিত করুন" : "Expand dispatch station & QR label")}
                      </span>
                    </div>

                    {/* Expandable Courier Dispatch Hub & Scannable Labels Section */}
                    {expandedDispatchIds.has(order.id) && (
                      <div className="mt-3 p-5 bg-gradient-to-br from-indigo-50/40 to-slate-50/50 dark:from-indigo-950/10 dark:to-slate-950/30 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 space-y-4 animate-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/30 dark:border-indigo-900/20 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                              <QrCode className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                {isBng ? 'কুরিয়ার ডিসপ্যাচ হাব এবং স্ক্যানযোগ্য লেবেল' : 'Courier Dispatch Hub & Scannable Labels'}
                              </h4>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                {isBng ? 'স্বয়ংক্রিয় শিপমেন্ট জেনারেশন এবং ট্র্যাকিং কেন্দ্র' : 'Automated shipment generation & dispatch tracking station'}
                              </p>
                            </div>
                          </div>

                          {order.awbNumber ? (
                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100/30 dark:border-indigo-900/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {order.carrier || order.selectedCarrier || "Active Dispatch"}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800/80">
                              {isBng ? 'কুরিয়ার অ্যাসাইনমেন্টের অপেক্ষায়' : 'Awaiting Courier Assignment'}
                            </span>
                          )}
                        </div>

                        {!order.awbNumber ? (
                          <div className="space-y-4">
                            <div className="py-4 flex flex-col items-center justify-center text-center space-y-2">
                              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-600">
                                <Barcode className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                  {isBng ? 'কুরিয়ার বুকিং অপেক্ষমান' : 'Awaiting Courier Booking...'}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-md mx-auto mt-0.5">
                                  {isBng 
                                    ? "কুরিয়ার বুকিং করতে এবং এডব্লিউবি ও কিউআর/বারকোড তৈরি করতে নিচে আপনার কুরিয়ার পার্টনার নির্বাচন করুন এবং 'Create Shipment' বোতামে ক্লিক করুন।"
                                    : "Click 'Create Shipment' below to generate AWB and QR/Barcode label instantly for this order."}
                                </p>
                              </div>
                            </div>
                            <CourierBookingWidget 
                              order={order} 
                              isBng={isBng} 
                              onSuccess={async () => {
                                await fetchOrders(true);
                                triggerDashboardRefresh();
                              }} 
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            {/* QR Code / Barcode display column */}
                            <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center gap-4 bg-white dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-2xs">
                              {/* Dynamic QR Code from AWB */}
                              <div className="text-center">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(order.awbNumber)}`} 
                                  alt="AWB QR Code" 
                                  className="w-24 h-24 rounded-lg border border-slate-100 dark:border-slate-800 p-1 bg-white select-all"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[8px] font-bold text-slate-400 block mt-1">SCANNABLE QR</span>
                              </div>

                              {/* Separator / Barcode line */}
                              <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l md:border-l-0 lg:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4 md:pl-0 lg:pl-4 md:pt-3 lg:pt-0 w-full sm:w-auto md:w-full lg:w-auto">
                                <div className="w-36 h-10 bg-white p-1 flex items-stretch gap-[1.5px] overflow-hidden select-all" aria-label="Mock Barcode">
                                  {[
                                    1,2,3,1,2,1,4,1,2,3,2,1,3,1,2,3,4,1,2,1,3,2,1,2,1,3
                                  ].map((w, idx) => (
                                    <div 
                                      key={idx} 
                                      className="bg-slate-950 flex-grow" 
                                      style={{ opacity: idx % 2 === 0 ? 1 : 0, minWidth: `${w}px` }} 
                                    />
                                  ))}
                                </div>
                                <span className="font-mono text-[9px] font-bold text-slate-500 mt-1 tracking-widest">{order.awbNumber}</span>
                                <span className="text-[8px] font-bold text-slate-400 block mt-0.5">CARRIER BARCODE</span>
                              </div>
                            </div>

                            {/* Carrier Details & Actions column */}
                            <div className="md:col-span-7 space-y-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                  {isBng ? 'বরাদ্দকৃত কুরিয়ার পার্টনার' : 'Assigned Courier Partner'}
                                </span>
                                <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                  <Truck className="w-4 h-4 text-indigo-500" />
                                  {order.carrier || order.selectedCarrier || "Delhivery API"}
                                </h5>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                  {isBng ? 'এয়ার ওয়েবিল ট্র্যাকিং নাম্বার (AWB)' : 'Air Waybill Number (AWB)'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 select-all">
                                    {order.awbNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.awbNumber || "");
                                      setCopiedAwb(order.awbNumber || null);
                                      setTimeout(() => setCopiedAwb(null), 2000);
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    {copiedAwb === order.awbNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    {copiedAwb === order.awbNumber ? (isBng ? "অনুলিপি করা হয়েছে" : "Copied!") : (isBng ? "কপি করুন" : "Copy")}
                                  </button>
                                </div>
                              </div>

                              {/* One-Click Action Buttons */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLabelAwb(order.awbNumber || null)}
                                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  {isBng ? 'শিপিং লেবেল প্রিন্ট করুন' : 'Print Shipping Label'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Open real tracking link or a dedicated status page
                                    const carrierUrl = (order.carrier || "").toLowerCase().includes("xpress") 
                                      ? "https://www.xpressbees.com/track"
                                      : (order.carrier || "").toLowerCase().includes("ecom")
                                      ? "https://ecomexpress.in/tracking/"
                                      : "https://www.delhivery.com/track/package/" + order.awbNumber;
                                    window.open(carrierUrl, "_blank");
                                  }}
                                  className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  {isBng ? 'কুরিয়ার ট্র্যাকিং দেখুন' : 'Track Package Status'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSoftDeleteOrder(order.id)}
                                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                  title={isBng ? "রিসাইকেল বিনে পাঠান" : "Move to Recycle Bin"}
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                  {isBng ? 'রিসাইকেল বিনে পাঠান' : 'Move to Recycle Bin'}
                                </button>
                              </div>

                              {/* Custom Carrier API Payload Response Log if available */}
                              {order.customCarrierResponse && (
                                <div className="mt-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                  <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    Custom Carrier HTTP Payload Logged (Secure Client)
                                  </p>
                                  <pre className="text-[8px] font-mono text-slate-400 overflow-x-auto max-h-16 whitespace-pre">
                                    {JSON.stringify(order.customCarrierResponse, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dynamic Tracking Summary Timeline */}
                    {order.awbNumber && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            {isBng ? 'ডেলিভারি ট্র্যাকিং সামারি' : 'Delivery Tracking Summary'}
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-900/30">
                            {order.deliveryLogStatus || "Active Dispatch"}
                          </span>
                        </div>
                        
                        {/* Checkpoints Timeline */}
                        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-3 mt-1 ml-1.5">
                          {(order.trackingCheckpoints || [
                            {
                              status: order.deliveryLogStatus || "Label Generated",
                              location: "Dispatch Hub, Kolkata",
                              timestamp: order.createdAt || new Date().toISOString(),
                              description: `Shipment registered with ${order.carrier || order.selectedCarrier || "Delhivery"}.`
                            }
                          ]).map((cp: any, idx: number) => (
                            <div key={idx} className="relative">
                              {/* Dot marker */}
                              <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white dark:bg-slate-900 ${idx === 0 ? 'border-indigo-600 animate-pulse bg-indigo-500' : 'border-slate-300 dark:border-slate-700'}`} />
                              
                              <div className="text-[11px] space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{cp.status}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                    {new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">{cp.description}</p>
                                <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-mono font-medium">{cp.location}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                        <AnimatePresence>
                          {editingId === order.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-slate-100 pt-4 mt-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'অবস্থা' : 'Status'}</label>
                                    <select 
                                      value={editForm.status}
                                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                      <option value="Pending Verification">Pending Verification</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Order Confirmed">Order Confirmed</option>
                                      <option value="Dispatched">Dispatched</option>
                                      <option value="Out for Delivery">Out for Delivery</option>
                                      <option value="Delivered">Delivered</option>
                                    </select>
                                  </div>
                                  
                                  {editForm.status !== "Order Confirmed" ? (
                                    <>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'ইউটিআর (UTR)' : 'UTR Number'}</label>
                                        <input 
                                          type="text"
                                          value={editForm.utrNumber || ""}
                                          onChange={(e) => setEditForm({ ...editForm, utrNumber: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'পেমেন্ট স্ক্রিনশট (Base64)' : 'Payment Screenshot (Base64)'}</label>
                                        <input 
                                          type="text"
                                          placeholder="Paste base64 image string"
                                          value={editForm.paymentScreenshot || ""}
                                          onChange={(e) => setEditForm({ ...editForm, paymentScreenshot: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'পার্টনারের নাম' : 'Partner Name'}</label>
                                        <input 
                                          type="text"
                                          value={editForm.deliveryPartnerName || ""}
                                          onChange={(e) => setEditForm({ ...editForm, deliveryPartnerName: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'পার্টনারের ফোন' : 'Partner Phone'}</label>
                                        <input 
                                          type="text"
                                          value={editForm.deliveryPartnerPhone || ""}
                                          onChange={(e) => setEditForm({ ...editForm, deliveryPartnerPhone: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <LogisticsConfigForm 
                                      order={order} 
                                      isBng={isBng} 
                                      onSuccess={async (awb) => {
                                        setEditingId(null);
                                        await fetchOrders(true);
                                        triggerDashboardRefresh();
                                        if (awb && awb !== 'INTERNAL-SELF') {
                                          setSelectedLabelAwb(awb);
                                        }
                                      }}
                                    />
                                  )}

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? 'ডেলিভারি তারিখ' : 'Delivery Date'}</label>
                                  <input 
                                    type="date"
                                    value={editForm.expectedDeliveryDate || ""}
                                    onChange={(e) => setEditForm({ ...editForm, expectedDeliveryDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                              <button 
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                              >
                                {isBng ? 'বাতিল' : 'Cancel'}
                              </button>
                              <button 
                                onClick={() => handleUpdate(order.id, editForm)}
                                className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                {isBng ? 'সেভ করুন' : 'Save Changes'}
                              </button>
                              {/* Placeholder for future actions */}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
            </div>
          )}

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

      {/* Shipment Partner Selection Modal */}
      <AnimatePresence>
        {selectedShipmentOrderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedShipmentOrderId(null)}
            className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col cursor-default"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isBng ? 'ডেলিভারি পার্টনার নির্বাচন করুন' : 'Select Delivery Partner'}
                </span>
                <button 
                  onClick={() => setSelectedShipmentOrderId(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setDeliveryMethod('API')} className={`flex-1 p-3 rounded-xl text-sm font-bold ${deliveryMethod === 'API' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>API Logistics</button>
                  <button onClick={() => setDeliveryMethod('Self')} className={`flex-1 p-3 rounded-xl text-sm font-bold ${deliveryMethod === 'Self' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Self Delivery</button>
                </div>
                {deliveryMethod === 'API' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{isBng ? 'ডেলিভারি পার্টনার' : 'Carrier'}</label>
                    <select value={selectedCarrier} onChange={(e) => setSelectedCarrier(e.target.value as any)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                      {['Delhivery', 'Xpressbees', 'Ecom Express', 'DTDC'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input type="text" placeholder="Weight (kg)" value={shipmentWeight} onChange={(e) => setShipmentWeight(e.target.value)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                      <input type="text" placeholder="Dimensions (cm)" value={shipmentDimensions} onChange={(e) => setShipmentDimensions(e.target.value)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    </div>
                  </div>
                )}
                
                <textarea placeholder="Notes" value={shipmentNotes} onChange={(e) => setShipmentNotes(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />

                <button
                  onClick={async () => {
                    try {
                      if (deliveryMethod === 'Self') {
                         await updateOrderInSupabase(selectedShipmentOrderId!, {
                           status: "Out for Delivery",
                         });
                         alert("Assigned to Self Delivery!");
                      } else {
                        await fetch("/api/shipments/create", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ 
                            orderId: selectedShipmentOrderId, 
                            partner: selectedCarrier, 
                            weight: shipmentWeight, 
                            dimensions: shipmentDimensions, 
                            notes: shipmentNotes 
                          })
                        });
                        alert("Shipment created!");
                      }
                      setSelectedShipmentOrderId(null);
                      await fetchOrders(true);
                    } catch (e) {
                      console.error(e);
                      alert("Failed to assign shipment");
                    }
                  }}
                  className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold text-sm transition"
                >
                  {isBng ? 'নিশ্চিত করুন' : 'Confirm Shipment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Scannable Shipping Label Mockup Modal */}
      <AnimatePresence>
        {selectedLabelAwb && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLabelAwb(null)}
            className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col cursor-default text-slate-900"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  {isBng ? 'শিপিং লেবেল প্রিন্ট প্রিভিউ' : 'Shipping Label Print Preview'}
                </span>
                <button 
                  onClick={() => setSelectedLabelAwb(null)}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Area */}
              <div className="p-6 bg-white space-y-4 font-sans text-xs">
                {/* Carrier and Logo */}
                <div className="flex justify-between items-center border-b-2 border-slate-950 pb-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                      {selectedLabelAwb.split('-')[0] || 'DEL'} EXPRESS
                    </h2>
                    <p className="text-[9px] text-slate-500 font-bold tracking-wider">STANDARD AIR CARGO</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-slate-950 text-white px-2 py-1 rounded">
                      PREPAID
                    </span>
                  </div>
                </div>

                {/* Sender & Receiver Info */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 text-[11px]">
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-[9px] text-slate-400">Ship From:</p>
                    <p className="font-black text-slate-950">GLOBAL LOGISTICS HUB</p>
                    <p className="text-slate-600 font-medium leading-normal">Warehouse Block GX, Sector 5</p>
                    <p className="text-slate-600 font-medium">Kolkata, WB - 700091</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-[9px] text-slate-400">Ship To (Destination):</p>
                    {(() => {
                      const matchedOrder = orders.find(o => o.awbNumber === selectedLabelAwb);
                      return matchedOrder ? (
                        <>
                          <p className="font-black text-slate-950 uppercase">{matchedOrder.customerName || "Customer Name"}</p>
                          <p className="text-slate-600 font-medium leading-tight">{matchedOrder.customerAddress || "No Address Provided"}</p>
                          <p className="text-slate-600 font-medium font-mono">PH: {matchedOrder.customerPhone || "N/A"}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-black text-slate-950">RECIPIENT CUSTOMER</p>
                          <p className="text-slate-600 font-medium">Kolkata, West Bengal, India</p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Package details */}
                <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-3 text-center">
                  <div className="border-r border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Weight</p>
                    <p className="font-black text-slate-950 text-sm">
                      {(() => {
                        const matchedOrder = orders.find(o => o.awbNumber === selectedLabelAwb);
                        return matchedOrder?.weight ? `${matchedOrder.weight} kg` : "1.5 kg";
                      })()}
                    </p>
                  </div>
                  <div className="border-r border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Dims (LxWxH)</p>
                    <p className="font-black text-slate-950 font-mono text-[11px]">
                      {(() => {
                        const matchedOrder = orders.find(o => o.awbNumber === selectedLabelAwb);
                        return matchedOrder?.dimensions || "20x15x10 cm";
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Routing Code</p>
                    <p className="font-black text-indigo-600 font-mono text-[11px]">GXSH-CAL</p>
                  </div>
                </div>

                {/* Scannable Barcode Mockup */}
                <div className="flex flex-col items-center justify-center py-4 space-y-2 border-b-2 border-slate-950">
                  <div className="w-full max-w-[280px] h-16 bg-white flex items-stretch gap-[2px] overflow-hidden select-none" aria-label="Mock Barcode">
                    {[
                      2,4,1,3,1,2,4,1,2,3,4,1,2,1,3,4,1,3,2,1,4,1,2,3,1,4,2,1,3,1,2,4,1,2,3,4,1,2,1,3,4,1,3,2,1,4,1,2,3,1,4,2
                    ].map((w, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-950 flex-grow" 
                        style={{ opacity: idx % 2 === 0 ? 1 : 0, minWidth: `${w}px` }} 
                      />
                    ))}
                  </div>
                  <p className="font-mono text-xs font-black tracking-[0.25em] text-slate-900">{selectedLabelAwb}</p>
                </div>

                {/* Footer notes */}
                <div className="text-[9px] text-slate-500 font-medium text-center space-y-1">
                  <p>SCAN TO TRACK OR CONFIRM DELIVERY AT WAREHOUSE GATE</p>
                  <p className="text-slate-400">Powered by Integrated Logistics Automation Pipeline</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {isBng ? 'মুদ্রণ করুন (Print PDF)' : 'Print Label'}
                </button>
                <button 
                  onClick={() => setSelectedLabelAwb(null)}
                  className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isBng ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
