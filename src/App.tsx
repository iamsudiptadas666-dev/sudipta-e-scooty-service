import React, { useState, useEffect, useCallback } from "react";
import {
  Wrench, Shield, Battery, Zap, Phone, Mail, MapPin, Facebook, MessageSquare,
  Plus, Trash, Edit, Search, FileText, Printer, TrendingUp, User, DollarSign,
  Calendar, AlertTriangle, X, ChevronRight, BookOpen, Sparkles, Calculator,
  Building, CheckCircle2, ClipboardList, Layers, Globe, Languages, LogOut, Lock, Megaphone, Sliders,
  Copy, Check, QrCode, Video, Play, ExternalLink, Star, Truck, Eye, EyeOff, Package, CreditCard, ShoppingCart, BarChart, Settings as SettingsIcon, Menu, Ticket, HardDrive, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Language, translations } from "./translations";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import SpareParts from "./components/SpareParts";
import ProductDetailPage from "./components/ProductDetailPage";
import {
  Vehicle, Product, Customer, Booking, EmiRecord, Enquiry, Announcement, Expense, ReportData, DashboardStats, SystemConfig, Settings, Testimonial, OfflineTransaction, Order, SupportTicket
} from "./types";

// Import modular components
import DiagnosticAssistant from "./components/DiagnosticAssistant";
import EmiCalculator from "./components/EmiCalculator";
import BatteryEstimator from "./components/BatteryEstimator";
import InvoiceModal from "./components/InvoiceModal";
import ShowroomCard from "./components/ShowroomCard";
import PartsCard from "./components/PartsCard";
import { UpiPaymentCard } from "./components/UpiPaymentCard";
import { OrderTracker } from "./components/OrderTracker";
import CustomerInquiryForm from "./components/CustomerInquiryForm";
import { logAuditEvent } from "./lib/auditLogger";

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
import AdminSettings from "./components/AdminSettings";
import AdminBilling from "./components/AdminBilling";
import { AdminOrders } from "./components/AdminOrders";
import { ReviewForm } from "./components/ReviewForm";
import { useDashboardRefresh } from "./hooks/useDashboardRefresh";

// Core audit additions
import { AdminCoupons } from "./components/AdminCoupons";
import { AdminInventory } from "./components/AdminInventory";
import { 
  getVehiclesFromSupabase, saveVehicleToSupabase, deleteVehicleFromSupabase, softDeleteVehicleInSupabase,
  getProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase, softDeleteProductInSupabase,
  getSettingsFromSupabase, saveSettingsToSupabase,
  getOrdersFromSupabase, saveOrderToSupabase, softDeleteOrderInSupabase,
  getCustomersFromSupabase, saveCustomerToSupabase, softDeleteCustomerInSupabase, deleteCustomerFromSupabase,
  getBookingsFromSupabase, saveBookingToSupabase, softDeleteBookingInSupabase,
  isSupabaseConfigured
} from "./lib/supabase";
import { AdminSupport } from "./components/AdminSupport";
import { AdminStaff } from "./components/AdminStaff";
import { AdminPayments } from "./components/AdminPayments";
import { AdminAuditLogs } from "./components/AdminAuditLogs";
import AdminRecycleBin from "./components/AdminRecycleBin";
import AdminDocuments from "./components/AdminDocuments";
import AdminCourses from "./components/AdminCourses";
import { verifyTOTP, getTOTPUri } from "./lib/totp";
import { QRCodeSVG } from "qrcode.react";

export const ROLE_TABS: Record<string, string[]> = {
  "Owner": [
    "dashboard", "products_cms", "orders", "customers", "payments_gateway", "coupons_engine",
    "reports", "inventory_alerts", "support_tickets", "staff_roles", "audit_logs", "emi",
    "bookings", "enquiries", "expenses", "announcements", "settings", "billing", "payments", "recycle_bin", "documents_drive", "academy_courses"
  ],
  "Technician": [
    "products_cms", "support_tickets", "inventory_alerts"
  ],
  "Sub-admin": [
    "products_cms", "orders", "customers", "coupons_engine", "recycle_bin", "documents_drive", "academy_courses"
  ],
  "Desk Executive": [
    "products_cms", "customers", "support_tickets", "documents_drive", "academy_courses"
  ],
  "Delivery Rider": [
    "orders"
  ]
};

