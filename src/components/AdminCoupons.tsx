import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Plus, Trash2, Tag, Calendar, AlertCircle, Percent, Coins, ShoppingBag, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  description: string;
}

interface AdminCouponsProps {
  lang: 'bn' | 'en';
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ lang }) => {
  const isBng = lang === 'bn';

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [maxUsage, setMaxUsage] = useState('');

  const handleToggleActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm(isBng ? 'আপনি কি নিশ্চিতভাবে এই কুপনটি ডিলিট করতে চান?' : 'Are you sure you want to delete this coupon?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minPurchase || !expiryDate) return;

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      value: parseFloat(value),
      minPurchase: parseFloat(minPurchase),
      expiryDate,
      isActive: true,
      usageCount: 0,
      maxUsage: maxUsage ? parseInt(maxUsage) : undefined,
      description: description || (isBng ? 'স্পেশাল প্রমোশনাল ছাড়' : 'Special promotional offer'),
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setShowAddForm(false);
    
    // Clear Form
    setCode('');
    setDiscountType('percentage');
    setValue('');
    setMinPurchase('');
    setExpiryDate('');
    setDescription('');
    setMaxUsage('');
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Ticket className="w-5.5 h-5.5 text-indigo-500" />
            <span>{isBng ? 'ডিসকাউন্ট এবং কুপন ইঞ্জিন' : 'Discount & Coupon Engine'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            {isBng ? 'গ্রাহকদের জন্য ডিসকাউন্ট কোড এবং প্রোমো অফার তৈরি ও পরিচালনা করুন।' : 'Generate and manage active promotional codes, referral programs, and purchase discount campaigns.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isBng ? 'নতুন কুপন যোগ করুন' : 'Add New Coupon'}
        </button>
      </div>

      {/* Add Coupon Dialog Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 space-y-4"
          >
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'কুপন কোড (Promo Code)' : 'Promo Code'}</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'ছাড়ের ধরণ' : 'Discount Type'}</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="percentage">{isBng ? 'শতকরা শতকরা (%)' : 'Percentage (%)'}</option>
                  <option value="flat">{isBng ? 'ফ্ল্যাট ছাড় (₹)' : 'Flat Amount (₹)'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">
                  {discountType === 'percentage' ? (isBng ? 'শতকরা ছাড় (%)' : 'Discount Value (%)') : (isBng ? 'টাকা ফ্ল্যাট ছাড় (₹)' : 'Flat Value (₹)')}
                </label>
                <input 
                  type="number"
                  required
                  placeholder={discountType === 'percentage' ? '15' : '500'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'সর্বনিম্ন অর্ডার মূল্য (₹)' : 'Min Purchase Amount (₹)'}</label>
                <input 
                  type="number"
                  required
                  placeholder="500"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'মেয়াদ শেষ হওয়ার তারিখ' : 'Expiration Date'}</label>
                <input 
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'সর্বোচ্চ ব্যবহার (ঐচ্ছিক)' : 'Max Usage Limit (Optional)'}</label>
                <input 
                  type="number"
                  placeholder="e.g. 100"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'কুপন বিবরণ (Description)' : 'Coupon Description'}</label>
                <input 
                  type="text"
                  placeholder={isBng ? 'যেমন: পুজোর অফার উপলক্ষ্যে স্পেশাল ১৫% ডিসকাউন্ট' : 'e.g. Get 15% discount during special customer campaigns'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {isBng ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  {isBng ? 'কুপন তৈরি করুন' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Cards Grid */}
      {coupons.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
            {isBng ? 'কোনো সক্রিয় কুপন বা প্রোমো কোড নেই।' : 'No promo codes or coupons created yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => {
            const isExpired = new Date(coupon.expiryDate) < new Date();
            return (
              <div 
                key={coupon.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between ${
                  coupon.isActive && !isExpired 
                    ? 'border-indigo-100 dark:border-indigo-900/30 shadow-indigo-500/2' 
                    : 'border-slate-100 dark:border-slate-850 opacity-75'
                }`}
              >
                {/* Ticket Jagged Border Visual Mask */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-600 dark:bg-indigo-500" />
                
                <div className="pl-2 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 select-all">
                        <Tag className="w-3.5 h-3.5" />
                        {coupon.code}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-1.5 font-medium">
                        {coupon.description}
                      </p>
                    </div>
                    
                    {/* Toggle Active status switch */}
                    <button
                      onClick={() => handleToggleActive(coupon.id)}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                    >
                      {coupon.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-350" />
                      )}
                    </button>
                  </div>

                  {/* Offer Details */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100/80 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isBng ? 'ছাড়ের পরিমাণ' : 'Discount Value'}</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1 mt-0.5 font-mono">
                        <Percent className="w-3.5 h-3.5 text-indigo-500" />
                        {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isBng ? 'সর্বনিম্ন ক্রয়' : 'Min Ticket'}</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1 mt-0.5 font-mono">
                        <Coins className="w-3.5 h-3.5 text-indigo-500" />
                        ₹{coupon.minPurchase}
                      </strong>
                    </div>
                  </div>

                  {/* Expiry and Total Usages footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-450 dark:text-slate-500 font-medium font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exp: {coupon.expiryDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isBng ? `ব্যবহার: ${coupon.usageCount}বার` : `Used: ${coupon.usageCount}`}</span>
                    </div>
                  </div>
                </div>

                {/* Quick visible Trash Trigger */}
                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
