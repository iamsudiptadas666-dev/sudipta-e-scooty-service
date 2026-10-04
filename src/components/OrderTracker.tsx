import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Search, ArrowLeft, ShoppingBag, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { useDashboardRefresh } from '../hooks/useDashboardRefresh';

interface OrderTrackerProps {
  lang: 'bn' | 'en';
  onBack: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ lang, onBack }) => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stable silent refresh function
  const fetchSilently = useCallback(async () => {
    if (!phone) return;
    try {
      const res = await fetch(`/api/track-order?phone=${encodeURIComponent(phone)}&_t=${Date.now()}`);
      if (res.ok) {
        const found = await res.json();
        setOrders(found);
      }
    } catch (err) {
      console.error("Silent tracking refresh failed", err);
    }
  }, [phone]);

  // Use dashboard refresh emitter/subscriber hook
  useDashboardRefresh(fetchSilently);

  // Setup short-polling for real-time customer status updates across tabs/devices
  useEffect(() => {
    if (!orders || !phone) return;

    const interval = setInterval(() => {
      fetchSilently();
    }, 5000);

    return () => clearInterval(interval);
  }, [phone, !!orders, fetchSilently]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const res = await fetch(`/api/track-order?phone=${encodeURIComponent(phone)}&_t=${Date.now()}`);
      if (res.ok) {
        const found = await res.json();
        setOrders(found);
      } else {
        const errorData = await res.json();
        setError(lang === 'bn' ? 'এই নম্বরের জন্য কোনো অর্ডার পাওয়া যায়নি।' : errorData.message || 'No orders found for this number.');
      }
    } catch (err) {
      setError(lang === 'bn' ? 'সার্ভার ত্রুটি। পরে চেষ্টা করুন।' : 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'Initiated', label: lang === 'bn' ? 'অর্ডার শুরু হয়েছে' : 'Initiated', icon: ShoppingBag, color: 'emerald' },
    { key: 'Verified', label: lang === 'bn' ? 'পেমেন্ট যাচাইকৃত' : 'Verified', icon: ShieldCheck, color: 'blue' },
    { key: 'Confirmed', label: lang === 'bn' ? 'অর্ডার নিশ্চিত' : 'Confirmed', icon: CheckCircle, color: 'indigo' },
    { key: 'Dispatched', label: lang === 'bn' ? 'পাঠানো হয়েছে' : 'Dispatched', icon: Package, color: 'amber' },
    { key: 'Delivered', label: lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered', icon: CheckCircle, color: 'emerald' },
  ];

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

  const getNormalizedStepIndex = (order: Order) => {
    const status = getOrderStatus(order);
    const isVerified = (order as any).is_verified === true || (order as any).is_verified === "true" || (order as any).isVerified === true || (order as any).isVerified === "true" || !!((order as any).utrNumber || (order as any).paymentScreenshot);

    if (status === 'Delivered') return 4;
    if (status === 'Out for Delivery' || status === 'Dispatched') return 3;
    if (status === 'Order Confirmed') return 2;
    
    // If status is Pending/Processing, check if it's "Verified" (has proof)
    if (isVerified || status === 'Processing') return 1;
    
    // Default to Initiated
    return 0;
  };

  // Find the first active order (not Delivered) or the most recent one
  const activeOrder = orders && orders.length > 0 ? (orders.find(o => getOrderStatus(o) !== 'Delivered') || orders[0]) : null;
  const historyOrders = orders ? orders.filter(o => o.id !== activeOrder?.id) : [];

  const partnerAssigned = activeOrder ? (activeOrder.partner_assigned === true || activeOrder.partner_assigned === "true" || activeOrder.partnerAssigned === true || activeOrder.partnerAssigned === "true" || !!(activeOrder.deliveryPartnerName || activeOrder.delivery_partner_info?.name || activeOrder.delivery_partner_info?.deliveryPartnerName)) : false;
  const partnerName = activeOrder?.deliveryPartnerName || activeOrder?.delivery_partner_info?.name || activeOrder?.delivery_partner_info?.deliveryPartnerName || (partnerAssigned ? (lang === 'bn' ? "ডেলিভারি রাইডার" : "Express Delivery Partner") : "");
  const partnerPhone = activeOrder?.deliveryPartnerPhone || activeOrder?.delivery_partner_info?.phone || activeOrder?.delivery_partner_info?.deliveryPartnerPhone || (partnerAssigned ? "9064517009" : "");

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">{lang === 'bn' ? 'পিছনে ফিরুন' : 'Go Back'}</span>
        </button>

        {!orders ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100"
          >
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50 rotate-3 group-hover:rotate-0 transition-transform">
                <Search className="w-10 h-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
                {lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Order Tracking'}
              </h1>
              <p className="text-slate-500 mt-3 font-medium max-w-sm mx-auto">
                {lang === 'bn' ? 'আপনার অর্ডারের ইতিহাস এবং বর্তমান অবস্থা জানতে ফোন নম্বর দিন' : 'Enter your mobile number to view order history and track current orders'}
              </p>
            </div>

            <form onSubmit={handleTrack} className="space-y-8 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Enter Mobile Number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9064517009"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 shadow-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                  {error}
                </p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{lang === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking'}</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Active Status Card */}
            {activeOrder && (
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {lang === 'bn' ? 'সর্বশেষ অর্ডার' : 'Latest Order'} #{activeOrder.id}
                    </h2>
                    <p className="text-slate-500 text-sm">Placed on {activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs border border-emerald-100">
                    {getOrderStatus(activeOrder)}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative pt-8 pb-12 overflow-x-auto custom-scrollbar">
                  <div className="absolute left-0 top-[60px] md:top-[68px] w-full h-1 bg-slate-100 z-0 hidden md:block min-w-[600px]">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      style={{ width: `${(getNormalizedStepIndex(activeOrder) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0 min-w-full md:min-w-[600px] px-2">
                    {steps.map((step, idx) => {
                      const isActive = idx <= getNormalizedStepIndex(activeOrder);
                      const isCurrent = idx === getNormalizedStepIndex(activeOrder);
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 group">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                            <Icon className={`w-6 h-6 ${isCurrent ? 'animate-bounce-subtle' : ''}`} />
                            {isCurrent && (
                              <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl animate-ping" />
                            )}
                          </div>
                          <div className="text-left md:text-center">
                            <span className={`block text-[10px] md:text-xs font-bold uppercase tracking-tight transition-colors duration-500 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                            {isCurrent && (
                              <motion.span 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest block"
                              >
                                {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Active'}
                              </motion.span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Details Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'bn' ? 'প্রত্যাশিত ডেলিভারি' : 'Expected Delivery'}</p>
                        <p className="text-lg font-bold text-slate-900 leading-none">
                          {activeOrder.expectedDeliveryDate}
                        </p>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          {activeOrder.expectedDeliveryTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-sm border border-amber-100">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}</p>
                        <p className="font-bold text-slate-800 leading-snug">{activeOrder.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Truck className="w-20 h-20 rotate-12" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{lang === 'bn' ? 'ডেলিভারি পার্টনার' : 'Delivery Executive'}</p>
                    
                    {partnerName ? (
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
                            {partnerName.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-white leading-none">{partnerName}</p>
                            {partnerPhone && (
                              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                <Phone className="w-3 h-3" />
                                {partnerPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        {partnerPhone && (
                          <a 
                            href={`tel:${partnerPhone}`}
                            className="w-full py-3 bg-white text-slate-900 font-black rounded-xl shadow-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 group/btn"
                          >
                            <Phone className="w-4 h-4 group-hover/btn:animate-shake" />
                            <span>{lang === 'bn' ? 'কল করুন' : 'Call Partner'}</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                          <AlertCircle className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-400 italic">
                          {lang === 'bn' ? 'পার্টনার এখনো বরাদ্দ করা হয়নি' : 'Awaiting partner assignment'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order History */}
            {historyOrders.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    {lang === 'bn' ? 'অর্ডার ইতিহাস' : 'Order History'}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200 uppercase">
                    {historyOrders.length} {lang === 'bn' ? 'পূর্ববর্তী অর্ডার' : 'Past Orders'}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {historyOrders.map(historyOrder => (
                    <div key={historyOrder.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-slate-800">Order #{historyOrder.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {historyOrder.createdAt ? new Date(historyOrder.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600">₹{(historyOrder.totalAmount || 0).toLocaleString()}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[10px] uppercase tracking-wider">
                            {historyOrder.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                        {(historyOrder.items || []).map(item => (
                          <div key={item.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 font-semibold">{item.name} x {item.quantity}</span>
                            <span className="text-slate-400 font-bold">₹{(item.price || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setOrders(null)}
              className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
            >
              {lang === 'bn' ? 'অন্য নম্বর দিয়ে খুঁজুন' : 'Track Another Number'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
