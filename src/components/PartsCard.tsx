import React from "react";
import { 
  ShoppingCart, 
  Battery, 
  Cpu, 
  Tag, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Product } from "../types";
import { useNavigate } from "react-router-dom";

interface PartsCardProps {
  key?: string;
  product: Product;
  allProducts: Product[];
  lang: Language;
  t: TranslationDict;
}

export default function PartsCard({ product, lang, t }: PartsCardProps) {
  const navigate = useNavigate();
  const isBng = lang === "bn";
  const title = isBng ? product.titleBen : product.titleEng;
  const desc = isBng ? product.descriptionBen : product.descriptionEng;

  // Custom icon mapping based on product category
  const renderCategoryBadge = () => {
    switch (product.category) {
      case "Battery":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold uppercase tracking-wider">
            <Battery className="w-3 h-3" />
            {isBng ? "ব্যাটারি" : "Battery"}
          </span>
        );
      case "Controller":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[9px] font-bold uppercase tracking-wider">
            <Cpu className="w-3 h-3" />
            {isBng ? "কন্ট্রোলার" : "Controller"}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold uppercase tracking-wider">
            <Tag className="w-3 h-3" />
            <span>{product.category}</span>
          </span>
        );
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`} 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between p-3.5 group animate-fade-in relative cursor-pointer"
    >
      {/* Decorative tag for premium products */}
      {(product.id === "p1" || product.id === "p2") && (
        <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5 z-10">
          <Sparkles className="w-2 h-2 fill-white" />
          <span>{isBng ? "সেরা পণ্য" : "SMART SERIES"}</span>
        </div>
      )}

      <div>
        {/* Product Image */}
        <div className="relative h-36 rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100/60 dark:border-slate-800/50">
          <img
            src={(product.images && product.images[0]) || product.image || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Low Stock Warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
              {isBng ? "সীমিত স্টক" : "Low Stock"}
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
              {t.outOfStock}
            </span>
          )}
        </div>

        {/* Info Header */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          {renderCategoryBadge()}
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono tracking-wide uppercase bg-slate-50 dark:bg-slate-950/50 px-1.5 py-0.5 rounded">
            {product.brand}
          </span>
        </div>

        <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm leading-snug group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>

        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-850/60 flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[8px] text-slate-400 block font-semibold uppercase">SPECIAL PRICE</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-450 line-through text-[10px] font-mono">₹ {(product.price || 0).toLocaleString()}</span>
              <span className="text-emerald-650 font-bold font-mono text-sm">₹ {(product.offerPrice || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[8px] text-slate-400 block font-semibold uppercase">{t.stockStatus}</span>
            <span className={`text-[10px] font-bold ${product.stock > 0 ? "text-slate-600 dark:text-slate-300" : "text-rose-500"}`}>
              {product.stock > 0 ? `${product.stock} Units` : t.outOfStock}
            </span>
          </div>
        </div>

        {/* Click details trigger */}
        <div className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150/40 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1 shadow-xs">
          <span>{isBng ? "বিস্তারিত দেখুন" : "View Details"}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
