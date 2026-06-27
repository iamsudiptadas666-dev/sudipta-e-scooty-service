import React, { useState } from "react";
import { Plus, Trash, Edit, Save, X, Tag, Sparkles } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Product } from "../types";

interface AdminProductsProps {
  products: Product[];
  onAdd: (product: Omit<Product, "id">) => Promise<void>;
  onUpdate: (id: string, product: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminProducts({ products, onAdd, onUpdate, onDelete, lang, t }: AdminProductsProps) {
  const isBng = lang === "bn";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [titleEng, setTitleEng] = useState("");
  const [titleBen, setTitleBen] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Battery");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(2500);
  const [offerPrice, setOfferPrice] = useState(1999);
  const [purchasePrice, setPurchasePrice] = useState(1400);
  const [stock, setStock] = useState(10);
  const [descEng, setDescEng] = useState("");
  const [descBen, setDescBen] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const resetForm = () => {
    setTitleEng("");
    setTitleBen("");
    setCategory("Battery");
    setBrand("");
    setPrice(2500);
    setOfferPrice(1999);
    setPurchasePrice(1400);
    setStock(10);
    setDescEng("");
    setDescBen("");
    setImgUrl("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      titleEng,
      titleBen: titleBen || titleEng,
      category,
      brand: brand || "Sudipta Power",
      price,
      offerPrice,
      purchasePrice,
      stock,
      descriptionEng: descEng,
      descriptionBen: descBen || descEng,
      images: [imgUrl || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800"]
    });
    setIsAdding(false);
    resetForm();
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setTitleEng(p.titleEng);
    setTitleBen(p.titleBen);
    setCategory(p.category);
    setBrand(p.brand);
    setPrice(p.price);
    setOfferPrice(p.offerPrice);
    setPurchasePrice(p.purchasePrice);
    setStock(p.stock);
    setDescEng(p.descriptionEng);
    setDescBen(p.descriptionBen);
    setImgUrl(p.images[0] || "");
  };

  const handleUpdateSubmit = async (id: string) => {
    await onUpdate(id, {
      titleEng,
      titleBen,
      category,
      brand,
      price,
      offerPrice,
      purchasePrice,
      stock,
      descriptionEng: descEng,
      descriptionBen: descBen,
      images: [imgUrl]
    });
    setEditingId(null);
    resetForm();
  };

  return (
    <div id="admin-products-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secSpareParts}</h3>
          <p className="text-xs text-slate-500 mt-1">{isBng ? "ব্যাটারি, চার্জার, কন্ট্রোলারের স্টক ক্যাটালগ এবং ক্রয়-বিক্রয় হিসেব" : "Manage inventory, purchase cost, wholesale offers, and active alerts"}</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnAddNewPart}
          </button>
        )}
      </div>

      {/* Add Product Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.btnAddNewPart}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খুচরা আইটেমের নাম (English)" : "Item Name (English)"}</label>
              <input type="text" value={titleEng} onChange={(e) => setTitleEng(e.target.value)} placeholder="e.g. Smart LFP Battery 60V" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "খুচরা আইটেমের নাম (বাংলা)" : "Item Name (Bengali)"}</label>
              <input type="text" value={titleBen} onChange={(e) => setTitleBen(e.target.value)} placeholder="যেমন: স্মার্ট এলএফপি ব্যাটারি" className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ক্যাটাগরি" : "Category"}</label>
              <select
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                value={category}
                onChange={(e) => setCategory(e.target.value as Product["category"])}
              >
                <option value="Battery">Battery (ব্যাটারি)</option>
                <option value="Charger">Charger (চার্জার)</option>
                <option value="Controller">Controller (কন্ট্রোলার)</option>
                <option value="Motor">Motor (মোটর)</option>
                <option value="Brake Parts">Brake Parts (ব্রেক পার্টস)</option>
                <option value="Tyres">Tyres (টায়ার)</option>
                <option value="Lights">Lights (লাইট)</option>
                <option value="Accessories">Accessories (এক্সেসরিজ)</option>
                <option value="Other">Other (অন্যান্য)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.brand}</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Sudipta Power" className="w-full p-2 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "পার্টস এর ছবি লিংক (Photo URL)" : "Photo URL"}</label>
              <input type="url" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://unsplash.com/..." className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ইংরেজি বিবরণ (Description Eng)" : "English Description"}</label>
              <textarea value={descEng} onChange={(e) => setDescEng(e.target.value)} placeholder="Technical specifications..." className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "বাংলা বিবরণ (Description Ben)" : "Bengali Description"}</label>
              <textarea value={descBen} onChange={(e) => setDescBen(e.target.value)} placeholder="পার্টস বা ব্যাটারির বিবরণ বাংলায়..." className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ক্রয় মূল্য (Purchase Price ₹)" : "Purchase Price (₹)"}</label>
              <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.price} (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.offerPrice} (₹)</label>
              <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "স্টক পরিমাণ (Units)" : "Stock (Units)"}</label>
              <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
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

      {/* Parts Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <th className="p-4 rounded-l-lg">Photo</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Cost (₹)</th>
                <th className="p-4 text-right">Sale (₹)</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 rounded-r-lg text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isEditing = editingId === p.id;
                const isLowStock = p.stock <= 5;
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition ${isLowStock ? "bg-rose-50/20" : ""}`}>
                    <td className="p-4 w-16">
                      <img
                        src={p.images[0] || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200"}
                        alt={p.titleEng}
                        className="w-10 h-10 object-cover rounded border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="space-y-1.5 max-w-sm">
                          <input type="text" value={titleEng} onChange={(e) => setTitleEng(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[10px]" placeholder="Name Eng" />
                          <input type="text" value={titleBen} onChange={(e) => setTitleBen(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[11px] font-bold" placeholder="Name Ben" />
                          <input type="text" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[9px]" placeholder="Image URL" />
                        </div>
                      ) : (
                        <div>
                          <strong className="text-slate-800 text-sm block">{isBng ? p.titleBen : p.titleEng}</strong>
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{p.brand}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <select value={category} onChange={(e) => setCategory(e.target.value as Product["category"])} className="p-1 border border-slate-200 rounded text-[11px]">
                          <option value="Battery">Battery</option>
                          <option value="Charger">Charger</option>
                          <option value="Controller">Controller</option>
                          <option value="Motor">Motor</option>
                          <option value="Brake Parts">Brake Parts</option>
                          <option value="Tyres">Tyres</option>
                          <option value="Lights">Lights</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono">
                          {p.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500 font-medium">
                      {isEditing ? (
                        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-20 text-right font-mono" />
                      ) : (
                        `₹ ${p.purchasePrice.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-20 text-right text-[10px] text-slate-400 font-mono" placeholder="Price" />
                          <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-20 text-right font-mono font-bold text-emerald-600" placeholder="Offer" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-300 line-through">₹ {p.price.toLocaleString()}</span>
                          <span>₹ {p.offerPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="p-1 border border-slate-200 rounded w-16 text-center font-mono" />
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isLowStock ? "bg-rose-100 text-rose-800 animate-pulse" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {p.stock} Units
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleUpdateSubmit(p.id)} className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition cursor-pointer" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingId(null); resetForm(); }} className="p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2.5">
                          <button onClick={() => handleEditClick(p)} className="p-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(p.id)} className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer" title="Delete">
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
