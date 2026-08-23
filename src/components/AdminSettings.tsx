import React, { useState, useEffect } from "react";
import {
  Save, RefreshCw, Sparkles, Sliders, Smartphone, Palette, MapPin, Globe,
  ShieldAlert, CheckCircle2, User, Key, HelpCircle, Bell, Video, CreditCard,
  Clock, MessageSquare, Plus, Trash, Edit, X, Star, Truck, Eye, EyeOff, Database, Server, Copy, Check
} from "lucide-react";
import { Settings, Testimonial } from "../types";
import { Language, TranslationDict } from "../translations";
import { AdminOrders } from "./AdminOrders";
import { getSettingsFromSupabase, saveSettingsToSupabase, isSupabaseConfigured } from "../lib/supabase";

interface AdminSettingsProps {
  settings: Settings | null;
  onUpdate: (updatedSettings: Settings) => Promise<void>;
  lang: Language;
  t: TranslationDict;
}

const festivalOptions = [
  { value: "none", labelBen: "কোনো উৎসবের থিম নেই", labelEng: "No Active Festival Theme" },
  { value: "durga_puja", labelBen: " can are can are দূর্গাপূজা থিম (Durga Puja)", labelEng: "Durga Puja Theme" },
  { value: "kali_puja", labelBen: "কালীপূজা থিম (Kali Puja)", labelEng: "Kali Puja Theme" },
  { value: "diwali", labelBen: "দেওয়ালী থিম (Diwali / Deepavali)", labelEng: "Diwali Theme" },
  { value: "eid", labelBen: "ঈদ মুবারক থিম (Eid Mubarak)", labelEng: "Eid Theme" },
  { value: "christmas", labelBen: "বড়দিন থিম (Christmas Holiday)", labelEng: "Christmas Theme" },
  { value: "new_year", labelBen: "শুভ নববর্ষ থিম (Happy New Year)", labelEng: "New Year Theme" },
  { value: "independence_day", labelBen: " can are can are স্বাধীনতা দিবস থিম (Independence Day)", labelEng: "Independence Day Theme" },
  { value: "republic_day", labelBen: "প্রজাতন্ত্র দিবস থিম (Republic Day)", labelEng: "Republic Day Theme" }
];

