import React, { useState } from "react";
import { MessageSquare, Phone, MapPin, Check, ChevronRight, CheckSquare } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Enquiry } from "../types";

interface AdminEnquiriesProps {
  enquiries: Enquiry[];
  onUpdateStatus: (id: string, status: Enquiry["status"]) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminEnquiries({ enquiries, onUpdateStatus, lang, t }: AdminEnquiriesProps) {
  const isBng = lang === "bn";

  return (
    <div id="admin-enquiries-view" className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-display font-semibold text-slate-800">{t.secEnquiries}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isBng ? "অনলাইন কাস্টমার টেস্ট রাইড বুকিং এবং সাধারণ অনুসন্ধানের লাইভ তালিকা" : "Real-time list of online showroom enquiries and pre-booked physical test rides"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <th className="p-4 rounded-l-lg">{t.fullName}</th>
                <th className="p-4">{t.selectType}</th>
                <th className="p-4">Message</th>
                <th className="p-4 text-center">{t.thDate}</th>
                <th className="p-4 text-center">{t.thStatus}</th>
                <th className="p-4 rounded-r-lg text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enquiries.map((e) => {
                const isNew = e.status === "New";
                return (
                  <tr key={e.id} className={`hover:bg-slate-50/50 transition ${isNew ? "bg-emerald-50/10 font-medium" : ""}`}>
                    <td className="p-4">
                      <div>
                        <strong className="text-slate-800 text-sm block">{e.name}</strong>
                        <a href={`tel:${e.phone}`} className="text-[10px] text-indigo-600 font-semibold font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {e.phone}
                        </a>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        e.type === "Test Ride" ? "bg-amber-100 text-amber-800" :
                        e.type === "Service Enquiry" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2 italic">"{e.message}"</p>
                    </td>
                    <td className="p-4 text-center text-slate-400 font-mono text-[10px]">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        e.status === "New" ? "bg-rose-100 text-rose-800 animate-pulse" :
                        e.status === "Contacted" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {e.status === "New" && (
                          <button
                            onClick={() => onUpdateStatus(e.id, "Contacted")}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded transition cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                        )}
                        {e.status !== "Closed" && (
                          <button
                            onClick={() => onUpdateStatus(e.id, "Closed")}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded transition cursor-pointer"
                          >
                            Close Lead
                          </button>
                        )}
                        {e.status === "Closed" && (
                          <span className="text-slate-300 font-bold text-[10px] flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                            Resolved
                          </span>
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
    </div>
  );
}
