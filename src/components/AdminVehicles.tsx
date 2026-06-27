import React, { useState } from "react";
import { Plus, Trash, Edit, Save, X, Camera, Sparkles } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Vehicle } from "../types";

interface AdminVehiclesProps {
  vehicles: Vehicle[];
  onAdd: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  onUpdate: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminVehicles({ vehicles, onAdd, onUpdate, onDelete, lang, t }: AdminVehiclesProps) {
  const isBng = lang === "bn";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [descEng, setDescEng] = useState("");
  const [descBen, setDescBen] = useState("");
  const [batteryEng, setBatteryEng] = useState("");
  const [batteryBen, setBatteryBen] = useState("");
  const [motor, setMotor] = useState("");
  const [range, setRange] = useState("");
  const [speed, setSpeed] = useState("");
  const [chargeTime, setChargeTime] = useState("");
  const [colorsEng, setColorsEng] = useState("");
  const [colorsBen, setColorsBen] = useState("");
  const [warrantyEng, setWarrantyEng] = useState("");
  const [warrantyBen, setWarrantyBen] = useState("");
  const [price, setPrice] = useState(85000);
  const [offerPrice, setOfferPrice] = useState(79999);
  const [emi, setEmi] = useState(2500);
  const [stockQuantity, setStockQuantity] = useState(5);
  const [imgUrl, setImgUrl] = useState("");

  const resetForm = () => {
    setBrand("");
    setModel("");
    setDescEng("");
    setDescBen("");
    setBatteryEng("");
    setBatteryBen("");
    setMotor("");
    setRange("");
    setSpeed("");
    setChargeTime("");
    setColorsEng("");
    setColorsBen("");
    setWarrantyEng("");
    setWarrantyBen("");
    setPrice(85000);
    setOfferPrice(79999);
    setEmi(2500);
    setStockQuantity(5);
    setImgUrl("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      brand: brand || "FLEETO",
      model,
      descriptionEng: descEng,
      descriptionBen: descBen || descEng,
      batteryTypeEng: batteryEng,
      batteryTypeBen: batteryBen || batteryEng,
      motorPower: motor,
      range,
      chargingTime: chargeTime,
      topSpeed: speed,
      colorsEng: colorsEng,
      colorsBen: colorsBen || colorsEng,
      warrantyEng: warrantyEng,
      warrantyBen: warrantyBen || warrantyEng,
      price,
      offerPrice,
      emiPrice: emi,
      stockStatus: stockQuantity > 2 ? "In Stock" : stockQuantity > 0 ? "Low Stock" : "Out of Stock",
      stockQuantity,
      images: [imgUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"],
      videoUrl: ""
    });
    setIsAdding(false);
    resetForm();
  };

  const handleEditClick = (v: Vehicle) => {
    setEditingId(v.id);
    setBrand(v.brand);
    setModel(v.model);
    setDescEng(v.descriptionEng);
    setDescBen(v.descriptionBen);
    setBatteryEng(v.batteryTypeEng);
    setBatteryBen(v.batteryTypeBen);
    setMotor(v.motorPower);
    setRange(v.range);
    setSpeed(v.topSpeed);
    setChargeTime(v.chargingTime);
    setColorsEng(v.colorsEng);
    setColorsBen(v.colorsBen);
    setWarrantyEng(v.warrantyEng);
    setWarrantyBen(v.warrantyBen);
    setPrice(v.price);
    setOfferPrice(v.offerPrice);
    setEmi(v.emiPrice);
    setStockQuantity(v.stockQuantity);
    setImgUrl(v.images[0] || "");
  };

  const handleUpdateSubmit = async (id: string) => {
    await onUpdate(id, {
      brand,
      model,
      descriptionEng: descEng,
      descriptionBen: descBen,
      batteryTypeEng: batteryEng,
      batteryTypeBen: batteryBen,
      motorPower: motor,
      range,
      topSpeed: speed,
      chargingTime: chargeTime,
      colorsEng,
      colorsBen,
      warrantyEng,
      warrantyBen,
      price,
      offerPrice,
      emiPrice: emi,
      stockQuantity,
      stockStatus: stockQuantity > 2 ? "In Stock" : stockQuantity > 0 ? "Low Stock" : "Out of Stock",
      images: [imgUrl]
    });
    setEditingId(null);
    resetForm();
  };

  return (
    <div id="admin-vehicles-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secVehicles}</h3>
          <p className="text-xs text-slate-500 mt-1">{isBng ? "আপনার শোরুমের গাড়ি এবং ইভি মডেল সংযোজন ও মূল্য পরিবর্তন করুন" : "Manage active showroom electric scooters and pricing metrics"}</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnAddNewVehicle}
          </button>
        )}
      </div>

      {/* Showroom Vehicle Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.btnAddNewVehicle}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.brand}</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. FLEETO" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.model}</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Wolf Warrior Lite" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গাড়ির ছবি লিংক (Photo URL)" : "Vehicle Photo URL"}</label>
              <input type="url" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://unsplash.com/..." className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ইংরেজি বিবরণ (Description Eng)" : "English Description"}</label>
              <textarea value={descEng} onChange={(e) => setDescEng(e.target.value)} placeholder="Describe specifications and features..." className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "বাংলা বিবরণ (Description Ben)" : "Bengali Description"}</label>
              <textarea value={descBen} onChange={(e) => setDescBen(e.target.value)} placeholder="স্কুটারের বিবরণ ও ফিচার লিখুন বাংলায়..." className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.batteryType} (Eng)</label>
              <input type="text" value={batteryEng} onChange={(e) => setBatteryEng(e.target.value)} placeholder="e.g. 60V 30Ah LFP" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.batteryType} (Ben)</label>
              <input type="text" value={batteryBen} onChange={(e) => setBatteryBen(e.target.value)} placeholder="যেমন: 60V 30Ah এলএফপি" className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.motorPower}</label>
              <input type="text" value={motor} onChange={(e) => setMotor(e.target.value)} placeholder="e.g. 1200W BLDC" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.range}</label>
              <input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 90-100 km" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.topSpeed}</label>
              <input type="text" value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="e.g. 50 km/h" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.chargingTime}</label>
              <input type="text" value={chargeTime} onChange={(e) => setChargeTime(e.target.value)} placeholder="e.g. 4 Hours" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.availableColors} (Eng)</label>
              <input type="text" value={colorsEng} onChange={(e) => setColorsEng(e.target.value)} placeholder="Red, White" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.availableColors} (Ben)</label>
              <input type="text" value={colorsBen} onChange={(e) => setColorsBen(e.target.value)} placeholder="লাল, সাদা" className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.price} (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.offerPrice} (₹)</label>
              <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "মাসিক ইএমআই শুরু (₹)" : "Starting EMI (₹)"}</label>
              <input type="number" value={emi} onChange={(e) => setEmi(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "স্টক পরিমাণ" : "Stock Quantity"}</label>
              <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.warranty} (Eng)</label>
              <input type="text" value={warrantyEng} onChange={(e) => setWarrantyEng(e.target.value)} placeholder="3 Years on Battery" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
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

      {/* Showroom CMS table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <th className="p-4 rounded-l-lg">Image</th>
                <th className="p-4">{t.brand} & {t.model}</th>
                <th className="p-4 text-right">Price (₹)</th>
                <th className="p-4 text-right">Offer Price (₹)</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 rounded-r-lg text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => {
                const isEditing = editingId === v.id;
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 w-16">
                      <img
                        src={v.images[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200"}
                        alt={v.model}
                        className="w-12 h-10 object-cover rounded-md border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="space-y-1.5 max-w-sm">
                          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[10px]" placeholder="Brand" />
                          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[11px] font-bold" placeholder="Model" />
                          <input type="text" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[9px] text-slate-400" placeholder="Image URL" />
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{v.brand}</span>
                          <strong className="text-slate-800 text-sm">{v.model}</strong>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-slate-500">
                      {isEditing ? (
                        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-20 text-right font-mono font-bold" />
                      ) : (
                        `₹ ${v.price.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {isEditing ? (
                        <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-20 text-right font-mono font-bold text-emerald-600" />
                      ) : (
                        `₹ ${v.offerPrice.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-16 text-center font-mono" />
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.stockQuantity > 2 ? "bg-blue-100 text-blue-800" : v.stockQuantity > 0 ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-rose-100 text-rose-800"
                        }`}>
                          {v.stockQuantity} Left
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleUpdateSubmit(v.id)} className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition cursor-pointer" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingId(null); resetForm(); }} className="p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2.5">
                          <button onClick={() => handleEditClick(v)} className="p-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(v.id)} className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer" title="Delete">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
