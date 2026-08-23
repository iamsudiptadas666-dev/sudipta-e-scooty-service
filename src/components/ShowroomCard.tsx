import React from "react";
import { Zap, ShieldCheck, Battery, Gauge, Hourglass, MessageSquare, Compass, ArrowUpRight } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Vehicle } from "../types";
import { useNavigate } from "react-router-dom";

interface ShowroomCardProps {
  key?: string;
  vehicle: Vehicle;
  lang: Language;
  t: TranslationDict;
  onEnquire: (vehicle: Vehicle) => void;
}

export default function ShowroomCard({ vehicle, lang, t }: ShowroomCardProps) {
  const isBng = lang === "bn";
  const navigate = useNavigate();

  const desc = isBng ? vehicle.descriptionBen : vehicle.descriptionEng;
  const battery = isBng ? vehicle.batteryTypeBen : vehicle.batteryTypeEng;
  const colors = isBng ? vehicle.colorsBen : vehicle.colorsEng;

  return (
    <div 
      id={`vehicle-card-${vehicle.id}`} 
      onClick={() => navigate(`/product/${vehicle.id}`)}
      className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col justify-between group animate-fade-in cursor-pointer"
    >
      {/* Vehicle image section */}
      <div className="relative h-40 sm:h-52 md:h-64 overflow-hidden bg-slate-900 shrink-0">
        <img
          src={(vehicle.images && vehicle.images[0]) || vehicle.image || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Eco Badge and Stock Status on top */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          <span className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-md">
            <Zap className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
            <span>ECO</span>
          </span>
          <span
            className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md ${
              vehicle.stockStatus === "In Stock"
                ? "bg-blue-600 text-white"
                : "bg-amber-500 text-white animate-pulse"
            }`}
          >
            {vehicle.stockStatus === "In Stock" ? t.inStock : t.lowStock}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-xs text-white px-3 py-1 md:py-1.5 rounded-xl font-mono text-[10px] md:text-xs font-bold shadow-lg flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-slate-300 line-through text-[8px] md:text-[10px]">₹ {(vehicle.price || 0).toLocaleString()}</span>
            <span className="text-emerald-400">₹ {(vehicle.offerPrice || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-50/20 to-transparent">
        <div>
          <span className="text-[9px] md:text-xs font-bold text-slate-400 tracking-wider uppercase">{vehicle.brand}</span>
          <h3 className="text-sm md:text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">{vehicle.model}</h3>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2">
            {desc}
          </p>

          {/* Quick core specs teaser */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{vehicle.range}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span>{vehicle.topSpeed}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <Battery className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{battery}</span>
            </div>
          </div>
        </div>

        {/* Action Button: "বিস্তারিত ও বুকিং" requested by user */}
        <div className="mt-5 pt-3 border-t border-slate-100/85">
          <div className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-1">
            <span>{isBng ? "বিস্তারিত ও বুকিং" : "Details & Booking"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
