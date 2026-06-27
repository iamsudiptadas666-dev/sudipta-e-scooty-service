import React, { useState } from "react";
import { Plus, Trash, Sparkles, Megaphone, X } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Announcement } from "../types";

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  onAdd: (announcement: Omit<Announcement, "id" | "date">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

export default function AdminAnnouncements({ announcements, onAdd, onDelete, lang, t }: AdminAnnouncementsProps) {
  const isBng = lang === "bn";
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [titleEng, setTitleEng] = useState("");
  const [titleBen, setTitleBen] = useState("");
  const [contentEng, setContentEng] = useState("");
  const [contentBen, setContentBen] = useState("");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEng || !contentEng) return;

    await onAdd({
      titleEng,
      titleBen: titleBen || titleEng,
      contentEng,
      contentBen: contentBen || contentEng
    });
    setIsAdding(false);
    setTitleEng("");
    setTitleBen("");
    setContentEng("");
    setContentBen("");
  };

  return (
    <div id="admin-announcements-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secAnnouncements}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "অনলাইন নোটিশ ও বিশেষ অফার ব্যানারসমূহ নিয়ন্ত্রণ করুন" : "Publish promotional banners, festive servicing discounts, and notices to client feeds"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnCreateAnnouncement}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.btnCreateAnnouncement}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notice Title (English)</label>
              <input type="text" value={titleEng} onChange={(e) => setTitleEng(e.target.value)} placeholder="e.g. Durga Puja Special Discount!" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">নোটিশের শিরোনাম (বাংলা)</label>
              <input type="text" value={titleBen} onChange={(e) => setTitleBen(e.target.value)} placeholder="যেমন: দুর্গোৎসব অফার! সম্পূর্ণ ফ্রি স্কুটি ওয়াশিং!" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notice Description (English)</label>
              <textarea value={contentEng} onChange={(e) => setContentEng(e.target.value)} placeholder="Get up to 20% off on all battery servicing from 1st Oct..." className="w-full p-2.5 border border-slate-200 rounded-lg text-xs h-24" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">নোটিশের বিবরণ (বাংলা)</label>
              <textarea value={contentBen} onChange={(e) => setContentBen(e.target.value)} placeholder="সব ধরণের ইলেকট্রিক বাইক ও স্কুটারের ব্যাটারি পাল্টানোর ওপর ২০% ছাড়..." className="w-full p-2.5 border border-slate-200 rounded-lg text-xs h-24" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
              {t.closeButton}
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer">
              {t.submitButton}
            </button>
          </div>
        </form>
      )}

      {/* Announcements lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((an) => {
          const title = isBng ? an.titleBen : an.titleEng;
          const body = isBng ? an.contentBen : an.contentEng;
          return (
            <div key={an.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md flex justify-between items-start gap-4 animate-fade-in">
              <div className="flex gap-3 items-start">
                <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl mt-1">
                  <Megaphone className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{body}</p>
                  <span className="text-[9px] font-mono font-medium text-slate-400 mt-3 block">{an.date}</span>
                </div>
              </div>

              <button
                onClick={() => onDelete(an.id)}
                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition shrink-0 cursor-pointer"
                title="Delete Announcement"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
