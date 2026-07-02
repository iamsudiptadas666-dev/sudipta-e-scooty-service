import React, { useState, useEffect } from "react";
import {
  Wrench, Shield, Battery, Zap, Phone, Mail, MapPin, Facebook, MessageSquare,
  Plus, Trash, Edit, Search, FileText, Printer, TrendingUp, User, DollarSign,
  Calendar, AlertTriangle, X, ChevronRight, BookOpen, Sparkles, Calculator,
  Building, CheckCircle2, ClipboardList, Layers, Globe, Languages, LogOut, Lock, Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Language, translations } from "./translations";
import {
  Vehicle, Product, Customer, Booking, EmiRecord, Enquiry, Announcement, Expense, ReportData, DashboardStats
} from "./types";

// Import modular components
import DiagnosticAssistant from "./components/DiagnosticAssistant";
import EmiCalculator from "./components/EmiCalculator";
import BatteryEstimator from "./components/BatteryEstimator";
import InvoiceModal from "./components/InvoiceModal";
import ShowroomCard from "./components/ShowroomCard";
import PartsCard from "./components/PartsCard";

// Admin views
import AdminDashboard from "./components/AdminDashboard";
import AdminVehicles from "./components/AdminVehicles";
import AdminProducts from "./components/AdminProducts";
import AdminCustomers from "./components/AdminCustomers";
import AdminEMI from "./components/AdminEMI";
import AdminServices from "./components/AdminServices";
import AdminEnquiries from "./components/AdminEnquiries";
import AdminExpenses from "./components/AdminExpenses";
import AdminAnnouncements from "./components/AdminAnnouncements";
import AdminReports from "./components/AdminReports";

const readStoredArray = <T,>(key: string, fallback: T[]): T[] => {
  if (typeof window === "undefined") return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return fallback;

    const parsedValue = JSON.parse(storedValue) as T[];
    return Array.isArray(parsedValue) ? parsedValue : fallback;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return fallback;
  }
};

