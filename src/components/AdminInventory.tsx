import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, AlertCircle, TrendingUp, ArrowDown, ArrowUp, RefreshCw, Layers, Edit, ShieldAlert, BadgeAlert, Plus, Check, Trash2 } from 'lucide-react';
import { Vehicle, Product } from '../types';

interface CustomStockItem {
  id: string;
  name: string;
  category: 'scooter' | 'spare_parts';
  sku: string;
  quantity: number;
  minThreshold: number;
  costPrice: number;
  sellingPrice: number;
  lastUpdated: string;
}

interface AdminInventoryProps {
  lang: 'bn' | 'en';
  vehicles?: Vehicle[];
  setVehicles?: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  products?: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  lang,
  vehicles = [],
  setVehicles,
  products = [],
  setProducts
}) => {
  const isBng = lang === 'bn';

  // Custom stock items created directly in inventory (starts empty [])
  const [customStock, setCustomStock] = useState<CustomStockItem[]>(() => {
    try {
      const saved = localStorage.getItem('sudipta_custom_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sudipta_custom_inventory', JSON.stringify(customStock));
  }, [customStock]);

  // Threshold overrides stored in localStorage per product/vehicle ID
  const [thresholds, setThresholds] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sudipta_inventory_thresholds');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sudipta_inventory_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Combine vehicles from website, products from website, and custom inventory items
  const stock = [
    ...vehicles.map(v => ({
      id: v.id,
      itemType: 'vehicle' as const,
      name: `${v.brand} ${v.model}`,
      category: 'scooter' as const,
      sku: `EV-${(v.brand || 'ECO').slice(0, 3)}-${(v.model || 'MOD').slice(0, 3)}`.toUpperCase(),
      quantity: v.stockQuantity ?? 0,
      minThreshold: thresholds[v.id] ?? 5,
      costPrice: v.offerPrice || v.price || 0,
      sellingPrice: v.price || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    })),
    ...products.map(p => ({
      id: p.id,
      itemType: 'product' as const,
      name: p.titleEng || p.titleBen || 'Product',
      category: 'spare_parts' as const,
      sku: `SP-${(p.category || 'PART').slice(0, 3)}-${p.id.slice(-4)}`.toUpperCase(),
      quantity: p.stock ?? 0,
      minThreshold: thresholds[p.id] ?? 5,
      costPrice: p.purchasePrice || Math.round((p.price || 0) * 0.7),
      sellingPrice: p.offerPrice || p.price || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    })),
    ...customStock.map(c => ({
      id: c.id,
      itemType: 'custom' as const,
      name: c.name,
      category: c.category,
      sku: c.sku,
      quantity: c.quantity,
      minThreshold: c.minThreshold,
      costPrice: c.costPrice,
      sellingPrice: c.sellingPrice,
      lastUpdated: c.lastUpdated
    }))
  ];

  const [activeTab, setActiveTab] = useState<'all' | 'low_stock' | 'scooters' | 'spares' | 'offline'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  
  // Offline Inventory State
  const [offlineStock, setOfflineStock] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sudipta_offline_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sudipta_offline_inventory', JSON.stringify(offlineStock));
  }, [offlineStock]);

  const handleUpdateOffline = (id: string, field: string, value: any) => {
    setOfflineStock(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, [field]: value } : item);
      return updated;
    });
  };

  const handleDeleteOffline = async (id: string) => {
    setOfflineStock(prev => prev.filter(item => item.id !== id));
  };
  
  const handleUpdateStock = (id: string, qty: number, thresh: number) => {
    const target = stock.find(s => s.id === id);
    if (!target) return;

    // Save custom threshold
    setThresholds(prev => ({ ...prev, [id]: thresh }));

    if (target.itemType === 'vehicle' && setVehicles) {
      setVehicles(prev => prev.map(v => v.id === id ? {
        ...v,
        stockQuantity: Math.max(0, qty),
        stockStatus: qty <= 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock"
      } : v));
    } else if (target.itemType === 'product' && setProducts) {
      setProducts(prev => prev.map(p => p.id === id ? {
        ...p,
        stock: Math.max(0, qty)
      } : p));
    } else if (target.itemType === 'custom') {
      setCustomStock(prev => prev.map(c => c.id === id ? {
        ...c,
        quantity: Math.max(0, qty),
        minThreshold: thresh,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : c));
    }
    setEditingId(null);
  };
  
  const addOfflineItem = () => {
    const newItem = { id: Date.now().toString(), name: 'New Item', location: 'Rack A', cost: 0, mrp: 0, retail: 0, b2b: 0, qty: 0, fittingCharge: 0, notes: '' };
    setOfflineStock(prev => [...prev, newItem]);
  };

  const incrementQty = (id: string, amount: number) => {
    const target = stock.find(s => s.id === id);
    if (!target) return;

    const newQty = Math.max(0, target.quantity + amount);

    if (target.itemType === 'vehicle' && setVehicles) {
      setVehicles(prev => prev.map(v => v.id === id ? {
        ...v,
        stockQuantity: newQty,
        stockStatus: newQty <= 0 ? "Out of Stock" : newQty <= 5 ? "Low Stock" : "In Stock"
      } : v));
    } else if (target.itemType === 'product' && setProducts) {
      setProducts(prev => prev.map(p => p.id === id ? {
        ...p,
        stock: newQty
      } : p));
    } else if (target.itemType === 'custom') {
      setCustomStock(prev => prev.map(c => c.id === id ? {
        ...c,
        quantity: newQty,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : c));
    }
  };

  const filteredStock = stock.filter(item => {
    if (activeTab === 'low_stock') return item.quantity <= item.minThreshold;
    if (activeTab === 'scooters') return item.category === 'scooter';
    if (activeTab === 'spares') return item.category === 'spare_parts';
    return true;
  });

  const lowStockCount = stock.filter(item => item.quantity <= item.minThreshold).length;

  return (
    <div className="space-y-6">
      {/* Overview stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-950/20 dark:to-slate-900/40 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{isBng ? 'মোট স্টক আইটেম' : 'Total SKU Count'}</span>
          <div className="flex items-center gap-3 mt-1">
            <Package className="w-5 h-5 text-indigo-500" />
            <strong className="text-xl font-black font-mono text-slate-800 dark:text-white">{stock.length}</strong>
          </div>
          <span className="text-[10px] text-slate-450 block mt-1.5">{isBng ? 'শোরুম ও স্পেয়ার পার্টস মিলিয়ে' : 'Vehicles and spare components'}</span>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 dark:from-rose-950/20 dark:to-slate-900/40 p-4 rounded-2xl border border-rose-100/40 dark:border-rose-900/30 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400 block tracking-wider">{isBng ? 'জরুরী কম স্টক এলার্ট' : 'Low Stock Critical Alerts'}</span>
          <div className="flex items-center gap-3 mt-1">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <strong className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">{lowStockCount}</strong>
          </div>
          <span className="text-[10px] text-slate-450 block mt-1.5">{isBng ? 'অতিসত্বর রিঅর্ডার করুন' : 'Requires immediate purchase reorder'}</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-950/20 dark:to-slate-900/40 p-4 rounded-2xl border border-emerald-100/45 dark:border-emerald-900/30">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{isBng ? 'স্টক সম্পদের মূল্যায়ন' : 'Estimated Stock Valuation'}</span>
          <div className="flex items-center gap-3 mt-1">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <strong className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{stock.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.costPrice || 0)), 0).toLocaleString()}
            </strong>
          </div>
          <span className="text-[10px] text-slate-450 block mt-1.5">{isBng ? 'ক্রয়মূল্যের ভিত্তিতে হিসাবকৃত' : 'Calculated at warehouse cost prices'}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {isBng ? 'সব আইটেম' : 'All Items'}
          </button>
          <button
            onClick={() => setActiveTab('low_stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'low_stock' 
                ? 'bg-rose-500 text-white shadow-xs' 
                : 'text-rose-500 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
            }`}
          >
            <BadgeAlert className="w-3.5 h-3.5" />
            <span>{isBng ? 'জরুরী রিঅর্ডার' : 'Low Stock'}</span>
            <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {lowStockCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('scooters')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'scooters' 
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {isBng ? 'শোরুম গাড়ি' : 'Scooters'}
          </button>
          <button
            onClick={() => setActiveTab('spares')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'spares' 
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {isBng ? 'খুচরা যন্ত্রাংশ' : 'Spare Parts'}
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'offline' 
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs' 
                : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {isBng ? 'অফলাইন স্টোর' : 'Offline Stores'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
          <Layers className="w-4 h-4 text-slate-400" />
          <span>{isBng ? 'ইনভেন্টরি থ্রেশহোল্ড স্বয়ংক্রিয় এলার্ট' : 'Inventory Threshold Alert System active'}</span>
        </div>
      </div>

      {/* Grid listing */}
      {activeTab === 'offline' ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 flex justify-between items-center">
             <h3 className="font-bold">{isBng ? 'অফলাইন ইনভেন্টরি' : 'Offline Inventory'}</h3>
             <button onClick={addOfflineItem} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold">+ {isBng ? 'নতুন যোগ করুন' : 'Add Item'}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">MRP</th>
                  <th className="p-4">Retail</th>
                  <th className="p-4">B2B</th>
                  <th className="p-4">Fitting Charge</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-center">{isBng ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {offlineStock.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="p-4"><input value={item.name} onChange={(e) => handleUpdateOffline(item.id, 'name', e.target.value)} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input value={item.location} onChange={(e) => handleUpdateOffline(item.id, 'location', e.target.value)} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input type="number" value={item.cost} onChange={(e) => handleUpdateOffline(item.id, 'cost', Number(e.target.value))} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input type="number" value={item.mrp} onChange={(e) => handleUpdateOffline(item.id, 'mrp', Number(e.target.value))} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input type="number" value={item.retail} onChange={(e) => handleUpdateOffline(item.id, 'retail', Number(e.target.value))} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input type="number" value={item.b2b} onChange={(e) => handleUpdateOffline(item.id, 'b2b', Number(e.target.value))} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4"><input type="number" value={item.fittingCharge || 0} onChange={(e) => handleUpdateOffline(item.id, 'fittingCharge', Number(e.target.value))} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4 flex items-center gap-1">
                      <button onClick={() => handleUpdateOffline(item.id, 'qty', Math.max(0, item.qty - 1))} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold cursor-pointer">-</button>
                      <span className="font-mono font-bold px-1">{item.qty}</span>
                      <button onClick={() => handleUpdateOffline(item.id, 'qty', item.qty + 1)} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold cursor-pointer">+</button>
                    </td>
                    <td className="p-4"><input value={item.notes} onChange={(e) => handleUpdateOffline(item.id, 'notes', e.target.value)} className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"/></td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteOffline(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title={isBng ? 'মুছে ফেলুন' : 'Delete Item'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {offlineStock.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                      {isBng ? 'কোনো অফলাইন আইটেম পাওয়া যায়নি' : 'No offline inventory items found. Click "+ Add Item" to create one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{isBng ? 'আইটেমের বিবরণ' : 'Item Details'}</th>
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">{isBng ? 'স্টক সংখ্যা' : 'In Stock'}</th>
                  <th className="p-4">{isBng ? 'মিনিমাম এলার্ট লিমিট' : 'Alert Limit'}</th>
                  <th className="p-4">{isBng ? 'মূল্য (Cost / Sell)' : 'Pricing'}</th>
                  <th className="p-4">{isBng ? 'আপডেট সময়' : 'Last Sync'}</th>
                  <th className="p-4 text-center">{isBng ? 'স্টক কন্ট্রোল' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredStock.map(item => {
                  const isCritical = item.quantity <= item.minThreshold;
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors ${isCritical ? 'bg-rose-50/20 dark:bg-rose-950/5' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${isCritical ? 'bg-rose-100/30 border-rose-200' : 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700'}`}>
                            <Package className={`w-4 h-4 ${isCritical ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
                          </div>
                          <div>
                            <strong className="text-slate-850 dark:text-white block font-bold leading-normal">{item.name}</strong>
                            <span className="text-[10px] text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {item.category === 'scooter' ? (isBng ? 'ই-স্কুটি' : 'Scooter') : (isBng ? 'পার্টস' : 'Spare Part')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-500 dark:text-slate-400 select-all">{item.sku}</td>
                      
                      <td className="p-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-16 p-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-bold"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {item.quantity} {isBng ? 'টি' : 'units'}
                            </span>
                            {isCritical && (
                              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                {isBng ? 'অল্প স্টক!' : 'Low Stock'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-16 p-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-bold"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                          />
                        ) : (
                          <span className="text-slate-500 dark:text-slate-450">
                            {item.minThreshold} {isBng ? 'টি' : 'units'}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                        <div className="space-y-0.5">
                          <div className="text-[10px]"><span className="text-slate-400">Cost:</span> ₹{(item.costPrice || 0).toLocaleString()}</div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold"><span className="text-slate-450 font-medium">Sell:</span> ₹{(item.sellingPrice || 0).toLocaleString()}</div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-400">{item.lastUpdated}</td>
                      
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <button
                              onClick={() => handleUpdateStock(item.id, parseInt(editQty) || 0, parseInt(editThreshold) || 1)}
                              className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                              title={isBng ? 'সংরক্ষণ' : 'Save'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditQty(item.quantity.toString());
                                  setEditThreshold(item.minThreshold.toString());
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-300 rounded-xl transition cursor-pointer"
                                title={isBng ? 'সম্পাদনা' : 'Quick Edit Alert'}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => incrementQty(item.id, 1)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-xl transition cursor-pointer font-bold text-[11px]"
                                title={isBng ? 'স্টক ১ বাড়ান' : 'Quick Add +1'}
                              >
                                +1
                              </button>
                              
                              <button
                                onClick={() => incrementQty(item.id, -1)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 rounded-xl transition cursor-pointer font-bold text-[11px]"
                                title={isBng ? 'স্টক ১ কমান' : 'Quick Deduct -1'}
                              >
                                -1
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reorder recommendations */}
      <div className="bg-amber-500/5 dark:bg-amber-950/10 p-5 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <strong className="text-slate-900 dark:text-amber-400 font-bold text-sm block">
              {isBng ? 'স্বয়ংক্রিয় রিঅর্ডার শিডিউলার অ্যাক্টিভ' : 'Automated Purchase Recommendation Active'}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-1">
              {isBng 
                ? 'আপনার ইনভেন্টরি থ্রেশহোল্ড অনুযায়ী কাস্টম ব্রেকিং এলার্ট এবং অটোমেটিক পার্টস সাপ্লায়ার রিকমেন্ডেশন তালিকা জেনারেট করা হয়েছে।' 
                : 'Smart triggers suggest initiating purchasing orders with our approved EV components supplier.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            alert(isBng ? 'খুচরা যন্ত্রাংশের অটো-অর্ডার রিকমেন্ডেশন পিডিএফ জেনারেট করা হচ্ছে...' : 'Generating auto-purchase order slip PDF with suppliers...');
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
        >
          {isBng ? 'রিকমেন্ডেশন অর্ডার রিলিজ করুন' : 'Export Auto-PO Slip'}
        </button>
      </div>
    </div>
  );
};
