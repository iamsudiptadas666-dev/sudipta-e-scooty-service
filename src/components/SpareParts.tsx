import React from "react";
import { TranslationDict, Language } from "../translations";
import { Product } from "../types";
import PartsCard from "./PartsCard";
import { motion } from "motion/react";
import { Package } from "lucide-react";

interface SparePartsProps {
  products: Product[];
  lang: Language;
  t: TranslationDict;
}

const SpareParts: React.FC<SparePartsProps> = ({ products, lang, t }) => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <section id="spare-parts" className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-2">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
            {t.partsStoreTitle}
          </h3>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">
            {t.partsStoreSubtitle}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">
              {lang === "bn" ? "বর্তমানে কোনো খুচরা যন্ত্রাংশ উপলব্ধ নেই।" : "No spare parts are currently available in the catalogue."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PartsCard
                  product={p}
                  allProducts={products}
                  lang={lang}
                  t={t}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SpareParts;