const persistStoredArray = <T,>(key: string, value: T[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to localStorage`, error);
  }
};

const fallbackVehicles: Vehicle[] = [
  {
    id: "v1",
    brand: "FLEETO",
    model: "Wolf Warrior Lite",
    descriptionEng: "A rugged and powerful electric scooter featuring dual front forks, aggressive styling, smooth acceleration with a Sine Wave Controller, and dual disc brakes.",
    descriptionBen: "ডুয়াল ফ্রন্ট ফর্ক, চমৎকার আগ্রাসী স্টাইলিং, সাইন ওয়েভ কন্ট্রোলারের সাথে মসৃণ ত্বরণ এবং ডুয়াল ডিস্ক ব্রেক সহ একটি শক্তিশালী বৈদ্যুতিক স্কুটার।",
    batteryTypeEng: "60V Lithium-Ion (24Ah / 34Ah) or Lead Acid (32Ah)",
    batteryTypeBen: "60V লিথিয়াম-আয়ন (24Ah / 34Ah) বা লেড অ্যাসিড (32Ah)",
    motorPower: "1.0kW Peak Power (Sine Wave)",
    range: "Up to 100 km",
    chargingTime: "5 Hours",
    topSpeed: "55 km/h",
    colorsEng: "Metallic Blue, Metallic Cherry Red, Metallic Sea Green",
    colorsBen: "মেটালিক ব্লু, মেটালিক চেরি রেড, মেটালিক সি গ্রিন",
    warrantyEng: "3 Years on Battery, 1 Year on Motor & Controller",
    warrantyBen: "ব্যাটারিতে ৩ বছর, মোটর ও কন্ট্রোলারে ১ বছরের ওয়ারেন্টি",
    price: 68000,
    offerPrice: 61000,
    emiPrice: 2100,
    stockStatus: "In Stock",
    stockQuantity: 5,
    images: ["আপনার_ImgBB_লিঙ্ক"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v2",
    brand: "FLEETO",
    model: "Panther",
    descriptionEng: "Smart and sporty electric scooter with 15L of boot space, smart parking switch, multiple speed modes, and flexible battery configurations.",
    descriptionBen: "১৫ লিটার বুট স্পেস, স্মার্ট পার্কিং সুইচ, একাধিক স্পিড মোড এবং নমনীয় ব্যাটারি কনফিগারেশন সহ স্মার্ট এবং স্পোর্টি বৈদ্যুতিক স্কুটার।",
    batteryTypeEng: "60 Volts",
    batteryTypeBen: "৬০ ভোল্ট",
    motorPower: "1500W BLDC Hub Motor",
    range: "Upto 80 Kms",
    chargingTime: "5 Hours",
    topSpeed: "60 kmph",
    colorsEng: "Metallic Blue, Blazing Red, Bullet Silver",
    colorsBen: "মেটালিক ব্লু, ব্লেজিং রেড, বুলেট সিলভার",
    warrantyEng: "3 Years on Battery, 1 Year on Motor & Controller",
    warrantyBen: "ব্যাটারিতে ৩ বছর, মোটর ও কন্ট্রোলারে ১ বছরের ওয়ারেন্টি",
    price: 98000,
    offerPrice: 92000,
    emiPrice: 3200,
    stockStatus: "In Stock",
    stockQuantity: 3,
    images: ["/src/assets/images/fleeto_panther_scooter_1782481064099.jpg"],
    videoUrl: ""
  }
];

const fallbackProducts: Product[] = [
  {
    id: "p1",
    titleEng: "Smart LFP Battery 60V 30Ah",
    titleBen: "স্মার্ট এলএফপি ব্যাটারি 60V 30Ah",
    category: "Battery",
    brand: "Sudipta Power",
    price: 36000,
    offerPrice: 32500,
    purchasePrice: 27000,
    stock: 8,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60"],
    descriptionEng: "Ultra durable 60V 30Ah Lithium Ferro Phosphate (LFP) battery in heavy-duty black metal casing with dual handles and smart BMS safety control.",
    descriptionBen: "স্মার্ট বিএমএস সুরক্ষা নিয়ন্ত্রণ, ডাবল মেটাল হ্যান্ডেল এবং মজবুত ধাতব কেসিং সহ অত্যন্ত টেকসই ৬০ভি ৩০এএইচ লিথিয়াম ফেরো ফসফেট (LFP) ব্যাটারি।"
  },
  {
    id: "p2",
    titleEng: "SMART EV CONTROLLER",
    titleBen: "স্মার্ট ইভি কন্ট্রোলার",
    category: "Controller",
    brand: "SUDIPTA POWER",
    price: 3500,
    offerPrice: 2999,
    purchasePrice: 1400,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60"],
    descriptionEng: "An EV smart controller is the \"brain\" of your electric vehicle. It converts the DC battery power into usable energy for the motor and manages throttle response, regenerative braking, and safety limits (like overcurrent and overheating protection).",
    descriptionBen: "একটি ইভি স্মার্ট কন্ট্রোলার হলো আপনার বৈদ্যুতিক গাড়ির 'মস্তিষ্ক'। এটি ডিসি ব্যাটারির শক্তিকে মোটরের জন্য ব্যবহারযোগ্য শক্তিতে রূপান্তরিত করে এবং থ্রটল রেসপন্স, রিজেনারেটিভ ব্রেকিং এবং সুরক্ষা সীমা (যেমন ওভারকারেন্ট এবং ওভারহিটিং প্রতিরোধ) পরিচালনা করে।"
  },
  {
    id: "p3",
    titleEng: "All-Weather Heavy Duty EV Tubeless Tyre (10x3.0)",
    titleBen: "অল-ওয়েদার হেভি ডিউটি ইভি টিউবলেস টায়ার (10x3.0)",
    category: "Tyres",
    brand: "Ceat EV Zoom",
    price: 2200,
    offerPrice: 1753,
    purchasePrice: 850,
    stock: 24,
    images: ["https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=60"],
    descriptionEng: "Specially formulated rubber for low rolling resistance and high load capacity in electric scooters.",
    descriptionBen: "ইলেকট্রিক স্কুটারে কম ঘূর্ণায়মান প্রতিরোধ এবং উচ্চ লোড ক্ষমতার জন্য বিশেষভাবে তৈরি টায়ার।"
  },
  {
    id: "p4",
    titleEng: "Super Fast Charger 60V 6A with Auto Cut-off",
    titleBen: "অটো কাট-অফ সহ সুপার ফাস্ট চার্জার 60V 6A",
    category: "Charger",
    brand: "Sudipta Power",
    price: 3200,
    offerPrice: 2800,
    purchasePrice: 1950,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop&q=60"],
    descriptionEng: "Fast charger with silent fan, voltage protection, and automatic cut-off technology.",
    descriptionBen: "সাইলেন্ট ফ্যান, ভোল্টেজ সুরক্ষা এবং স্বয়ংক্রিয় কাট-অফ প্রযুক্তি সহ দ্রুত চার্জার।"
  }
];

export default function App() {
  // Localization - Default Bengali as requested
  const [lang, setLang] = useState<Language>("bn");
  const t = translations[lang];

  // Auth States
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Active Admin Section
  const [activeTab, setActiveTab] = useState("dashboard");

  // Collections States
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => readStoredArray<Vehicle>("scooty_vehicles", fallbackVehicles));
  const [products, setProducts] = useState<Product[]>(() => readStoredArray<Product>("scooty_products", fallbackProducts));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [emiRecords, setEmiRecords] = useState<EmiRecord[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => readStoredArray<Enquiry>("customer_enquiries", []));
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingBookings: 0,
    activeEmiCount: 0,
    lowStockCount: 0,
    totalSales: 0,
    announcementsCount: 0
  });

  // UI Interactive States
  const [selectedScooter, setSelectedScooter] = useState<Vehicle | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState<"Test Ride" | "General Enquiry" | "Service Enquiry">("General Enquiry");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form Fields for Customer Booking
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMsg, setClientMsg] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Active Invoice states
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState<Booking | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Active calculator/tools widget tab
  const [activeCalcTab, setActiveCalcTab] = useState<"emi" | "battery">("emi");

  const persistVehicles = (nextVehicles: Vehicle[]) => {
    setVehicles(nextVehicles);
    persistStoredArray("scooty_vehicles", nextVehicles);
  };

  const persistProducts = (nextProducts: Product[]) => {
    setProducts(nextProducts);
    persistStoredArray("scooty_products", nextProducts);
  };

  const persistEnquiries = (nextEnquiries: Enquiry[]) => {
    setEnquiries(nextEnquiries);
    persistStoredArray("customer_enquiries", nextEnquiries);
  };

  // Load overall collections from API
  const fetchAllData = async () => {
    try {
      const [vRes, pRes, cRes, bRes, eRes, qRes, aRes, xRes, rRes, sRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/products"),
        fetch("/api/customers"),
        fetch("/api/bookings"),
        fetch("/api/emi"),
        fetch("/api/enquiries"),
        fetch("/api/announcements"),
        fetch("/api/expenses"),
        fetch("/api/reports"),
        fetch("/api/dashboard-stats")
      ]);

      const nextVehicles = vRes.ok ? await vRes.json() : null;
      if (Array.isArray(nextVehicles)) {
        persistVehicles(nextVehicles as Vehicle[]);
      }

      const nextProducts = pRes.ok ? await pRes.json() : null;
      if (Array.isArray(nextProducts)) {
        persistProducts(nextProducts as Product[]);
      }

      setCustomers(cRes.ok ? await cRes.json() : []);
      setBookings(bRes.ok ? await bRes.json() : []);
      setEmiRecords(eRes.ok ? await eRes.json() : []);

      const nextEnquiries = qRes.ok ? await qRes.json() : null;
      if (Array.isArray(nextEnquiries)) {
        persistEnquiries(nextEnquiries as Enquiry[]);
      }

      setAnnouncements(aRes.ok ? await aRes.json() : []);
      setExpenses(xRes.ok ? await xRes.json() : []);
      setReport(rRes.ok ? await rRes.json() : null);
      setStats(sRes.ok ? await sRes.json() : {
        totalVehicles: fallbackVehicles.length,
        totalProducts: fallbackProducts.length,
        totalCustomers: 0,
        pendingBookings: 0,
        activeEmiCount: 0,
        lowStockCount: 0,
        totalSales: 0,
        announcementsCount: 0
      });
    } catch (err) {
      console.error("Error syncing ERP data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Submit enquiry from customer website
  const handleClientBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    setSubmittingBooking(true);
    try {
      const enquiryPayload: Enquiry = {
        id: `enq-${Date.now()}`,
        name: clientName,
        phone: clientPhone,
        email: "",
        vehicleId: selectedScooter?.id || undefined,
        type: bookingType,
        message: clientMsg || `Interested in E-Scooty / battery. Requesting callback.`,
        status: "New",
        createdAt: new Date().toISOString()
      };

      persistEnquiries([enquiryPayload, ...enquiries]);
      setBookingSuccess(true);
      setClientName("");
      setClientPhone("");
      setClientMsg("");
      window.alert(lang === "bn" ? "আপনার enquiry/টেস্ট রাইড অনুরোধ স্থানীয়ভাবে সংরক্ষিত হয়েছে।" : "Your enquiry request has been saved locally.");
    } catch (error) {
      console.error(error);
      window.alert(lang === "bn" ? "অনুরোধ সংরক্ষণে সমস্যা হয়েছে।" : "There was a problem saving your request.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Secure Admin passcode login validation
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "4444") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError("");
      setPasscode("");
    } else {
      setLoginError(t.invalidPasscode);
    }
  };

  // Admin CMS endpoints proxy triggers
  const handleAddVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`
    } as Vehicle;

    setVehicles((prevVehicles) => {
      const nextVehicles = [newVehicle, ...prevVehicles];
      persistStoredArray("scooty_vehicles", nextVehicles);
      return nextVehicles;
    });

    try {
      await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData)
      });
    } catch (error) {
      console.error("Vehicle save fallback failed", error);
    }
  };

  const handleUpdateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles((prevVehicles) => {
      const nextVehicles = prevVehicles.map((vehicle) => vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle);
      persistStoredArray("scooty_vehicles", nextVehicles);
      return nextVehicles;
    });

    try {
      await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData)
      });
    } catch (error) {
      console.error("Vehicle update fallback failed", error);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই মডেলটি মুছে ফেলতে চান?" : "Are you sure you want to delete this vehicle model?")) {
      setVehicles((prevVehicles) => {
        const nextVehicles = prevVehicles.filter((vehicle) => vehicle.id !== id);
        persistStoredArray("scooty_vehicles", nextVehicles);
        return nextVehicles;
      });

      try {
        await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Vehicle delete fallback failed", error);
      }
    }
  };

  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`
    } as Product;

    setProducts((prevProducts) => {
      const nextProducts = [newProduct, ...prevProducts];
      persistStoredArray("scooty_products", nextProducts);
      return nextProducts;
    });

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch (error) {
      console.error("Product save fallback failed", error);
    }
  };

  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts((prevProducts) => {
      const nextProducts = prevProducts.map((product) => product.id === id ? { ...product, ...productData } : product);
      persistStoredArray("scooty_products", nextProducts);
      return nextProducts;
    });

    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch (error) {
      console.error("Product update fallback failed", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই খুচরা যন্ত্রাংশটি স্টক থেকে সরাতে চান?" : "Are you sure you want to remove this spare part?")) {
      setProducts((prevProducts) => {
        const nextProducts = prevProducts.filter((product) => product.id !== id);
        persistStoredArray("scooty_products", nextProducts);
        return nextProducts;
      });

      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Product delete fallback failed", error);
      }
    }
  };

  const handleAddCustomer = async (custData: Omit<Customer, "id">) => {
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(custData)
    });
    fetchAllData();
  };

  const handleAddBooking = async (bookingData: Omit<Booking, "id" | "createdAt" | "totalAmount">) => {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });
    fetchAllData();
  };

  const handleUpdateBooking = async (id: string, bookingData: Partial<Booking>) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });
    fetchAllData();
  };

  const handleAddEMI = async (emiData: Omit<EmiRecord, "id">) => {
    await fetch("/api/emi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emiData)
    });
    fetchAllData();
  };

  const handleRecordEMIPayment = async (emiId: string, amount: number, method: string) => {
    await fetch(`/api/emi/${emiId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method })
    });
    fetchAllData();
  };

  const handleAddExpense = async (expenseData: Omit<Expense, "id">) => {
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData)
    });
    fetchAllData();
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই খরচ রেকর্ডটি মুছে ফেলতে চান?" : "Are you sure you want to delete this expense entry?")) {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      fetchAllData();
    }
  };

  const handleAddAnnouncement = async (annData: Omit<Announcement, "id" | "date">) => {
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annData)
    });
    fetchAllData();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    fetchAllData();
  };

  const handleUpdateLeadStatus = async (id: string, status: Enquiry["status"]) => {
    await fetch(`/api/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
                {t.brandName}
              </h1>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mt-1 flex flex-wrap items-center gap-1.5 md:gap-2">
                <span>{t.ownerRole}: {t.ownerName}</span>
                <span className="text-emerald-300 hidden sm:inline">•</span>
                <a href="tel:+919064517009" className="hover:text-emerald-900 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-tight text-emerald-800">
                  <Phone className="w-2.5 h-2.5 fill-emerald-700 text-emerald-700" />
                  {t.phone}
                </a>
              </span>
            </div>
          </div>

          {/* Quick contact and toggle actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language switch */}
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            {/* Portal toggle */}
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.logoutButton}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>{lang === "bn" ? "এডমিন ইআরপি" : "ERP Access"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Controller */}
      <main className="flex-1">
        {!isAdmin ? (
          /* =========================================
             A. CUSTOMER-FACING PUBLIC WEBSITE
             ========================================= */
          <div className="space-y-16 pb-16 animate-fade-in">
            {/* Active Notices Banner if any announcements exist */}
            {announcements.length > 0 && (
              <div className="bg-amber-50 border-b border-amber-100 py-3 text-center text-xs text-amber-900 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
                  <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider animate-pulse">NOTICE</span>
                  <strong className="font-semibold">{lang === "bn" ? announcements[0].titleBen : announcements[0].titleEng}:</strong>
                  <span>{lang === "bn" ? announcements[0].contentBen : announcements[0].contentEng}</span>
                </div>
              </div>
            )}

            {/* Hero Section */}
            <section id="hero" className="relative bg-slate-900 text-white overflow-hidden py-20 md:py-28 px-4">
              <div className="absolute inset-0 z-0 opacity-25">
                <img
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200"
                  alt="Sudipta E-Scooter Workshop - Contact: +91 9064517009"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-0" />

              <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {lang === "bn" ? "পশ্চিমবঙ্গের অন্যতম বিশ্বস্ত ইভি সার্ভিস সেন্টার" : "Leading Multi-brand EV Hub in West Bengal"}
                </span>

                <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight max-w-4xl mx-auto">
                  {t.heroTitle}
                </h2>

                <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                  {t.heroSubtitle}
                </p>

                {/* Highly visible interactive contact info bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold font-mono tracking-wider text-emerald-400 bg-slate-950/70 backdrop-blur-sm border border-emerald-500/25 px-5 py-2.5 rounded-2xl w-fit mx-auto shadow-xl">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 fill-emerald-400 text-slate-950 animate-bounce" />
                    <span>{lang === "bn" ? "কল করুন:" : "CALL NOW:"}</span>
                    <a href="tel:+919064517009" className="hover:underline text-white transition-colors">
                      +91 9064517009
                    </a>
                  </span>
                  <span className="text-slate-800 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 fill-emerald-400 text-slate-950" />
                    <span>{lang === "bn" ? "হোয়াটসঅ্যাপ চ্যাট:" : "WHATSAPP:"}</span>
                    <a 
                      href="https://wa.me/919064517009" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-white transition-colors"
                    >
                      +91 9064517009
                    </a>
                  </span>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  <a
                    href="#showroom"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/20 cursor-pointer"
                  >
                    {t.heroCTA1}
                  </a>
                  <button
                    onClick={() => {
                      setSelectedScooter(null);
                      setBookingType("Service Enquiry");
                      setShowBookingModal(true);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-xl transition cursor-pointer"
                  >
                    {t.heroCTA2}
                  </button>
                  <a
                    href="tel:+919064517009"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-950/20 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white animate-pulse" />
                    <span>{lang === "bn" ? "মালিককে কল করুন (+91 9064517009)" : "Call Proprietor (+91 9064517009)"}</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Services Highlights Grid */}
            <section id="services" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-2 mb-12">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                  {t.servicesTitle}
                </h3>
                <p className="text-sm text-slate-500">{t.servicesSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Repair */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{lang === "bn" ? "ই-স্কুটার রিপেয়ারিং" : "Scooter Mechanical Repair"}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === "bn" ? "মোটর কন্ট্রোলার, ওয়ারিং স্ক্যানিং, চ্যাসিস সারিবদ্ধকরণ এবং যেকোনো জটিল মেকানিক্যাল সমস্যার দ্রুত সমাধান।" : "Diagnostic scanning, motor sensor swaps, heavy frame repair and multi-point wiring."}
                  </p>
                </div>

                {/* Battery diagnostics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                    <Battery className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{lang === "bn" ? "ব্যাটারি ডায়াগনস্টিকস" : "LFP Battery Reconditioning"}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === "bn" ? "অত্যাধুনিক লিথিয়াম ফসফেট (LFP) কোষ সমতাকরণ এবং ত্রুটিযুক্ত ব্যাটারি সেলের ক্ষমতা পুনঃস্থাপন।" : "Cell balancing, advanced BMS calibrations, internal resistance analysis, LFP replacement."}
                  </p>
                </div>

                {/* EMI battery */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{lang === "bn" ? "সহজ কিস্তিতে ব্যাটারি" : "Battery EMI Financing"}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === "bn" ? "আকর্ষণীয় অফার মূল্যে ০% সুদে ব্যাটারি কিনুন সহজ কিস্তিতে। মধ্যবিত্ত পরিবারের নির্ভরযোগ্য অংশীদার।" : "Certified brand batteries on modular instalment schemes with low downpayments."}
                  </p>
                </div>

                {/* Home pick pickup */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{lang === "bn" ? "হোম সার্ভিস ও টেকনিশিয়ান" : "Home Pickup & Repair"}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {lang === "bn" ? "অশোকনগর ও পার্শ্ববর্তী এলাকায় আপনার বাড়ি থেকে স্কুটার পিকআপ বা বাড়িতে টেকনিশিয়ান পাঠানোর নির্ভরযোগ্য সুবিধা।" : "On-demand mobile technician deployment. Quick home rescue and delivery services."}
                  </p>
                </div>
              </div>
            </section>

            {/* Showroom Vehicles Showcase */}
            <section id="showroom" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-2 mb-12">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                  {t.showroomTitle}
                </h3>
                <p className="text-sm text-slate-500">{t.showroomSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((v) => (
                  <ShowroomCard
                    key={v.id}
                    vehicle={v}
                    lang={lang}
                    t={t}
                    onEnquire={(scooter) => {
                      setSelectedScooter(scooter);
                      setBookingType("Test Ride");
                      setShowBookingModal(true);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Spare Parts Catalogue */}
            <section id="spare-parts" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-2 mb-12">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                  {t.partsStoreTitle}
                </h3>
                <p className="text-sm text-slate-500">{t.partsStoreSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <PartsCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    t={t}
                  />
                ))}
              </div>
            </section>

            {/* AI Diagnosis Assistant */}
            <section id="diagnosis" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-2 mb-10">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="w-7 h-7 text-emerald-600 animate-pulse" />
                  {lang === "bn" ? "স্মার্ট এআই ইভি রোগ নির্ণয়কারী" : "AI EV Diagnostic Console"}
                </h3>
                <p className="text-sm text-slate-500">
                  {lang === "bn" ? "আপনার ইলেকট্রিক যানের যেকোনো যান্ত্রিক ত্রুটি সমাধান জানাবে আমাদের এআই অ্যাসিস্ট্যান্ট।" : "Query live solutions regarding throttle grids, charger cutoffs, cell drainage or wiring shorts."}
                </p>
              </div>

              <DiagnosticAssistant lang={lang} t={t} />
            </section>

            {/* Interactive Calculators & Tools Widget Section */}
            <section id="emi-calculator-widget" className="max-w-4xl mx-auto px-4">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2">
                  <Calculator className="w-6 h-6 text-indigo-600" />
                  {lang === "bn" ? "স্মার্ট ইভি ক্যালকুলেটর ও টুলস" : "Smart EV Calculators & Tools"}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === "bn" 
                    ? "ডাউন পেমেন্ট, মাসিক কিস্তি এবং ব্যাটারি ক্ষমতা অনুযায়ী সম্ভাব্য আসল রেঞ্জ এক ক্লিকেই হিসাব করুন।" 
                    : "Calculate monthly installments and predict real-world mileage range based on custom environments."}
                </p>
              </div>

              {/* Dynamic Tabs Navigation */}
              <div className="flex justify-center border-b border-slate-200 mb-6 max-w-sm mx-auto p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveCalcTab("emi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    activeCalcTab === "emi"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {lang === "bn" ? "কিস্তি গণনা" : "EMI Calculator"}
                </button>
                <button
                  onClick={() => setActiveCalcTab("battery")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    activeCalcTab === "battery"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === "bn" ? "মাইলেজ গণনা" : "Battery Range"}
                </button>
              </div>

              {/* Active Component Tab */}
              <div className="transition-all duration-300">
                {activeCalcTab === "emi" ? (
                  <EmiCalculator lang={lang} t={t} defaultPrice={32000} />
                ) : (
                  <BatteryEstimator lang={lang} />
                )}
              </div>
            </section>

            {/* Customer Testimonial Reviews */}
            <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-2 mb-12">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                  {t.reviewsTitle}
                </h3>
                <p className="text-xs text-slate-500">{lang === "bn" ? "আমাদের অশোকনগরের গ্রাহকদের প্রকৃত অভিজ্ঞতা" : "Verified feedback from our community in North 24 Parganas"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {lang === "bn"
                      ? `"আমার ইলেকট্রিক স্কুটারটি হঠাৎ করে চলা বন্ধ হয়ে গেছিল। সুদীপ্ত বাবু স্ক্যানার দিয়ে রোগ ধরে মাত্র ১ ঘন্টায় মেরামত করে দিয়েছেন। খরচও অনেক কম লেগেছে!"`
                      : `"My electric scooter stopped running out of nowhere. Sudipta analyzed the scanner grids and got it running within an hour. Extremely fair repair prices!"`}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-100">
                      JS
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 block">জয়দেব শিকদার (Joydeb Shikdar)</strong>
                      <span className="text-[10px] text-slate-400">Ashoknagar Local</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {lang === "bn"
                      ? `"সুদীপ্ত বাবুর থেকে ব্যাটারি কিস্তিতে বা EMI তে নিয়ে আমার খুব উপকার হয়েছে। কোনো বাড়তি সুদ বা ঝামেলা ছাড়াই মাসে মাসে দিয়ে দিই। খুব ভালো সার্ভিস!"`
                      : `"Acquiring my scooter LFP battery on EMI from Sudipta saved me. No compound interest or hidden processing traps. Excellent customer-first ethics!"`}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-100">
                      RG
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 block">রিমি ঘোষ (Rimi Ghosh)</strong>
                      <span className="text-[10px] text-slate-400">Kalobari Resident</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {lang === "bn"
                      ? `"খুচরা যন্ত্রাংশের স্টক খুবই ভালো। আমার লিথিয়াম ব্যাটারির চার্জার খারাপ হয়ে গেছিল, অন্য কোথাও পাচ্ছিলাম না, সুদীপ্ত দার দোকানে সাথে সাথে অরিজিনাল চার্জার পেয়ে গেলাম।"`
                      : `"Impeccable spare parts catalogue. I was searching for an auto-cutoff lithium charger everywhere, found a certified original at Sudipta's store instantly."`}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold border border-amber-100">
                      SD
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 block">সুব্রত দাস (Subrata Das)</strong>
                      <span className="text-[10px] text-slate-400">EV Commuter</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sudipta Das Facebook Updates Stream & Video tutorials */}
            <section id="facebook-stream" className="max-w-4xl mx-auto px-4">
              <div className="bg-gradient-to-br from-indigo-50/70 to-emerald-50/40 border border-slate-200/60 p-6 md:p-8 rounded-3xl text-center space-y-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl w-fit mx-auto shadow-md">
                  <Facebook className="w-6 h-6 fill-white" />
                </div>
                <h4 className="text-lg md:text-xl font-display font-bold text-slate-800 tracking-tight">
                  {t.facebookUpdatesTitle}
                </h4>
                <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {t.facebookUpdatesDesc}
                </p>
                <div className="p-4 bg-white/80 rounded-xl border border-slate-100 text-xs text-slate-500 italic max-w-lg mx-auto">
                  {t.facebookUpdatesNote}
                </div>
                <a
                  href="https://www.facebook.com/share/1DPBfmxkNG/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Facebook className="w-4 h-4 fill-white" />
                  {t.followOnFacebook}
                </a>
              </div>
            </section>

            {/* Footer with business details and contact card */}
            <section id="contact" className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                    {t.contactTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{t.contactSubtitle}</p>
                </div>

                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">{t.addressLabel}</strong>
                      <p className="leading-relaxed">{t.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">WhatsApp / Call</strong>
                      <p className="font-mono text-sm font-semibold">{t.phone} ({t.ownerName})</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">Email</strong>
                      <p className="font-mono">{t.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <a
                    href="tel:+919064517009"
                    className="flex-1 min-w-36 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    {t.callNowButton}
                  </a>

                  <a
                    href="https://wa.me/919064517009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-36 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    {t.whatsappButton}
                  </a>
                </div>
              </div>

              {/* Simulated Google Maps Node block */}
              <div className="bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 flex flex-col justify-between p-8 md:p-10 text-white shadow-xl min-h-[350px]">
                <div className="absolute inset-0 opacity-15">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                    alt="Map styling"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10">
                  <a
                    href="https://maps.app.goo.gl/4qvAEgzE6h4c2U6U6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full w-fit mb-4 transition-all duration-250 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {lang === "bn" ? "লাইভ লোকেশন ম্যাপ" : "Service Center Coordinates"}
                  </a>
                  <h4 className="text-lg md:text-xl font-display font-bold tracking-tight">
                    Power House Road Workshop
                  </h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-sm">
                    {lang === "bn"
                      ? "অশোকনগর পাওয়ার হাউস রোড ধরে কালোবাড়ির দিকে বাঘাযতীন খেলার মাঠের একেবারে সংলগ্ন উত্তর পাশে আমাদের ওয়ার্কশপটি অবস্থিত।"
                      : "Located immediately adjacent to the Bhajajatin Playground, Ashoknagar, North 24 Parganas, West Bengal."}
                  </p>
                </div>

                <div className="relative z-10 p-4 bg-slate-850/90 backdrop-blur border border-slate-800 rounded-2xl flex items-center gap-3.5 mt-8 max-w-sm">
                  <div className="p-3.5 bg-emerald-600 rounded-xl text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="block font-bold text-white uppercase tracking-wider">Business Hours</span>
                    <span>10:00 AM - 08:30 PM (Thursdays Closed)</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* =========================================
             B. ADMIN ERP MANAGEMENT PANEL CONTROL CENTER
             ========================================= */
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-fade-in print:p-0">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar Tabs - Hidden in print */}
              <div className="w-full lg:w-64 flex flex-wrap lg:flex-col gap-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-md shrink-0 print:hidden">
                <span className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 mb-2">ERP Controller</span>

                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {t.secDashboard}
                </button>

                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "vehicles" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  {t.secVehicles.split(" ")[0]} Showroom
                </button>

                <button
                  onClick={() => setActiveTab("spare_parts")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "spare_parts" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Battery className="w-4 h-4" />
                  {t.secSpareParts.split(" ")[0]} Spares
                </button>

                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "customers" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t.secCustomers}
                </button>

                <button
                  onClick={() => setActiveTab("emi")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "emi" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  {t.secEMI.split(" ")[0]} EMIs
                </button>

                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "services" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  {t.secServices.split(" ")[0]} Job Cards
                </button>

                <button
                  onClick={() => setActiveTab("enquiries")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "enquiries" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Leads ({enquiries.filter(e => e.status === "New").length})
                </button>

                <button
                  onClick={() => setActiveTab("expenses")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "expenses" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {t.secExpenses}
                </button>

                <button
                  onClick={() => setActiveTab("announcements")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "announcements" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  {t.secAnnouncements.split(" ")[0]} Notices
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className={`flex-1 lg:flex-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    activeTab === "reports" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {t.secReports.split(" ")[0]} Financials
                </button>
              </div>

              {/* ERP Tab Content panel */}
              <div className="flex-1 bg-transparent w-full min-w-0">
                {activeTab === "dashboard" && (
                  <AdminDashboard
                    stats={stats}
                    products={products}
                    vehicles={vehicles}
                    enquiries={enquiries}
                    onNavigate={(tab) => setActiveTab(tab)}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "vehicles" && (
                  <AdminVehicles
                    vehicles={vehicles}
                    onAdd={handleAddVehicle}
                    onUpdate={handleUpdateVehicle}
                    onDelete={handleDeleteVehicle}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "spare_parts" && (
                  <AdminProducts
                    products={products}
                    onAdd={handleAddProduct}
                    onUpdate={handleUpdateProduct}
                    onDelete={handleDeleteProduct}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "customers" && (
                  <AdminCustomers
                    customers={customers}
                    onAdd={handleAddCustomer}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "emi" && (
                  <AdminEMI
                    emiRecords={emiRecords}
                    customers={customers}
                    onAddEMI={handleAddEMI}
                    onRecordPayment={handleRecordEMIPayment}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "services" && (
                  <AdminServices
                    bookings={bookings}
                    products={products}
                    customers={customers}
                    onAddBooking={handleAddBooking}
                    onUpdateBooking={handleUpdateBooking}
                    onLaunchInvoice={(b) => {
                      setActiveInvoiceBooking(b);
                      setShowInvoiceModal(true);
                    }}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "enquiries" && (
                  <AdminEnquiries
                    enquiries={enquiries}
                    onUpdateStatus={handleUpdateLeadStatus}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "expenses" && (
                  <AdminExpenses
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "announcements" && (
                  <AdminAnnouncements
                    announcements={announcements}
                    onAdd={handleAddAnnouncement}
                    onDelete={handleDeleteAnnouncement}
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "reports" && (
                  <AdminReports
                    report={report}
                    lang={lang}
                    t={t}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer Copyright Info */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900 print:hidden text-center text-xs space-y-2 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {t.brandName}. {t.footerRights}</p>
          <p className="text-slate-600">{t.footerDeveloper}</p>
        </div>
      </footer>

      {/* =========================================
         POPUPS / MODAL OVERLAYS
         ========================================= */}

      {/* A. Online Booking / Enquiry Popup */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 space-y-4 animate-fade-in">
            <button
              onClick={() => { setShowBookingModal(false); setBookingSuccess(false); setSelectedScooter(null); }}
              className="text-slate-400 hover:text-slate-600 transition absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleClientBookingSubmit} className="space-y-4">
                <div>
                  <h4 className="text-lg font-display font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    {t.bookingFormTitle}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "bn"
                      ? "নিচের তথ্যগুলি দিন, সুদীপ্ত বাবু আপনার সাথে মোবাইল নম্বরে যোগাযোগ করবেন।"
                      : "Please submit your details. Sudipta Das will contact you on your phone shortly."}
                  </p>
                </div>

                {selectedScooter && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-emerald-800" />
                    <span>Selected: <strong>{selectedScooter.brand} {selectedScooter.model}</strong></span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.phoneNumber}</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter your phone number"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.selectType}</label>
                  <select
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as any)}
                  >
                    <option value="Test Ride">{t.testRide}</option>
                    <option value="General Enquiry">{t.generalEnquiry}</option>
                    <option value="Service Enquiry">{t.serviceEnquiry}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.message}</label>
                  <textarea
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs h-20"
                    placeholder="Enter your message or description"
                    value={clientMsg}
                    onChange={(e) => setClientMsg(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer text-center"
                >
                  {submittingBooking ? t.submittingButton : t.submitButton}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Registration Complete!</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  {t.successMessage}
                </p>
                <button
                  onClick={() => { setShowBookingModal(false); setBookingSuccess(false); setSelectedScooter(null); }}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {t.closeButton}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. Admin Login Popup */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdminAuth} className="bg-white rounded-2xl max-w-sm w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 space-y-4 animate-fade-in">
            <button
              type="button"
              onClick={() => { setShowLoginModal(false); setLoginError(""); setPasscode(""); }}
              className="text-slate-400 hover:text-slate-600 transition absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="text-lg font-display font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Lock className="w-5 h-5 text-indigo-600" />
                {t.adminLoginTitle}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "bn"
                  ? "সুদীপ্ত বাবুর ব্যক্তিগত ইআরপি কন্ট্রোল প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে নিরাপত্তা পাসকোড দিন।"
                  : "Authenticate securely with Sudipta's private workshop passcode to manage database."}
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.passcodeLabel}</label>
              <input
                type="password"
                required
                placeholder="Enter Passcode"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {t.loginButton}
            </button>
          </form>
        </div>
      )}

      {/* C. Printable Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => { setShowInvoiceModal(false); setActiveInvoiceBooking(null); }}
        lang={lang}
        t={t}
        booking={activeInvoiceBooking}
      />
    </div>
  );
}
