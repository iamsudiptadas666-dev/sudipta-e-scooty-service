import React, { useState, useEffect } from "react";
import { Plus, Trash, Edit, Save, X, Tag, Sparkles, Upload, Image as ImageIcon, Check } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { parseNumericValue } from "../utils";
import { Product } from "../types";
import { getProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase } from "../lib/supabase";

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  "Battery": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
  "Charger": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
  "Controller": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  "Motor": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
  "Brake Parts": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800",
  "Tyres": "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800",
  "Lights": "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800",
  "Accessories": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
  "Other": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800"
};

export function getDefaultProductImage(category?: string): string {
  if (category && CATEGORY_DEFAULT_IMAGES[category]) {
    return CATEGORY_DEFAULT_IMAGES[category];
  }
  return "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800";
}

interface AdminProductsProps {
  products: Product[];
  onAdd: (product: Omit<Product, "id">) => Promise<void>;
  onUpdate: (id: string, product: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminProducts({ products: propProducts = [], onAdd, onUpdate, onDelete, lang, t }: AdminProductsProps) {
  const isBng = lang === "bn";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>(propProducts);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalize helper to guarantee every product has titleEng, name, offerPrice, purchasePrice and category-smart image
  const normalizeProduct = (p: any): Product => {
    const eng = p.titleEng || p.name || p.title_eng || p.title || '';
    const ben = p.titleBen || p.title_ben || eng;
    const cat = p.category || 'General';

    const rawImg = (p.images && p.images[0]) || p.image;
    const isOldGenericPlaceholder = !rawImg || rawImg.includes("photo-1619642751034-765dfdf7c58e");
    const resolvedImg = isOldGenericPlaceholder ? getDefaultProductImage(cat) : rawImg;
    const imgList = Array.isArray(p.images) && p.images.length > 0 && !isOldGenericPlaceholder
      ? p.images 
      : [resolvedImg];

    return {
      ...p,
      id: p.id,
      titleEng: eng,
      titleBen: ben,
      name: eng,
      category: cat,
      brand: p.brand || 'Sudipta Power',
      price: (() => {
        const reg = Number(p.price || 0);
        const off = Number(p.offerPrice !== undefined ? p.offerPrice : (p.offer_price !== undefined ? p.offer_price : 0));
        return reg > 0 ? reg : (off > 0 ? off : 0);
      })(),
      offerPrice: (() => {
        const reg = Number(p.price || 0);
        const off = Number(p.offerPrice !== undefined ? p.offerPrice : (p.offer_price !== undefined ? p.offer_price : 0));
        return off > 0 ? off : (reg > 0 ? reg : 0);
      })(),
      purchasePrice: Number(p.purchasePrice ?? p.purchase_price ?? 0),
      stock: Number(p.stock || 0),
      images: imgList,
      image: resolvedImg,
      deliveryCharge: Number(p.deliveryCharge ?? p.delivery_charge ?? 0)
    };
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Sync from props if provided
    if (Array.isArray(propProducts)) {
      setLocalProducts(propProducts.map(normalizeProduct));
    } else {
      // Check localStorage
      const saved = localStorage.getItem("sudipta_products");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalProducts(parsed.map(normalizeProduct));
          }
        } catch (e) {
          console.error("Error parsing saved products", e);
        }
      }
    }

    // 2. Always fetch latest directly from Supabase to ensure fresh DB sync
    getProductsFromSupabase().then(dbProducts => {
      if (isMounted && Array.isArray(dbProducts)) {
        setLocalProducts(dbProducts.map(normalizeProduct));
      }
    }).catch(err => console.error("Supabase products load error:", err));