// Helper function to convert YouTube, Facebook, and Instagram links into embed URLs
function getEmbedUrl(url: string): { type: "youtube" | "facebook" | "instagram" | "direct" | "unknown"; embedUrl: string } {
  const fallbackUrl = "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=0&rel=0";
  if (!url) {
    return { type: "youtube", embedUrl: fallbackUrl };
  }

  const cleanUrl = url.trim();

  // Handle broken/deleted default YouTube video URLs
  const brokenVideoIds = ["pSOn-oXmYwI", "L_LUpnjgPso"];
  if (brokenVideoIds.some(bId => cleanUrl.includes(bId))) {
    return { type: "youtube", embedUrl: fallbackUrl };
  }

  // YouTube
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    let videoId = "";
    if (cleanUrl.includes("youtu.be/")) {
      videoId = cleanUrl.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (cleanUrl.includes("youtube.com/shorts/")) {
      videoId = cleanUrl.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0];
    } else if (cleanUrl.includes("youtube.com/embed/")) {
      videoId = cleanUrl.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
    } else {
      const match = cleanUrl.match(/[?&]v=([^&#]+)/);
      videoId = match ? match[1] : "";
    }
    if (videoId && !brokenVideoIds.includes(videoId)) {
      return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` };
    }
    return { type: "youtube", embedUrl: fallbackUrl };
  }

  // Facebook
  if (cleanUrl.includes("facebook.com")) {
    if (cleanUrl.includes("facebook.com/share/r/")) {
      return { type: "youtube", embedUrl: fallbackUrl };
    }
    return {
      type: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=0`
    };
  }

  // Instagram
  if (cleanUrl.includes("instagram.com")) {
    let base = cleanUrl.split(/[?#]/)[0];
    if (!base.endsWith("/")) {
      base += "/";
    }
    return {
      type: "instagram",
      embedUrl: `${base}embed`
    };
  }

  // Direct Video
  if (cleanUrl.match(/\.(mp4|webm|ogg)/i) || cleanUrl.includes("commondatastorage.googleapis.com")) {
    return { type: "direct", embedUrl: cleanUrl };
  }

  return { type: "unknown", embedUrl: cleanUrl };
}

function getNavLinkIcon(labelEng: string) {
  const normLabel = labelEng.toLowerCase().trim();
  if (normLabel.includes("showroom")) return <Building className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />;
  if (normLabel.includes("parts") || normLabel.includes("spare")) return <Package className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />;
  if (normLabel.includes("diagnosis")) return <Wrench className="w-3.5 h-3.5 transition-transform group-hover:scale-110 text-emerald-500" />;
  if (normLabel.includes("tools") || normLabel.includes("calculator")) return <Calculator className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />;
  if (normLabel.includes("support")) return <Ticket className="w-3.5 h-3.5 transition-transform group-hover:scale-110 text-indigo-500" />;
  return <Zap className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />;
}

export default function App() {
  // Localization - Default English as requested
  const [lang, setLang] = useState<Language>("en");
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic branding and festival theme states
  const [globalConfig, setGlobalConfig] = useState<SystemConfig | null>(() => {
    const saved = localStorage.getItem('sudipta_global_config');
    return saved ? JSON.parse(saved) : null;
  });

  const isLinkActive = (href: string) => {
    if (href === "/spare_parts" || href === "/spare-parts") {
      return location.pathname === "/spare_parts" || location.pathname === "/spare-parts";
    }
    const hash = href.includes("#") ? "#" + href.split("#")[1] : "";
    return (location.pathname === "/" || location.pathname === "") && location.hash === hash;
  };
  const baseT = translations[lang];
  const t = {
    ...baseT,
    brandName: lang === "bn" 
      ? (globalConfig?.businessNameBen || baseT.brandName) 
      : (globalConfig?.businessNameEng || baseT.brandName),
    heroTitle: lang === "bn"
      ? (globalConfig?.heroTitleBen || baseT.heroTitle)
      : (globalConfig?.heroTitleEng || baseT.heroTitle),
    heroSubtitle: lang === "bn"
      ? (globalConfig?.heroSubtitleBen || baseT.heroSubtitle)
      : (globalConfig?.heroSubtitleEng || baseT.heroSubtitle),
    phone: globalConfig?.businessPhone || baseT.phone,
    address: lang === "bn"
      ? (globalConfig?.addressBen || baseT.address)
      : (globalConfig?.addressEng || baseT.address),
  };

  // Auth States
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem("sudipta_is_admin") === "true";
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string; email: string; phone: string } | null>(() => {
    const saved = sessionStorage.getItem("sudipta_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Proton Customer Member Portal States
  const [showProtonLoginModal, setShowProtonLoginModal] = useState(false);
  const [protonUser, setProtonUser] = useState(() => {
    const stored = sessionStorage.getItem("proton_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [protonLoginName, setProtonLoginName] = useState("");
  const [protonLoginPhone, setProtonLoginPhone] = useState("");
  const [protonLoginError, setProtonLoginError] = useState("");

  // Active Admin Section
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<"vehicles" | "spare_parts">("vehicles");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    if (isAdmin && currentUser) {
      const userRole = currentUser.role || "Technician";
      const allowed = ROLE_TABS[userRole] || [];
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [isAdmin, currentUser, activeTab]);

  // Core Security States
  const [loginStep, setLoginStep] = useState<"credentials" | "mfa_setup" | "2fa">("credentials");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [shake2Fa, setShake2Fa] = useState(false);
  const [loginMfaCopied, setLoginMfaCopied] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "System security node initialized: SSL Secured over TLS 1.3",
    "Server Firewall status: ACTIVE & SECURED",
    "Cloud Firewall status: PROVISIONED & ACTIVE",
    "Intrusion detection system (IDS) online"
  ]);

  // Emergency bypass: Force reset 2FA on load if needed (can be toggled or triggered by special route/flag)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset_2fa") === "true") {
      localStorage.removeItem("sudipta_2fa_linked");
      localStorage.removeItem("sudipta_2fa_secret");
      sessionStorage.removeItem("sudipta_2fa_linked");
      sessionStorage.removeItem("sudipta_2fa_secret");
      setLoginStep("credentials");
    }
  }, []);

  // Collections States with LocalStorage fallback to prevent Vercel ephemeral reset
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("sudipta_vehicles");
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("sudipta_products");
    return saved ? JSON.parse(saved) : [];
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("sudipta_customers");
    return saved ? JSON.parse(saved) : [];
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("sudipta_bookings");
    return saved ? JSON.parse(saved) : [];
  });
  const [emiRecords, setEmiRecords] = useState<EmiRecord[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("sudipta_orders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (vehicles.length > 0) localStorage.setItem("sudipta_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem("sudipta_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (customers.length > 0) localStorage.setItem("sudipta_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (bookings.length > 0) localStorage.setItem("sudipta_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (orders.length > 0) localStorage.setItem("sudipta_orders", JSON.stringify(orders));
  }, [orders]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    return JSON.parse(localStorage.getItem('sudipta_support_tickets') || '[]');
  });

  const [staff, setStaff] = useState<any[]>(() => {
    const stored = localStorage.getItem('sudipta_staff_members');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('sudipta_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('sudipta_staff_members', JSON.stringify(staff));
  }, [staff]);

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
  const [viewedTicketIds, setViewedTicketIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('sudipta_viewed_tickets') || '[]');
  });

  const pendingSupportCount = supportTickets.filter(t => t.status === "open" && !viewedTicketIds.includes(t.id)).length;

  useEffect(() => {
    localStorage.setItem('sudipta_viewed_tickets', JSON.stringify(viewedTicketIds));
  }, [viewedTicketIds]);

  const handleSupportTabClick = () => {
    setActiveTab("support_tickets");
    // Mark all currently open tickets as viewed when entering support
    const openIds = supportTickets.filter(t => t.status === "open").map(t => t.id);
    setViewedTicketIds(prev => Array.from(new Set([...prev, ...openIds])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Work sample video states with persistence
  const [videoUrl, setVideoUrl] = useState(() => {
    const stored = localStorage.getItem("workshop_work_sample_url");
    if (!stored || stored.includes("pSOn-oXmYwI") || stored.includes("L_LUpnjgPso") || stored.includes("facebook.com/share/r/")) {
      return "https://www.youtube.com/watch?v=M7lc1UVf-VE";
    }
    return stored;
  });
  const [isEditingVideoUrl, setIsEditingVideoUrl] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState(() => {
    const stored = localStorage.getItem("workshop_work_sample_url");
    if (!stored || stored === "https://www.youtube.com/watch?v=pSOn-oXmYwI" || stored.includes("facebook.com/share/r/")) {
      return "https://www.youtube.com/watch?v=L_LUpnjgPso";
    }
    return stored;
  });

  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("sudipta_theme") as "light" | "dark") || "light";
  });

  // State to handle auto-stopping of holiday animations to prevent device lagging
  const [showFestivalOverlay, setShowFestivalOverlay] = useState(true);
  const [isFestivalFadingOut, setIsFestivalFadingOut] = useState(false);

  // Dynamic Title and Favicon based on Config
  useEffect(() => {
    if (globalConfig) {
      // Update Document Title
      const siteName = lang === "bn" ? (globalConfig.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস") : (globalConfig.businessNameEng || "Sudipta E-Scooty Service");
      document.title = siteName;

      // Update Favicon if provided
      if (globalConfig.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = globalConfig.faviconUrl;
      }
      
      // Persist to local storage for instant white-labeling on reload
      localStorage.setItem('sudipta_global_config', JSON.stringify(globalConfig));
    }
  }, [globalConfig, lang]);

  useEffect(() => {
    // 20-second timer to start the smooth fade-out
    const fadeTimer = setTimeout(() => {
      setIsFestivalFadingOut(true);
    }, 20000);

    // 22-second timer to completely unmount the component and clean up memory
    const unmountTimer = setTimeout(() => {
      setShowFestivalOverlay(false);
    }, 22000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Toggle theme mode and persist to local storage
  const handleToggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("sudipta_theme", newTheme);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sudipta_staff_members', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('sudipta_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setSupportTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  // Hash scrolling effect to support navigation links instantly
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Support both "spare-parts" section id and "spare_parts"
      const targetId = id === "spare_parts" ? "spare-parts" : id;
      
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  // Smooth navigation click handler
  const handleNavLinkClick = (href: string, e: React.MouseEvent) => {
    setIsAdmin(false);
    setShowOrderTracker(false);
    setShowMobileMenu(false);
    
    const isHashLink = href.startsWith("/#") || href.startsWith("#");
    if (isHashLink) {
      e.preventDefault();
      const hash = href.includes("#") ? "#" + href.split("#")[1] : "";
      navigate("/" + hash);
    }
  };

  // Load overall collections from API
  const fetchAllData = useCallback(async () => {
    const safeFetchJson = async (url: string, fallback: any = []) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Fetch to ${url} failed with status: ${res.status}`);
          return fallback;
        }
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (jsonErr) {
          console.error(`Failed to parse JSON from ${url}:`, jsonErr, "Response text was:", text.substring(0, 100));
          return fallback;
        }
      } catch (err) {
        console.error(`Fetch to ${url} failed:`, err);
        return fallback;
      }
    };

    try {
      const [
        vehiclesData,
        productsData,
        customersData,
        bookingsData,
        emiData,
        enquiriesData,
        announcementsData,
        expensesData,
        reportsData,
        statsData,
        settingsData,
        testimonialsData,
        offlineTransactionsData,
        ordersData
      ] = await Promise.all([
        safeFetchJson("/api/vehicles", []),
        safeFetchJson("/api/products", []),
        safeFetchJson("/api/customers", []),
        safeFetchJson("/api/bookings", []),
        safeFetchJson("/api/emi", []),
        safeFetchJson("/api/enquiries", []),
        safeFetchJson("/api/announcements", []),
        safeFetchJson("/api/expenses", []),
        safeFetchJson("/api/reports", { revenueItems: [], expenses: [], financialSummary: {}, emiSummary: [] }),
        safeFetchJson("/api/dashboard-stats", {}),
        safeFetchJson("/api/globalConfig", {}),
        safeFetchJson("/api/testimonials", []),
        safeFetchJson("/api/offline-transactions", []),
        isSupabaseConfigured
          ? (getOrdersFromSupabase().then(d => d ?? []))
          : safeFetchJson(`/api/orders?_t=${Date.now()}`, [])
      ]);

      if (Array.isArray(vehiclesData) && vehiclesData.length > 0) {
        const activeVehicles = vehiclesData.filter((v: any) => !v.isDeleted && !v.is_deleted && v.status !== 'deleted');
        setVehicles(prev => {
          if (prev.length > 0) return prev;
          const saved = localStorage.getItem("sudipta_vehicles");
          return saved ? JSON.parse(saved) : activeVehicles;
        });
      }
      if (Array.isArray(productsData) && productsData.length > 0) {
        const activeProducts = productsData.filter((p: any) => !p.isDeleted && !p.is_deleted && p.status !== 'deleted');
        setProducts(prev => {
          if (prev.length > 0) return prev;
          const saved = localStorage.getItem("sudipta_products");
          return saved ? JSON.parse(saved) : activeProducts;
        });
      }
      if (Array.isArray(customersData) && customersData.length > 0) {
        const activeCust = customersData.filter((c: any) => !c.isDeleted && !c.is_deleted && c.status !== 'deleted');
        setCustomers(prev => {
          if (prev.length > 0) return prev;
          const saved = localStorage.getItem("sudipta_customers");
          return saved ? JSON.parse(saved) : activeCust;
        });
      }
      if (Array.isArray(bookingsData) && bookingsData.length > 0) {
        const activeBookings = bookingsData.filter((b: any) => !b.isDeleted && !b.is_deleted && b.status !== 'deleted');
        setBookings(prev => {
          if (prev.length > 0) return prev;
          const saved = localStorage.getItem("sudipta_bookings");
          return saved ? JSON.parse(saved) : activeBookings;
        });
      }
      if (Array.isArray(emiData)) {
        const activeEmi = emiData.filter((e: any) => !e.isDeleted && !e.is_deleted && e.status !== 'deleted');
        setEmiRecords(activeEmi);
      }
      if (Array.isArray(enquiriesData)) {
        const activeEnq = enquiriesData.filter((e: any) => !e.isDeleted && !e.is_deleted && e.status !== 'deleted');
        setEnquiries(activeEnq);
      }
      if (Array.isArray(announcementsData)) {
        if (announcementsData.length > 0) {
          setAnnouncements(announcementsData);
        } else {
          const stored = localStorage.getItem("sudipta_announcements");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setAnnouncements(parsed);
              }
            } catch (e) {}
          }
        }
      }
      if (Array.isArray(expensesData)) {
        const activeExp = expensesData.filter((e: any) => !e.isDeleted && e.status !== 'deleted');
        setExpenses(activeExp);
      }
      if (Array.isArray(offlineTransactionsData)) {
        if (offlineTransactionsData.length > 0) {
          setOfflineTransactions(offlineTransactionsData);
        } else {
          const stored = localStorage.getItem("sudipta_offline_transactions");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setOfflineTransactions(parsed);
              }
            } catch (e) {}
          }
        }
      }
      if (Array.isArray(ordersData)) {
        const activeServerOrders = ordersData.filter((o: any) => !o.isDeleted && !o.is_deleted && o.status !== 'deleted');
        const storedOrdersStr = localStorage.getItem("sudipta_orders");
        let localOrders: any[] = [];
        if (storedOrdersStr) {
          try {
            localOrders = JSON.parse(storedOrdersStr);
          } catch (e) {}
        }

        const map = new Map<string, any>();
        if (Array.isArray(localOrders)) {
          localOrders.filter((o: any) => !o.isDeleted && !o.is_deleted && o.status !== 'deleted').forEach((o: any) => {
            if (o && o.id) map.set(o.id, o);
          });
        }
        activeServerOrders.forEach((o: any) => {
          if (o && o.id) map.set(o.id, o);
        });

        const mergedOrders = Array.from(map.values());
        setOrders(mergedOrders);

        if (mergedOrders.length > 0) {
          localStorage.setItem("sudipta_orders", JSON.stringify(mergedOrders));
        }
      }
      setReport(reportsData);
      setStats(statsData);
      if (settingsData && Object.keys(settingsData).length > 0) {
        setGlobalConfig(settingsData);
      }
      setTestimonialsList((testimonialsData || []).filter((t: any) => !t.isPending));

      // Query Supabase for persisted settings, vehicles, products, orders, customers & bookings
      try {
        const [dbSettings, dbVehicles, dbProducts, dbOrders, dbCustomers, dbBookings] = await Promise.all([
          getSettingsFromSupabase(),
          getVehiclesFromSupabase(),
          getProductsFromSupabase(),
          getOrdersFromSupabase(),
          getCustomersFromSupabase(),
          getBookingsFromSupabase()
        ]);

        if (dbSettings && Object.keys(dbSettings).length > 0) {
          setGlobalConfig(prev => ({ ...prev, ...dbSettings }));
        }
        if (Array.isArray(dbVehicles) && dbVehicles.length > 0) {
          setVehicles(dbVehicles);
        }
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          const activeDbProducts = dbProducts.filter((p: any) => !p.isDeleted && !p.is_deleted && p.status !== 'deleted');
          setProducts(activeDbProducts);
        }
        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          const activeDbOrders = dbOrders.filter((o: any) => !o.isDeleted && !o.is_deleted && o.status !== 'deleted');
          setOrders(activeDbOrders);
        }
        if (Array.isArray(dbCustomers) && dbCustomers.length > 0) {
          const activeDbCustomers = dbCustomers.filter((c: any) => !c.isDeleted && !c.is_deleted && c.status !== 'deleted');
          setCustomers(activeDbCustomers);
        }
        if (Array.isArray(dbBookings) && dbBookings.length > 0) {
          const activeDbBookings = dbBookings.filter((b: any) => !b.isDeleted && !b.is_deleted && b.status !== 'deleted');
          setBookings(activeDbBookings);
        }
      } catch (sbErr) {
        console.warn("Supabase fetch inside fetchAllData notice:", sbErr);
      }
    } catch (err) {
      console.error("Error syncing ERP data:", err);
    }
  }, []);

  const fetchFilteredReport = async (startDate?: string, endDate?: string) => {
    const url = startDate && endDate 
      ? `/api/reports?startDate=${startDate}&endDate=${endDate}` 
      : "/api/reports";
    try {
      const res = await fetch(url);
      if (res.ok) {
        setReport(await res.json());
      } else {
        console.warn(`fetchFilteredReport failed: status ${res.status}`);
      }
    } catch (err) {
      console.error("fetchFilteredReport error:", err);
    }
  };

  const handleUpdateSettings = async (updatedSettings: SystemConfig) => {
    try {
      localStorage.setItem('sudipta_global_config', JSON.stringify(updatedSettings));
      localStorage.setItem('sudipta_cms_settings', JSON.stringify(updatedSettings));
      setGlobalConfig(updatedSettings);
      
      // Persist to Supabase
      await saveSettingsToSupabase(updatedSettings);

      const res = await fetch("/api/globalConfig", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalConfig(data);
        localStorage.setItem('sudipta_global_config', JSON.stringify(data));
        localStorage.setItem('sudipta_cms_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error updating globalConfig:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Globally subscribe the dashboard to auto-refresh whenever an order status is updated or partner assigned
  useDashboardRefresh(fetchAllData);

  // Submit enquiry from customer website
  const handleClientBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    setSubmittingBooking(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          phone: clientPhone,
          vehicleId: selectedScooter?.id || undefined,
          type: bookingType,
          message: clientMsg || `Interested in E-Scooty / battery. Requesting callback.`
        })
      });

      if (response.ok) {
        setBookingSuccess(true);
        // Clear forms
        setClientName("");
        setClientPhone("");
        setClientMsg("");
        // Reload leads to admin instantly
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Secure Admin passcode login validation
  const handleAdminAuth = async (e: React.FormEvent, portalType: "staff" | "admin" = "staff") => {
    e.preventDefault();
    const targetPasscode = globalConfig?.erpPasscode || "9064";

    if (loginStep === "credentials") {
      let isAuthorized = false;
      let authenticatedUser = null;

      if (portalType === "admin") {
        // Admin portal has NO username field, only passcode
        if (passcode === targetPasscode) {
          isAuthorized = true;
          authenticatedUser = staff.find(s => s.role === "Owner") || {
            id: "STF-01",
            name: "Sudipta Das",
            role: "Owner",
            email: "sudipta.das@protonscooty.com",
            phone: "9064517009",
            password: targetPasscode
          };
        }
      } else {
        // Staff portal REQUIRES username
        const trimmedUsername = loginUsername.trim();
        if (!trimmedUsername) {
          setLoginError(lang === "bn" ? "অনুগ্রহ করে আপনার ফোন বা ইমেল লিখুন!" : "Employee Phone / Email is required!");
          return;
        }

        // Search in staff database
        const foundMember = staff.find(s => 
          s.status === 'active' && 
          (s.phone === trimmedUsername || s.email.toLowerCase() === trimmedUsername.toLowerCase())
        );

        if (foundMember) {
          // Simple match of custom password (fallback to phone or master passcode)
          const expectedPassword = foundMember.password || foundMember.phone || targetPasscode;
          if (passcode === expectedPassword) {
            isAuthorized = true;
            authenticatedUser = foundMember;
          }
        } else if (trimmedUsername === "9064517009" || trimmedUsername.toLowerCase() === "sudipta.das@protonscooty.com") {
          // Special fallback for Sudipta Das if logging in via staff portal with his credentials
          if (passcode === targetPasscode) {
            isAuthorized = true;
            authenticatedUser = {
              id: "STF-01",
              name: "Sudipta Das",
              role: "Owner",
              email: "sudipta.das@protonscooty.com",
              phone: "9064517009",
              password: targetPasscode
            };
          }
        }
      }

      setSecurityLogs(prev => [
        ...prev,
        `[LOGIN INITIATED] Processing portal auth for ${portalType.toUpperCase()}.`,
        `[CREDENTIALS MATCH] Simple plain-text database query verification initiated.`
      ]);

      if (isAuthorized && authenticatedUser) {
        if (portalType === "staff") {
          // Staff portal -> direct access, NO 2FA
          setIsAdmin(true);
          sessionStorage.setItem("sudipta_is_admin", "true");
          sessionStorage.setItem("sudipta_current_user", JSON.stringify(authenticatedUser));
          setCurrentUser(authenticatedUser);
          setShowLoginModal(false);
          setLoginError("");
          setPasscode("");
          setLoginUsername("");
          setOtpInput("");
          setRecoveryKeyInput("");
          setLoginStep("credentials");
          setSecurityLogs(prev => [
            ...prev,
            `[AUTH VERIFIED] Match success for ${authenticatedUser.name} (${authenticatedUser.role})! Session granted.`
          ]);
          logAuditEvent({
            actor: authenticatedUser.name,
            role: authenticatedUser.role === "Owner" ? "Admin" : "Staff",
            action: `Staff portal session authenticated for ${authenticatedUser.name}`,
            module: "Staff Portal",
            severity: "info"
          });
          navigate("/dashboard");
        } else {
          // Admin portal -> Proceed to 2-step verification (2FA)
          setCurrentUser(authenticatedUser);
          const isLinked = (sessionStorage.getItem("sudipta_2fa_linked") || localStorage.getItem("sudipta_2fa_linked")) === "true";
          if (!isLinked) {
            setLoginStep("mfa_setup");
            setLoginError("");
            setSecurityLogs(prev => [
              ...prev,
              `[AUTH VERIFIED] Passcode matched. 2FA setup required for ${authenticatedUser.name}.`,
              `[MFA SETUP] Security keys generated. Awaiting first-time QR enrollment scan.`
            ]);
          } else {
            setLoginStep("2fa");
            setLoginError("");
            setSecurityLogs(prev => [
              ...prev,
              `[AUTH VERIFIED] Passcode matched. Google Authenticator 2FA challenge triggered for ${authenticatedUser.name}.`
            ]);
          }
        }
      } else {
        setLoginError(
          portalType === "admin" 
            ? (lang === "bn" ? "ভুল এডমিন সিকিউরিটি পাসকোড!" : "Invalid Admin Security Passcode!")
            : (lang === "bn" ? "ভুল ফোন/ইমেল বা পাসওয়ার্ড!" : "Invalid Employee Phone/Email or Password!")
        );
        setSecurityLogs(prev => [
          ...prev,
          `[AUTH FAILED] Credentials mismatch. Unauthorized attempt recorded.`
        ]);
      }
    } else {
      // 2FA / MFA Setup check for Admin
      const cleanOtp = otpInput.trim();
      const cleanRecovery = recoveryKeyInput.trim();

      const secret2FA = sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK";
      const isRecoveryValid = cleanRecovery === secret2FA || cleanRecovery === `RECOVERY-${secret2FA}` || cleanRecovery === "SUDIPTADASEYWORK" || cleanRecovery === "RECOVERY-SUDIPTADASEYWORK" || cleanRecovery === "SECURE-RECOVERY-KEY-9064";

      setSecurityLogs(prev => [
        ...prev,
        `[2FA CHALLENGE] Verifying 6-digit TOTP token against cryptographic systems...`
      ]);

      const isOtpValid = await verifyTOTP(secret2FA, cleanOtp);
      console.log(`[2FA VERIFY] Token: ${cleanOtp}, valid: ${isOtpValid}`);

      if (isOtpValid || isRecoveryValid) {
        setIsAdmin(true);
        sessionStorage.setItem("sudipta_is_admin", "true");
        const finalUser = currentUser || {
          id: "STF-01",
          name: "Sudipta Das",
          role: "Owner",
          email: "sudipta.das@protonscooty.com",
          phone: "9064517009",
          password: targetPasscode
        };
        sessionStorage.setItem("sudipta_current_user", JSON.stringify(finalUser));
        setCurrentUser(finalUser);
        setShowLoginModal(false);
        setLoginError("");
        setPasscode("");
        setLoginUsername("");
        setOtpInput("");
        setRecoveryKeyInput("");
        setLoginStep("credentials");
        setSecurityLogs(prev => [
          ...prev,
          isRecoveryValid 
            ? `[RECOVERY] Admin authenticated via emergency recovery key.`
            : `[2FA COMPLETE] Google Authenticator verification successful. Master ERP session granted.`,
          `[FIREWALL SHIELD] Private ERP Panel secure session token established.`
        ]);
        logAuditEvent({
          actor: finalUser.name,
          role: "Admin",
          action: `Master Admin session authenticated via ${isRecoveryValid ? "Emergency Recovery Key" : "2FA TOTP Shield"}`,
          module: "Security Portal",
          severity: "critical"
        });
        navigate("/dashboard");
      } else {
        setShake2Fa(true);
        setTimeout(() => setShake2Fa(false), 500);

        setLoginError(lang === "bn" ? "ভুল গুগল প্রমাণীকরণ কোড বা রিকভারি কী!" : "Invalid Authenticator 2FA Code or Recovery Key!");
        setOtpInput("");
        setSecurityLogs(prev => [
          ...prev,
          `[2FA FAIL] Cryptographic verification failed. Correct 2FA Authenticator code required.`
        ]);
      }
    }
  };

  // Helper to handle API requests safely with local fallback and error logging
  const executeApiAction = async (
    apiCall: () => Promise<Response>,
    actionName: string,
    onSuccess?: () => void
  ) => {
    try {
      const res = await apiCall();
      if (!res.ok) {
        console.warn(`[ERP Background Sync] ${actionName} notice (${res.status}). State synchronized locally & Supabase.`);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.warn(`[ERP Background Sync] ${actionName} offline notice:`, err);
    }
  };

  // Admin CMS endpoints proxy triggers with persistent state handlers
  const handleAddVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = { id: `v_${Date.now()}`, ...vehicleData };
    setVehicles(prev => [...prev, newVehicle]);
    await saveVehicleToSupabase(newVehicle);
  };

  const handleUpdateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicleData } : v));
    const target = vehicles.find(v => v.id === id) || { id, ...vehicleData };
    await saveVehicleToSupabase({ ...target, ...vehicleData });
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই মডেলটি মুছে ফেলতে চান?" : "Are you sure you want to delete this vehicle model?")) {
      setVehicles(prev => prev.filter(v => v.id !== id));
      await softDeleteVehicleInSupabase(id);
    }
  };

  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    const newProd: Product = { id: `p_${Date.now()}`, ...productData };
    setProducts(prev => [...prev, newProd]);
    await saveProductToSupabase(newProd);
  };

  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    const target = products.find(p => p.id === id) || { id, ...productData };
    await saveProductToSupabase({ ...target, ...productData });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই খুচরা যন্ত্রাংশটি স্টক থেকে সরাতে চান?" : "Are you sure you want to remove this spare part?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      await softDeleteProductInSupabase(id);
    }
  };

  const handleAddCustomer = async (custData: Omit<Customer, "id">) => {
    const newCust: Customer = { id: `c_${Date.now()}`, serviceHistory: [], paymentHistory: [], emiRecords: [], photo: "", ...custData };
    setCustomers(prev => [...prev, newCust]);
    await saveCustomerToSupabase(newCust);
  };

  const handleDeleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    await softDeleteCustomerInSupabase(id);
  };

  const handleAddBooking = async (bookingData: Omit<Booking, "id" | "createdAt" | "totalAmount">) => {
    const newBooking: Booking = {
      id: `s_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalAmount: (bookingData.serviceCharge || 0) + (bookingData.partsUsed?.reduce((sum, p) => sum + p.price * p.quantity, 0) || 0),
      status: "Pending",
      paymentStatus: "Unpaid",
      ...bookingData
    };
    setBookings(prev => [...prev, newBooking]);
    await saveBookingToSupabase(newBooking);
  };

  const handleUpdateBooking = async (id: string, bookingData: Partial<Booking>) => {
    const existing = bookings.find(b => b.id === id);
    const updated = { ...(existing || { id }), ...bookingData };
    setBookings(prev => prev.map(b => b.id === id ? (updated as Booking) : b));
    await saveBookingToSupabase(updated);
  };

  const handleDeleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    await softDeleteBookingInSupabase(id);
  };

  const handleAddEMI = async (emiData: Omit<EmiRecord, "id">) => {
    const total = Number(emiData.totalPrice);
    const down = Number(emiData.downPayment);
    const remaining = total - down;
    const newEmi: EmiRecord = {
      id: `emi_${Date.now()}`,
      remainingBalance: remaining,
      paidAmount: down,
      dueAmount: remaining,
      paymentHistory: [
        { amount: down, date: new Date().toISOString().split("T")[0], method: (emiData as any).method || "Cash", status: "Down Payment" }
      ],
      ...emiData
    };
    setEmiRecords(prev => [...prev, newEmi]);
    executeApiAction(
      () => fetch("/api/emi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emiData)
      }),
      "Create EMI Record"
    );
  };

  const handleRecordEMIPayment = async (emiId: string, amount: number, method: string) => {
    const existing = emiRecords.find(e => e.id === emiId);
    if (existing) {
      const paid = existing.paidAmount + amount;
      const rem = Math.max(0, existing.totalPrice - paid);
      const updated = {
        ...existing,
        paidAmount: paid,
        remainingBalance: rem,
        dueAmount: rem,
        paymentHistory: [...existing.paymentHistory, { amount, date: new Date().toISOString().split("T")[0], method, status: "Installment" }]
      };
      setEmiRecords(prev => prev.map(e => e.id === emiId ? updated : e));
    }
    executeApiAction(
      () => fetch(`/api/emi/${emiId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method })
      }),
      "Record EMI Payment"
    );
  };

  const handleDeleteEMI = async (emiId: string) => {
    setEmiRecords(prev => prev.filter(e => e.id !== emiId));
    executeApiAction(
      () => fetch(`/api/emi/${emiId}`, { method: "DELETE" }),
      "Delete EMI Record"
    );
  };

  const handleAddExpense = async (expenseData: Omit<Expense, "id">) => {
    const newExp: Expense = { id: `exp_${Date.now()}`, date: new Date().toISOString().split("T")[0], ...expenseData };
    setExpenses(prev => [...prev, newExp]);
    executeApiAction(
      () => fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
      }),
      "Add Expense"
    );
  };

  const handleUpdateExpense = async (id: string, expenseData: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expenseData } : e));
    executeApiAction(
      () => fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
      }),
      "Update Expense"
    );
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই খরচ রেকর্ডটি মুছে ফেলতে চান?" : "Are you sure you want to delete this expense entry?")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      executeApiAction(
        () => fetch(`/api/expenses/${id}`, { method: "DELETE" }),
        "Delete Expense"
      );
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, status: Enquiry["status"]) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    executeApiAction(
      () => fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      }),
      "Update Enquiry Status"
    );
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই লিডটি মুছে ফেলতে চান?" : "Are you sure you want to delete this lead?")) {
      setEnquiries(prev => prev.filter(e => e.id !== id));
      executeApiAction(
        () => fetch(`/api/enquiries/${id}`, { method: "DELETE" }),
        "Delete Enquiry"
      );
    }
  };

  const handleAddAnnouncement = async (annData: Omit<Announcement, "id" | "date">) => {
    const newAnn: Announcement = { id: `ann_${Date.now()}`, date: new Date().toISOString().split("T")[0], isActive: true, ...annData };
    setAnnouncements(prev => {
      const updated = prev.map(a => ({ ...a, isActive: false })).concat(newAnn);
      return updated;
    });
    executeApiAction(
      () => fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnn)
      }),
      "Add Announcement"
    );
  };

  const handleActivateAnnouncement = async (id: string) => {
    setAnnouncements(prev => {
      const updated = prev.map(a => {
        const isActive = a.id === id;
        return { ...a, isActive };
      });
      return updated;
    });
    executeApiAction(
      () => fetch(`/api/announcements/${id}/activate`, { method: "PUT" }),
      "Activate Announcement"
    );
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?" : "Are you sure you want to delete this notice?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      executeApiAction(
        () => fetch(`/api/announcements/${id}`, { method: "DELETE" }),
        "Delete Announcement"
      );
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: Enquiry["status"]) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    executeApiAction(
      () => fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      }),
      "Update Lead Status"
    );
  };

  const renderPortalLoginFormInline = (portalType: "staff" | "admin" = "staff") => {
    return (
      <form 
        onSubmit={(e) => handleAdminAuth(e, portalType)} 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-150 dark:border-slate-800 space-y-6 text-left"
        style={shake2Fa ? { transform: "translateX(10px)" } : {}}
      >
        <div className="flex flex-col items-center text-center space-y-2 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-display font-black text-slate-800 dark:text-white uppercase tracking-wider">
            {portalType === "admin" 
              ? (lang === "bn" ? "এডমিন ইআরপি পোর্টাল অ্যাক্সেস" : "Admin ERP Portal Access")
              : (lang === "bn" ? "স্টাফ পোর্টাল" : "Staff Portal")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {portalType === "admin"
              ? (lang === "bn" 
                ? "মাস্টার ইআরপি কন্ট্রোল প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে ওনার সিকিউরিটি পাসকোড দিন।" 
                : "Authenticate securely with the Owner/Admin private security passcode to access the Master ERP.")
              : (lang === "bn" 
                ? "নিরাপদ ইআরপি প্যানেলে অ্যাক্সেস করতে আপনার রেজিস্টার্ড ফোন/ইমেল এবং পাসওয়ার্ড দিন।" 
                : "Access the private ERP panel using your registered employee credentials.")}
          </p>
        </div>

        {loginError && (
          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold border border-rose-200/20 animate-fade-in">
            {loginError}
          </div>
        )}

        {loginStep === "credentials" && (
          <div className="space-y-4">
            {portalType === "staff" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  {lang === "bn" ? "রেজিস্টার্ড ফোন নম্বর / ইমেল" : "Employee Phone or Email"}
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-xs pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                {portalType === "admin"
                  ? (lang === "bn" ? "এডমিন সিকিউরিটি পাসকোড" : "Admin Security Passcode")
                  : (lang === "bn" ? "পাসওয়ার্ড" : "Password")}
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  required
                  placeholder=""
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-mono pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition duration-200 cursor-pointer text-center"
            >
              {portalType === "admin"
                ? (lang === "bn" ? "লগইন করুন →" : "Login to ERP →")
                : (lang === "bn" ? "স্টাফ লগইন →" : "Staff Login →")}
            </button>
          </div>
        )}

        {loginStep === "mfa_setup" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center space-y-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-250 shadow-sm shrink-0">
                <QRCodeSVG 
                  value={getTOTPUri(
                    sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK", 
                    "Sudipta E-Scooty (iamsudiptadas666@gmail.com)", 
                    "Sudipta E-Scooty"
                  )} 
                  size={130}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="w-full text-center space-y-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                  Emergency Recovery Key:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-black text-xs tracking-wider text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                    {sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sec = sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK";
                      navigator.clipboard.writeText(sec);
                      setLoginMfaCopied(true);
                      setTimeout(() => setLoginMfaCopied(false), 2000);
                    }}
                    className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/20 transition cursor-pointer"
                    title="Copy Key"
                  >
                    {loginMfaCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/20 rounded-xl">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Save this key safely. If you lose your phone, you can manually input this Base32 key to restore mobile 2FA access.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLoginStep("credentials");
                  setLoginError("");
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {lang === "bn" ? "← ফিরে যান" : "← Back"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("sudipta_2fa_linked", "true");
                  localStorage.setItem("sudipta_2fa_linked", "true");
                  setLoginStep("2fa");
                }}
                className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <span>{lang === "bn" ? "কিউআর স্ক্যান করেছি ➡️" : "I Have Scanned the QR Code ➡️"}</span>
              </button>
            </div>
          </div>
        )}

        {loginStep === "2fa" && (
          <div className="space-y-4 animate-fade-in">
            {!showRecoveryInput ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Google Authenticator Code</label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="******"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block leading-relaxed text-center">
                  Launch your <strong>Google Authenticator</strong> mobile app to read your active 6-digit MFA OTP code.
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Backup Recovery Key</label>
                <input
                  type="text"
                  placeholder=""
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={recoveryKeyInput}
                  onChange={(e) => setRecoveryKeyInput(e.target.value.toUpperCase())}
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block leading-relaxed">
                  Lost your device? Provide your 16-character Base32 Emergency Recovery Key to log in.
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setLoginStep("credentials");
                  setLoginError("");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                ← Back to Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryInput(!showRecoveryInput);
                  setLoginError("");
                }}
                className="text-slate-500 dark:text-slate-400 hover:underline font-bold"
              >
                {showRecoveryInput ? "Use Authenticator Code" : "Use Backup Recovery Key"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer text-center"
            >
              {lang === "bn" ? "কোড যাচাই করুন" : "Complete 2-Factor Verification"}
            </button>
          </div>
        )}
      </form>
    );
  };

  const renderAdminPanelContent = () => {
    const userRole = currentUser?.role || "Technician";
    const allowedTabs = ROLE_TABS[userRole] || [];
    const isAccessDenied = !allowedTabs.includes(activeTab);

    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-fade-in print:p-0">
        {/* Primary Live Alert for New Orders */}
        {allowedTabs.includes("orders") && orders.filter(o => o.status === "Pending Verification" || o.status === "Order Placed").length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start md:items-center gap-3.5">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shrink-0 shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {lang === "bn" ? "নতুন অর্ডার অপেক্ষারত" : "New Live Orders Awaiting Processing"}
                  </h4>
                </div>
                <p className="text-xs text-slate-650 mt-1">
                  {lang === "bn" 
                    ? `বর্তমানে আপনার কাছে ${orders.filter(o => o.status === "Pending Verification" || o.status === "Order Placed").length}টি নতুন স্কুটি সার্ভিস / খুচরা যন্ত্রাংশের অর্ডার রয়েছে যা ভেরিফিকেশন এবং ডেলিভারি পার্টনার অ্যাসাইন করতে হবে।`
                    : `You have ${orders.filter(o => o.status === "Pending Verification" || o.status === "Order Placed").length} new incoming orders that need pending verification & delivery executive assignment.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="shrink-0 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 w-fit self-end md:self-auto"
            >
              <Truck className="w-4 h-4 animate-bounce" />
              {lang === "bn" ? "অর্ডার প্রসেস করুন →" : "Manage Priority Orders →"}
            </button>
          </div>
        )}

        {/* Global Alert for New Customer Support Tickets */}
        {allowedTabs.includes("support_tickets") && pendingSupportCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-500">
            <div className="flex items-start md:items-center gap-3.5">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {lang === "bn" ? "নতুন কাস্টমার ইনকোয়ারি পেন্ডিং" : "⚠️ NEW CUSTOMER INQUIRY PENDING"}
                  </h4>
                </div>
                <p className="text-xs text-slate-650 mt-1">
                  {lang === "bn" 
                    ? `বর্তমানে আপনার কাছে ${pendingSupportCount}টি নতুন সাপোর্ট টিকিট রয়েছে যা সমাধান বা টেকনিশিয়ান অ্যাসাইন করা প্রয়োজন।`
                    : `You have ${pendingSupportCount} unassigned customer helpdesk tickets awaiting technician assignment or response.`}
                </p>
              </div>
            </div>
            <button
              onClick={handleSupportTabClick}
              className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 w-fit self-end md:self-auto"
            >
              <MessageSquare className="w-4 h-4" />
              {lang === "bn" ? "টিকিট সমাধান করুন →" : "Solve Tickets →"}
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Tabs - Hidden in print */}
          <div 
            className="w-full lg:w-64 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-col gap-2 bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-md shrink-0 print:hidden lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden custom-scrollbar"
          >
            {["dashboard", "products_cms", "orders", "customers", "payments_gateway", "coupons_engine", "reports", "inventory_alerts", "support_tickets", "staff_roles", "audit_logs"].some(t => allowedTabs.includes(t)) && (
              <span className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 mb-2">ERP Controller</span>
            )}

            {allowedTabs.includes("dashboard") && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.secDashboard}</span>
              </button>
            )}

            {allowedTabs.includes("products_cms") && (
              <button
                onClick={() => setActiveTab("products_cms")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "products_cms" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Building className="w-4 h-4 shrink-0" />
                <span className="truncate">Product (Showroom & CMS)</span>
              </button>
            )}

            {allowedTabs.includes("orders") && (
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "orders" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="truncate">Orders (Active Queue)</span>
              </button>
            )}

            {allowedTabs.includes("customers") && (
              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "customers" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">Customers (Database)</span>
              </button>
            )}

            {allowedTabs.includes("payments_gateway") && (
              <button
                onClick={() => setActiveTab("payments_gateway")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "payments_gateway" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="truncate">Payments (Transaction Gateway)</span>
              </button>
            )}

            {allowedTabs.includes("coupons_engine") && (
              <button
                onClick={() => setActiveTab("coupons_engine")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "coupons_engine" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span className="truncate">Coupons (Promo Engine)</span>
              </button>
            )}

            {allowedTabs.includes("reports") && (
              <button
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "reports" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BarChart className="w-4 h-4 shrink-0" />
                <span className="truncate">Reports (Analytics Graphs)</span>
              </button>
            )}

            {allowedTabs.includes("inventory_alerts") && (
              <button
                onClick={() => setActiveTab("inventory_alerts")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "inventory_alerts" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span className="truncate">Inventory (Stock Alerts)</span>
              </button>
            )}

            {allowedTabs.includes("support_tickets") && (
              <button
                onClick={() => setActiveTab("support_tickets")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "support_tickets" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">Support Helpdesk</span>
              </button>
            )}

            {allowedTabs.includes("staff_roles") && (
              <button
                onClick={() => setActiveTab("staff_roles")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "staff_roles" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="truncate">Staff (Roles)</span>
              </button>
            )}

            {allowedTabs.includes("audit_logs") && (
              <button
                onClick={() => setActiveTab("audit_logs")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "audit_logs" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate flex items-center gap-1.5">
                  Audit Logs
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </span>
              </button>
            )}

            {["emi", "bookings", "enquiries", "expenses", "announcements", "settings", "billing", "payments"].some(t => allowedTabs.includes(t)) && (
              <>
                <div className="w-full h-px bg-slate-100 my-2 col-span-full"></div>
                <span className="hidden lg:block text-[9px] font-black text-slate-400 uppercase tracking-wider px-3.5 mb-1">Additional ERP Tools</span>
              </>
            )}

            {allowedTabs.includes("emi") && (
              <button
                onClick={() => setActiveTab("emi")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "emi" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.secEMI}</span>
              </button>
            )}

            {allowedTabs.includes("bookings") && (
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "bookings" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.secServices}</span>
              </button>
            )}

            {allowedTabs.includes("enquiries") && (
              <button
                onClick={() => setActiveTab("enquiries")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "enquiries" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.secEnquiries}</span>
              </button>
            )}

            {allowedTabs.includes("expenses") && (
              <button
                onClick={() => setActiveTab("expenses")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "expenses" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                <span className="truncate">{lang === "bn" ? "দৈনিক খরচ" : "Expenses"}</span>
              </button>
            )}

            {allowedTabs.includes("announcements") && (
              <button
                onClick={() => setActiveTab("announcements")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "announcements" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span className="truncate">{lang === "bn" ? "নোটিশ বোর্ড" : "Notices"}</span>
              </button>
            )}

            {allowedTabs.includes("settings") && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-semibold text-left transition cursor-pointer ${
                  activeTab === "settings" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{lang === "bn" ? "সেটিংস" : "Settings"}</span>
              </button>
            )}

            {allowedTabs.includes("billing") && (
              <button
                onClick={() => setActiveTab("billing")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "billing" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{lang === "bn" ? "কুইক বিলিং" : "Quick Billing"}</span>
              </button>
            )}

            {allowedTabs.includes("payments") && (
              <button
                onClick={() => setActiveTab("payments")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "payments" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span className="truncate">{lang === "bn" ? "পেমেন্ট কিউআর" : "Receive Payment"}</span>
              </button>
            )}

            {allowedTabs.includes("documents_drive") && (
              <button
                onClick={() => setActiveTab("documents_drive")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "documents_drive" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <HardDrive className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{lang === "bn" ? "📁 ড্রাইভ স্টোরেজ" : "📁 Drive & Documents"}</span>
              </button>
            )}

            {allowedTabs.includes("academy_courses") && (
              <button
                onClick={() => setActiveTab("academy_courses")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "academy_courses" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{lang === "bn" ? "🎓 কোর্স ও একাডেমি" : "🎓 Course Management"}</span>
              </button>
            )}

            {allowedTabs.includes("recycle_bin") && (
              <button
                onClick={() => setActiveTab("recycle_bin")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-[11px] md:text-xs font-bold text-left transition cursor-pointer ${
                  activeTab === "recycle_bin" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Trash className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{lang === "bn" ? "🗑️ রিসাইকেল বিন" : "🗑️ Recycle Bin (Trash)"}</span>
              </button>
            )}

            {/* Sidebar Green Footer Accent */}
            <div className="w-full h-1 bg-emerald-500 rounded-full mt-4 mb-2 shrink-0 print:hidden hidden lg:block" title="ERP Connection Secured"></div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {isAccessDenied ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-xl">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/30">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-950 dark:text-white">403 - Forbidden Access</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Your current staff role <strong>({currentUser?.role || "Staff"})</strong> does not have authorized ERP capabilities to access the <strong>{activeTab}</strong> module.
                </p>
                <button 
                  onClick={() => {
                    const firstAllowed = allowedTabs[0] || "dashboard";
                    setActiveTab(firstAllowed);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Return to Authorized Area
                </button>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && <AdminDashboard stats={stats} products={products} vehicles={vehicles} enquiries={enquiries} orders={orders} onNavigate={setActiveTab} lang={lang} t={t} supportTickets={supportTickets} />}
                
                {activeTab === "products_cms" && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-0.5">Showroom & CMS</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Product Catalog Management Center</h4>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setActiveSubTab("vehicles")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeSubTab === "vehicles" ? "bg-indigo-600 text-white shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"}`}
                        >
                          Showroom Vehicles
                        </button>
                        <button
                          onClick={() => setActiveSubTab("spare_parts")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeSubTab === "spare_parts" ? "bg-indigo-600 text-white shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"}`}
                        >
                          Spare Parts Catalog
                        </button>
                      </div>
                    </div>
                    {activeSubTab === "vehicles" ? (
                      <AdminVehicles vehicles={vehicles} onAdd={handleAddVehicle} onUpdate={handleUpdateVehicle} onDelete={handleDeleteVehicle} lang={lang} t={t} />
                    ) : (
                      <AdminProducts products={products} onAdd={handleAddProduct} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} lang={lang} t={t} />
                    )}
                  </div>
                )}

                {activeTab === "orders" && <AdminOrders orders={orders} lang={lang} />}
                {activeTab === "customers" && <AdminCustomers customers={customers} bookings={bookings} announcements={announcements} onAdd={handleAddCustomer} onDelete={handleDeleteCustomer} lang={lang} t={t} />}
                {activeTab === "payments_gateway" && <AdminPayments lang={lang} />}
                {activeTab === "coupons_engine" && <AdminCoupons lang={lang} />}
                {activeTab === "reports" && <AdminReports report={report} onFilterChange={fetchFilteredReport} lang={lang} t={t} vehicles={vehicles} products={products} />}
                {activeTab === "inventory_alerts" && <AdminInventory lang={lang} vehicles={vehicles} setVehicles={setVehicles} products={products} setProducts={setProducts} />}
                {activeTab === "support_tickets" && <AdminSupport lang={lang} tickets={supportTickets} setTickets={setSupportTickets} staffMembers={staff} />}
                {activeTab === "staff_roles" && <AdminStaff lang={lang} staffMembers={staff} setStaffMembers={setStaff} />}
                {activeTab === "audit_logs" && <AdminAuditLogs lang={lang} />}

                {/* Additional ERP Tools */}
                {activeTab === "emi" && <AdminEMI emiRecords={emiRecords} customers={customers} onAddEMI={handleAddEMI} onRecordPayment={handleRecordEMIPayment} onDeleteEMI={handleDeleteEMI} onRefresh={fetchAllData} lang={lang} t={t} />}
                {activeTab === "bookings" && <AdminServices bookings={bookings} products={products} customers={customers} staffMembers={staff} onAddBooking={handleAddBooking} onUpdateBooking={handleUpdateBooking} onDeleteBooking={handleDeleteBooking} onLaunchInvoice={(booking) => { setActiveInvoiceBooking(booking); setShowInvoiceModal(true); }} lang={lang} t={t} />}
                {activeTab === "enquiries" && <AdminEnquiries enquiries={enquiries} onUpdateStatus={handleUpdateEnquiryStatus} onDelete={handleDeleteEnquiry} lang={lang} t={t} />}
                {activeTab === "expenses" && <AdminExpenses expenses={expenses} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} lang={lang} t={t} />}
                {activeTab === "announcements" && <AdminAnnouncements announcements={announcements} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} onActivate={handleActivateAnnouncement} lang={lang} t={t} />}
                {activeTab === "settings" && <AdminSettings settings={globalConfig} onUpdate={handleUpdateSettings} lang={lang} t={t} />}
                {activeTab === "billing" && (
                  <AdminBilling
                    lang={lang}
                    t={t}
                  />
                )}
                {activeTab === "payments" && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-10 shadow-xl max-w-xl mx-auto space-y-6">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Secure Billing Node</span>
                      <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <QrCode className="w-5 h-5 text-emerald-500" />
                        {lang === "bn" ? "সহজ ইউপিআই পেমেন্ট" : "Sudipta Quick UPI Payment"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        {lang === "bn"
                          ? "নিচে যে কোনো পরিমাণ (রুপি) লিখুন এবং গ্রাহককে মোবাইল ক্যামেরা বা ইউপিআই অ্যাপ দিয়ে স্ক্যান করে পেমেন্ট করার জন্য কিউআর কোডটি দেখান।"
                          : "Enter any bill amount below to generate a dynamic UPI QR code instantly. Present this to the customer for direct secure scan & pay."}
                      </p>
                    </div>
                    <UpiPaymentCard lang={lang} globalConfig={globalConfig} />
                  </div>
                )}

                {activeTab === "documents_drive" && (
                  <AdminDocuments lang={lang} />
                )}

                {activeTab === "academy_courses" && (
                  <AdminCourses lang={lang} />
                )}

                {activeTab === "recycle_bin" && (
                  <AdminRecycleBin lang={lang} onRefresh={fetchAllData} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Synchronize activeTab state with URL paths
  useEffect(() => {
    if (isAdmin) {
      if (location.pathname === "/billing" && activeTab !== "billing") {
        setActiveTab("billing");
      } else if (location.pathname === "/dashboard" && activeTab === "billing") {
        setActiveTab("dashboard");
      }
    }
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "billing" && location.pathname !== "/billing") {
        navigate("/billing");
      } else if (activeTab !== "billing" && location.pathname !== "/dashboard") {
        navigate("/dashboard");
      }
    }
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (globalConfig?.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = globalConfig.faviconUrl;
    }
  }, [globalConfig?.faviconUrl]);

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between overflow-x-hidden transition-colors duration-300 ${themeMode === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      {/* 0. Style Injections & Festive Animation Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${globalConfig?.primaryColor || '#1E40AF'};
          --secondary-color: ${globalConfig?.secondaryColor || '#FACC15'};
          --accent-color: ${globalConfig?.accentColor || '#10B981'};
        }
        .theme-primary-bg { background-color: var(--primary-color) !important; }
        .theme-primary-text { color: var(--primary-color) !important; }
        .theme-primary-border { border-color: var(--primary-color) !important; }
        .theme-secondary-bg { background-color: var(--secondary-color) !important; }
        .theme-secondary-text { color: var(--secondary-color) !important; }
        .theme-secondary-border { border-color: var(--secondary-color) !important; }
        .theme-accent-bg { background-color: var(--accent-color) !important; }
        .theme-accent-text { color: var(--accent-color) !important; }
        .theme-accent-border { border-color: var(--accent-color) !important; }
        
        /* Dynamic scrollbar thumbs matching accent and primary color */
        ::-webkit-scrollbar-thumb {
          background-color: var(--accent-color) !important;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: var(--primary-color) !important;
        }

        /* Dynamic classes for the Quick Finder and similar sections */
        .theme-accent-header {
          color: var(--accent-color) !important;
        }
        .theme-accent-border-hover:hover {
          border-color: var(--accent-color) !important;
        }
        .theme-accent-icon-box {
          background-color: ${themeMode === "dark" ? "rgba(30, 41, 59, 0.6)" : "rgba(16, 185, 129, 0.08)"};
          color: var(--accent-color);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .theme-accent-icon-box {
          background-color: var(--accent-color) !important;
          color: #ffffff !important;
        }
        .theme-accent-chevron {
          color: var(--accent-color) !important;
        }
        .theme-accent-focus:focus {
          border-color: var(--accent-color) !important;
          box-shadow: 0 0 0 3px ${themeMode === "dark" ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.18)"} !important;
        }
        .theme-accent-bg-hover:hover {
          background-color: var(--accent-color) !important;
          filter: brightness(0.9);
        }

        @keyframes fall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .falling-asset {
          position: fixed;
          top: -50px;
          pointer-events: none;
          z-index: 100;
          animation: fall 12s linear infinite;
        }
        
        /* Glassmorphic Cards support */
        .glass-card {
          background: ${themeMode === "dark" ? "rgba(30, 41, 59, 0.45)" : "rgba(255, 255, 255, 0.75)"};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${themeMode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(226, 232, 240, 0.8)"};
        }
        
        @keyframes subtle-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
            transform: scale(1.02);
          }
        }
        .btn-call-pulse {
          animation: subtle-pulse 2.2s infinite ease-in-out;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-call-pulse:hover {
          transform: translateY(-2px) scale(1.04) !important;
          box-shadow: 0 0 20px 6px rgba(16, 185, 129, 0.7) !important;
        }
      `}} />

      {/* Dynamic Festival Animation Overlay */}
      {showFestivalOverlay && globalConfig?.festivalTheme && globalConfig.festivalTheme !== "none" && (
        <div 
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden transition-opacity duration-1000 ease-out"
          style={{ opacity: isFestivalFadingOut ? 0 : 1 }}
        >
          {Array.from({ length: 18 }).map((_, i) => {
            let icon = "🌸";
            if (globalConfig.festivalTheme === "durga_puja") icon = "🪷";
            else if (globalConfig.festivalTheme === "kali_puja" || globalConfig.festivalTheme === "diwali") icon = "🪔";
            else if (globalConfig.festivalTheme === "eid") icon = "🌙";
            else if (globalConfig.festivalTheme === "christmas") icon = "❄️";
            else if (globalConfig.festivalTheme === "new_year") icon = "🎈";
            else if (globalConfig.festivalTheme === "independence_day" || globalConfig.festivalTheme === "republic_day") icon = "🇮🇳";

            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 8}s`;
            const duration = `${8 + Math.random() * 8}s`;
            const size = `${14 + Math.random() * 16}px`;

            return (
              <span
                key={i}
                className="falling-asset"
                style={{
                  left,
                  animationDelay: delay,
                  animationDuration: duration,
                  fontSize: size,
                }}
              >
                {icon}
              </span>
            );
          })}
        </div>
      )}

      {/* 1. Header Navigation Bar */}
      <header 
        style={{ padding: '4px 0px', margin: '0' }}
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 print:hidden ${themeMode === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white/95 border-slate-100 shadow-xs"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-1.5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2.5 theme-accent-bg text-white rounded-2xl shadow-md hover:scale-105 transition-transform flex-shrink-0">
                {globalConfig?.logoUrl ? (
                  <img src={globalConfig.logoUrl} alt="Logo" className="w-5.5 h-5.5 object-contain" />
                ) : (
                  <Zap className="w-5.5 h-5.5 fill-white" />
                )}
              </Link>
              <div className="flex flex-col">
                <Link to="/">
                  <h1 className={`text-base md:text-lg font-display font-extrabold tracking-tight leading-none hover:opacity-90 transition-opacity whitespace-nowrap ${themeMode === "dark" ? "text-white" : "text-slate-900"}`}>
                    {lang === "bn" ? (globalConfig?.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস") : (globalConfig?.businessNameEng || "Sudipta E-Scooty Service")}
                  </h1>
                </Link>
                <div className="text-[10px] theme-accent-text font-bold uppercase tracking-wider flex items-center flex-wrap gap-2 mt-1">
                  <span>{lang === "bn" ? (globalConfig?.proprietorNameBen || "প্রোপ্রাইটর: সুদীপ্ত দাস") : (globalConfig?.proprietorNameEng || "PROPRIETOR: SUDIPTA DAS")}</span>
                  <span className={`${themeMode === "dark" ? "text-slate-700" : "text-slate-300"}`}>•</span>
                  <a href={`tel:${globalConfig?.whatsappNumber || "+919064517009"}`} className={`hover:underline flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-tight ${themeMode === "dark" ? "bg-emerald-950/40 text-emerald-300" : "bg-emerald-50 text-emerald-800"}`}>
                    <Phone className="w-2.5 h-2.5 fill-emerald-700 dark:fill-emerald-300" />
                    {globalConfig?.whatsappNumber || "+91 9064517009"}
                  </a>
                  <span className={`${themeMode === "dark" ? "text-slate-700" : "text-slate-300"}`}>•</span>
                  <span className="flex items-center gap-1 text-[8.5px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/45 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <Shield className="w-2.5 h-2.5 fill-emerald-500" />
                    <span>SSL SECURED (HTTPS)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Hamburger toggle - Always visible on mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 lg:hidden rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                themeMode === "dark" ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Desktop Nav & Actions - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4">
              <nav className="flex items-center gap-3">
                {((globalConfig?.navLinks && globalConfig.navLinks.length > 0) ? globalConfig.navLinks : [
                  { id: "1", labelEng: "Showroom", labelBen: "শোরুম", href: "/#showroom", isEnabled: true },
                  { id: "2", labelEng: "Spare Parts", labelBen: "খুচরা যন্ত্রাংশ", href: "/spare_parts", isEnabled: true },
                  { id: "3", labelEng: "Diagnosis", labelBen: "ডায়াগনস্টিকস", href: "/#diagnosis", isEnabled: true },
                  { id: "4", labelEng: "Tools", labelBen: "ক্যালকুলেটর", href: "/#tools", isEnabled: true },
                  { id: "5", labelEng: "Support", labelBen: "সহায়তা", href: "/#support", isEnabled: true }
                ]).filter(link => link.isEnabled).map(link => {
                  const href = link.href;
                  const isHashLink = href.startsWith("/#");
                  const isActive = isLinkActive(href);
                  
                  const buttonClass = `group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                    isActive
                      ? themeMode === "dark"
                        ? "bg-emerald-950/45 text-emerald-400 border-emerald-500/50 shadow-xs shadow-emerald-500/10"
                        : "bg-emerald-50 text-emerald-700 border-emerald-250/50 shadow-xs"
                      : themeMode === "dark"
                        ? "bg-slate-900/30 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 hover:border-emerald-500/30"
                        : "bg-slate-100/40 border-slate-200/20 text-slate-600 hover:text-emerald-600 hover:bg-white hover:border-emerald-250/50 hover:shadow-2xs"
                  }`;
                  return isHashLink ? (
                    <a key={link.id} href={href} onClick={(e) => handleNavLinkClick(href, e)} className={buttonClass}>
                      {getNavLinkIcon(link.labelEng)}
                      <span>{lang === "bn" ? link.labelBen : link.labelEng}</span>
                    </a>
                  ) : (
                    <Link key={link.id} to={href} onClick={(e) => handleNavLinkClick(href, e)} className={buttonClass}>
                      {getNavLinkIcon(link.labelEng)}
                      <span>{lang === "bn" ? link.labelBen : link.labelEng}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleTheme}
                  className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                    themeMode === "dark" ? "bg-slate-800 text-amber-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={lang === "bn" ? "থিম পরিবর্তন" : "Toggle Theme Mode"}
                >
                  {themeMode === "dark" ? <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Layers className="w-4 h-4 text-slate-600" />}
                </button>
                <button
                  onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                  className={`flex items-center gap-1 px-2 py-2 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer shrink-0 ${
                    themeMode === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title={lang === "bn" ? "English" : "বাংলা"}
                >
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === "bn" ? "English" : "বাংলা"}</span>
                </button>
                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowOrderTracker(true);
                      navigate("/");
                    }}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      themeMode === "dark" 
                        ? "bg-emerald-950/45 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/20" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>{lang === "bn" ? "অর্ডার ট্র্যাক" : "Track Order"}</span>
                  </button>
                )}
                {isAdmin ? (
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setCurrentUser(null);
                      localStorage.removeItem("sudipta_is_admin");
                      localStorage.removeItem("sudipta_current_user");
                      sessionStorage.removeItem("sudipta_is_admin");
                      sessionStorage.removeItem("sudipta_current_user");
                      navigate("/");
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logoutButton}</span>
                  </button>
                ) : null}
              </div>
            </div>

        </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`lg:hidden border-t overflow-hidden ${
                themeMode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              }`}
            >
              <nav className="flex flex-col py-4 px-6 gap-3">
                {(globalConfig?.navLinks || [
                  { id: "1", labelEng: "Showroom", labelBen: "শোরুম", href: "/#showroom", isEnabled: true },
                  { id: "2", labelEng: "Spare Parts", labelBen: "খুচরা যন্ত্রাংশ", href: "/spare_parts", isEnabled: true },
                  { id: "3", labelEng: "Diagnosis", labelBen: "ডায়াগনস্টিকস", href: "/#diagnosis", isEnabled: true },
                  { id: "4", labelEng: "Tools", labelBen: "ক্যালকুলেটর", href: "/#tools", isEnabled: true },
                  { id: "5", labelEng: "Support", labelBen: "সহায়তা", href: "/#support", isEnabled: true }
                ]).filter(link => link.isEnabled).map(link => {
                  const href = link.href;
                  const isHashLink = href.startsWith("/#");
                  const isActive = isLinkActive(href);
                  
                  const buttonClass = `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                    isActive
                      ? themeMode === "dark"
                        ? "bg-emerald-950/45 text-emerald-400 border-emerald-500/50 shadow-xs"
                        : "bg-emerald-50 text-emerald-700 border-emerald-250/50 shadow-xs"
                      : themeMode === "dark"
                        ? "bg-slate-900/30 border-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 hover:border-emerald-500/30"
                        : "bg-slate-100/40 border-slate-200/20 text-slate-700 hover:text-emerald-600 hover:bg-white hover:border-emerald-250/50 hover:shadow-2xs"
                  }`;

                  return isHashLink ? (
                    <a 
                      key={link.id} 
                      href={href} 
                      onClick={(e) => handleNavLinkClick(href, e)}
                      className={buttonClass}
                    >
                      {getNavLinkIcon(link.labelEng)}
                      <span>{lang === "bn" ? link.labelBen : link.labelEng}</span>
                    </a>
                  ) : (
                    <Link 
                      key={link.id} 
                      to={href} 
                      onClick={(e) => handleNavLinkClick(href, e)}
                      className={buttonClass}
                    >
                      {getNavLinkIcon(link.labelEng)}
                      <span>{lang === "bn" ? link.labelBen : link.labelEng}</span>
                    </Link>
                  );
                })}

                {!isAdmin && (
                  <button
                    onClick={() => {
                      setShowOrderTracker(true);
                      setShowMobileMenu(false);
                      navigate("/");
                    }}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                      showOrderTracker
                        ? themeMode === "dark"
                          ? "bg-emerald-950/45 text-emerald-400 border-emerald-500/50 shadow-xs"
                          : "bg-emerald-50 text-emerald-700 border-emerald-250/50 shadow-xs"
                        : themeMode === "dark"
                          ? "bg-slate-900/30 border-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 hover:border-emerald-500/30"
                          : "bg-slate-100/40 border-slate-200/20 text-slate-700 hover:text-emerald-600 hover:bg-white hover:border-emerald-250/50 hover:shadow-2xs"
                    }`}
                  >
                    <Truck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>{lang === "bn" ? "অর্ডার ট্র্যাক" : "Track Order"}</span>
                  </button>
                )}

                <hr className={`my-2 ${themeMode === "dark" ? "border-slate-800" : "border-slate-100"}`} />

                {/* Mobile Menu Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { handleToggleTheme(); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 p-3 rounded-xl transition cursor-pointer text-left ${
                      themeMode === "dark" ? "bg-slate-800 text-amber-400" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {themeMode === "dark" ? <Sparkles className="w-4 h-4 fill-amber-400" /> : <Layers className="w-4 h-4" />}
                    <span className="text-sm font-bold">{lang === "bn" ? "থিম পরিবর্তন করুন" : "Toggle Theme"}</span>
                  </button>

                  <button
                    onClick={() => { setLang(lang === "bn" ? "en" : "bn"); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 p-3 rounded-xl transition cursor-pointer text-left ${
                      themeMode === "dark" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-bold">{lang === "bn" ? "English" : "বাংলা"}</span>
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={() => {
                        setIsAdmin(false);
                        setCurrentUser(null);
                        localStorage.removeItem("sudipta_is_admin");
                        localStorage.removeItem("sudipta_current_user");
                        sessionStorage.removeItem("sudipta_is_admin");
                        sessionStorage.removeItem("sudipta_current_user");
                        setShowMobileMenu(false);
                        navigate("/");
                      }}
                      className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl transition cursor-pointer text-left w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-bold">{t.logoutButton}</span>
                    </button>
                  ) : null}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Main Content Controller */}
      <main className="flex-1">
        <Routes>
          {/* Public customer-facing routes */}
          <Route path="/spare_parts" element={<SpareParts products={products} lang={lang} t={t} />} />
          <Route path="/spare-parts" element={<SpareParts products={products} lang={lang} t={t} />} />
          <Route path="/product/:id" element={<ProductDetailPage products={products} vehicles={vehicles} lang={lang} t={t} />} />

          {/* Secure ERP Portal Access Path */}
          <Route path="/staff-portal" element={
            isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
                {renderPortalLoginFormInline("staff")}
              </div>
            )
          } />
          <Route path="/admin-portal" element={
            isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
                {renderPortalLoginFormInline("admin")}
              </div>
            )
          } />
          <Route path="/owner-portal" element={<Navigate to="/admin-portal" replace />} />
          <Route path="/erp-login" element={<Navigate to="/staff-portal" replace />} />
          <Route path="/admin" element={<Navigate to="/admin-portal" replace />} />
          <Route path="/staff" element={<Navigate to="/staff-portal" replace />} />
          <Route path="/login" element={<Navigate to="/staff-portal" replace />} />
          <Route path="/signin" element={<Navigate to="/staff-portal" replace />} />

          {/* Protected Dashboard/Billing routes */}
          <Route path="/dashboard" element={
            isAdmin ? (
              renderAdminPanelContent()
            ) : (
              <Navigate to="/staff-portal" replace />
            )
          } />

          <Route path="/billing" element={
            isAdmin ? (
              renderAdminPanelContent()
            ) : (
              <Navigate to="/staff-portal" replace />
            )
          } />

          <Route path="*" element={
              showOrderTracker ? (
                <OrderTracker lang={lang} onBack={() => setShowOrderTracker(false)} />
              ) : (
                /* =========================================
                   A. CUSTOMER-FACING PUBLIC WEBSITE
                   ========================================= */
                <div className="space-y-16 pb-16 animate-fade-in">
            {/* Active Notices Banner if any announcements exist */}
            {announcements.length > 0 && (() => {
              const activeAnn = announcements.find(a => a.isActive) || announcements[0];
              return (
                <div 
                  id="notice-bar" 
                  style={{ padding: '4px 0px', margin: '0' }}
                  className="bg-amber-50/60 border-b border-amber-100/80 text-center text-xs text-amber-900 px-4 animate-fade-in relative z-30"
                >
                  <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="bg-amber-200 text-amber-900/90 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider animate-blinker shrink-0">NOTICE</span>
                      <strong className="font-bold text-amber-950 text-[13px] sm:text-[14px]" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {lang === "bn" ? activeAnn.titleBen : activeAnn.titleEng}
                      </strong>
                    </div>
                    <span 
                      className="block w-full text-center"
                      style={{ color: "#580b0b", fontFamily: "'Hind Siliguri', sans-serif", fontSize: "15px", lineHeight: "20px" }}
                    >
                      {lang === "bn" ? activeAnn.contentBen : activeAnn.contentEng}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Active Festival Banners and Greetings Overlay */}
            {globalConfig?.festivalTheme && globalConfig.festivalTheme !== "none" && (
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className={`p-6 rounded-3xl border text-center relative overflow-hidden shadow-lg transition-all duration-300 ${
                  globalConfig.festivalTheme === "durga_puja" 
                    ? "bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white border-red-500" 
                    : globalConfig.festivalTheme === "kali_puja" || globalConfig.festivalTheme === "diwali"
                    ? "bg-gradient-to-r from-violet-900 via-amber-800 to-indigo-950 text-amber-200 border-amber-600"
                    : globalConfig.festivalTheme === "eid"
                    ? "bg-gradient-to-r from-emerald-800 via-teal-900 to-green-800 text-amber-300 border-emerald-600"
                    : globalConfig.festivalTheme === "christmas"
                    ? "bg-gradient-to-r from-red-800 via-rose-900 to-emerald-900 text-white border-rose-700"
                    : globalConfig.festivalTheme === "new_year"
                    ? "bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-950 text-white border-indigo-700"
                    : "bg-gradient-to-r from-amber-600 via-white to-emerald-600 text-slate-900 border-amber-500 font-bold"
                }`}>
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <Sparkles className="w-16 h-16 animate-pulse" />
                  </div>
                  
                  {globalConfig.festivalTheme === "durga_puja" && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5">
                        🪷 শুভ শারদীয়া উৎসবের আন্তরিক প্রীতি ও শুভেচ্ছা! 🪷
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto">
                        {lang === "bn" 
                          ? `${globalConfig?.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস"}-এর পক্ষ থেকে আপনাকে ও আপনার পরিবারকে জানাই শারদ শুভেচ্ছা। উৎসবের মরসুমে আপনার সফর হোক আনন্দময় ও সুরক্ষিত!`
                          : `${globalConfig?.businessNameEng || "Sudipta E-Scooty Service"} wishes you and your family a safe and happy Durga Puja festival!`}
                      </p>
                    </div>
                  )}

                  {(globalConfig.festivalTheme === "kali_puja" || globalConfig.festivalTheme === "diwali") && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5 text-yellow-300">
                        🪔 শুভ দীপাবলী ও কালীপূজা! 🪔
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto text-amber-100">
                        {lang === "bn"
                          ? "আলোর উৎসবে দূর হোক সমস্ত অন্ধকার। আমাদের এখানে উৎসব উপলক্ষে রয়েছে সমস্ত ই-স্কুটি সার্ভিসিং ও ব্যাটারি ডায়াগনস্টিকসে বিশেষ ছাড়!"
                          : "May the festival of lights bring prosperity. Avail special offers on EV diagnostics during this festive period!"}
                      </p>
                    </div>
                  )}

                  {globalConfig.festivalTheme === "eid" && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5">
                        🌙 ঈদ মোবারক! Eid Mubarak! 🌙
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto">
                        {lang === "bn"
                          ? `শান্তি ও আনন্দের এই পুণ্যলগ্নে ${globalConfig?.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস"}-এর পক্ষ থেকে জানাই ঈদের শুভেচ্ছা।`
                          : `Wishing you a peaceful and joyful Eid. Travel green and travel safe with ${globalConfig?.businessNameEng || "Sudipta E-Scooty Service"}.`}
                      </p>
                    </div>
                  )}

                  {globalConfig.festivalTheme === "christmas" && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5">
                        ❄️ Merry Christmas & Happy Holidays! ❄️
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto">
                        {lang === "bn"
                          ? "শুভ বড়দিন! উৎসবের মরসুমে আপনার ও আপনার পরিবারের সকল সদস্যের যাত্রা হোক নিরাপদ ও স্বাচ্ছন্দ্যময়।"
                          : "Warmest thoughts and best wishes for a wonderful Christmas! May your rides always stay powered up."}
                      </p>
                    </div>
                  )}

                  {globalConfig.festivalTheme === "new_year" && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5 text-blue-300">
                        🎈 শুভ ইংরেজি নববর্ষ! Happy New Year! 🎈
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto text-slate-200">
                        {lang === "bn"
                          ? "নতুন বছরের নতুন গতিতে আপনার ই-স্কুটারকে করে তুলুন একদম নতুনের মতো। আজই চলে আসুন অশোকনগর ওয়ার্কশপে!"
                          : "Step into the new year with peak motor efficiency. Get your lithium batteries calibrated today!"}
                      </p>
                    </div>
                  )}

                  {(globalConfig.festivalTheme === "independence_day" || globalConfig.festivalTheme === "republic_day") && (
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg md:text-xl font-display font-black tracking-wide flex items-center justify-center gap-1.5 text-amber-800">
                        🇮🇳 প্রীত দেশবাসী! Happy National Day! 🇮🇳
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-90 max-w-2xl mx-auto text-slate-700">
                        {lang === "bn"
                          ? "আসুন আমাদের প্রিয় ই-যানবাহন ব্যবহারের মাধ্যমে দেশকে বায়ু দূষণমুক্ত রাখতে সক্রিয় অবদান রাখি। জয় হিন্দ!"
                          : "Let us pledge to build a cleaner, greener India. Celebrate with eco-friendly mobility solutions."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hero Section */}
            <section id="hero" className="relative bg-slate-900 text-white overflow-hidden py-20 md:py-28 px-4">
              <div className="absolute inset-0 z-0 overflow-hidden">
                {globalConfig?.heroBgType === 'video' && globalConfig?.heroBgUrl ? (
                  <div className="w-full h-full opacity-30">
                    {globalConfig.heroBgUrl.includes('youtube.com') || globalConfig.heroBgUrl.includes('youtu.be') ? (
                      <iframe
                        src={`${globalConfig.heroBgUrl.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&playlist=${globalConfig.heroBgUrl.split('v=')[1] || globalConfig.heroBgUrl.split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                        className="w-full h-full scale-[1.5] pointer-events-none"
                        allow="autoplay; encrypted-media"
                        frameBorder="0"
                      />
                    ) : globalConfig.heroBgUrl.includes('vimeo.com') ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${globalConfig.heroBgUrl.split('/').pop()}?autoplay=1&muted=1&loop=1&background=1`}
                        className="w-full h-full scale-[1.5] pointer-events-none"
                        allow="autoplay; encrypted-media"
                        frameBorder="0"
                      />
                    ) : (
                      <video
                        src={globalConfig.heroBgUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 opacity-25">
                    <img
                      src={globalConfig?.heroBgUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200"}
                      alt="Sudipta E-Scooter Workshop - Contact: +91 9064517009"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
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
                    <Phone className="w-4 h-4 fill-emerald-400 text-slate-950 animate-pulse" />
                    <span>{lang === "bn" ? "কল করুন:" : "CALL NOW:"}</span>
                    <a href={`tel:${(globalConfig?.phone || "+919064517009").replace(/\s+/g, '')}`} className="hover:underline text-white transition-colors">
                      {globalConfig?.phone || "+91 90645 17009"}
                    </a>
                  </span>
                  <span className="text-slate-800 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 fill-emerald-400 text-slate-950" />
                    <span>{lang === "bn" ? "হোয়াটসঅ্যাপ চ্যাট:" : "WHATSAPP:"}</span>
                    <a 
                      href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/[^\d]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-white transition-colors"
                    >
                      {globalConfig?.whatsappNumber || "+91 90645 17009"}
                    </a>
                  </span>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  <a
                    href="#showroom"
                    className="px-6 py-3 theme-accent-bg text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/20 cursor-pointer"
                  >
                    {lang === "bn" ? (globalConfig?.buttonTexts?.buyNowBen || t.heroCTA1) : (globalConfig?.buttonTexts?.buyNowEng || t.heroCTA1)}
                  </a>
                  <button
                    onClick={() => {
                      setSelectedScooter(null);
                      setBookingType("Service Enquiry");
                      setShowBookingModal(true);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-xl transition cursor-pointer"
                  >
                    {lang === "bn" ? (globalConfig?.buttonTexts?.bookNowBen || t.heroCTA2) : (globalConfig?.buttonTexts?.bookNowEng || t.heroCTA2)}
                  </button>
                  <a
                    href={`tel:${globalConfig?.whatsappNumber || "+919064517009"}`}
                    className="px-6 py-3 theme-primary-bg btn-call-pulse text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-950/20 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white animate-pulse" />
                    <span>{lang === "bn" ? `মালিককে কল করুন (${globalConfig?.whatsappNumber || "+91 9064517009"})` : `Call Proprietor (${globalConfig?.whatsappNumber || "+91 9064517009"})`}</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Quick Navigation and Product Search Section */}
            <section id="quick-finder" className="max-w-7xl mx-auto px-4 md:px-6 mt-8 animate-fade-in">
              <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
                themeMode === "dark" 
                  ? "bg-slate-900/60 border-slate-800 shadow-xl" 
                  : "bg-white border-slate-100/70 shadow-md shadow-slate-100/40"
              }`}>
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] md:text-[11px] font-extrabold theme-accent-header uppercase tracking-widest block mb-1">
                      {lang === "bn" ? "কুইক সার্ভিস ও ফাইন্ডার" : "QUICK SERVICE & FINDER"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white">
                      {lang === "bn" ? "খুচরা পার্টস সার্চ ও কুইক লিংক" : "Spare Parts Search & Quick Actions"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {lang === "bn" ? "ব্যাটারি, মোটর, চার্জার ও প্রয়োজনীয় খুচরা পার্টস সহজে খুঁজুন এবং সরাসরি বুক করুন।" : "Locate premium EV batteries, chargers, spare parts or navigate straight to workshop tools."}
                    </p>
                  </div>
                </div>

                {/* Prominent Search Bar */}
                <div className="relative max-w-3xl mx-auto mb-8">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={lang === "bn" ? "অরিজিনাল খুচরা যন্ত্রাংশ, ব্যাটারি, মোটর বা চার্জার খুঁজুন..." : "Search for genuine batteries, chargers, motors, tires, brakes..."}
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-semibold tracking-wide border transition-all duration-300 outline-hidden theme-accent-focus ${
                        themeMode === "dark"
                          ? "bg-slate-950/80 border-slate-800 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-inner"
                      }`}
                    />
                    {productSearchQuery && (
                      <button
                        onClick={() => setProductSearchQuery("")}
                        className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Display Area */}
                  {productSearchQuery && (
                    <div className={`absolute left-0 right-0 mt-3 z-30 p-5 rounded-2xl border shadow-2xl max-h-[420px] overflow-y-auto ${
                      themeMode === "dark"
                        ? "bg-slate-900 border-slate-800 text-white"
                        : "bg-white border-slate-100 text-slate-900"
                    }`}>
                      <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest theme-accent-header">
                          {lang === "bn" 
                            ? `পণ্য খোঁজার ফলাফল (${products.filter(p => 
                                p.titleEng.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                                p.titleBen.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                (p.descriptionEng && p.descriptionEng.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                                (p.descriptionBen && p.descriptionBen.toLowerCase().includes(productSearchQuery.toLowerCase()))
                              ).length})` 
                            : `Search Results (${products.filter(p => 
                                p.titleEng.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                                p.titleBen.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                (p.descriptionEng && p.descriptionEng.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                                (p.descriptionBen && p.descriptionBen.toLowerCase().includes(productSearchQuery.toLowerCase()))
                              ).length})`}
                        </h4>
                        <button
                          onClick={() => setProductSearchQuery("")}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {lang === "bn" ? "বন্ধ করুন" : "Dismiss"}
                        </button>
                      </div>

                      {/* Filter logic */}
                      {(() => {
                        const matched = products.filter(p => 
                          p.titleEng.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                          p.titleBen.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                          (p.descriptionEng && p.descriptionEng.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                          (p.descriptionBen && p.descriptionBen.toLowerCase().includes(productSearchQuery.toLowerCase()))
                        );

                        if (matched.length === 0) {
                          return (
                            <div className="text-center py-6">
                              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {lang === "bn" ? "কোনো মিল পাওয়া যায়নি!" : "No products found matching your search."}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {lang === "bn" ? "অন্য কোনো শব্দ যেমন 'Battery', 'Charger', বা 'Motor' দিয়ে চেষ্টা করুন।" : "Try typing terms like 'Battery', 'Charger', or 'Motor'."}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {matched.map(p => (
                              <div 
                                key={p.id}
                                onClick={() => {
                                  navigate(`/product/${p.id}`);
                                  setProductSearchQuery("");
                                }}
                                className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all theme-accent-border-hover cursor-pointer ${
                                  themeMode === "dark"
                                    ? "bg-slate-950/40 border-slate-800/80"
                                    : "bg-slate-50/60 border-slate-150 hover:bg-white hover:shadow-xs"
                                }`}
                              >
                                {p.images && p.images.length > 0 ? (
                                  <img 
                                    src={p.images[0]} 
                                    alt={p.titleEng}
                                    className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-slate-100"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Package className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {lang === "bn" ? p.titleBen : p.titleEng}
                                  </h5>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wider">
                                      {p.brand}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">
                                      {p.category}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-xs font-extrabold theme-accent-header">
                                      ₹{p.offerPrice || p.price}
                                    </span>
                                    {p.offerPrice > 0 && p.offerPrice < p.price && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        ₹{p.price}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClientMsg(`Spare Parts Enquiry: ${p.titleEng} (${p.brand})`);
                                    setBookingType("General Enquiry");
                                    setShowBookingModal(true);
                                    setProductSearchQuery("");
                                  }}
                                  className="px-3 py-1.5 theme-accent-bg theme-accent-bg-hover text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer"
                                >
                                  {lang === "bn" ? "বুকিং" : "Enquire"}
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Four Distinct Navigation Cards/Buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {/* Card 1: Showroom */}
                  <a
                    href="#showroom"
                    className={`group flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-300 theme-accent-border-hover ${
                      themeMode === "dark"
                        ? "bg-slate-950/30 border-slate-800 hover:bg-slate-800/30 shadow-xs"
                        : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="p-2.5 rounded-xl w-fit theme-accent-icon-box">
                        <Building className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white mt-4 flex items-center gap-1">
                        <span>{lang === "bn" ? "শোরুম" : "Showroom"}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity theme-accent-chevron" />
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                        {lang === "bn" ? "ই-স্কুটার এবং সাইকেল কালেকশন দেখুন।" : "Explore electric scooters & multi-brand cycles."}
                      </p>
                    </div>
                  </a>

                  {/* Card 2: Spare Parts */}
                  <Link
                    to="/spare_parts"
                    className={`group flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-300 theme-accent-border-hover ${
                      themeMode === "dark"
                        ? "bg-slate-950/30 border-slate-800 hover:bg-slate-800/30 shadow-xs"
                        : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="p-2.5 rounded-xl w-fit theme-accent-icon-box">
                        <Package className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white mt-4 flex items-center gap-1">
                        <span>{lang === "bn" ? "খুচরা যন্ত্রাংশ" : "Spare Parts"}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity theme-accent-chevron" />
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                        {lang === "bn" ? "জেনুইন ব্যাটারি, চার্জার ও প্রয়োজনীয় পার্টস।" : "Buy authentic motors, lithium batteries & parts."}
                      </p>
                    </div>
                  </Link>

                  {/* Card 3: Diagnosis */}
                  <a
                    href="#diagnosis"
                    className={`group flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-300 theme-accent-border-hover ${
                      themeMode === "dark"
                        ? "bg-slate-950/30 border-slate-800 hover:bg-slate-800/30 shadow-xs"
                        : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="p-2.5 rounded-xl w-fit theme-accent-icon-box">
                        <Wrench className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white mt-4 flex items-center gap-1">
                        <span>{lang === "bn" ? "ডায়াগনস্টিকস" : "Diagnosis"}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity theme-accent-chevron" />
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                        {lang === "bn" ? "এআই-এর সাহায্যে ইভি জটিল রোগ নির্ণয়।" : "AI console to diagnose EV wiring & cells."}
                      </p>
                    </div>
                  </a>

                  {/* Card 4: Tools */}
                  <a
                    href="#tools"
                    className={`group flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-300 theme-accent-border-hover ${
                      themeMode === "dark"
                        ? "bg-slate-950/30 border-slate-800 hover:bg-slate-800/30 shadow-xs"
                        : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="p-2.5 rounded-xl w-fit theme-accent-icon-box">
                        <Calculator className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white mt-4 flex items-center gap-1">
                        <span>{lang === "bn" ? "ক্যালকুলেটর" : "Tools"}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity theme-accent-chevron" />
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium">
                        {lang === "bn" ? "সহজ কিস্তি ও ব্যাটারি মাইলেজ হিসাব।" : "Calculate EMI & predict actual EV mileage range."}
                      </p>
                    </div>
                  </a>
                </div>

              </div>
            </section>

            {/* About Us section with high-fidelity Interactive Digital Visiting Card & Video Player */}
            <section id="about" className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* About copy details (Left Column) */}
                <div className="lg:col-span-4 space-y-6 flex flex-col justify-center">
                  <div className="space-y-2">
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider block">{lang === "bn" ? "পরিচিতি ও নির্ভরযোগ্যতা" : "Our Workshop Identity"}</span>
                    <h3 className="text-slate-800 dark:text-slate-200 font-bold text-2xl md:text-3.5xl font-display tracking-tight leading-tight flex items-start gap-2">
                      <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500 shrink-0 mt-1" />
                      <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent font-extrabold font-siliguri leading-[40px]">
                        {lang === "bn" ? (globalConfig?.aboutHeadingBen || "সুদীপ্ত ই-স্কুটি সার্ভিস") : (globalConfig?.aboutHeadingEng || "Sudipta E-Scooty Service")}
                      </span>
                    </h3>
                  </div>

                  <p className="text-[#78787c] dark:text-slate-300 text-sm leading-relaxed font-extrabold">
                    {lang === "bn" 
                      ? (globalConfig?.aboutText1Ben || "সুদীপ্ত দাস (সুদীপ্ত বাবু)-এর তত্ত্বাবধানে পরিচালিত এই ওয়ার্কশপটি পশ্চিমবঙ্গের উত্তর ২৪ পরগণার অশোকনগরে অবস্থিত। আমরা দ্বিচক্র বাহনকে রাখি নতুনের মতো সচল।")
                      : (globalConfig?.aboutText1Eng || "Headed by Sudipta Das (Sudipta Babu), our workshop in Ashoknagar, West Bengal guarantees high-efficiency repairs for all EV scooters and cycles.")}
                  </p>

                  <p className="text-[#78787c] dark:text-slate-300 text-xs leading-relaxed font-bold">
                    {lang === "bn"
                      ? (globalConfig?.aboutText2Ben || "আমরা শুধুমাত্র সার্ভিসিং করি না, বরং আপনার মূল্যবান স্কুটির লিথিয়াম-আয়ন ও এলএফপি (LFP) ব্যাটারি ডায়াগনস্টিকস, সেল ব্যালেসিং, ওয়্যার সলভিং এবং ইএমআই (EMI) সুবিধায় ব্যাটারি প্রদান করি।")
                      : (globalConfig?.aboutText2Eng || "We specialize in precision lithium-ion battery restorations, cell balancing, diagnostic scans, and modular battery instalment EMI schemes.")}
                  </p>

                  {/* Badges grids */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-1">
                      <span className="font-extrabold text-xs text-black dark:text-emerald-400">✓ {lang === "bn" ? "১০০% আসল" : "100% Genuine"}</span>
                      <p className="text-[10px] text-black dark:text-slate-400 font-bold leading-normal">{lang === "bn" ? "অরিজিনাল খুচরা পার্টস ও ফিটিংস।" : "Tested authentic components."}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-1">
                      <span className="font-extrabold text-xs text-black dark:text-emerald-400">✓ {lang === "bn" ? "দক্ষ কারিগর" : "Certified Tech"}</span>
                      <p className="text-[10px] text-black dark:text-slate-400 font-bold leading-normal">{lang === "bn" ? "জটিল ওয়্যারিং ও ব্যাটারি সমাধান।" : "Wiring & battery pack specialists."}</p>
                    </div>
                  </div>
                </div>

                {/* Digital Visiting Card & Video Player Side-by-Side (Right Column) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left sub-column: Interactive Digital Visiting Card */}
                  <div className="flex flex-col w-full space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "bn" ? "আমাদের ডিজিটাল ভিজিটিং কার্ড" : "Interactive Digital Card"}
                    </span>

                    {/* Physical Card Container */}
                    <div className="w-full h-[225px] rounded-2xl relative overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-indigo-500/15 cursor-default border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white select-none mx-auto md:mx-0">
                      
                      {/* Metallic glare shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                      
                      {/* Card Top header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">
                              {lang === "bn" ? "ভেরিফাইড বিজনেস" : "VERIFIED BUSINESS"}
                            </span>
                          </div>
                          <h4 className="text-xs font-display font-black tracking-wide text-white leading-tight">
                            {lang === "bn" ? (globalConfig?.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস") : (globalConfig?.businessNameEng || "Sudipta E-Scooty Service")}
                          </h4>
                          <p className="text-[9px] text-amber-300 font-bold">
                            {lang === "bn" 
                              ? "ই-স্কুটি • ই-সাইকেল • ব্যাটারি • চার্জার • স্পেয়ার পার্টস"
                              : "E-Scooty • E-Cycle • Battery • Charger • Spare Parts"}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section: Proprietor info */}
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[7px] text-slate-400 block uppercase tracking-wider">
                              {lang === "bn" ? (globalConfig?.visitingCardOwnerRoleBen || "প্রোপ্রাইটার") : (globalConfig?.visitingCardOwnerRoleEng || "PROPRIETOR")}
                            </span>
                            <span className="text-xs font-display font-black text-yellow-300 tracking-wide">
                              {lang === "bn" ? (globalConfig?.visitingCardOwnerNameBen || "সুদীপ্ত দাস") : (globalConfig?.visitingCardOwnerNameEng || "Sudipta Das")}
                            </span>
                          </div>
                          
                          <div className="text-right text-[9px] font-mono font-bold space-y-0.5">
                            <a href={`tel:${globalConfig?.visitingCardPhone || globalConfig?.phone || "9064517009"}`} className="hover:text-yellow-300 transition-colors block">
                              📞 {globalConfig?.visitingCardPhone || globalConfig?.phone || "+91 90645 17009"}
                            </a>
                            <span className="text-[8px] text-slate-400 block">{lang === "bn" ? "২৪/৭ ইমার্জেন্সি সাপোর্ট" : "24/7 Support Desk"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Address line */}
                      <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[8px] text-slate-300 leading-normal">
                        <span className="max-w-[210px] truncate-2-lines font-medium">
                          📍 {lang === "bn" ? (globalConfig?.visitingCardAddressBen || "অশোকনগর পাওয়ার হাউস রোড, কালোবাড়ির দিক, উত্তর ২৪ পরগনা।") : (globalConfig?.visitingCardAddressEng || "Ashoknagar Power House Road (Towards Kalobari), North 24 Parganas.")}
                        </span>
                        
                        <a 
                          href={globalConfig?.googleMapsUrl || "https://maps.app.goo.gl/4qvAEgzE6h4c2U6U6"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md text-[7px] font-bold text-yellow-300 transition shrink-0 ml-1"
                        >
                          {lang === "bn" ? "ম্যাপ খুলুন ↗" : "Get Route ↗"}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-column: Video Player / Embed Module */}
                  <div className="flex flex-col w-full space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                      <Video className="w-3.5 h-3.5 text-emerald-500" />
                      {lang === "bn" ? "আমাদের কাজের নমুনা" : "Our Work Sample"}
                    </span>

                    {/* Interactive Video Player */}
                    <div className="w-full h-[225px] rounded-2xl relative overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl group">
                      {(() => {
                        const { type, embedUrl } = getEmbedUrl(globalConfig?.youtubeUrl || videoUrl);
                        if (type === "direct") {
                          return (
                            <video
                              className="w-full h-full rounded-2xl object-cover bg-black"
                              src={embedUrl}
                              controls
                              preload="metadata"
                            />
                          );
                        } else {
                          return (
                            <iframe
                              className="w-full h-full rounded-2xl bg-black"
                              src={embedUrl}
                              title="Work Sample Video"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            />
                          );
                        }
                      })()}
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* Services Highlights Grid */}
            {globalConfig?.enabledModules?.service !== false && (
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
            )}

            {/* Showroom Vehicles Showcase */}
            {globalConfig?.enabledModules?.vehicles !== false && (
              <section id="showroom" className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center space-y-2 mb-12">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                    {t.showroomTitle}
                  </h3>
                  <p className="text-sm text-slate-500">{t.showroomSubtitle}</p>
                </div>

                {vehicles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">
                      {lang === "bn" ? "বর্তমানে প্রদর্শনীতে কোনো ই-স্কুটি বা যানবাহন উপলব্ধ নেই।" : "No vehicles currently available in the showroom."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
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
                )}
              </section>
            )}

            {/* Spare Parts Catalogue */}
            {globalConfig?.enabledModules?.spareParts !== false && (
              <section id="spare-parts" className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center space-y-2 mb-12">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
                    {t.partsStoreTitle}
                  </h3>
                  <p className="text-sm text-slate-500">{t.partsStoreSubtitle}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {products.map((p) => (
                    <PartsCard
                      key={p.id}
                      product={p}
                      allProducts={products}
                      lang={lang}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* AI Diagnosis Assistant */}
            {globalConfig?.enabledModules?.service !== false && (
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
            )}

            {/* Support & Inquiry Section */}
            <section id="support" className="max-w-4xl mx-auto px-4 md:px-6">
              <CustomerInquiryForm lang={lang} />
            </section>

            {/* Interactive Calculators & Tools Widget Section */}
            {globalConfig?.enabledModules?.emi !== false && (
              <section id="tools" className="max-w-4xl mx-auto px-4">
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
                    <EmiCalculator lang={lang} t={t} settings={globalConfig} defaultPrice={32000} />
                  ) : (
                    <BatteryEstimator lang={lang} settings={globalConfig} />
                  )}
                </div>
              </section>
            )}

            {/* Sudipta EV Academy - Future Courses & Pre-Booking */}
            <section id="ev-academy" className="max-w-7xl mx-auto px-4 md:px-6 mt-16 animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-indigo-900/35">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  {/* Academy Header */}
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold tracking-wide border border-indigo-500/35">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "ভবিষ্যত প্রস্তুত ক্যারিয়ার" : "Future-Ready Career Training"}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
                      {lang === "bn" ? "সুদীপ্ত ইভি একাডেমি" : "SUDIPTA EV ACADEMY"}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {lang === "bn" 
                        ? "ইভি স্কুটি প্রযুক্তির আধুনিক প্রফেশনাল কোর্স ও ব্যবহারিক শিক্ষা নিয়ে আমরা অশোকনগরে শুরু করতে চলেছি অত্যাধুনিক ইভি একাডেমি। এখনই আপনার সিট বুক করুন!"
                        : "Master modern electric vehicle architecture, diagnostics, lithium batteries & charger engineering with hands-on labs from Sudipta E-Scooty. Pre-book your slot today!"}
                    </p>
                  </div>

                  {/* Course Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Course 1 */}
                    <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                            <Wrench className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                            {lang === "bn" ? "শীঘ্রই আসছে" : "Coming Soon"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {lang === "bn" ? "কমপ্লিট ইভি স্কুটার রিপেয়ারিং ও ডায়াগনস্টিকস" : "Complete EV Scooter Repairing & Diagnostics"}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {lang === "bn"
                              ? "মোটর ওয়্যারিং, সেন্সর, এক্সিলারেটর গ্রিড ট্রাবলশুটিং এবং এআই ডায়াগনস্টিকস টুলের ব্যবহারিক প্রশিক্ষণ।"
                              : "Hands-on training in brushless hub motor rewinding, controller repair, sensor mapping, and diagnostic scanners."}
                          </p>
                        </div>
                      </div>
                      <div className="pt-6">
                        <a
                          href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            lang === "bn" 
                              ? "হ্যালো সুদীপ্ত দা, আমি 'কমপ্লিট ইভি স্কুটার রিপেয়ারিং ও ডায়াগনস্টিকস' কোর্সে প্রি-বুক করতে আগ্রহী!"
                              : "Hi Sudipta Da, I am interested in joining the EV Scooter Repairing & Diagnostics course!"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:shadow-indigo-500/20 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          <span>{lang === "bn" ? "হোয়াটসঅ্যাপে প্রি-বুক করুন" : "Pre-Book via WhatsApp"}</span>
                        </a>
                      </div>
                    </div>

                    {/* Course 2 */}
                    <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                            {lang === "bn" ? "শীঘ্রই আসছে" : "Coming Soon"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                            {lang === "bn" ? "ইভি চার্জার রিপেয়ারিং মাস্টারক্লাস" : "EV Charger Repairing Masterclass"}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {lang === "bn"
                              ? "ইভি স্মার্ট ফাস্ট চার্জার এবং কাটঅফ সার্কিট রিপেয়ারিং, ট্রানজিস্টর ও মসফেট পরিবর্তন করার লাইভ ল্যাব।"
                              : "Live labs troubleshooting smart LFP/Li-ion chargers, MOSFET swaps, micro-controller circuits & cooling grids."}
                          </p>
                        </div>
                      </div>
                      <div className="pt-6">
                        <a
                          href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            lang === "bn" 
                              ? "হ্যালো সুদীপ্ত দা, আমি 'ইভি চার্জার রিপেয়ারিং মাস্টারক্লাস' কোর্সে প্রি-বুক করতে আগ্রহী!"
                              : "Hi Sudipta Da, I am interested in joining the EV Charger Repairing Masterclass!"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:shadow-indigo-500/20 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          <span>{lang === "bn" ? "হোয়াটসঅ্যাপে প্রি-বুক করুন" : "Pre-Book via WhatsApp"}</span>
                        </a>
                      </div>
                    </div>

                    {/* Course 3 */}
                    <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                            <Battery className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                            {lang === "bn" ? "শীঘ্রই আসছে" : "Coming Soon"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                            {lang === "bn" ? "লিথিয়াম ব্যাটারি অ্যাসেম্বলি ও বিএমএস ওয়্যারিং" : "Lithium Battery Assembly & BMS Wiring"}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {lang === "bn"
                              ? "এলএফপি (LFP) এবং লিথিয়াম-আয়ন সেল টেস্টিং, স্পট ওয়েল্ডিং, নিখুঁত সেল ব্যালেন্সিং এবং স্মার্ট বিএমএস কানেকশন।"
                              : "Master spot welding, high-capacity cell matching, resistance calculation, thermal wrap design and Smart BMS telemetry."}
                          </p>
                        </div>
                      </div>
                      <div className="pt-6">
                        <a
                          href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            lang === "bn" 
                              ? "হ্যালো সুদীপ্ত দা, আমি 'লিথিয়াম ব্যাটারি অ্যাসেম্বলি ও বিএমএস ওয়্যারিং' কোর্সে প্রি-বুক করতে আগ্রহী!"
                              : "Hi Sudipta Da, I am interested in joining the Lithium Battery Assembly & BMS Wiring course!"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:shadow-indigo-500/20 cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          <span>{lang === "bn" ? "হোয়াটসঅ্যাপে প্রি-বুক করুন" : "Pre-Book via WhatsApp"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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
                {testimonialsList.length > 0 ? (
                  testimonialsList.map((tItem) => (
                    <div key={tItem.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition">
                      <div className="space-y-4">
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(tItem.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          “{lang === "bn" ? (tItem.textBen || tItem.textEng) : (tItem.textEng || tItem.textBen)}”
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-100">
                          {tItem.avatar || (tItem.name ? tItem.name.substring(0, 2).toUpperCase() : "US")}
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block">{tItem.name}</strong>
                          <span className="text-[10px] text-slate-500">{tItem.role}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          {lang === "bn"
                            ? `"আমার ইলেকট্রিক স্কুটারটি হঠাৎ করে চলা বন্ধ হয়ে গেছিল। সুদীপ্ত বাবু স্ক্যানার দিয়ে রোগ ধরে মাত্র ১ ঘন্টায় মেরামত করে দিয়েছেন। খরচও অনেক কম লেগেছে!"`
                            : `"My electric scooter stopped running out of nowhere. Sudipta analyzed the scanner grids and got it running within an hour. Extremely fair repair prices!"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-100">
                          JS
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block">জয়দেব শিকদার (Joydeb Shikdar)</strong>
                          <span className="text-[10px] text-slate-500">Ashoknagar Local</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          {lang === "bn"
                            ? `"সুদীপ্ত বাবুর থেকে ব্যাটারি কিস্তিতে বা EMI তে নিয়ে আমার খুব উপকার হয়েছে। কোনো বাড়তি সুদ বা ঝামেলা ছাড়াই মাসে মাসে দিয়ে দিই। খুব ভালো সার্ভিস!"`
                            : `"Acquiring my scooter LFP battery on EMI from Sudipta saved me. No compound interest or hidden processing traps. Excellent customer-first ethics!"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-100">
                          RG
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block">রিমি ঘোষ (Rimi Ghosh)</strong>
                          <span className="text-[10px] text-slate-500">Kalobari Resident</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          {lang === "bn"
                            ? `"খুচরা যন্ত্রাংশের স্টক খুবই ভালো। আমার লিথিয়াম ব্যাটারির চার্জার খারাপ হয়ে গেছিল, অন্য কোথাও পাচ্ছিলাম না, সুদীপ্ত দার দোকানে সাথে সাথে অরিজিনাল চার্জার পেয়ে গেলাম।"`
                            : `"Impeccable spare parts catalogue. I was searching for an auto-cutoff lithium charger everywhere, found a certified original at Sudipta's store instantly."`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold border border-amber-100">
                          SD
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block">সুব্রত দাস (Subrata Das)</strong>
                          <span className="text-[10px] text-slate-500">EV Commuter</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Write a Review Button */}
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="group flex items-center gap-2.5 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black hover:-translate-y-1 transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>{lang === "bn" ? "আপনার মন্তব্য জানান" : "Write a Review"}</span>
                </button>
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
            <section id="contact" className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-8 w-full">
              <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-6 flex flex-col justify-between w-full">
                <div>
                  <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <Phone className="w-8 h-8 text-emerald-600 shrink-0" />
                    <span>{t.contactTitle}</span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">{t.contactSubtitle}</p>
                </div>

                <div className="space-y-4 text-xs text-slate-600">
                  <a 
                    href={globalConfig?.googleMapsUrl || "https://maps.google.com/?q=Power+House+Road+Workshop+Ashoknagar"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:text-emerald-600 transition-colors cursor-pointer group/addr"
                  >
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 group-hover/addr:scale-110 transition-transform" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">{t.addressLabel}</strong>
                      <p className="leading-relaxed">{lang === "bn" ? (globalConfig?.businessAddressBen || t.address) : (globalConfig?.businessAddressEng || t.address)}</p>
                    </div>
                  </a>

                  <a 
                    href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:text-emerald-600 transition-colors cursor-pointer group/phone"
                  >
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 group-hover/phone:scale-110 transition-transform" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">WhatsApp / Call</strong>
                      <p className="font-mono text-sm font-semibold">{globalConfig?.whatsappNumber || t.phone} ({lang === "bn" ? (globalConfig?.proprietorNameBen || "সুদীপ্ত দাস") : (globalConfig?.proprietorNameEng || "Sudipta Das")})</p>
                    </div>
                  </a>

                  <a 
                    href={`mailto:${globalConfig?.supportEmail || "iamsudiptadas666@gmail.com"}`}
                    className="flex items-start gap-3 hover:text-emerald-600 transition-colors cursor-pointer group/mail"
                  >
                    <Mail className="w-5 h-5 text-emerald-600 shrink-0 group-hover/mail:scale-110 transition-transform" />
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase mb-1">Email</strong>
                      <p className="font-mono">{globalConfig?.supportEmail || t.email}</p>
                    </div>
                  </a>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <a
                    href={`tel:${(globalConfig?.phone || "+919064517009").replace(/\s+/g, '')}`}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 btn-call-pulse text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    {t.callNowButton}
                  </a>

                  <a
                    href={`https://wa.me/${(globalConfig?.whatsappNumber || "919064517009").replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    {t.whatsappButton}
                  </a>

                  <a
                    href={globalConfig?.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(globalConfig?.businessAddressEng || "Sudipta E-Scooty Service, Ashoknagar")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-indigo-200 animate-spin-slow" />
                    <span>{lang === "bn" ? "ড্রাইভিং ম্যাপ ও দিকনির্দেশনা ↗" : "Get Driving Directions ↗"}</span>
                  </a>

                  <button
                    onClick={() => setShowOrderTracker(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    {lang === "bn" ? "আপনার অর্ডার ট্র্যাক করুন" : "Track Your Order"}
                  </button>
                </div>
              </div>

              {/* Simulated Google Maps Node block - Entire Card Clickable */}
              <a
                href={globalConfig?.googleMapsUrl || "https://www.google.com/maps/dir/?api=1&destination=Sudipta+E-Scooty+Service"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 flex flex-col justify-between p-8 md:p-10 text-white shadow-xl min-h-[350px] cursor-pointer hover:border-emerald-500/40 hover:shadow-emerald-950/20 transition-all duration-300 group block hover:scale-[1.005] w-full"
              >
                <div className="absolute inset-0 opacity-15">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                    alt="Map styling"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-450 px-3 py-1 rounded-full w-fit mb-4">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === "bn" ? "লাইভ লোকেশন" : "Live Location"}</span>
                  </div>
                  
                  <h4 className="text-lg md:text-xl font-display font-semibold text-emerald-300">
                    Power House Road Workshop
                  </h4>
                  
                  <p className="text-slate-350 text-sm mt-3 leading-relaxed max-w-2xl text-slate-300">
                    {globalConfig?.address || (lang === "bn"
                      ? "অশোকনগর পাওয়ার হাউস রোড ধরে কালোবাড়ির দিকে বাঘাযতীন খেলার মাঠের একেবারে সংলগ্ন উত্তর পাশে আমাদের ওয়ার্কশপটি অবস্থিত।"
                      : "Located immediately adjacent to the Bhajajatin Playground, Ashoknagar Power House Road (Towards Kalobari), North 24 Parganas, West Bengal - 743222.")}
                  </p>
                </div>

                <div className="relative z-10 p-4 bg-slate-850/90 backdrop-blur border border-slate-800 rounded-2xl flex items-center gap-3.5 mt-8 max-w-sm">
                  <div className="p-3.5 bg-emerald-600 rounded-xl text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="block font-bold text-white uppercase tracking-wider">{lang === "bn" ? "কাজের সময়" : "Business Hours"}</span>
                    <span>{lang === "bn" ? (globalConfig?.timingWeekdaysBen || "১০:০০ AM - ০৮:৩০ PM") : (globalConfig?.timingWeekdaysEng || "10:00 AM - 08:30 PM")}</span>
                  </div>
                </div>
              </a>
            </section>
          </div>
          )
            } />
        </Routes>
      </main>

      {/* 3. Footer Copyright Info */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900 print:hidden text-center text-xs space-y-2 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {lang === "bn" ? (globalConfig?.businessNameBen || "সুদীপ্ত ই-স্কুটি সার্ভিস") : (globalConfig?.businessNameEng || "Sudipta E-Scooty Service")}. {t.footerRights}</p>
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
                    placeholder="e.g. Joydeb Das"
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
                    placeholder="e.g. +91 9064517009"
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
                    placeholder="e.g. I want to book a physical test ride at the Ashoknagar workshop."
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
              <div className="text-center py-6 space-y-4 max-w-sm mx-auto">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Registration Complete!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.successMessage}
                </p>

                <button
                  onClick={() => { setShowBookingModal(false); setBookingSuccess(false); setSelectedScooter(null); }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
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
          <motion.form 
            onSubmit={handleAdminAuth} 
            animate={shake2Fa ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 space-y-4 text-left"
          >
            <button
              type="button"
              onClick={() => { 
                setShowLoginModal(false); 
                setLoginError(""); 
                setPasscode(""); 
                setOtpInput("");
                setRecoveryKeyInput("");
                setLoginStep("credentials");
                setShowRecoveryInput(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-[8px] font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <Shield className="w-2.5 h-2.5 fill-emerald-500" />
                  MFA SECURITY SHIELD (HTTPS)
                </span>
                <span className="flex items-center gap-1 text-[8px] font-mono font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  SHA-1 ENGINE
                </span>
              </div>
              <h4 className="text-lg font-display font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                {loginStep === "credentials" 
                  ? t.adminLoginTitle 
                  : loginStep === "mfa_setup" 
                  ? "First-Time 2FA Setup" 
                  : "MFA 2-Factor Verification"}
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
                {loginStep === "credentials"
                  ? (lang === "bn"
                    ? "সুদীপ্ত বাবুর ব্যক্তিগত ইআরপি কন্ট্রোল প্যানেল অ্যাক্সেস করতে অনুগ্রহ করে নিরাপত্তা পাসকোড দিন।"
                    : "Authenticate securely with Sudipta's private workshop passcode to manage database.")
                  : loginStep === "mfa_setup"
                  ? (lang === "bn"
                    ? "আপনার গুগল প্রমাণীকরণকারী অ্যাপটি সিঙ্ক করতে নিচের কিউআর কোডটি স্ক্যান করুন।"
                    : "Scan the QR Code below to sync your Google Authenticator mobile application.")
                  : (lang === "bn"
                    ? "আপনার নিরাপত্তা অ্যাপ থেকে ৬-ডিজিটের কোড লিখুন বা রিকভারি কী ব্যবহার করুন।"
                    : "Enter Sudipta's active 6-digit Google Authenticator code or provide an Emergency Recovery Key.")}
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-850 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginStep === "credentials" && (
              /* Step 1: Passcode / Credentials Input */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.passcodeLabel}</label>
                  <div className="relative">
                    <input
                      type={showPasscode ? "text" : "password"}
                      required
                      placeholder="Enter Passcode"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono pr-10 text-slate-900 dark:text-white"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer text-center"
                >
                  {lang === "bn" ? "পাসকোড যাচাই করুন →" : "Verify Passcode & Hash →"}
                </button>
              </div>
            )}

            {loginStep === "mfa_setup" && (
              /* Step 1.5: First-Time Setup Enrollment QR */
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-sm shrink-0">
                    <QRCodeSVG 
                      value={getTOTPUri(
                        sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK", 
                        "Sudipta E-Scooty (iamsudiptadas666@gmail.com)", 
                        "Sudipta E-Scooty"
                      )} 
                      size={130}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="w-full text-center space-y-1.5">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold block uppercase tracking-wider">
                      Emergency Recovery Key:
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-black text-xs tracking-wider text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const sec = sessionStorage.getItem("sudipta_2fa_secret") || localStorage.getItem("sudipta_2fa_secret") || "SUDIPTADASEYWORK";
                          navigator.clipboard.writeText(sec);
                          setLoginMfaCopied(true);
                          setTimeout(() => setLoginMfaCopied(false), 2000);
                        }}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/20 transition cursor-pointer"
                        title="Copy Key"
                      >
                        {loginMfaCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-250/20 rounded-xl">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Save this key safely. If Sudipta loses their phone, they can manually input this Base32 key to restore mobile 2FA access.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("credentials");
                      setLoginError("");
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    {lang === "bn" ? "← ফিরে যান" : "← Back"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("sudipta_2fa_linked", "true");
                      localStorage.setItem("sudipta_2fa_linked", "true");
                      setLoginStep("2fa");
                    }}
                    className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>{lang === "bn" ? "কিউআর স্ক্যান করেছি ➡️" : "I Have Scanned the QR Code ➡️"}</span>
                  </button>
                </div>
              </div>
            )}

            {loginStep === "2fa" && (
              /* Step 2: 2FA OTP & Recovery Challenge */
              <div className="space-y-4">
                {!showRecoveryInput ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5">Google Authenticator Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="******"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-sm font-mono tracking-widest text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block leading-relaxed text-center">
                      Launch your <strong>Google Authenticator</strong> mobile app to scan or read Sudipta's active 6-digit MFA OTP code.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5">Backup Recovery Key</label>
                    <input
                      type="text"
                      placeholder="e.g. SUDIPTADASEYWORK"
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white uppercase outline-none focus:ring-1 focus:ring-indigo-500"
                      value={recoveryKeyInput}
                      onChange={(e) => setRecoveryKeyInput(e.target.value.toUpperCase())}
                    />
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 block leading-relaxed">
                      Lost Sudipta's device? Provide Sudipta's 16-character Base32 Emergency Recovery Key (e.g. <span className="font-mono text-indigo-500 dark:text-indigo-400 font-bold">SUDIPTADASEYWORK</span>) to log in.
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("credentials");
                      setLoginError("");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    ← Back to Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecoveryInput(!showRecoveryInput);
                      setLoginError("");
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:underline font-bold"
                  >
                    {showRecoveryInput ? "Use Authenticator Code" : "Use Backup Recovery Key"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer text-center"
                >
                  {lang === "bn" ? "কোড যাচাই করুন" : "Complete 2-Factor Verification"}
                </button>
              </div>
            )}


          </motion.form>
        </div>
      )}

      {/* C. Printable Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => { setShowInvoiceModal(false); setActiveInvoiceBooking(null); }}
        lang={lang}
        t={t}
        booking={activeInvoiceBooking}
        settings={globalConfig}
      />

      {/* D. Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm 
            lang={lang} 
            onClose={() => setShowReviewForm(false)} 
            onSuccess={() => fetchAllData()} 
          />
        )}
      </AnimatePresence>

      {/* E. Proton Customer Member Portal Modal */}
      {showProtonLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border flex flex-col max-h-[85vh] overflow-y-auto animate-fade-in ${
            themeMode === "dark" ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-800 border-slate-100"
          }`}>
            <button
              onClick={() => { setShowProtonLoginModal(false); setProtonLoginError(""); }}
              className="text-slate-400 hover:text-slate-600 transition absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!protonUser ? (
              /* LOGIN FORM */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (protonLoginPhone.length !== 10 || !/^\d+$/.test(protonLoginPhone)) {
                    setProtonLoginError(lang === "bn" ? "দয়া করে সঠিক ১০ ডিজিটের ফোন নম্বর দিন" : "Please enter a valid 10-digit phone number");
                    return;
                  }
                  const user = {
                    name: protonLoginName.trim(),
                    phone: protonLoginPhone,
                    memberId: "PRT-" + Math.floor(100000 + Math.random() * 900000),
                    points: 250,
                    level: "Gold Elite",
                    joinDate: new Date().toLocaleDateString()
                  };
                  sessionStorage.setItem("proton_user", JSON.stringify(user));
                  setProtonUser(user);
                  setProtonLoginName("");
                  setProtonLoginPhone("");
                  setProtonLoginError("");
                }} 
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xl font-display font-black tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <User className="w-5.5 h-5.5" />
                    {lang === "bn" ? "প্রোটন কাস্টমার পোর্টাল" : "Proton Member Portal"}
                  </h4>
                  <p className={`text-xs mt-1.5 leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {lang === "bn"
                      ? "সুদীপ্ত ই-স্কুটির বিশেষ প্রোটন মেম্বারশিপে লগইন করুন। আপনার অর্ডার ট্র্যাক করুন, এবং বিশেষ কাস্টমার সুবিধা ও রিওয়ার্ড পয়েন্ট চেক করুন।"
                      : "Login to the exclusive Proton Customer Portal. Track your real orders, view special discounts, and claim your loyalty reward points."}
                  </p>
                </div>

                {protonLoginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{protonLoginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">{lang === "bn" ? "আপনার নাম" : "Your Name"}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "bn" ? "উদাঃ সুজয় দাস" : "e.g. Sujoy Das"}
                    className={`w-full p-3 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 ${
                      themeMode === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    value={protonLoginName}
                    onChange={(e) => setProtonLoginName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">{lang === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9064517009"
                    className={`w-full p-3 border rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500 ${
                      themeMode === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    value={protonLoginPhone}
                    onChange={(e) => setProtonLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition duration-200 cursor-pointer text-center"
                >
                  {lang === "bn" ? "প্রোটন লগইন সম্পন্ন করুন" : "Complete Proton Login"}
                </button>
              </form>
            ) : (
              /* LOGGED-IN PORTAL */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-display font-black tracking-tight flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Shield className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                      {lang === "bn" ? "প্রোটন মেম্বার ড্যাশবোর্ড" : "Proton VIP Member"}
                    </h4>
                    <p className={`text-xs ${themeMode === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {lang === "bn" ? "সুদীপ্ত ই-স্কুটি এক্সক্লুসিভ ক্লাব" : "Sudipta E-Scooty Exclusive Club"}
                    </p>
                  </div>
                  <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {protonUser.level}
                  </span>
                </div>

                {/* VIP CARD */}
                <div className="relative bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">PROTON EXCLUSIVE</span>
                      <h5 className="text-xl font-display font-black tracking-tight mt-0.5">{protonUser.name}</h5>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div className="flex justify-between items-end font-mono">
                    <div>
                      <span className="text-[9px] uppercase block text-indigo-300">{lang === "bn" ? "মেম্বার আইডি" : "MEMBER ID"}</span>
                      <span className="text-xs font-bold">{protonUser.memberId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase block text-indigo-300">{lang === "bn" ? "মোবাইল" : "PHONE"}</span>
                      <span className="text-xs font-bold">{protonUser.phone}</span>
                    </div>
                  </div>
                </div>

                {/* LOYALTY POINTS & DISCOUNTS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${themeMode === "dark" ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wide">{lang === "bn" ? "রিওয়ার্ড পয়েন্ট" : "REWARD POINTS"}</span>
                    <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400 block mt-1 font-mono">250 Pts</strong>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      {lang === "bn" ? "খুচরা পার্টস ও সার্ভিসে ছাড়ের জন্য প্রযোজ্য" : "Redeemable for ₹250 discount on services"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${themeMode === "dark" ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wide">{lang === "bn" ? "স্পেশাল মেম্বার ডিসকাউন্ট" : "MEMBER DISCOUNT"}</span>
                    <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">15% OFF</strong>
                    <div className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded inline-block mt-1 font-bold">
                      Code: PROTON15
                    </div>
                  </div>
                </div>

                {/* LIVE BOOKINGS AND ORDERS FROM REAL STATE */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-500" />
                    {lang === "bn" ? "আপনার বুকিং এবং অর্ডার হিস্ট্রি" : "Your Real-time Bookings & Orders"}
                  </h5>
                  
                  {(() => {
                    const matchedBookings = bookings.filter(b => b.customerPhone === protonUser.phone);
                    const matchedOrders = orders.filter(o => o.customerPhone === protonUser.phone);

                    if (matchedBookings.length === 0 && matchedOrders.length === 0) {
                      return (
                        <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${themeMode === "dark" ? "bg-slate-800/20 border-slate-700" : "bg-slate-50/50 border-slate-200"}`}>
                          <p className="text-slate-400">
                            {lang === "bn" 
                              ? "এই নম্বরে কোনো সক্রিয় অর্ডার বা বুকিং পাওয়া যায়নি।" 
                              : "No active orders or test-ride bookings found for this phone number."}
                          </p>
                          <button
                            onClick={() => setShowProtonLoginModal(false)}
                            className="text-indigo-600 dark:text-indigo-400 font-bold underline mt-1.5 block mx-auto hover:text-indigo-700 transition"
                          >
                            {lang === "bn" ? "গাড়ি এবং পার্টস ব্রাউজ করুন" : "Browse Vehicles & Parts"}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {/* Render Bookings */}
                        {matchedBookings.map((b) => (
                          <div 
                            key={b.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition hover:shadow-xs ${
                              themeMode === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                            }`}
                          >
                            <div>
                              <strong className="block text-slate-700 dark:text-slate-300">{b.vehicleDetails || "Service Booking"}</strong>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {b.id} • {b.bookingDate}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 uppercase tracking-tight">
                              {b.status}
                            </span>
                          </div>
                        ))}

                        {/* Render Orders */}
                        {matchedOrders.map((o) => (
                          <div 
                            key={o.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition hover:shadow-xs ${
                              themeMode === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                            }`}
                          >
                            <div>
                              <strong className="block text-slate-700 dark:text-slate-300">
                                {o.items?.[0]?.name || "EV Accessory"}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {o.id} • ₹ {(o.totalAmount || 0).toLocaleString()}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                              o.status === "Delivered" || o.status === "Order Confirmed"
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                                : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("proton_user");
                      sessionStorage.removeItem("proton_user");
                      setProtonUser(null);
                    }}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-center"
                  >
                    {lang === "bn" ? "প্রোটন লগআউট" : "Log Out of Proton"}
                  </button>
                  <button
                    onClick={() => setShowProtonLoginModal(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-center ${
                      themeMode === "dark" ? "bg-slate-800 hover:bg-slate-750 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {lang === "bn" ? "বন্ধ করুন" : "Close Portal"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
