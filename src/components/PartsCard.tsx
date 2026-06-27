import React, { useState } from "react";
import { 
  ShoppingCart, 
  MessageSquare, 
  Battery, 
  Sparkles, 
  Tag, 
  Cpu, 
  Settings, 
  Zap, 
  CheckCircle, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  Gauge,
  Weight,
  Mountain
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Product } from "../types";

interface PartsCardProps {
  key?: string;
  product: Product;
  lang: Language;
  t: TranslationDict;
}

export default function PartsCard({ product, lang, t }: PartsCardProps) {
  const isBng = lang === "bn";
  const title = isBng ? product.titleBen : product.titleEng;
  const desc = isBng ? product.descriptionBen : product.descriptionEng;

  // Custom states for the interactive match form
  const [activeTab, setActiveTab] = useState<"overview" | "types" | "match">("overview");
  const [evBrand, setEvBrand] = useState("");
  const [motorPower, setMotorPower] = useState("1000W");
  const [deviceType, setDeviceType] = useState("Controller");

  // Custom icon mapping based on product category
  const renderCategoryBadge = () => {
    switch (product.category) {
      case "Battery":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            <Battery className="w-3.5 h-3.5" />
            {lang === "bn" ? "ব্যাটারি" : "Battery"}
          </span>
        );
      case "Controller":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            {lang === "bn" ? "কন্ট্রোলার" : "Controller"}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            {product.category}
          </span>
        );
    }
  };

  // Compute WhatsApp Message
  let finalWaMessage = "";
  if (product.id === "p2") {
    if (activeTab === "match") {
      finalWaMessage = isBng
        ? `নমস্কার সুদীপ্ত দা, আমি আপনার "SUDIPTA POWER" স্মার্ট ম্যাচিং সিস্টেমের মাধ্যমে যোগাযোগ করছি:\n\n- ইভি ব্র্যান্ড/মডেল: ${evBrand || "উল্লেখ করা হয়নি"}\n- মোটর পাওয়ার: ${motorPower}\n- ক্যাটাগরি: ${deviceType === "Controller" ? "মোটর কন্ট্রোলার" : "স্মার্ট চার্জিং স্টেশন"}\n\nঅনুগ্রহ করে আমার গাড়ির জন্য উপযুক্ত সমাধান এবং অফার প্রাইস জানাবেন।`
        : `Hello Sudipta, I am using the "SUDIPTA POWER" Smart Matching System to inquire about a technical match for my vehicle:\n\n- EV Brand/Model: ${evBrand || "Not specified"}\n- Motor Wattage: ${motorPower}\n- Requirement: ${deviceType === "Controller" ? "EV Motor Controller" : "Smart EV Charging Station"}\n\nPlease recommend the best match, let me know the availability, and send over the final pricing!`;
    } else {
      finalWaMessage = isBng
        ? `নমস্কার সুদীপ্ত দা, আমি আপনার খুচরা যন্ত্রাংশ থেকে "সুদীপ্তা পাওয়ার স্মার্ট ইভি কন্ট্রোলার" সম্পর্কে জানতে আগ্রহী। এটি কি স্টকে পাওয়া যাবে?`
        : `Hello Sudipta, I am interested in purchasing the "SUDIPTA POWER Smart EV Controller" from your parts catalogue. Please let me know its availability!`;
    }
  } else {
    finalWaMessage = isBng
      ? `নমস্কার সুদীপ্ত দা, আমি আপনার খুচরা যন্ত্রাংশ স্টক থেকে "${title}" পার্টসটি ক্রয় করতে আগ্রহী। স্টক এবং অফার প্রাইস জানাবেন কি?`
      : `Hello Sudipta, I want to purchase "${title}" from your spares catalogue. Please let me know if it's available.`;
  }

  const waUrl = `https://wa.me/919064517009?text=${encodeURIComponent(finalWaMessage)}`;

  // Customized UI for SUDIPTA POWER Smart EV Controller
  if (product.id === "p2") {
    return (
      <div 
        id="product-card-p2" 
        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-emerald-500/10 hover:border-emerald-500/30 flex flex-col justify-between p-5 group animate-fade-in relative col-span-1 lg:col-span-1"
      >
        {/* High-tech badge decoration */}
        <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 fill-white" />
          <span>{isBng ? "সেরা ইভি পার্টস" : "SMART CONTROLLER"}</span>
        </div>

        <div>
          {/* Product Image */}
          <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-50 mb-4 border border-slate-100">
            <img
              src={product.images[0] || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Stock status indicator overlay */}
            <span className="absolute top-2 left-2 bg-slate-900/85 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
              {lang === "bn" ? "ব্র্যান্ড নিউ" : "Premium OEM Spares"}
            </span>
          </div>

          {/* Info Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {renderCategoryBadge()}
            <span className="text-[10px] text-emerald-600 font-bold font-mono tracking-wide uppercase bg-emerald-50 px-2 py-0.5 rounded-lg">
              {product.brand}
            </span>
          </div>

          <h3 className="font-display font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>

          {/* Interactive Mini-Tabs */}
          <div className="flex gap-1 mt-3 bg-slate-100/80 p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === "overview" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {isBng ? "সারসংক্ষেপ" : "Overview"}
            </button>
            <button
              onClick={() => setActiveTab("types")}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === "types" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {isBng ? "কন্ট্রোলার গাইড" : "Types & Buying"}
            </button>
            <button
              onClick={() => setActiveTab("match")}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === "match" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🎯 {isBng ? "ম্যাচ করুন" : "Find Match"}
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="mt-4.5 min-h-[148px] flex flex-col justify-center">
            {activeTab === "overview" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {desc}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Sine Wave Power</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Regen Braking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Self-Learning Chip</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>48V/60V Auto-sensing</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "types" && (
              <div className="space-y-2.5 text-[11px] text-slate-600 leading-relaxed animate-fade-in">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>E-Scooter (BLDC) Controllers</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Compact dual-voltage (48V/60V/72V) units like 25A - 35A limits. Features pure sine wave technology for vibration-free silent driving.
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    <span>Smart EV AC Chargers</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    OCPP-compliant chargers like Exicom Smart Spin Air (7.5kW residential, 11kW and 22kW high speed commercial).
                  </p>
                </div>
              </div>
            )}

            {activeTab === "match" && (
              <div className="space-y-2.5 animate-fade-in text-[11px]">
                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-emerald-500" />
                  <span>Configure Your Match Requirements</span>
                </div>
                
                {/* Brand Selection Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    {isBng ? "১. ইভি ব্র্যান্ড বা মডেল:" : "1. What EV model/brand do you have?"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aayan 66, Panther, Wolf..."
                    value={evBrand}
                    onChange={(e) => setEvBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white text-[11px] font-medium"
                  />
                </div>

                {/* Wattage and Device Type Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {isBng ? "২. মোটর ওয়াট:" : "2. Motor Wattage:"}
                    </label>
                    <select
                      value={motorPower}
                      onChange={(e) => setMotorPower(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white text-[11px] font-medium"
                    >
                      <option value="800W">800W</option>
                      <option value="1000W">1000W</option>
                      <option value="1200W">1200W</option>
                      <option value="1500W">1500W</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      {isBng ? "৩. প্রকারভেদ:" : "3. What do you need?"}
                    </label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white text-[11px] font-medium"
                    >
                      <option value="Controller">{isBng ? "মোটর কন্ট্রোলার" : "Motor Controller"}</option>
                      <option value="Charging Station">{isBng ? "স্মার্ট চার্জার" : "Smart Charger"}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing, stock, and CTA */}
        <div className="mt-5 pt-3.5 border-t border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">SUDIPTA POWER OFFER</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 line-through text-xs font-mono">₹ {product.price.toLocaleString()}</span>
                <span className="text-emerald-600 font-bold font-mono text-lg">₹ {product.offerPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.stockStatus}</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {product.stock} Units
              </span>
            </div>
          </div>

          {/* Dynamic WhatsApp enquiry trigger */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
            <span>
              {activeTab === "match" 
                ? (isBng ? "কাস্টম ম্যাচ অনুসন্ধান পাঠান" : "Inquire with Specs Match") 
                : (isBng ? "অর্ডার / অনুসন্ধান" : "Order / Inquire")}
            </span>
          </a>
        </div>
      </div>
    );
  }

  // Customized UI for Smart LFP Battery 60V 30Ah / 40Ah
  if (product.id === "p1") {
    const [spec, setSpec] = useState<"30" | "40">("30");
    const [batteryTab, setBatteryTab] = useState<"overview" | "math" | "factors">("overview");

    const capacityWh = 60 * (spec === "30" ? 30 : 40);
    const minEstimatedRange = spec === "30" ? 60 : 80;
    const maxEstimatedRange = spec === "30" ? 90 : 120;
    const computedPrice = spec === "30" ? product.offerPrice : product.offerPrice + 9500; // Extra for 40Ah upgrade

    // Computed WhatsApp message with choices
    const batteryWaMsg = isBng
      ? `নমস্কার সুদীপ্ত দা, আমি আপনার "${title}" কাস্টম কনফিগারেশনে আগ্রহী:\n\n- ভোল্টেজ: ৬০ভি\n- ক্ষমতা: ${spec}Ah (${capacityWh} Wh)\n- আনুমানিক রেঞ্জ: ${minEstimatedRange} থেকে ${maxEstimatedRange} কিমি\n\nদয়া করে এটার দাম এবং ডেলিভারি সময় জানাবেন।`
      : `Hello Sudipta, I am interested in purchasing your "${title}" with custom spec:\n\n- Voltage: 60V\n- Capacity: ${spec}Ah (${capacityWh} Wh)\n- Predicted Range: ${minEstimatedRange}-${maxEstimatedRange} km\n\nPlease share the booking procedure and delivery timeline.`;

    const batteryWaUrl = `https://wa.me/919064517009?text=${encodeURIComponent(batteryWaMsg)}`;

    return (
      <div 
        id="product-card-p1" 
        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-indigo-500/15 hover:border-indigo-500/35 flex flex-col justify-between p-5 group animate-fade-in relative"
      >
        {/* Hot tag */}
        <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
          <Battery className="w-2.5 h-2.5 fill-white" />
          <span>{isBng ? "স্মার্ট ব্যাটারি প্যাক" : "LFP CELL TECH"}</span>
        </div>

        <div>
          {/* Image with overlay indicator */}
          <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-100">
            <img
              src={product.images[0] || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Visual capacity bubble */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono shadow flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{spec === "30" ? "1.8 kWh (1800 Wh)" : "2.4 kWh (2400 Wh)"}</span>
            </div>
            {/* Spec upgrade offer tag */}
            <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {isBng ? "আপগ্রেড উপলব্ধ" : "40Ah Super Range Ready"}
            </span>
          </div>

          {/* Title & Brand */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              <Battery className="w-3 h-3" />
              {isBng ? "লিথিয়াম ব্যাটারি" : "Lithium LFP"}
            </span>
            <span className="text-[10px] text-indigo-600 font-bold font-mono tracking-wide uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">
              {product.brand}
            </span>
          </div>

          <h3 className="font-display font-bold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors">
            {isBng ? `স্মার্ট LFP ব্যাটারি 60V ${spec}Ah` : `Smart LFP Battery 60V ${spec}Ah`}
          </h3>

          {/* Interactive Capacity Toggle Selector */}
          <div className="mt-3.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {isBng ? "ব্যাটারির ক্ষমতা সিলেক্ট করুন:" : "Select Battery Capacity:"}
              </span>
              <span className="text-[11px] text-slate-700 font-medium">
                {spec === "30" 
                  ? (isBng ? "স্ট্যান্ডার্ড সিটি রেঞ্জ" : "Standard City Range") 
                  : (isBng ? "লং ড্রাইভ সুপার রেঞ্জ" : "Long Amperage Super Range")}
              </span>
            </div>
            <div className="flex bg-slate-200/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSpec("30")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  spec === "30" 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                30Ah
              </button>
              <button
                type="button"
                onClick={() => setSpec("40")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  spec === "40" 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                40Ah
              </button>
            </div>
          </div>

          {/* Micro Tabs switcher inside card */}
          <div className="flex gap-1 mt-4 bg-slate-100/70 p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setBatteryTab("overview")}
              className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                batteryTab === "overview" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {isBng ? "ফিচারসমূহ" : "Overview"}
            </button>
            <button
              onClick={() => setBatteryTab("math")}
              className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                batteryTab === "math" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📊 {isBng ? "গণিত ও ক্ষমতা" : "The Math"}
            </button>
            <button
              onClick={() => setBatteryTab("factors")}
              className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                batteryTab === "factors" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ⚙️ {isBng ? "রেঞ্জ ফ্যাক্টর" : "Range Factors"}
            </button>
          </div>

          {/* Micro Tab Content */}
          <div className="mt-3.5 min-h-[140px] flex flex-col justify-center">
            {batteryTab === "overview" && (
              <div className="space-y-2.5 animate-fade-in text-xs">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {desc}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-indigo-500" />
                    <span>LiFePO4 Safe Chemistry</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-indigo-500" />
                    <span>Smart BMS Protection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-indigo-500" />
                    <span>3000+ Charge Cycles</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-indigo-500" />
                    <span>3-Year Warranty</span>
                  </div>
                </div>
              </div>
            )}

            {batteryTab === "math" && (
              <div className="space-y-2 animate-fade-in text-xs">
                <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100/40">
                  <span className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                    🔋 {isBng ? "মোট শক্তি ক্ষমতা হিসাব" : "Energy Capacity Formula"}
                  </span>
                  <code className="block text-center font-mono font-bold text-indigo-700 text-xs bg-white py-1 rounded border border-indigo-100/50">
                    60V × {spec}Ah = {capacityWh} Wh ({spec === "30" ? "1.8" : "2.4"} kWh)
                  </code>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed font-sans text-justify">
                  {isBng 
                    ? `বেশিরভাগ স্ট্যান্ডার্ড ইলেকট্রিক টু-হুইলার প্রতি কিলোমিটারে ২০ থেকে ৩০ ওয়াট-আওয়ার (Wh) বিদ্যুৎ ব্যবহার করে। ফলস্বরূপ, একটি চার্জে আনুমানিক ${minEstimatedRange} থেকে ${maxEstimatedRange} কিমি চমৎকার মাইলেজ পাওয়া সম্ভব।`
                    : `Most standard electric two-wheelers consume about 20 to 30 Wh per kilometer, which mathematically results in the ${minEstimatedRange} to ${maxEstimatedRange} km mileage prediction.`}
                </p>
              </div>
            )}

            {batteryTab === "factors" && (
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 animate-fade-in">
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-indigo-600" />
                    {isBng ? "গতিবেগ" : "Speed"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                    {isBng ? "বেশি গতিতে ব্যাটারি দ্রুত নিষ্কাশন হয়।" : "Higher speeds drain power exponentially."}
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Weight className="w-3 h-3 text-indigo-600" />
                    {isBng ? "ওজন" : "Weight"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                    {isBng ? "অতিরিক্ত লোড বা আরোহী মাইলেজ কমায়।" : "Extra load (pillion/cargo) decreases range."}
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Mountain className="w-3 h-3 text-indigo-600" />
                    {isBng ? "রাস্তার ঢাল" : "Terrain"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                    {isBng ? "খাড়া পাহাড়ি রাস্তায় বেশি শক্তির প্রয়োজন।" : "Steep inclines heavily reduce travel distance."}
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-600" />
                    {isBng ? "মোটর" : "Motor size"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                    {isBng ? "মোটরের ওয়াট এবং ঘূর্ণন গতি কার্যক্ষমতা নিয়ন্ত্রণ করে।" : "Motor size (Wattage) and tire pressure dictate efficiency."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing, stock, verified links, and CTA */}
        <div className="mt-5 pt-3.5 border-t border-slate-100">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">
                {spec === "40" ? (isBng ? "৪0Ah আপগ্রেডেড মূল্য" : "40Ah Upgraded Value") : (isBng ? "অফার প্রাইস" : "Offer Price")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 line-through text-xs font-mono">
                  ₹ {(spec === "30" ? product.price : product.price + 11000).toLocaleString()}
                </span>
                <span className="text-indigo-600 font-bold font-mono text-lg">
                  ₹ {computedPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.stockStatus}</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {spec === "30" ? product.stock : 3} Units
              </span>
            </div>
          </div>

          {/* Sourced Explore links to Amazon & IndiaMart */}
          <div className="mb-4 py-2 border-y border-slate-50 flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-medium">
            <span>{isBng ? "অন্যান্য ব্যাটারি দেখুন:" : "Compare ratings:"}</span>
            <a
              href="https://www.amazon.in/s?k=60v+lithium+battery+for+electric+scooter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-bold text-orange-600 hover:underline"
            >
              Amazon.in
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="https://dir.indiamart.com/search.mp?ss=60v+electric+scooter+battery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-bold text-teal-600 hover:underline"
            >
              IndiaMart
            </a>
          </div>

          {/* WhatsApp enquiry action buttons */}
          <a
            href={batteryWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
            <span>
              {isBng ? `কনফিগার করা ${spec}Ah অর্ডার করুন` : `Order Custom 60V ${spec}Ah`}
            </span>
          </a>
        </div>
      </div>
    );
  }

  // Standard Spares Card layout for other products
  return (
    <div id={`product-card-${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-between p-4 group animate-fade-in">
      <div>
        {/* Product Image */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-slate-50 mb-4">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Low Stock Warning */}
          {product.stock <= 5 && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">
              {lang === "bn" ? "সীমিত স্টক" : "Low Stock"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {renderCategoryBadge()}
          <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase">
            {product.brand}
          </span>
        </div>

        <h3 className="font-display font-bold text-slate-800 text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50">
        {/* Price & Stock info */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Offer Price</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 line-through text-xs font-mono">₹ {product.price.toLocaleString()}</span>
              <span className="text-emerald-600 font-bold font-mono text-base">₹ {product.offerPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.stockStatus}</span>
            <span className={`text-[10px] font-bold ${product.stock > 0 ? "text-slate-600" : "text-rose-500"}`}>
              {product.stock > 0 ? `${product.stock} Units` : t.outOfStock}
            </span>
          </div>
        </div>

        {/* WhatsApp enquiry trigger */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-emerald-700" />
          {lang === "bn" ? "অর্ডার / অনুসন্ধান" : "Order / Inquire"}
        </a>
      </div>
    </div>
  );
}