    return () => { isMounted = false; };
  }, [propProducts]);

  const displayProducts = (Array.isArray(localProducts) ? localProducts : propProducts).map(normalizeProduct);

  // Form Fields
  const [titleEng, setTitleEng] = useState("");
  const [titleBen, setTitleBen] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Battery");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState<number | "">(2500);
  const [offerPrice, setOfferPrice] = useState<number | "">(1999);
  const [purchasePrice, setPurchasePrice] = useState<number | "">(1400);
  const [stock, setStock] = useState<number | "">(10);
  const [descEng, setDescEng] = useState("");
  const [descBen, setDescBen] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState<number | "">(0);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(isBng ? "ছবির সাইজ ১০ এমবি এর কম হতে হবে।" : "Image size must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImgUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
    setImgUrl(getDefaultProductImage("Battery"));
    setDeliveryCharge(0);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = Number(price) || 0;
    const cleanOffer = Number(offerPrice) || 0;
    const cleanPurchase = Number(purchasePrice) || 0;
    const cleanStock = Number(stock) || 0;
    const cleanDelivery = Number(deliveryCharge) || 0;
    const finalPhoto = imgUrl.trim() || getDefaultProductImage(category);

    await onAdd({
      titleEng,
      titleBen: titleBen || titleEng,
      category,
      brand: brand || "Sudipta Power",
      price: cleanPrice,
      offerPrice: cleanOffer > 0 ? cleanOffer : cleanPrice,
      purchasePrice: cleanPurchase,
      stock: cleanStock,
      descriptionEng: descEng,
      descriptionBen: descBen || descEng,
      deliveryCharge: cleanDelivery,
      images: [finalPhoto]
    });
    setIsAdding(false);
    resetForm();
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setTitleEng(p.titleEng || (p as any).name || (p as any).title_eng || (p as any).title || "");
    setTitleBen(p.titleBen || (p as any).title_ben || p.titleEng || (p as any).name || "");
    setCategory(p.category || "Battery");
    setBrand(p.brand || "Sudipta Power");
    setPrice(p.price || 0);
    setOfferPrice(p.offerPrice ?? (p as any).offer_price ?? p.price ?? 0);
    setPurchasePrice(p.purchasePrice ?? (p as any).purchase_price ?? 0);
    setStock(p.stock || 0);
    setDescEng(p.descriptionEng || (p as any).description_eng || (p as any).description || "");
    setDescBen(p.descriptionBen || (p as any).description_ben || (p as any).description || "");
    
    const rawPhoto = (p.images && p.images[0]) || p.image || "";
    const isGenericWrench = rawPhoto.includes("photo-1619642751034-765dfdf7c58e");
    setImgUrl(isGenericWrench ? getDefaultProductImage(p.category) : rawPhoto);
    setDeliveryCharge(p.deliveryCharge ?? (p as any).delivery_charge ?? 0);
  };

  const handleUpdateSubmit = async (id: string) => {
    const cleanPrice = Number(price) || 0;
    const cleanOffer = Number(offerPrice) || 0;
    const cleanPurchase = Number(purchasePrice) || 0;
    const cleanStock = Number(stock) || 0;
    const cleanDelivery = Number(deliveryCharge) || 0;
    const finalPhoto = imgUrl.trim() || getDefaultProductImage(category);

    await onUpdate(id, {
      titleEng,
      titleBen,
      category,
      brand,
      price: cleanPrice,
      offerPrice: cleanOffer > 0 ? cleanOffer : cleanPrice,
      purchasePrice: cleanPurchase,
      stock: cleanStock,
      descriptionEng: descEng,
      descriptionBen: descBen,
      deliveryCharge: cleanDelivery,
      images: [finalPhoto]
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
                onChange={(e) => {
                  const newCat = e.target.value as Product["category"];
                  setCategory(newCat);
                  // If current imgUrl is empty or matches an existing default category photo, auto switch
                  const isCurrentDefault = Object.values(CATEGORY_DEFAULT_IMAGES).includes(imgUrl) || !imgUrl;
                  if (isCurrentDefault) {
                    setImgUrl(getDefaultProductImage(newCat));
                  }
                }}
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
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                <span>{isBng ? "পার্টস এর ছবি (Photo)" : "Product Photo"}</span>
                <span className="text-[10px] text-emerald-600 font-normal">{isBng ? "গ্যালারি/ক্যামেরা থেকে আপলোড করুন" : "Upload from device or URL"}</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                  <img
                    src={imgUrl || getDefaultProductImage(category)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 cursor-pointer transition shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isBng ? "ছবি আপলোড" : "Upload File"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                </label>
                <input 
                  type="text" 
                  value={imgUrl} 
                  onChange={(e) => setImgUrl(e.target.value)} 
                  placeholder={isBng ? "অথবা ছবির URL দিন..." : "Or paste image URL..."} 
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-xs" 
                />
              </div>
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
              <input 
                type="number" 
                value={purchasePrice} 
                onChange={(e) => setPurchasePrice(parseNumericValue(e.target.value))} 
                onBlur={() => { if (purchasePrice === "") setPurchasePrice(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.price} (₹)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(parseNumericValue(e.target.value))} 
                onBlur={() => { if (price === "") setPrice(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.offerPrice} (₹)</label>
              <input 
                type="number" 
                value={offerPrice} 
                onChange={(e) => setOfferPrice(parseNumericValue(e.target.value))} 
                onBlur={() => { if (offerPrice === "") setOfferPrice(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "স্টক পরিমাণ (Units)" : "Stock (Units)"}</label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(parseNumericValue(e.target.value))} 
                onBlur={() => { if (stock === "") setStock(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "ডেলিভারি চার্জ (₹)" : "Delivery Charge (₹)"}</label>
              <input 
                type="number" 
                value={deliveryCharge} 
                onChange={(e) => setDeliveryCharge(parseNumericValue(e.target.value))} 
                onBlur={() => { if (deliveryCharge === "") setDeliveryCharge(0); }}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold" 
                required 
              />
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
              {displayProducts.map((p) => {
                const isEditing = editingId === p.id;
                const isLowStock = p.stock <= 5;
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition ${isLowStock ? "bg-rose-50/20" : ""}`}>
                    <td className="p-4 w-16">
                      <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 group/pic">
                        <img
                          src={isEditing 
                            ? (imgUrl || getDefaultProductImage(category)) 
                            : (((p.images && p.images[0]) || p.image || "").includes("photo-1619642751034-765dfdf7c58e")
                                ? getDefaultProductImage(p.category)
                                : ((p.images && p.images[0]) || p.image || getDefaultProductImage(p.category)))}
                          alt={p.titleEng || (p as any).name || "Product"}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isEditing && (
                          <label className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-85 hover:opacity-100 cursor-pointer transition" title={isBng ? "ছবি পরিবর্তন করুন" : "Change photo"}>
                            <Upload className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold mt-0.5">{isBng ? "আপলোড" : "Change"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                          </label>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="space-y-1.5 max-w-sm">
                          <input type="text" value={titleEng} onChange={(e) => setTitleEng(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[10px]" placeholder="Name Eng" />
                          <input type="text" value={titleBen} onChange={(e) => setTitleBen(e.target.value)} className="p-1 border border-slate-200 rounded w-full text-[11px] font-bold" placeholder="Name Ben" />
                          <div className="flex items-center gap-1.5">
                            <input type="text" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="p-1 border border-slate-200 rounded flex-1 text-[9px]" placeholder="Image URL" />
                            <label className="px-1.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded cursor-pointer border border-indigo-200 shrink-0 flex items-center gap-1" title="Device থেকে ছবি আপলোড">
                              <Upload className="w-3 h-3" />
                              <span>{isBng ? "ফাইল" : "File"}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <strong className="text-slate-800 text-sm block">
                            {isBng 
                              ? (p.titleBen || p.titleEng || (p as any).name || (p as any).title) 
                              : (p.titleEng || (p as any).name || p.titleBen || (p as any).title)}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{p.brand || "Sudipta Power"}</span>
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
                        <input 
                          type="number" 
                          value={purchasePrice} 
                          onChange={(e) => setPurchasePrice(parseNumericValue(e.target.value))} 
                          onBlur={() => { if (purchasePrice === "") setPurchasePrice(0); }}
                          className="p-1 border border-slate-200 rounded w-20 text-right font-mono" 
                        />
                      ) : (
                        `₹ ${(p.purchasePrice || 0).toLocaleString()}`
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(parseNumericValue(e.target.value))} 
                            onBlur={() => { if (price === "") setPrice(0); }}
                            className="p-1 border border-slate-200 rounded w-20 text-right text-[10px] text-slate-400 font-mono" 
                            placeholder="Price" 
                          />
                          <input 
                            type="number" 
                            value={offerPrice} 
                            onChange={(e) => setOfferPrice(parseNumericValue(e.target.value))} 
                            onBlur={() => { if (offerPrice === "") setOfferPrice(0); }}
                            className="p-1 border border-slate-200 rounded w-20 text-right font-mono font-bold text-emerald-600" 
                            placeholder="Offer" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-300 line-through">₹ {(p.price || 0).toLocaleString()}</span>
                          <span>₹ {(p.offerPrice || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={stock} 
                          onChange={(e) => setStock(parseNumericValue(e.target.value))} 
                          onBlur={() => { if (stock === "") setStock(0); }}
                          className="p-1 border border-slate-200 rounded w-16 text-center font-mono" 
                        />
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
                          <button onClick={() => setProductToDelete(p)} className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer" title={isBng ? "ডিলিট করুন" : "Delete"}>
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

      {/* In-App Delete Confirmation Modal (Safe for iFrame environments) */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                {isBng ? "পণ্যটি ডিলিট করতে চান?" : "Delete this Product?"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isBng 
                  ? `"${productToDelete.titleBen || productToDelete.titleEng}" স্টক ক্যাটালগ থেকে সম্পূর্ণ মুছে ফেলা হবে।`
                  : `Are you sure you want to permanently delete "${productToDelete.titleEng || productToDelete.name}"?`}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                {isBng ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = productToDelete.id;
                  setIsDeleting(true);
                  try {
                    setLocalProducts(prev => prev.filter(item => item.id !== id));
                    const saved = localStorage.getItem("sudipta_products");
                    if (saved) {
                      try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                          localStorage.setItem("sudipta_products", JSON.stringify(parsed.filter((item: any) => item.id !== id)));
                        }
                      } catch (_) {}
                    }
                    await onDelete(id);
                  } finally {
                    setIsDeleting(false);
                    setProductToDelete(null);
                  }
                }}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>{isDeleting ? (isBng ? "মুছে ফেলা হচ্ছে..." : "Deleting...") : (isBng ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