export default function AdminSettings({ settings, onUpdate, lang, t }: AdminSettingsProps) {
  const isBng = lang === "bn";
  const [activeSubTab, setActiveSubTab] = useState<"core" | "database" | "hero" | "about" | "card" | "calc" | "testimonials" | "pending_reviews" | "schedule" | "orders" | "branding" | "payment" | "contact" | "ui_ux" | "logistics">("core");
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeCarrier, setActiveCarrier] = useState<"delhivery" | "xpressbees" | "ecom" | "custom">("delhivery");
  const [showDelhiveryKey, setShowDelhiveryKey] = useState(false);
  const [showXpressbeesKey, setShowXpressbeesKey] = useState(false);
  const [showEcomKey, setShowEcomKey] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  
  // Settings Form State
  const [formData, setFormData] = useState<Settings>({
    businessName: "",
    phone: "",
    address: "",
    googleMapsUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    googleBusinessUrl: "",
    whatsappLink: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    heroHeading: "",
    heroSubheading: "",
    festivalTheme: "none",
    erpPasscode: "9064",
    showTopNotice: false,
    topNoticeTitleEng: "",
    topNoticeTitleBen: "",
    topNoticeTextEng: "",
    topNoticeTextBen: "",
    aboutHeadingEng: "",
    aboutHeadingBen: "",
    aboutText1Eng: "",
    aboutText1Ben: "",
    aboutText2Eng: "",
    aboutText2Ben: "",
    visitingCardOwnerNameEng: "",
    visitingCardOwnerNameBen: "",
    visitingCardOwnerRoleEng: "",
    visitingCardOwnerRoleBen: "",
    visitingCardPhone: "",
    visitingCardAddressEng: "",
    visitingCardAddressBen: "",
    calcDefaultPrice: 32000,
    calcDefaultDownPaymentPct: 30,
    calcBaseInterestRate: 0,
    calcDefaultVoltage: 60,
    calcDefaultCapacity: 40,
    calcDefaultSpeed: 35,
    timingWeekdaysEng: "",
    timingWeekdaysBen: "",
    timingSundayEng: "",
    timingSundayBen: "",
    heroBgType: "image",
    heroBgUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200",
    upiId: "tanmoydasdas23@ybl",
    upiMerchantName: "Mr TANMAY DAS",
    shopGstin: "",
    businessNameEng: "Sudipta E-Scooty Service",
    businessNameBen: "সুদীপ্ত ই-স্কুটি সার্ভিস",
    proprietorNameEng: "SUDIPTA DAS",
    proprietorNameBen: "সুদীপ্ত দাস",
    logoUrl: "",
    faviconUrl: "",
    colorTheme: "classic",
    qrCodeUrl: "",
    paymentInstructionsEng: "",
    paymentInstructionsBen: "",
    whatsappNumber: "",
    supportEmail: "",
    businessAddressEng: "",
    businessAddressBen: "",
    enabledModules: {
      vehicles: true,
      spareParts: true,
      service: true,
      emi: true,
      ecommerce: true
    },
    buttonTexts: {
      buyNowEng: "Buy Now",
      buyNowBen: "এখনই কিনুন",
      bookNowEng: "Book Now",
      bookNowBen: "বুক করুন"
    },
    navLinks: []
  });

  const [saving, setSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  // Testimonials state and controls
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingT, setLoadingT] = useState(false);
  const [editingTId, setEditingTId] = useState<string | null>(null);
  
  // Testimonial Form State
  const [tTextBen, setTTextBen] = useState("");
  const [tTextEng, setTTextEng] = useState("");
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tAvatar, setTAvatar] = useState("");

  // Sync formData with settings prop & Supabase
  useEffect(() => {
    let mounted = true;
    if (settings && Object.keys(settings).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...settings
      }));
    } else {
      const saved = localStorage.getItem('sudipta_cms_settings') || localStorage.getItem('sudipta_global_config');
      if (saved) {
        try {
          setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
          console.error("Failed to parse saved settings", e);
        }
      }
    }

    // Try fetching latest settings from Supabase
    getSettingsFromSupabase().then(dbSettings => {
      if (mounted && dbSettings && Object.keys(dbSettings).length > 0) {
        setFormData(prev => ({ ...prev, ...dbSettings }));
      }
    }).catch(err => console.error("Supabase settings error:", err));

    return () => { mounted = false; };
  }, [settings]);

  // Save to local storage on formData change
  useEffect(() => {
    if (formData && formData.businessNameEng) {
      localStorage.setItem('sudipta_cms_settings', JSON.stringify(formData));
      localStorage.setItem('sudipta_global_config', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (activeSubTab === "testimonials") {
      fetchTestimonials();
    }
  }, [activeSubTab]);

  const fetchTestimonials = async () => {
    setLoadingT(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingT(false);
    }
  };

  const handleApproveTestimonial = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/approve`, {
        method: "PATCH",
      });
      if (response.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Error approving testimonial:", err);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tTextBen) return;

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textBen: tTextBen,
          textEng: tTextEng || tTextBen,
          name: tName,
          role: tRole || (isBng ? "গ্রাহক" : "Verified Customer"),
          avatar: tAvatar || tName.substring(0, 2).toUpperCase(),
          isPending: false, // Admin-added reviews are approved by default
          rating: 5,
          date: new Date().toISOString()
        })
      });
      if (res.ok) {
        setTTextBen("");
        setTTextEng("");
        setTName("");
        setTRole("");
        setTAvatar("");
        fetchTestimonials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditTestimonial = (tItem: Testimonial) => {
    setEditingTId(tItem.id);
    setTTextBen(tItem.textBen);
    setTTextEng(tItem.textEng);
    setTName(tItem.name);
    setTRole(tItem.role);
    setTAvatar(tItem.avatar);
  };

  const handleUpdateTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textBen: tTextBen,
          textEng: tTextEng,
          name: tName,
          role: tRole,
          avatar: tAvatar
        })
      });
      if (res.ok) {
        setEditingTId(null);
        setTTextBen("");
        setTTextEng("");
        setTName("");
        setTRole("");
        setTAvatar("");
        fetchTestimonials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm(isBng ? "আপনি কি নিশ্চিতভাবে এই গ্রাহক রিভিউটি ডিলিট করতে চান?" : "Are you sure you want to delete this customer feedback testimonial?")) {
      try {
        const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchTestimonials();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox mapping
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      let finalValue: any = value;
      if (name.startsWith("calc")) {
        if (value === "") {
          finalValue = "";
        } else {
          // Strip leading zeros unless it is just "0" itself
          const cleaned = value.replace(/^0+(?=\d)/, "");
          finalValue = cleaned === "" ? 0 : Number(cleaned);
        }
      }
      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("calc") && value === "") {
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }));
    }
  };

  const handleColorPreset = (primary: string, secondary: string, accent: string) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent
    }));
  };

  const resetToDefaultPreset = () => {
    setFormData(prev => ({
      ...prev,
      primaryColor: "#1E40AF",
      secondaryColor: "#FACC15",
      accentColor: "#10B981"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('sudipta_cms_settings', JSON.stringify(formData));
      localStorage.setItem('sudipta_global_config', JSON.stringify(formData));
      await saveSettingsToSupabase(formData);
      await onUpdate(formData);
      setShowSuccessAlert(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-settings-panel" className="bg-white rounded-3xl p-5 md:p-8 border border-slate-100 shadow-md space-y-6 animate-fade-in">
      
      {/* Header and Brand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5.5 h-5.5 text-emerald-600" />
            {isBng ? "ওয়েবসাইট কন্টেন্ট কন্ট্রোল ও সেটিংস (CMS)" : "Website Content Control & Settings (CMS)"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isBng 
              ? "ওয়েবসাইটের প্রতিটি টেক্সট, ভিডিও, ব্যানার, ক্যালকুলেটর প্যারামিটার এবং পাসকোড এখান থেকে নিয়ন্ত্রণ করুন।"
              : "Dynamically configure copywriting, video embeds, notice alerts, calculators, and ERP security."}
          </p>
        </div>
        <button
          onClick={resetToDefaultPreset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isBng ? "ডিফল্ট থিম কালার" : "Reset Default Colors"}
        </button>
      </div>

      {showSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
          <span>{isBng ? "অভিনন্দন! আপনার পরিবর্তনগুলি সফলভাবে ডাটাবেসে সেভ করা হয়েছে।" : "Success! Your configuration overrides were saved and live updated."}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
        <button
          onClick={() => setActiveSubTab("core")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "core" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          {isBng ? "ব্র্যান্ড ও পাসওয়ার্ড" : "Brand & Security"}
        </button>

        <button
          onClick={() => setActiveSubTab("database")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "database" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          {isBng ? "ডাটাবেস ও ভার্সেল (Supabase)" : "Database & Vercel (Supabase)"}
        </button>

        <button
          onClick={() => setActiveSubTab("branding")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "branding" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          {isBng ? "ব্র্যান্ড ও থিম" : "Branding & Logo"}
        </button>

        <button
          onClick={() => setActiveSubTab("payment")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "payment" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          {isBng ? "পেমেন্ট গেটওয়ে" : "Payment Gateway"}
        </button>

        <button
          onClick={() => setActiveSubTab("contact")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "contact" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          {isBng ? "কন্টাক্ট ইনফো" : "Contact Info"}
        </button>

        <button
          onClick={() => setActiveSubTab("ui_ux")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "ui_ux" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isBng ? "ইউআই কন্ট্রোল" : "UI/UX Control"}
        </button>

        <button
          onClick={() => setActiveSubTab("hero")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "hero" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          {isBng ? "হিরো ও অ্যালার্ট ব্যানার" : "Hero & Notices"}
        </button>

        <button
          onClick={() => setActiveSubTab("about")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "about" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          {isBng ? "পরিচিতি ও কাজের নমুনা ভিডিও" : "About & Video"}
        </button>

        <button
          onClick={() => setActiveSubTab("card")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "card" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          {isBng ? "ডিজিটাল ভিজিটিং কার্ড" : "Visiting Card"}
        </button>

        <button
          onClick={() => setActiveSubTab("calc")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "calc" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          {isBng ? "স্মার্ট ক্যালকুলেটরস" : "Calculators"}
        </button>

        <button
          onClick={() => setActiveSubTab("testimonials")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "testimonials" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {isBng ? "গ্রাহক রিভিউ" : "Approved Reviews"}
        </button>

        <button
          onClick={() => setActiveSubTab("pending_reviews")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer relative ${
            activeSubTab === "pending_reviews" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {isBng ? "পেন্ডিং রিভিউ" : "Pending Reviews"}
          {testimonials.filter(t => t.isPending).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse">
              {testimonials.filter(t => t.isPending).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("orders")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "orders" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          {isBng ? "অর্ডার ট্র্যাকিং (ERP)" : "Order Management"}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("logistics")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "logistics" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          {isBng ? "লজিস্টিক কুরিয়ার সেটিংস" : "Logistics Config"}
        </button>

        <button
          onClick={() => setActiveSubTab("schedule")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "schedule" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {isBng ? "কাজের সময় ও ঠিকানা" : "Schedules & Footer"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* =========================================
            TAB: DATABASE & VERCEL CONFIGURATION
            ========================================= */}
        {activeSubTab === "database" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <span>{isBng ? "সুপাবেস ডাটাবেস স্ট্যাটাস" : "Supabase Database Status"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isSupabaseConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                      {isSupabaseConfigured ? (isBng ? "সক্রিয় (Active)" : "Connected") : (isBng ? "লোকাল ফলব্যাক মোড" : "Local State Mode")}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isSupabaseConfigured
                      ? (isBng ? "ডাটাবেস কানেক্ট করা আছে। Showroom, Orders, Customers এবং Settings স্থায়ীভাবে সেভ হচ্ছে।" : "Live connected! All changes to Showroom, Orders, Customers & Settings persist permanently.")
                      : (isBng ? "Vercel Environment Variables এ VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY যোগ করুন।" : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel to activate persistent storage.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Vercel Steps */}
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4">
              <h5 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                {isBng ? "ভার্সেল এনভায়রনমেন্ট ভেরিয়েবলস সেটিংস নির্দেশিকা (Vercel Setup Steps)" : "Steps to Add Database API Keys to Vercel"}
              </h5>
              <ol className="list-decimal list-inside text-xs text-emerald-950 space-y-2 font-medium">
                <li>{isBng ? "আপনার Vercel Dashboard-এ গিয়ে Sudipta E-Scooty প্রজেক্টটি নির্বাচন করুন।" : "Go to your Vercel Dashboard and select your deployed Sudipta E-Scooty project."}</li>
                <li>{isBng ? "উপরের নেভিগেশন বারের Settings ট্যাবে যান, তারপর বামপাশের Environment Variables পেজে যান।" : "Click on Settings at the top, then navigate to Environment Variables on the left sidebar."}</li>
                <li>
                  {isBng ? "নিচের নামের ভেরিয়েবল দুটি যোগ করুন:" : "Add the following Environment Variables:"}
                  <div className="mt-2 space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                      <span><strong>VITE_SUPABASE_URL</strong> = https://your-project.supabase.co</span>
                      <button type="button" onClick={() => navigator.clipboard.writeText("VITE_SUPABASE_URL")} className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-sans text-xs">
                        <Copy className="w-3.5 h-3.5" /> Copy Key Name
                      </button>
                    </div>
                    <div className="p-2.5 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                      <span><strong>VITE_SUPABASE_ANON_KEY</strong> = eyJhbGciOiJIUzI1NiIsIn...</span>
                      <button type="button" onClick={() => navigator.clipboard.writeText("VITE_SUPABASE_ANON_KEY")} className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-sans text-xs">
                        <Copy className="w-3.5 h-3.5" /> Copy Key Name
                      </button>
                    </div>
                  </div>
                </li>
                <li>{isBng ? "Save এ ক্লিক করুন এবং Vercel এ Deployments এ গিয়ে 'Redeploy' দিন যাতে নতুন ভেরিয়েবল কার্যকর হয়।" : "Click Save, then go to Deployments and trigger a 'Redeploy' so Vite bakes the keys into the web app."}</li>
              </ol>
            </div>

            {/* SQL Schema Generator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  {isBng ? "সুপাবেস টেবিল তৈরি করার SQL স্ক্রিপ্ট (Supabase SQL Editor)" : "Supabase Database SQL Table Creator Script"}
                </h5>
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- Supabase Schema for Sudipta E-Scooty ERP
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  brand TEXT,
  model TEXT,
  tagline TEXT,
  price NUMERIC,
  range TEXT,
  topSpeed TEXT,
  batteryType TEXT,
  colors JSONB,
  images JSONB,
  image TEXT,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  price NUMERIC,
  stock INTEGER,
  image TEXT,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  address TEXT,
  vehicleModel TEXT,
  photo TEXT,
  serviceHistory JSONB DEFAULT '[]'::jsonb,
  paymentHistory JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  customerPhone TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  totalAmount NUMERIC,
  paymentStatus TEXT,
  status TEXT DEFAULT 'Processing',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  businessName TEXT,
  businessNameEng TEXT,
  businessNameBen TEXT,
  phone TEXT,
  address TEXT,
  upiId TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public All Access" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public All Access" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Public All Access" ON public.customers FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public All Access" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public All Access" ON public.settings FOR ALL USING (true);`;
                    navigator.clipboard.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? (isBng ? "কপি হয়েছে!" : "Copied!") : (isBng ? "SQL কোড কপি করুন" : "Copy SQL Script")}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {isBng 
                  ? "Supabase Dashboard -> SQL Editor এ গিয়ে এই কোডটি পেস্ট করে 'Run' বাটনে চাপলে সব টেবিল নিজে থেকেই তৈরি হয়ে যাবে।"
                  : "Paste this script into Supabase Dashboard -> SQL Editor and click 'Run' to auto-generate all required tables."}
              </p>

              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-60 border border-slate-800">
{`CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  brand TEXT,
  model TEXT,
  price NUMERIC,
  range TEXT,
  topSpeed TEXT,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  price NUMERIC,
  stock INTEGER,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  customerPhone TEXT,
  totalAmount NUMERIC,
  is_deleted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Processing'
);`}
              </pre>
            </div>
          </div>
        )}
        
        {/* =========================================
            TAB: BRANDING & IDENTITY
            ========================================= */}
        {activeSubTab === "branding" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-600" />
              {isBng ? "ব্র্যান্ড আইডেন্টিটি ও লোগো" : "Brand Identity & Logo Customization"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (English)" : "Website Name (English)"}</label>
                <input
                  type="text"
                  name="businessNameEng"
                  value={formData.businessNameEng || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (বাংলা)" : "Website Name (Bengali)"}</label>
                <input
                  type="text"
                  name="businessNameBen"
                  value={formData.businessNameBen || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটর নাম (English)" : "Proprietor Name (English)"}</label>
                <input
                  type="text"
                  name="proprietorNameEng"
                  value={formData.proprietorNameEng || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটর নাম (বাংলা)" : "Proprietor Name (Bengali)"}</label>
                <input
                  type="text"
                  name="proprietorNameBen"
                  value={formData.proprietorNameBen || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "লোগো ইউআরএল (Logo URL)" : "Website Logo URL"}</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (English)" : "Website Name (English)"}</label>
                <input
                  type="text"
                  name="businessNameEng"
                  value={formData.businessNameEng || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (বাংলা)" : "Website Name (Bengali)"}</label>
                <input
                  type="text"
                  name="businessNameBen"
                  value={formData.businessNameBen || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ফেভিকন ইউআরএল (Favicon URL)" : "Favicon Icon URL"}</label>
                <input
                  type="text"
                  name="faviconUrl"
                  value={formData.faviconUrl || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কালার থিম স্টাইল" : "Color Theme Preset"}</label>
                <select
                  name="colorTheme"
                  value={formData.colorTheme || "classic"}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="classic">Classic Professional</option>
                  <option value="modern">Modern Minimal</option>
                  <option value="vibrant">Vibrant & Bold</option>
                  <option value="minimal">Ultra Clean</option>
                </select>
              </div>
            </div>

            {/* Color Palette Customizer (Re-used from core for convenience) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-600" />
                {isBng ? "কাস্টম কালার প্যালেট" : "Custom Global Color Palette"}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "প্রাথমিক রঙ" : "Primary Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="primaryColor" value={formData.primaryColor || "#1E40AF"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "সেকেন্ডারি রঙ" : "Secondary Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="secondaryColor" value={formData.secondaryColor || "#FACC15"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "অ্যাকসেন্ট রঙ" : "Accent Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="accentColor" value={formData.accentColor || "#10B981"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: PAYMENT GATEWAY
            ========================================= */}
        {activeSubTab === "payment" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              {isBng ? "পেমেন্ট গেটওয়ে ও ইউপিআই সেটিংস" : "Payment Gateway & UPI Configurations"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ইউপিআই আইডি (UPI ID)" : "UPI ID"}</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={handleChange}
                  placeholder="e.g. tanmoydasdas23@ybl"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "মার্চেন্ট নাম" : "Merchant/Payee Name"}</label>
                <input
                  type="text"
                  name="upiMerchantName"
                  value={formData.upiMerchantName || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কিউআর কোড ইমেজ ইউআরএল" : "Payment QR Code Image URL"}</label>
                <input
                  type="text"
                  name="qrCodeUrl"
                  value={formData.qrCodeUrl || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পেমেন্ট নির্দেশাবলী (বাংলা)" : "Payment Instructions (Ben)"}</label>
                <textarea
                  name="paymentInstructionsBen"
                  value={formData.paymentInstructionsBen || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পেমেন্ট নির্দেশাবলী (ইংরেজি)" : "Payment Instructions (Eng)"}</label>
                <textarea
                  name="paymentInstructionsEng"
                  value={formData.paymentInstructionsEng || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: CONTACT INFORMATION
            ========================================= */}
        {activeSubTab === "contact" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              {isBng ? "কন্টাক্ট ইনফরমেশন আপডেট" : "Global Contact & Support Information"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={handleChange}
                  placeholder="e.g. +919064517009"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "সাপোর্ট ইমেইল" : "Support Email Address"}</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার ঠিকানা (বাংলা)" : "Business Address (Bengali)"}</label>
                <textarea
                  name="businessAddressBen"
                  value={formData.businessAddressBen || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার ঠিকানা (ইংরেজি)" : "Business Address (English)"}</label>
                <textarea
                  name="businessAddressEng"
                  value={formData.businessAddressEng || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: UI/UX CONTROL
            ========================================= */}
        {activeSubTab === "ui_ux" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              {isBng ? "ইউআই মডিউল ও বাটন কন্ট্রোল" : "UI Module Visibility & Button Text Overrides"}
            </h4>

            {/* Module Visibility */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "মডিউল এনাবল/ডিজেবল" : "Enable/Disable Website Modules"}</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(formData.enabledModules || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-300 transition shadow-2xs">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          enabledModules: {
                            ...prev.enabledModules,
                            [key]: e.target.checked
                          }
                        }));
                      }}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700 capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "বাটন টেক্সট (কিনুন)" : "Buy Now Button Texts"}</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">English</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.buyNowEng || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, buyNowEng: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Bengali</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.buyNowBen || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, buyNowBen: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "বাটন টেক্সট (বুকিং)" : "Book Now Button Texts"}</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">English</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.bookNowEng || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, bookNowEng: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Bengali</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.bookNowBen || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, bookNowBen: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "নেভিগেশন লিঙ্ক ম্যানেজমেন্ট" : "Navigation Links Management"}</h5>
              <div className="space-y-3">
                {(formData.navLinks || []).map((link, idx) => (
                  <div key={link.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="sm:col-span-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Labels (Eng / Ben)</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={link.labelEng}
                          onChange={(e) => {
                            const newLinks = [...(formData.navLinks || [])];
                            newLinks[idx].labelEng = e.target.value;
                            setFormData(prev => ({ ...prev, navLinks: newLinks }));
                          }}
                          placeholder="English Label"
                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          value={link.labelBen}
                          onChange={(e) => {
                            const newLinks = [...(formData.navLinks || [])];
                            newLinks[idx].labelBen = e.target.value;
                            setFormData(prev => ({ ...prev, navLinks: newLinks }));
                          }}
                          placeholder="Bengali Label"
                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Href (Target ID)</label>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...(formData.navLinks || [])];
                          newLinks[idx].href = e.target.value;
                          setFormData(prev => ({ ...prev, navLinks: newLinks }));
                        }}
                        placeholder="#section-id"
                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={link.isEnabled}
                        onChange={(e) => {
                          const newLinks = [...(formData.navLinks || [])];
                          newLinks[idx].isEnabled = e.target.checked;
                          setFormData(prev => ({ ...prev, navLinks: newLinks }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-[10px] font-bold text-slate-600">{isBng ? "এনাবল" : "Enabled"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: BRANDING & LOGO
            ========================================= */}
        {activeSubTab === "branding" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-1">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                {isBng ? "ব্র্যান্ডিং ও লোগো কন্ট্রোল" : "Brand Identity & Visual Theme"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isBng ? "আপনার ওয়েবসাইটের লোগো, ফেভিকন এবং কালার থিম পরিবর্তন করুন।" : "Manage your website's primary branding assets and color schemes."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (English)" : "Website Name (English)"}</label>
                <input
                  type="text"
                  name="businessNameEng"
                  value={formData.businessNameEng || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম (বাংলা)" : "Website Name (Bengali)"}</label>
                <input
                  type="text"
                  name="businessNameBen"
                  value={formData.businessNameBen || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটর নাম (English)" : "Proprietor Name (English)"}</label>
                <input
                  type="text"
                  name="proprietorNameEng"
                  value={formData.proprietorNameEng || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটর নাম (বাংলা)" : "Proprietor Name (Bengali)"}</label>
                <input
                  type="text"
                  name="proprietorNameBen"
                  value={formData.proprietorNameBen || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "লোগো ইউআরএল (Logo URL)" : "Website Logo URL"}</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ফেভিকন ইউআরএল (Favicon URL)" : "Favicon Icon URL"}</label>
                <input
                  type="text"
                  name="faviconUrl"
                  value={formData.faviconUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কালার থিম (Color Theme)" : "Visual Theme Style"}</label>
                <select
                  name="colorTheme"
                  value={formData.colorTheme || "classic"}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                >
                  <option value="classic">Classic (Emerald & Slate)</option>
                  <option value="modern">Modern (Indigo & Slate)</option>
                  <option value="vibrant">Vibrant (Rose & Amber)</option>
                  <option value="minimal">Minimal (Gray & Black)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: PAYMENT GATEWAY
            ========================================= */}
        {activeSubTab === "payment" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-1">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                {isBng ? "পেমেন্ট গেটওয়ে সেটিংস" : "Payment Gateway & UPI Integration"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isBng ? "আপনার ইউপিআই আইডি এবং কিউআর কোড ইমেজ আপডেট করুন পেমেন্ট নেওয়ার জন্য।" : "Configure your primary UPI ID and upload custom QR codes for direct payments."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ইউপিআই আইডি (UPI ID)" : "Primary UPI VPA ID"}</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={handleChange}
                  placeholder="e.g. sdas@upi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "মার্চেন্ট নাম (UPI Name)" : "UPI Account/Merchant Name"}</label>
                <input
                  type="text"
                  name="upiMerchantName"
                  value={formData.upiMerchantName || ""}
                  onChange={handleChange}
                  placeholder="e.g. Sudipta Das"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কিউআর কোড ইমেজ ইউআরএল (QR URL)" : "Payment QR Code Image URL"}</label>
                <input
                  type="text"
                  name="qrCodeUrl"
                  value={formData.qrCodeUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/qr-code.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
                <p className="text-[9px] text-slate-400 mt-1 italic">Leave empty to auto-generate standard QR based on UPI ID.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পেমেন্ট নির্দেশিকা (English)" : "Payment Instructions (Eng)"}</label>
                <textarea
                  name="paymentInstructionsEng"
                  value={formData.paymentInstructionsEng || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পেমেন্ট নির্দেশিকা (বাংলা)" : "Payment Instructions (Ben)"}</label>
                <textarea
                  name="paymentInstructionsBen"
                  value={formData.paymentInstructionsBen || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: CONTACT INFORMATION
            ========================================= */}
        {activeSubTab === "contact" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                {isBng ? "কন্টাক্ট ইনফরমেশন" : "Global Contact & Communication Hub"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isBng ? "হোয়াটসঅ্যাপ নম্বর, ইমেল এবং ব্যবসার ঠিকানা এখান থেকে আপডেট করুন।" : "Manage how customers reach you via WhatsApp, Email and Physical Location."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "হোয়াটসঅ্যাপ নম্বর (WhatsApp)" : "Global WhatsApp Number"}</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={handleChange}
                  placeholder="e.g. +919064517009"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "সাপোর্ট ইমেল (Support Email)" : "Official Support Email"}</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail || ""}
                  onChange={handleChange}
                  placeholder="iamsudiptadas666@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার ঠিকানা (English)" : "Full Business Address (Eng)"}</label>
                <textarea
                  name="businessAddressEng"
                  value={formData.businessAddressEng || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার ঠিকানা (বাংলা)" : "Full Business Address (Ben)"}</label>
                <textarea
                  name="businessAddressBen"
                  value={formData.businessAddressBen || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "গুগল ম্যাপ ইউআরএল (Maps URL)" : "Google Maps Pin / Embed URL"}</label>
                <input
                  type="text"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl || ""}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB: UI/UX MODULE CONTROL
            ========================================= */}
        {activeSubTab === "ui_ux" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-1">
              <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-600" />
                {isBng ? "ইউআই মডিউল কন্ট্রোল" : "UI Module & Feature Management"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isBng ? "ওয়েবসাইটের নির্দিষ্ট সেকশনগুলি চালু বা বন্ধ করুন এবং বাটন টেক্সট পরিবর্তন করুন।" : "Enable/Disable core website sections and modify global call-to-action button texts."}
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "মডিউল সক্ষম/অক্ষম করুন" : "Enable/Disable Core Modules"}</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { id: "vehicles", label: isBng ? "শোরুম (Vehicles)" : "Showroom" },
                  { id: "spareParts", label: isBng ? "যন্ত্রাংশ (Parts)" : "Spare Parts" },
                  { id: "service", label: isBng ? "সার্ভিস (Service)" : "Repair Service" },
                  { id: "emi", label: isBng ? "ইএমআই (EMI)" : "EMI/Financing" },
                  { id: "ecommerce", label: isBng ? "ই-কমার্স (Shop)" : "E-Commerce" }
                ].map((mod) => (
                  <div key={mod.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <input
                      type="checkbox"
                      checked={formData.enabledModules?.[mod.id as keyof typeof formData.enabledModules] !== false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          enabledModules: {
                            ...(prev.enabledModules || { vehicles: true, spareParts: true, service: true, emi: true, ecommerce: true }),
                            [mod.id]: e.target.checked
                          }
                        }));
                      }}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-600">{mod.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "বাটন টেক্সট পরিবর্তন" : "Dynamic Button Text (CTA Labels)"}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">"Buy Now" / "Showroom" Button</p>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">English</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.buyNowEng || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, buyNowEng: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Bengali</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.buyNowBen || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, buyNowBen: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">"Book Now" / "Service" Button</p>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">English</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.bookNowEng || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, bookNowEng: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Bengali</label>
                    <input
                      type="text"
                      value={formData.buttonTexts?.bookNowBen || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonTexts: { ...prev.buttonTexts, bookNowBen: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? "নেভিগেশন লিঙ্ক ম্যানেজমেন্ট" : "Navigation Links Management"}</h5>
              <div className="space-y-3">
                {(formData.navLinks || []).map((link, idx) => (
                  <div key={link.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="sm:col-span-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Labels (Eng / Ben)</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={link.labelEng}
                          onChange={(e) => {
                            const newLinks = [...(formData.navLinks || [])];
                            newLinks[idx].labelEng = e.target.value;
                            setFormData(prev => ({ ...prev, navLinks: newLinks }));
                          }}
                          placeholder="English Label"
                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          value={link.labelBen}
                          onChange={(e) => {
                            const newLinks = [...(formData.navLinks || [])];
                            newLinks[idx].labelBen = e.target.value;
                            setFormData(prev => ({ ...prev, navLinks: newLinks }));
                          }}
                          placeholder="Bengali Label"
                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Href (Target ID)</label>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...(formData.navLinks || [])];
                          newLinks[idx].href = e.target.value;
                          setFormData(prev => ({ ...prev, navLinks: newLinks }));
                        }}
                        placeholder="#section-id"
                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={link.isEnabled}
                        onChange={(e) => {
                          const newLinks = [...(formData.navLinks || [])];
                          newLinks[idx].isEnabled = e.target.checked;
                          setFormData(prev => ({ ...prev, navLinks: newLinks }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-[10px] font-bold text-slate-600">{isBng ? "এনাবল" : "Enabled"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 1: CORE IDENTITY & SECURITY
            ========================================= */}
        {activeSubTab === "core" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                {isBng ? "ERP পাসওয়ার্ড পরিবর্তন" : "ERP Lock/Passcode Security Control"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isBng ? "নিরাপত্তার স্বার্থে যেকোনো সময় ইআরপি ড্যাশবোর্ডে লগইন করার পাসকোড পরিবর্তন করতে পারেন। ডিফল্ট: 9064" : "Modify the key security passcode required to gain root ERP system access."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "সরাসরি ড্যাশবোর্ড পাসকোড (ERP Passcode)" : "Security ERP Passcode"}</label>
                <input
                  type="text"
                  name="erpPasscode"
                  value={formData.erpPasscode || "9064"}
                  onChange={handleChange}
                  placeholder="e.g. 9064"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম - বাংলা (ব্র্যান্ডিং)" : "Business Name (Bengali)"}</label>
                <input
                  type="text"
                  name="businessNameBen"
                  value={formData.businessNameBen || ""}
                  onChange={handleChange}
                  required
                  placeholder="যেমন: সুদীপ্ত ই-স্কুটি সার্ভিস"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যবসার নাম - ইংরেজি (ব্র্যান্ডিং)" : "Business Name (English)"}</label>
                <input
                  type="text"
                  name="businessNameEng"
                  value={formData.businessNameEng || ""}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Sudipta E-Scooty Service"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কল করার মোবাইল নম্বর" : "Primary Phone Contact No"}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "হোয়াটসঅ্যাপ চ্যাট লিংক ইউআরএল" : "WhatsApp Chat Link URL"}</label>
                <input
                  type="text"
                  name="whatsappLink"
                  value={formData.whatsappLink}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ইউপিআই আইডি (UPI ID)" : "UPI ID for Parts Checkout"}</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={handleChange}
                  required
                  placeholder="e.g. tanmoydasdas23@ybl"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ইউপিআই মার্চেন্ট নাম (Payee Name)" : "UPI Payee Name (Merchant Name)"}</label>
                <input
                  type="text"
                  name="upiMerchantName"
                  value={formData.upiMerchantName || ""}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mr TANMAY DAS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "বিজনেস জিএসটি নম্বর" : "Business GSTIN (Shop GSTIN)"}</label>
                <input
                  type="text"
                  name="shopGstin"
                  value={formData.shopGstin || ""}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Color Palette Customizer */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-600" />
                {isBng ? "ব্র্যান্ড রঙের থিম (Color Themes)" : "Custom Visual Color Palette Themes"}
              </h4>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{isBng ? "ক্লিক করে দ্রুত থিম রঙ সেট করুন:" : "Quick Theme Presets:"}</span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleColorPreset("#1E40AF", "#FACC15", "#10B981")}
                    className="flex items-center gap-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-slate-600 ml-1">Royal Blue & Gold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleColorPreset("#0F172A", "#38BDF8", "#F43F5E")}
                    className="flex items-center gap-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                    <span className="text-slate-600 ml-1">Cosmic Cyber</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleColorPreset("#047857", "#FEF08A", "#059669")}
                    className="flex items-center gap-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEF08A]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                    <span className="text-slate-600 ml-1">Mint Eco Green</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "প্রাথমিক রঙ" : "Primary Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="primaryColor" value={formData.primaryColor || "#1E40AF"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "সেকেন্ডারি রঙ" : "Secondary Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="secondaryColor" value={formData.secondaryColor || "#FACC15"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">{isBng ? "অ্যাকসেন্ট রঙ" : "Accent Color"}</label>
                  <div className="flex gap-2">
                    <input type="color" name="accentColor" value={formData.accentColor || "#10B981"} onChange={handleChange} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0" />
                    <input type="text" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-mono" />
                  </div>
                </div>
              </div>
            </div>

            {/* Festival Engine Option */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 block mb-1.5">{isBng ? "উৎসবের থিম নির্বাচন" : "Active Holiday Overlays"}</label>
              <select
                name="festivalTheme"
                value={formData.festivalTheme}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {festivalOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {isBng ? opt.labelBen : opt.labelEng}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: HERO BANNER & ALERTS
            ========================================= */}
        {activeSubTab === "hero" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {isBng ? "হিরো ল্যান্ডিং সেকশন টেক্সট" : "Hero Landing Screen Copywriting"}
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রধান হিরো হেডিং (বাংলা)" : "Hero Main Headline"}</label>
                <input
                  type="text"
                  name="heroHeading"
                  value={formData.heroHeading}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "হিরো সাব-টাইটেল/বিবরণ (বাংলা)" : "Hero Sub-headline Description"}</label>
                <textarea
                  name="heroSubheading"
                  value={formData.heroSubheading}
                  onChange={handleChange}
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Hero Background Management Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                {isBng ? "হিরো ব্যাকগ্রাউন্ড মিডিয়া" : "Hero Background Media Control"}
              </h4>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, heroBgType: 'image' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                      formData.heroBgType === 'image' || !formData.heroBgType
                        ? "bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm"
                        : "bg-white border border-slate-200 text-slate-500 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    {isBng ? "ছবি (Image)" : "Background Image"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, heroBgType: 'video' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                      formData.heroBgType === 'video'
                        ? "bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm"
                        : "bg-white border border-slate-200 text-slate-500 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {isBng ? "ভিডিও (Video)" : "Background Video"}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {formData.heroBgType === 'video' 
                      ? (isBng ? "ভিডিও ইউআরএল (YouTube/Vimeo/Direct MP4)" : "Video URL (YouTube/Vimeo/Direct MP4 Link)") 
                      : (isBng ? "ব্যাকগ্রাউন্ড ইমেজ ইউআরএল" : "Background Image URL")
                    }
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="heroBgUrl"
                      value={formData.heroBgUrl || ""}
                      onChange={handleChange}
                      placeholder={formData.heroBgType === 'video' ? "https://..." : "https://images.unsplash.com/..."}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="absolute right-2 top-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {formData.heroBgType === 'video' 
                      ? (isBng ? "প্রো-টিপঃ সচরাচর ইউটিউব বা ডাইরেক্ট ভিডিও লিঙ্ক ব্যবহার করলে ভালো ফলাফল পাওয়া যায়।" : "Pro-tip: Use direct .mp4 or high-quality video links for the best performance.")
                      : (isBng ? "উচ্চমানের ছবি ব্যবহার করুন (রেকমেন্ডেড সাইজ: ১৯২০x১০৮০)" : "Use high-resolution photos (Recommended: 1920x1080px).")
                    }
                  </p>
                </div>
                
                {formData.heroBgUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black relative">
                    {formData.heroBgType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Video className="w-8 h-8 text-white/20" />
                        <span className="absolute bottom-2 left-2 text-[8px] text-white/50 font-mono truncate max-w-[200px]">{formData.heroBgUrl}</span>
                      </div>
                    ) : (
                      <img src={formData.heroBgUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Banner / Notice Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-500 animate-swing" />
                    {isBng ? "শীর্ষ জরুরি ঘোষণা ব্যানার (Alert Notice Banner)" : "Top Alert Announcement Banner"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isBng ? "হোমপেজের সবার উপরে একটি রানিং নোটিশ বা লাল এলার্ট ব্যানার দেখানোর জন্য এটি সক্রিয় করুন।" : "Toggle a high-visibility message block pinned at the very top of the website."}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showTopNotice"
                    checked={formData.showTopNotice || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        showTopNotice: e.target.checked
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {formData.showTopNotice && (
                <div className="space-y-4 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 block">{isBng ? "ঘোষণা শিরোনাম (বাংলা)" : "Notice Title (Bengali)"}</label>
                      <input
                        type="text"
                        name="topNoticeTitleBen"
                        value={formData.topNoticeTitleBen || ""}
                        onChange={handleChange}
                        placeholder="যেমন: বিশেষ বর্ষাকালীন সার্ভিসিং অফারঃ"
                        className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 block">{isBng ? "ঘোষণা শিরোনাম (ইংরেজি)" : "Notice Title (English)"}</label>
                      <input
                        type="text"
                        name="topNoticeTitleEng"
                        value={formData.topNoticeTitleEng || ""}
                        onChange={handleChange}
                        placeholder="e.g. Special Monsoon Service Offer:"
                        className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 block">{isBng ? "ঘোষণা বর্ণনা (বাংলা)" : "Notice Description (Bengali)"}</label>
                      <textarea
                        name="topNoticeTextBen"
                        value={formData.topNoticeTextBen}
                        onChange={handleChange}
                        rows={2}
                        placeholder="যেমন: সম্পূর্ণ ইভি ডায়াগনোসিস এবং ওয়্যারিং সার্ভিসিং-এ সরাসরি ২০% ছাড়..."
                        className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 block">{isBng ? "ঘোষণা বর্ণনা (ইংরেজি)" : "Notice Description (English)"}</label>
                      <textarea
                        name="topNoticeTextEng"
                        value={formData.topNoticeTextEng}
                        onChange={handleChange}
                        rows={2}
                        placeholder="e.g. Get flat 20% discount on complete EV diagnosis and wiring service..."
                        className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: ABOUT US & WORK VIDEO
            ========================================= */}
        {activeSubTab === "about" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-600" />
              {isBng ? "আমাদের সম্পর্কে বিবরণী (About Us Customizer)" : "About Us Section Copy & Showcase Video"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি হেডিং (ইংরেজি)" : "About Header Copy (Eng)"}</label>
                <input
                  type="text"
                  name="aboutHeadingEng"
                  value={formData.aboutHeadingEng}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি হেডিং (বাংলা)" : "About Header Copy (Ben)"}</label>
                <input
                  type="text"
                  name="aboutHeadingBen"
                  value={formData.aboutHeadingBen}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি প্যারাগ্রাফ ১ (ইংরেজি)" : "Intro Paragraph 1 (Eng)"}</label>
                <textarea
                  name="aboutText1Eng"
                  value={formData.aboutText1Eng}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি প্যারাগ্রাফ ১ (বাংলা)" : "Intro Paragraph 1 (Ben)"}</label>
                <textarea
                  name="aboutText1Ben"
                  value={formData.aboutText1Ben}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি প্যারাগ্রাফ ২ (ইংরেজি)" : "Intro Paragraph 2 (Eng)"}</label>
                <textarea
                  name="aboutText2Eng"
                  value={formData.aboutText2Eng}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পরিচিতি প্যারাগ্রাফ ২ (বাংলা)" : "Intro Paragraph 2 (Ben)"}</label>
                <textarea
                  name="aboutText2Ben"
                  value={formData.aboutText2Ben}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Work Sample Video Embedded links */}
            <div className="pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">
                  {isBng ? "কাজের নমুনা শোকেস ভিডিও লিংক (Video Embed Link)" : "Showcase Video Link Manager"}
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="Paste YouTube, Facebook or Instagram video link here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                  {isBng 
                    ? "💡 আপনি যেকোনো ইউটিউব ভিডিও, ফেসবুক রিলস/ভিডিও অথবা ইনস্টাগ্রাম পোস্টের লিঙ্ক পেস্ট করতে পারেন। সিস্টেম নিজে থেকে এটি এম্বেড করবে।"
                    : "💡 Enter any YouTube video URL, Facebook video/reels link, or Instagram URL. Our player converts it on the fly."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: DIGITAL VISITING CARD
            ========================================= */}
        {activeSubTab === "card" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              {isBng ? "ডিজিটাল ভিজিটিং কার্ড সেটিংস" : "Digital Visiting Card Customizer"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটার নাম (ইংরেজি)" : "Proprietor Name (Eng)"}</label>
                <input
                  type="text"
                  name="visitingCardOwnerNameEng"
                  value={formData.visitingCardOwnerNameEng}
                  onChange={handleChange}
                  placeholder="e.g. Sudipta Das"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "প্রোপ্রাইটার নাম (বাংলা)" : "Proprietor Name (Ben)"}</label>
                <input
                  type="text"
                  name="visitingCardOwnerNameBen"
                  value={formData.visitingCardOwnerNameBen}
                  onChange={handleChange}
                  placeholder="যেমন: সুদীপ্ত দাস"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পদবী / ভূমিকা (ইংরেজি)" : "Owner Designation Role (Eng)"}</label>
                <input
                  type="text"
                  name="visitingCardOwnerRoleEng"
                  value={formData.visitingCardOwnerRoleEng}
                  onChange={handleChange}
                  placeholder="e.g. PROPRIETOR / OWNER"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "পদবী / ভূমিকা (বাংলা)" : "Owner Designation Role (Ben)"}</label>
                <input
                  type="text"
                  name="visitingCardOwnerRoleBen"
                  value={formData.visitingCardOwnerRoleBen}
                  onChange={handleChange}
                  placeholder="যেমন: প্রোপ্রাইটার ও ইভি বিশেষজ্ঞ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "যোগাযোগ ফোন নম্বর" : "Visiting Card Phone Contact"}</label>
                <input
                  type="text"
                  name="visitingCardPhone"
                  value={formData.visitingCardPhone}
                  onChange={handleChange}
                  placeholder="+91 90645 17009"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কার্ডের ঠিকানা (ইংরেজি)" : "Card Display Address (Eng)"}</label>
                <input
                  type="text"
                  name="visitingCardAddressEng"
                  value={formData.visitingCardAddressEng}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "কার্ডের ঠিকানা (বাংলা)" : "Card Display Address (Ben)"}</label>
                <input
                  type="text"
                  name="visitingCardAddressBen"
                  value={formData.visitingCardAddressBen}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 5: CALCULATORS PARAMETERS
            ========================================= */}
        {activeSubTab === "calc" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              {isBng ? "ক্যালকুলেটরস বেস প্যারামিটারস সেটিং" : "Smart Estimator Baseline Variable Controls"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ডিফল্ট ব্যাটারি/স্কুটার মূল্য (₹)" : "Default Item Baseline Price"}</label>
                <input
                  type="number"
                  name="calcDefaultPrice"
                  value={formData.calcDefaultPrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ডিফল্ট ডাউনপেমেন্ট (%)" : "Default Downpayment Pct (%)"}</label>
                <input
                  type="number"
                  name="calcDefaultDownPaymentPct"
                  value={formData.calcDefaultDownPaymentPct}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ইএমআই বার্ষিক সুদের হার (%)" : "Annual Base Interest Rate (%)"}</label>
                <input
                  type="number"
                  name="calcBaseInterestRate"
                  value={formData.calcBaseInterestRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যাটারি ভোল্টেজ প্রিসেট (Volts)" : "Battery Predefined Voltage"}</label>
                <input
                  type="number"
                  name="calcDefaultVoltage"
                  value={formData.calcDefaultVoltage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "ব্যাটারি ক্যাপাসিটি প্রিসেট (Ah)" : "Battery Predefined Capacity (Ah)"}</label>
                <input
                  type="number"
                  name="calcDefaultCapacity"
                  value={formData.calcDefaultCapacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "গড় ড্রাইভিং গতি প্রিসেট (km/h)" : "Average Speed Metric"}</label>
                <input
                  type="number"
                  name="calcDefaultSpeed"
                  value={formData.calcDefaultSpeed}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 6: TESTIMONIALS CRUD
            ========================================= */}
        {activeSubTab === "testimonials" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                {isBng ? "গ্রাহক মতামত ও রিভিউ ম্যানেজমেন্ট" : "Customer Feedback Quotes Manager (CRUD)"}
              </h4>
            </div>

            {/* Form to Add / Edit Testimonial */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {editingTId ? <Edit className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                {editingTId ? (isBng ? "রিভিউ এডিট করুন" : "Edit Customer Testimonial") : (isBng ? "নতুন রিভিউ যুক্ত করুন" : "Add New Client Quote")}
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">{isBng ? "গ্রাহকের নাম" : "Customer Name"}</label>
                  <input
                    type="text"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    placeholder="e.g. Joydeb Shikdar"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">{isBng ? "ঠিকানা / রোল" : "Location or Designation"}</label>
                  <input
                    type="text"
                    value={tRole}
                    onChange={(e) => setTRole(e.target.value)}
                    placeholder="e.g. Ashoknagar Local"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">{isBng ? "লোগো / আদ্যক্ষর (Avatar)" : "Profile Initials / Avatar"}</label>
                  <input
                    type="text"
                    value={tAvatar}
                    onChange={(e) => setTAvatar(e.target.value)}
                    placeholder="e.g. JS"
                    maxLength={3}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">{isBng ? "রিভিউ কন্টেন্ট (বাংলায়)" : "Testimonial Content (Bengali)"}</label>
                  <textarea
                    value={tTextBen}
                    onChange={(e) => setTTextBen(e.target.value)}
                    rows={2}
                    placeholder="গ্রাহকের রিভিউ বাংলায় লিখুন..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">{isBng ? "রিভিউ কন্টেন্ট (ইংরেজিতে)" : "Testimonial Content (English)"}</label>
                  <textarea
                    value={tTextEng}
                    onChange={(e) => setTTextEng(e.target.value)}
                    rows={2}
                    placeholder="Customer review in English script..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                {editingTId ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTId(null);
                        setTTextBen("");
                        setTTextEng("");
                        setTName("");
                        setTRole("");
                        setTAvatar("");
                      }}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {isBng ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTestimonial(editingTId)}
                      className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {isBng ? "আপডেট রিভিউ" : "Save Update"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddTestimonial}
                    className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isBng ? "রিভিউ সেভ করুন" : "Add Testimonial"}
                  </button>
                )}
              </div>
            </div>

            {/* Testimonials List */}
            {loadingT ? (
              <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isBng ? "রিভিউ লোড হচ্ছে..." : "Syncing testimonials collection..."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.filter(t => !t.isPending).map((tItem) => (
                  <div key={tItem.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-3 relative hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 shrink-0 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {tItem.avatar || "C"}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <strong className="text-slate-800 text-xs font-bold block">{tItem.name}</strong>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">{tItem.role}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditTestimonial(tItem)}
                            className="p-1 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(tItem.id)}
                            className="p-1 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic mt-1 leading-relaxed">
                        “{isBng ? tItem.textBen : tItem.textEng}”
                      </p>
                    </div>
                  </div>
                ))}

                {testimonials.filter(t => !t.isPending).length === 0 && (
                  <div className="md:col-span-2 text-center py-8 text-slate-400 text-xs">
                    {isBng ? "কোনো পাবলিশ করা রিভিউ পাওয়া যায়নি।" : "No approved feedback quotes found. Publish some pending reviews!"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "pending_reviews" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{isBng ? "পেন্ডিং কাস্টমার রিভিউ" : "Pending Customer Reviews"}</h4>
                <p className="text-[10px] text-slate-400">{isBng ? "রিভিউ অ্যাপ্রুভ করলে তা পাবলিক ওয়েবসাইটে দেখা যাবে।" : "Approve these reviews to make them visible on the public website."}</p>
              </div>
              <button 
                onClick={() => fetch("/api/testimonials").then(r => r.json()).then(setTestimonials)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {testimonials.filter(t => t.isPending).map((tItem) => (
                <div key={tItem.id} className="p-5 bg-white rounded-2xl border-2 border-amber-100 shadow-sm flex flex-col md:flex-row gap-4 relative">
                  <div className="flex gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 shrink-0 text-amber-700 text-sm font-bold flex items-center justify-center">
                      {tItem.avatar || "C"}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-800 text-xs font-bold">{tItem.name}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{tItem.role}</span>
                        <div className="flex gap-0.5 text-amber-400 ml-auto md:ml-0">
                          {[...Array(tItem.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        “{tItem.textBen || tItem.textEng}”
                      </p>
                      {tItem.date && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tItem.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2 justify-center md:border-l border-slate-100 md:pl-4">
                    <button
                      type="button"
                      onClick={() => handleApproveTestimonial(tItem.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer shadow-sm shadow-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isBng ? "অ্যাপ্রুভ" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(tItem.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      {isBng ? "ডিলিট" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}

              {testimonials.filter(t => t.isPending).length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare className="w-8 h-8 text-slate-200" />
                  </div>
                  <h5 className="text-slate-800 font-bold text-sm">{isBng ? "কোনো পেন্ডিং রিভিউ নেই" : "All Caught Up!"}</h5>
                  <p className="text-[10px] text-slate-400 mt-1">{isBng ? "নতুন রিভিউ আসলে এখানে দেখতে পাবেন।" : "No new customer reviews waiting for approval."}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 7: SCHEDULES & FOOTER TIMING
            ========================================= */}
        {activeSubTab === "schedule" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              {isBng ? "কর্মদিবস ও সময়সূচী নিয়ন্ত্রণ" : "Workshop Working Schedule & Footers"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "সোম - শনি কাজের সময় (বাংলা)" : "Mon - Sat Schedule (Ben)"}</label>
                <input
                  type="text"
                  name="timingWeekdaysBen"
                  value={formData.timingWeekdaysBen}
                  onChange={handleChange}
                  placeholder="যেমন: সোম - শনি: সকাল ৯:০০ - রাত ৯:০০"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "সোম - শনি কাজের সময় (ইংরেজি)" : "Mon - Sat Schedule (Eng)"}</label>
                <input
                  type="text"
                  name="timingWeekdaysEng"
                  value={formData.timingWeekdaysEng}
                  onChange={handleChange}
                  placeholder="e.g. Mon - Sat: 9:00 AM - 9:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "রবিবার কাজের সময় (বাংলা)" : "Sunday Schedule (Ben)"}</label>
                <input
                  type="text"
                  name="timingSundayBen"
                  value={formData.timingSundayBen}
                  onChange={handleChange}
                  placeholder="যেমন: রবিবার: বন্ধ / জরুরী মেরামত অন-কল"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">{isBng ? "রবিবার কাজের সময় (ইংরেজি)" : "Sunday Schedule (Eng)"}</label>
                <input
                  type="text"
                  name="timingSundayEng"
                  value={formData.timingSundayEng}
                  onChange={handleChange}
                  placeholder="e.g. Sunday: Closed / Emergency On-Call repairs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Google Business / Maps coordination links */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {isBng ? "গুগল ম্যাপস ও কাস্টমার লোকেশন লিঙ্কস" : "Google Location Routing Integration Links"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">{isBng ? "সম্পূর্ণ শোরুমের ঠিকানা" : "Workshop Static Address Location"}</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">{isBng ? "গুগল ম্যাপ নেভিগেশন লিঙ্ক" : "Google Map Search Routing Link"}</label>
                  <input
                    type="text"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleChange}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "logistics" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 space-y-1">
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                {isBng ? "থার্ড-পার্টি কুরিয়ার ইন্টিগ্রেশন সেটিংস" : "Logistics Integration & Carrier APIs"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isBng 
                  ? "গ্রাহকের অর্ডার স্বয়ংক্রিয়ভাবে ডিসপ্যাচ করতে এখানে আপনার ডেলিভারি পার্টনার এপিআই ক্রেডেনশিয়াল সেট করুন।" 
                  : "Setup the carrier authentication variables. When clicking 'Create Shipment' on an order, these values are parsed automatically to securely register packages."}
              </p>
            </div>

            {/* Carrier Selection Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setActiveCarrier("delhivery")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCarrier === "delhivery"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-950/70"
                }`}
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Delhivery API</p>
                <p className="text-[9px] text-slate-400 mt-1">
                  {isBng ? "স্ট্যাটাস: সক্রিয়" : "Status: Active"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveCarrier("xpressbees")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCarrier === "xpressbees"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-950/70"
                }`}
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Xpressbees API</p>
                <p className="text-[9px] text-slate-400 mt-1">
                  {isBng ? "স্ট্যাটাস: সক্রিয়" : "Status: Active"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveCarrier("ecom")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCarrier === "ecom"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-950/70"
                }`}
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Ecom Express API</p>
                <p className="text-[9px] text-slate-400 mt-1">
                  {isBng ? "স্ট্যাটাস: সক্রিয়" : "Status: Active"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveCarrier("custom")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCarrier === "custom"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-950/70"
                }`}
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Others / Custom API</p>
                <p className="text-[9px] text-slate-400 mt-1">
                  {isBng ? "স্ট্যাটাস: সক্রিয়" : "Status: Active"}
                </p>
              </button>
            </div>

            {/* Carrier Settings Forms */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-xs">
              {activeCarrier === "delhivery" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "ডেলিভারি এপিআই কি (DELHIVERY_API_KEY)" : "Delhivery API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type={showDelhiveryKey ? "text" : "password"}
                        name="delhiveryApiKey"
                        value={formData.delhiveryApiKey || ""}
                        onChange={handleChange}
                        placeholder="MOCK_SECURE_DELHIVERY_KEY_12345"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDelhiveryKey(!showDelhiveryKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showDelhiveryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      {isBng 
                        ? "নিরাপত্তা নিশ্চিত করতে কি-টি এনক্রিপ্ট করে ব্যাকএন্ড সার্ভারে সংরক্ষণ করা হয়।" 
                        : "Stored securely on the backend. Fallback is set to the environment variable."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "ডেলিভারি ট্র্যাকিং এন্ডপয়েন্ট" : "Delhivery Tracking Endpoint"}
                    </label>
                    <input
                      type="text"
                      name="delhiveryTrackingUrl"
                      value={formData.delhiveryTrackingUrl || ""}
                      onChange={handleChange}
                      placeholder="https://track.delhivery.com/api/v1/packages/json"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "ট্র্যাকিং আপডেট কল করার কুরিয়ার গেটওয়ে এন্ডপয়েন্ট।" : "The webhook/JSON tracker gateway endpoint."}
                    </p>
                  </div>
                </div>
              )}

              {activeCarrier === "xpressbees" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "এক্সপ্রেসবিস এপিআই কি (XPRESSBEES_API_KEY)" : "Xpressbees API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type={showXpressbeesKey ? "text" : "password"}
                        name="xpressbeesApiKey"
                        value={formData.xpressbeesApiKey || ""}
                        onChange={handleChange}
                        placeholder="MOCK_SECURE_XPRESSBEES_KEY_54321"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowXpressbeesKey(!showXpressbeesKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showXpressbeesKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      {isBng 
                        ? "এক্সপ্রেসবিস কুরিয়ার ইন্টিগ্রেশন এনক্রিপশন কি।" 
                        : "Xpressbees server encryption authorization credential key."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "এক্সপ্রেসবিস ট্র্যাকিং এন্ডপয়েন্ট (URL)" : "Xpressbees Endpoint URL"}
                    </label>
                    <input
                      type="text"
                      name="xpressbeesEndpointUrl"
                      value={formData.xpressbeesEndpointUrl || ""}
                      onChange={handleChange}
                      placeholder="https://api.xpressbees.com/v1/shipments"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "এক্সপ্রেসবিস ডিসপ্যাচ এন্ডপয়েন্ট গেটওয়ে।" : "Gateway dispatching and routing link url."}
                    </p>
                  </div>
                </div>
              )}

              {activeCarrier === "ecom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "ইকম এক্সপ্রেস এপিআই কি (ECOM_API_KEY)" : "Ecom Express API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type={showEcomKey ? "text" : "password"}
                        name="ecomExpressApiKey"
                        value={formData.ecomExpressApiKey || ""}
                        onChange={handleChange}
                        placeholder="MOCK_SECURE_ECOM_KEY_67890"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEcomKey(!showEcomKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showEcomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      {isBng 
                        ? "ইকম এক্সপ্রেস কুরিয়ার ইন্টিগ্রেশন এনক্রিপশন কি।" 
                        : "Ecom Express API client authorization credential key."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "ইকম এক্সপ্রেস মার্চেন্ট আইডি (Merchant ID)" : "Ecom Express Merchant ID"}
                    </label>
                    <input
                      type="text"
                      name="ecomExpressMerchantId"
                      value={formData.ecomExpressMerchantId || ""}
                      onChange={handleChange}
                      placeholder="https://api.ecomexpress.in/v1/register"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "ইকম এক্সপ্রেস এপিআই মার্চেন্ট রেজিস্ট্রেশন আইডি বা এন্ডপয়েন্ট।" : "Merchant account identifier / registration endpoint."}
                    </p>
                  </div>
                </div>
              )}

              {activeCarrier === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "কাস্টম কুরিয়ারের নাম" : "Custom Carrier Name"}
                    </label>
                    <input
                      type="text"
                      name="customCarrierName"
                      value={formData.customCarrierName || ""}
                      onChange={handleChange}
                      placeholder="e.g. Porter, Borzo, Local Express"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "কাস্টম কুরিয়ার পার্টনারের নাম।" : "Display name of your custom courier partner."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "কাস্টম বেস এপিআই ইউআরএল (API Endpoint)" : "Custom Base API URL / Endpoint"}
                    </label>
                    <input
                      type="text"
                      name="customBaseApiUrl"
                      value={formData.customBaseApiUrl || ""}
                      onChange={handleChange}
                      placeholder="https://api.customcarrier.com/v1/shipments"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "অর্ডার রিকোয়েস্ট পাঠানোর এন্ডপয়েন্ট ইউআরএল।" : "API request gateway dispatch routing link."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "কাস্টম এপিআই কি" : "Custom API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type={showCustomKey ? "text" : "password"}
                        name="customApiKey"
                        value={formData.customApiKey || ""}
                        onChange={handleChange}
                        placeholder="MOCK_SECURE_CUSTOM_KEY_99999"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomKey(!showCustomKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showCustomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "কাস্টম কুরিয়ারের অথরাইজেশন ক্রেডেনশিয়াল।" : "Secure bearer credential key for your custom integration."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">
                      {isBng ? "কাস্টম ট্র্যাকিং এন্ডপয়েন্ট ইউআরএল" : "Custom Tracking Endpoint URL"}
                    </label>
                    <input
                      type="text"
                      name="customTrackingEndpointUrl"
                      value={formData.customTrackingEndpointUrl || ""}
                      onChange={handleChange}
                      placeholder="https://api.customcarrier.com/v1/track"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400">
                      {isBng ? "কাস্টম কুরিয়ার ট্র্যাকিংয়ের এন্ডপয়েন্ট ইউআরএল।" : "Endpoint used to pull tracking status updates."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "orders" && (
          <div className="animate-fade-in">
            <AdminOrders lang={lang} />
          </div>
        )}

        {/* Form Submission Buttons */}
        {(activeSubTab !== "testimonials" && activeSubTab !== "orders") && (
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isBng ? "সমস্ত পরিবর্তন সেভ করুন" : "Save Configuration"}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
