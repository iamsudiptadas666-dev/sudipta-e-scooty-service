import React, { useRef, useEffect } from "react";
import { X, ShoppingCart, CheckCircle, Package } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";
import { Language, TranslationDict } from "../translations";

interface ProductDetailModalProps {
  product: Product;
  lang: Language;
  t: TranslationDict;
  onClose: () => void;
  onBuy: (price: number) => void;
  relatedProducts: Product[];
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, lang, t, onClose, onBuy, relatedProducts }) => {
  const isBng = lang === "bn";
  const title = isBng ? product.titleBen : product.titleEng;
  const desc = isBng ? product.descriptionBen : product.descriptionEng;

  // Pinch-to-zoom refs and states
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const isPinchingRef = useRef(false);
  const startDistRef = useRef(0);
  const startMidpointRef = useRef({ x: 0, y: 0 });
  const currentScaleRef = useRef(1);

  // Bind non-passive touch events to allow preventing default scrolling during pinch
  useEffect(() => {
    const wrapper = imageWrapperRef.current;
    const img = zoomImageRef.current;
    if (!wrapper || !img) return;

    const getDistance = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
        Math.pow(t1.clientY - t2.clientY, 2)
      );
    };

    const getMidpoint = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true;
        startDistRef.current = getDistance(e.touches);
        startMidpointRef.current = getMidpoint(e.touches);
        img.style.transition = "none";
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinchingRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const currentDist = getDistance(e.touches);
        const currentMid = getMidpoint(e.touches);

        let scale = currentDist / startDistRef.current;
        if (scale < 1) scale = 1;
        if (scale > 4) scale = 4;
        currentScaleRef.current = scale;

        const dx = currentMid.x - startMidpointRef.current.x;
        const dy = currentMid.y - startMidpointRef.current.y;

        img.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        img.style.transformOrigin = "center center";
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinchingRef.current) {
        isPinchingRef.current = false;
        currentScaleRef.current = 1;
        
        img.style.transition = "transform 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)";
        img.style.transform = "translate(0px, 0px) scale(1)";
      }
    };

    wrapper.addEventListener("touchstart", handleTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: false });
    wrapper.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [product.images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPinchingRef.current) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const img = zoomImageRef.current;
    if (img) {
      img.style.transition = "transform 0.1s ease-out, transform-origin 0.1s ease-out";
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(1.8)";
    }
  };

  const handleMouseLeave = () => {
    const img = zoomImageRef.current;
    if (img) {
      img.style.transition = "transform 0.3s ease, transform-origin 0.3s ease";
      img.style.transformOrigin = "center center";
      img.style.transform = "scale(1)";
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="font-display font-bold text-slate-900">{isBng ? "পণ্যের বিবরণ" : "Product Details"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div 
              ref={imageWrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full rounded-3xl overflow-hidden h-80 bg-slate-50 cursor-zoom-in relative"
            >
              <img 
                ref={zoomImageRef}
                src={(product.images && product.images[0]) || product.image || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-500" 
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-bold text-xl">₹{(product.offerPrice || 0).toLocaleString()}</span>
                <span className="text-slate-400 line-through text-sm">₹{(product.price || 0).toLocaleString()}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              <button 
                onClick={() => onBuy(product.offerPrice)}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                {isBng ? "এখনই কিনুন" : "Buy Now"}
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">{isBng ? "সম্পর্কিত পণ্য" : "Related Products"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map(p => (
                <div key={p.id} className="p-3 border rounded-2xl border-slate-100">
                  <img src={(p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200"} alt={p.titleEng} className="w-full h-24 object-cover rounded-lg mb-2" />
                  <p className="text-xs font-bold truncate">{isBng ? p.titleBen : p.titleEng}</p>
                  <p className="text-xs font-bold text-emerald-600">₹{(p.offerPrice || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;
