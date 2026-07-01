import React, { useState } from "react";
import { Zap, ShieldCheck, Battery, Gauge, Hourglass, MessageSquare, Compass, Send, Check, Info } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Vehicle } from "../types";
import OptimizedImage from "./OptimizedImage";

interface ShowroomCardProps {
  key?: string;
  vehicle: Vehicle;
  lang: Language;
  t: TranslationDict;
  onEnquire: (vehicle: Vehicle) => void;
}

export default function ShowroomCard({ vehicle, lang, t, onEnquire }: ShowroomCardProps) {
  const isBng = lang === "bn";
  
  // Interactive choices specifically for the Panther card
  const [selectedColor, setSelectedColor] = useState<string>("Metallic Blue");
  const [selectedBattery, setSelectedBattery] = useState<string>("Lead Acid: 60V 32Ah");

  const desc = isBng ? vehicle.descriptionBen : vehicle.descriptionEng;
  const battery = isBng ? vehicle.batteryTypeBen : vehicle.batteryTypeEng;
  const colors = isBng ? vehicle.colorsBen : vehicle.colorsEng;
  const warranty = isBng ? vehicle.warrantyBen : vehicle.warrantyEng;

  // Color values map for visual dots
  const colorMap: Record<string, { bg: string; border: string; labelBn: string }> = {
    "Metallic Blue": { bg: "bg-blue-600", border: "border-blue-300", labelBn: "মেটালিক ব্লু" },
    "Blazing Red": { bg: "bg-red-600", border: "border-red-300", labelBn: "ব্লেজিং রেড" },
    "Bullet Silver": { bg: "bg-slate-300", border: "border-slate-400", labelBn: "বুলেট সিলভার" }
  };

  // WhatsApp redirection customized message with interactive parameters
  const computedWaMessage = vehicle.id === "v2"
    ? isBng
      ? `নমস্কার সুদীপ্ত দা, আমি আপনার শোরুমের ${vehicle.brand} ${vehicle.model} স্কুটারটি বুক করতে ইচ্ছুক!\n\nপছন্দসই কনফিগারেশন:\n- কালার: ${colorMap[selectedColor]?.labelBn || selectedColor}\n- ব্যাটারি: ${selectedBattery === "Lead Acid: 60V 32Ah" ? "লেড অ্যাসিড: ৬০ভোল্ট ৩২Ah" : selectedBattery === "Lithium: 60V 24Ah" ? "লিথিয়াম: ৬০ভোল্ট ২৪Ah" : "লিথিয়াম: ৬০ভোল্ট ৩৪Ah"}\n\nদয়া করে প্রারম্ভিক মূল্য এবং বুকিং প্রক্রিয়া সম্পর্কে জানাবেন।`
      : `Hello Sudipta, I want to book the ${vehicle.brand} ${vehicle.model} with my selected preferences:\n\n- Chosen Color: ${selectedColor}\n- Chosen Battery: ${selectedBattery}\n\nPlease share the booking process and delivery schedule.`
    : isBng
    ? `নমস্কার সুদীপ্ত দা, আমি আপনার শোরুমের ${vehicle.brand} ${vehicle.model} স্কুটারটি সম্পর্কে জানতে আগ্রহী।`
    : `Hello Sudipta, I am interested in your ${vehicle.brand} ${vehicle.model} electric scooter. Please share more details.`;

  const waUrl = `https://wa.me/919064517009?text=${encodeURIComponent(computedWaMessage)}`;

  return (
    <div 
      id={`vehicle-card-${vehicle.id}`} 
      className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 flex flex-col group animate-fade-in ${
        vehicle.id === "v2" ? "border-purple-500/10 hover:border-purple-500/30" : "border-slate-100"
      }`}
    >
      {/* Vehicle image section */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-slate-900">
        <OptimizedImage
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {/* Badges on top */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            100% ECO
          </span>
          <span
            className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md ${
              vehicle.stockStatus === "In Stock"
                ? "bg-blue-600 text-white"
                : vehicle.stockStatus === "Low Stock"
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-slate-500 text-white"
            }`}
          >
            {vehicle.stockStatus === "In Stock" ? t.inStock : vehicle.stockStatus === "Low Stock" ? t.lowStock : t.outOfStock}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-sm text-white px-4 py-1.5 rounded-2xl font-mono text-sm font-bold shadow-lg flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-slate-300 line-through text-xs">₹ {vehicle.price.toLocaleString()}</span>
            <span className="text-emerald-400">₹ {vehicle.offerPrice.toLocaleString()}</span>
          </div>
          <span className="text-[9px] text-slate-300 font-sans tracking-wide uppercase font-bold mt-0.5">
            {vehicle.id === "v2" ? (isBng ? "অনওয়ার্ডস" : "onwards") : ""}
          </span>
        </div>
      </div>

      {/* Details section */}
      <div 
        className={`p-6 flex-1 flex flex-col justify-between ${
          vehicle.id === "v1" 
            ? "bg-gradient-to-b from-blue-50/20 to-transparent border-t border-blue-100/30" 
            : vehicle.id === "v2"
            ? "bg-gradient-to-b from-purple-50/20 to-transparent border-t border-purple-100/30"
            : ""
        }`}
      >
        <div>
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{vehicle.brand}</span>
          <div className="flex items-center justify-between mt-0.5">
            <h3 className="text-xl font-display font-bold text-slate-800 tracking-tight">{vehicle.model}</h3>
            {vehicle.id === "v1" && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                {isBng ? "প্রারম্ভিক মূল্য: ₹৬১,০০০" : "Starts at ₹61,000"}
              </span>
            )}
            {vehicle.id === "v2" && (
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                {isBng ? "প্রারম্ভিক মূল্য: ₹৯২,০০০" : "Starts at ₹92,000"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{desc}</p>

          {/* Special Wolf Warrior Lite Integrations */}
          {vehicle.id === "v1" && (
            <div className="mt-3.5 bg-blue-50/60 border border-blue-100/60 rounded-xl p-3 text-xs text-slate-700 space-y-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                <span>{isBng ? "স্পীড ও কালার গ্যারান্টি" : "Top Speed & Color Integrity"}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {isBng
                  ? "৫৫ কিমি/ঘন্টা সর্বোচ্চ গতি প্রতিটি কালার ভ্যারিয়েন্টেই (মেটালিক ব্লু, চেরি রেড এবং সি গ্রিন) নিখুঁতভাবে বজায় থাকে।"
                  : "The 55 km/h top speed is perfectly maintained across all three color variants: Metallic Blue, Metallic Cherry Red, and Metallic Sea Green."}
              </p>
              <div className="pt-1.5 border-t border-blue-100/50 flex flex-wrap gap-2 text-[10px]">
                <span className="bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-full font-medium">Metallic Blue</span>
                <span className="bg-red-100/70 text-red-800 px-2 py-0.5 rounded-full font-medium">Cherry Red</span>
                <span className="bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Sea Green</span>
              </div>
            </div>
          )}

          {/* Interactive Panther Configurations */}
          {vehicle.id === "v2" && (
            <div className="mt-4 bg-purple-50/45 border border-purple-100/50 rounded-2xl p-3.5 text-xs text-slate-700 space-y-3 shadow-sm animate-fade-in">
              {/* Color Selection Picker */}
              <div>
                <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  🎨 {isBng ? "রং নির্বাচন করুন" : "Choose Colour"}
                </span>
                <div className="flex gap-2">
                  {Object.keys(colorMap).map((colorKey) => {
                    const info = colorMap[colorKey];
                    const isSelected = selectedColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        onClick={() => setSelectedColor(colorKey)}
                        title={isBng ? info.labelBn : colorKey}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "bg-white border-purple-500 shadow-sm text-slate-800" 
                            : "bg-white/50 border-slate-200 text-slate-500 hover:bg-white"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${info.bg} border ${info.border} inline-flex items-center justify-center`}>
                          {isSelected && <Check className="w-2 h-2 text-white fill-white" />}
                        </span>
                        <span>{isBng ? info.labelBn : colorKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Battery Picker */}
              <div>
                <span className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  🔋 {isBng ? "ব্যাটারি অপশন" : "Battery Option"}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    "Lead Acid: 60V 32Ah",
                    "Lithium: 60V 24Ah",
                    "Lithium: 60V 34Ah"
                  ].map((batKey) => {
                    const isSelected = selectedBattery === batKey;
                    return (
                      <button
                        key={batKey}
                        onClick={() => setSelectedBattery(batKey)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{batKey}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 gap-3.5 my-5 border-y border-slate-100 py-4 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-medium">{t.range.split(" ")[0]}</span>
                <span className="font-semibold text-slate-700">{vehicle.range}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-medium">{t.topSpeed.split(" ")[0]}</span>
                <span className="font-semibold text-slate-700">{vehicle.topSpeed}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-medium">{t.batteryType.split(" ")[0]}</span>
                <span className="font-semibold text-slate-700 line-clamp-1" title={battery}>
                  {vehicle.id === "v2" ? selectedBattery.split(": ")[1] || selectedBattery : battery}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-medium">{t.chargingTime.split(" ")[0]}</span>
                <span className="font-semibold text-slate-700">{vehicle.chargingTime}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>{t.motorPower}:</strong> {vehicle.motorPower}</span>
            </div>
            {vehicle.id === "v1" && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span><strong>{isBng ? "ব্রেকিং সিস্টেম:" : "Braking System:"}</strong> {isBng ? "ডুয়াল ডিস্ক ব্রেক সিস্টেম" : "Dual Disc Braking System"}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong>{t.warranty}:</strong> {warranty}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 inline-block rounded-full bg-slate-300 border border-slate-100" />
              <span>
                <strong>{t.availableColors}:</strong> {vehicle.id === "v2" ? selectedColor : colors}
              </span>
            </div>
          </div>

          {/* Mileage Disclaimer for Panther */}
          {vehicle.id === "v2" && (
            <div className="mt-4 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-1.5 text-[10px] text-slate-500 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p>
                {isBng 
                  ? "* স্ট্যান্ডার্ড টেস্ট পরিস্থিতিতে ৬০ কেজি লোড এবং ৩৫ কিমি/ঘণ্টা গড় গতিতে মাইলেজ পরিমাপ করা হয়েছে।"
                  : "* Mileage measured under standard test conditions of 60 kg load and an average speed of 35 km/h."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          {/* EMI Badge */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-indigo-900">
            <span>{t.emiStarting}:</span>
            <strong className="font-mono text-sm">₹ {vehicle.emiPrice.toLocaleString()} / {isBng ? "মাস" : "mo"}*</strong>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onEnquire({ ...vehicle, model: `${vehicle.model} (${selectedColor}, ${selectedBattery})` })}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              {t.bookTestRide}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
              {t.whatsappButton.split(" ")[0]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
