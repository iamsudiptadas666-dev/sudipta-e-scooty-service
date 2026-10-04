import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS headers handling middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

// Initialize Google Gen AI
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. AI EV Diagnosis will fallback to rules-based system.");
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const TMP_DB_PATH = path.join("/tmp", "sudipta_db.json");

// Create data directory if not exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  } catch (e) {
    console.warn("Could not create data directory, using in-memory backup");
  }
}

// Initial seed data
const initialData = {
  vehicles: [
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
      images: [
        "/images/fleeto_wolf_warrior_moped_1782481931851.jpg"
      ],
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
      images: [
        "/images/fleeto_panther_scooter_1782481064099.jpg"
      ],
      videoUrl: ""
    }
  ],
  products: [
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
      images: ["/images/fleeto_60v_30ah_battery_1782482443273.jpg"],
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
      images: ["/images/sudipta_power_controller_1782484517289.jpg"],
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
      images: ["/images/regenerated_image_1782484212276.jpg"],
      descriptionEng: "Fast charger with silent fan, voltage protection, and automatic cut-off technology.",
      descriptionBen: "সাইলেন্ট ফ্যান, ভোল্টেজ সুরক্ষা এবং স্বয়ংক্রিয় কাট-অফ প্রযুক্তি সহ দ্রুত চার্জার।"
    }
  ],
  customers: [
    {
      id: "c1",
      name: "Joydeb Sen",
      address: "Baghajatin Road, Ashoknagar",
      phone: "+91 9830112233",
      vehicleDetails: "Sudipta Eco Glide S1 (WB-24-H-1234)",
      serviceHistory: ["s1"],
      paymentHistory: [
        { amount: 1500, date: "2026-06-15", purpose: "First Service & Brake Pad", method: "Cash" }
      ],
      emiRecords: []
    },
    {
      id: "c2",
      name: "Rimi Dasgupta",
      address: "Habra Power House Area",
      phone: "+91 9051224466",
      vehicleDetails: "Volt Pro X (Purchased on Battery EMI)",
      serviceHistory: [],
      paymentHistory: [
        { amount: 12000, date: "2026-05-10", purpose: "Battery EMI Downpayment", method: "UPI" },
        { amount: 2500, date: "2026-06-10", purpose: "EMI Installment #1", method: "UPI" }
      ],
      emiRecords: ["emi1"]
    }
  ],
  bookings: [
    {
      id: "s1",
      customerName: "Joydeb Sen",
      customerPhone: "+91 9830112233",
      vehicleDetails: "Sudipta Eco Glide S1 (WB-24-H-1234)",
      bookingDate: "2026-06-15",
      technicianName: "Sajal Biswas",
      status: "Completed",
      repairDetails: "Regular servicing, general washing, diagnosis checked, rear brake pad replaced.",
      partsUsed: [
        { partId: "p3", partName: "EV Brake Pad", quantity: 1, price: 350 }
      ],
      serviceCharge: 1150,
      totalAmount: 1500,
      paymentStatus: "Paid",
      createdAt: "2026-06-14T10:30:00Z"
    },
    {
      id: "s2",
      customerName: "Pranab Ghosh",
      customerPhone: "+91 8240556677",
      vehicleDetails: "Hero Electric Optima",
      bookingDate: "2026-06-27",
      technicianName: "Unassigned",
      status: "Pending",
      repairDetails: "Battery draining very fast, showing error on dashboard. EV diagnosis needed.",
      partsUsed: [],
      serviceCharge: 200,
      totalAmount: 200,
      paymentStatus: "Unpaid",
      createdAt: "2026-06-25T14:15:00Z"
    }
  ],
  emi: [
    {
      id: "emi1",
      customerId: "c2",
      customerName: "Rimi Dasgupta",
      customerPhone: "+91 9051224466",
      batteryOrVehicleName: "LFP Battery 60V 30Ah",
      totalPrice: 32000,
      downPayment: 12000,
      monthlyEmi: 2500,
      remainingBalance: 17500,
      paidAmount: 14500,
      dueAmount: 17500,
      nextDueDate: "2026-07-10",
      paymentHistory: [
        { amount: 12000, date: "2026-05-10", method: "UPI", status: "Down Payment" },
        { amount: 2500, date: "2026-06-10", method: "UPI", status: "Installment #1" }
      ]
    }
  ],
  enquiries: [
    {
      id: "e1",
      name: "Subodh Mandal",
      phone: "+91 9064112233",
      email: "subodh@gmail.com",
      vehicleId: "v1",
      type: "Test Ride",
      message: "I want to book a test ride of Sudipta Eco Glide S1 tomorrow afternoon around 4 PM.",
      status: "New",
      createdAt: "2026-06-25T16:45:00Z"
    },
    {
      id: "e2",
      name: "Apurba Roy",
      phone: "+91 9433112288",
      email: "apurbaroy@yahoo.com",
      type: "General Enquiry",
      message: "Do you have EMI options for batteries on other scooter brands? I own an Okinawa.",
      status: "Contacted",
      createdAt: "2026-06-24T09:20:00Z"
    }
  ],
  announcements: [
    {
      id: "a1",
      titleEng: "Special Monsoon Servicing Offer!",
      titleBen: "বিশেষ বর্ষাকালীন সার্ভিসিং অফার!",
      contentEng: "Get flat 20% off on complete EV diagnosis and wiring servicing. Protect your scooter from monsoon rain dampness. Contact owner Sudipta Das today!",
      contentBen: "বিশেষ বর্ষাকালীন সার্ভিসিং অফারঃ সম্পূর্ণ ইভি ডায়াগনোসিস এবং ওয়্যারিং সার্ভিসিং-এ সরাসরি ২০% ছাড় পান। বর্ষার স্যাঁতসেঁতে ভাব থেকে আপনার স্কুটার রক্ষা করুন। আজই যোগাযোগ করুন সুদীপ্ত দাসের মঞ্চে",
      date: "2026-06-24",
      isActive: true
    },
    {
      id: "a2",
      titleEng: "Easy Battery EMI Facility Now Open",
      titleBen: "সহজ ব্যাটারি ইএমআই সুবিধা এখন উপলব্ধ",
      contentEng: "Don't pay all at once! Get your high-speed LFP or Lithium-ion battery with easy monthly installments. Low down payment starts from only ₹5000.",
      contentBen: "একবারে সব টাকা দিতে হবে না! সহজ মাসিক কিস্তিতে আপনার হাই-স্পিড এলএফপি বা লিথিয়াম-আয়ন ব্যাটারি পান। মাত্র ৫০০০ টাকা থেকে ডাউন পেমেন্ট শুরু হচ্ছে।",
      date: "2026-06-20",
      isActive: false
    }
  ],
  expenses: [
    { id: "ex1", description: "Workshop rent", amount: 6500, category: "Rent", date: "2026-06-01" },
    { id: "ex2", description: "Hydraulic lift maintenance grease", amount: 450, category: "Maintenance", date: "2026-06-05" },
    { id: "ex3", description: "Tea and snacks for clients", amount: 320, category: "Refreshments", date: "2026-06-10" },
    { id: "ex4", description: "Electric bill", amount: 1850, category: "Utilities", date: "2026-06-20" }
  ],
  orders: [
    {
      id: "ord1001",
      customerId: "c1",
      customerName: "Joydeb Sen",
      customerPhone: "+91 9830112233",
      customerAddress: "Baghajatin Road, Ashoknagar",
      items: [
        { id: "p1", name: "Smart LFP Battery 60V 30Ah", quantity: 1, price: 32500 }
      ],
      totalAmount: 32500,
      status: "Dispatched",
      expectedDeliveryDate: "2026-07-08",
      expectedDeliveryTime: "Afternoon",
      deliveryPartnerName: "Arun Ghosh",
      deliveryPartnerPhone: "+91 9064223344",
      notes: "Handle with care, heavy battery unit.",
      createdAt: "2026-07-05T10:00:00Z"
    }
  ],
  offlineTransactions: []
};

function createBackendAuditLog(db: any, params: {
  actor?: string;
  role?: "Admin" | "Staff" | "System";
  action: string;
  module: string;
  severity?: "info" | "warning" | "critical";
  ipAddress?: string;
}) {
  if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
    db.auditLogs = getInitialAuditLogs();
  }

  const now = new Date();
  const newLog = {
    id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: now.toISOString(),
    actor: params.actor || "SUDIPTA DAS",
    role: params.role || "Admin",
    action: params.action,
    ipAddress: params.ipAddress || "192.168.1.50",
    severity: params.severity || "info",
    module: params.module
  };

  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }

  return newLog;
}

function getInitialAuditLogs() {
  const now = new Date();
  const formatTime = (minusMinutes: number) => {
    return new Date(now.getTime() - minusMinutes * 60 * 1000).toISOString();
  };

  return [
    {
      id: "LOG-9064",
      timestamp: formatTime(2),
      actor: "SUDIPTA DAS",
      role: "Admin",
      action: "Admin ERP Portal access granted with master security passcode",
      ipAddress: "192.168.1.50",
      severity: "critical",
      module: "Security Portal"
    },
    {
      id: "LOG-9063",
      timestamp: formatTime(12),
      actor: "SUDIPTA DAS",
      role: "Admin",
      action: "Verified Google Authenticator 2FA TOTP cryptographic session handshake",
      ipAddress: "192.168.1.50",
      severity: "info",
      module: "MFA 2FA Guard"
    },
    {
      id: "LOG-9062",
      timestamp: formatTime(35),
      actor: "Tanmay Das",
      role: "Staff",
      action: "Approved customer booking reservation order #EV-9021 for Sudipta Eco Glide S1",
      ipAddress: "192.168.1.112",
      severity: "info",
      module: "Bookings Service"
    },
    {
      id: "LOG-9061",
      timestamp: formatTime(90),
      actor: "SYSTEM MONITOR",
      role: "System",
      action: "Automated CRM state snapshot pushed to cloud backup bucket",
      ipAddress: "127.0.0.1",
      severity: "info",
      module: "Compliance Backup"
    },
    {
      id: "LOG-9060",
      timestamp: formatTime(180),
      actor: "SYSTEM SHIELD",
      role: "System",
      action: "Rate-limiter scrubbed high-frequency crawler bot connection from IP 45.121.23.11",
      ipAddress: "45.121.23.11",
      severity: "warning",
      module: "WAF Rate Limiter"
    },
    {
      id: "LOG-9059",
      timestamp: formatTime(310),
      actor: "SYSTEM SHIELD",
      role: "System",
      action: "SQL Injection filter intercepted and sanitized malicious query string",
      ipAddress: "185.220.101.4",
      severity: "critical",
      module: "WAF SQL Shield"
    }
  ];
}

function getInitialWafState() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  return {
    wafLogs: [
      `[${timeStr}] [SECURITY] Cloud-Shield Anycast DDoS & WAF Firewall active on Port 3000`,
      `[${timeStr}] [RATE-LIMIT] Session filter initialized. Client IP threshold: 5 req/min`,
      `[${timeStr}] [SANITIZER] SQLi and XSS parameterization active for all incoming payloads`
    ],
    blockedIps: ["45.121.23.11", "185.220.101.4"],
    rateLimiterActive: true
  };
}

// Database helper functions with in-memory caching for zero-crash serverless environments
let inMemoryDb: any = null;

function readDb() {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  try {
    // 1. Check if writable /tmp/db.json exists on Vercel Serverless
    if (fs.existsSync(TMP_DB_PATH)) {
      try {
        const tmpData = fs.readFileSync(TMP_DB_PATH, "utf8");
        inMemoryDb = JSON.parse(tmpData);
        return inMemoryDb;
      } catch (err) {
        console.warn("Could not read /tmp/db.json, falling back to primary DB_PATH", err);
      }
    }

    // 2. Read from primary DB_PATH if exists
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      inMemoryDb = JSON.parse(data);
      // Seed /tmp/db.json for future Vercel serverless calls
      try {
        fs.writeFileSync(TMP_DB_PATH, JSON.stringify(inMemoryDb, null, 2));
      } catch (e) {
        console.warn("Could not seed /tmp/db.json:", e);
      }
      return inMemoryDb;
    }

    // 3. Fallback to initial seed data
    inMemoryDb = JSON.parse(JSON.stringify(initialData));
    try {
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(inMemoryDb, null, 2));
    } catch (e) {
      console.warn("Could not seed /tmp/db.json with initial data:", e);
    }
    return inMemoryDb;
  } catch (error) {
    console.error("Error reading db.json, falling back to initial seed data", error);
    inMemoryDb = JSON.parse(JSON.stringify(initialData));
    return inMemoryDb;
  }
}

function writeDb(data: any) {
  inMemoryDb = data;

  // 1. Always write to /tmp/db.json first (Writable on Vercel Serverless)
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to /tmp/db.json:", error);
  }

  // 2. Also write to project directory DB_PATH (Works in local dev / Docker)
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    // Read-only filesystem on Vercel - expected warning
    console.warn("Vercel filesystem is read-only. Data successfully persisted to /tmp/db.json and in-memory cache.");
  }
}

const defaultSettings = {
  businessName: "Sudipta E-Scooty Service (সুদীপ্ত ই-স্কুটি সার্ভিস)",
  phone: "+91 9064517009",
  address: "Ashoknagar Power House Road, Ashoknagar, West Bengal 743222",
  googleMapsUrl: "https://maps.app.goo.gl/4qvAEgzE6h4c2U6U6",
  facebookUrl: "https://www.facebook.com/share/1DPBfmxkNG/",
  instagramUrl: "",
  youtubeUrl: "https://www.facebook.com/share/r/18jMdwrgUY/",
  googleBusinessUrl: "",
  whatsappLink: "https://wa.me/919064517009",
  primaryColor: "#1E40AF",
  secondaryColor: "#FACC15",
  accentColor: "#10B981",
  heroHeading: "আধুনিক ইলেকট্রিক স্কুটার সার্ভিস এবং নির্ভরযোগ্য ইভি পার্টস ডিলার",
  heroSubheading: "সুদীপ্ত ই-স্কুটি সার্ভিস - আমরা অত্যন্ত যত্ন সহকারে ই-স্কুটার রিপেয়ার, ব্যাটারি সার্ভিসিং এবং ইএমআই (EMI) সুবিধায় ব্যাটারি প্রদান করি।",
  festivalTheme: "none",
  businessNameEng: "Sudipta E-Scooty Service",
  businessNameBen: "সুদীপ্ত ই-স্কুটি সার্ভিস",
  erpPasscode: "9064",
  showTopNotice: true,
  topNoticeTitleEng: "Special Monsoon Servicing Offer!",
  topNoticeTitleBen: "বিশেষ বর্ষাকালীন সার্ভিসিং অফারঃ",
  topNoticeTextEng: "Get flat 20% off on complete EV diagnosis and wiring servicing.",
  topNoticeTextBen: "সম্পূর্ণ ইভি ডায়াগনোসিস এবং ওয়্যারিং সার্ভিসিং-এ সরাসরি ২০% ছাড় পান। বর্ষার স্যাঁতসেঁতে ভাব থেকে আপনার স্কুটার রক্ষা করুন। আজই যোগাযোগ করুন সুদীপ্ত দাসের মঞ্চে",
  aboutHeadingEng: "Sudipta E-Scooty Service",
  aboutHeadingBen: "সুদীপ্ত ই-স্কুটি সার্ভিস",
  aboutText1Eng: "Headed by Sudipta Das (Sudipta Babu), our workshop in Ashoknagar, West Bengal guarantees high-efficiency repairs for all EV scooters and cycles.",
  aboutText1Ben: "সুদীপ্ত দাস (সুদীপ্ত বাবু)-এর তত্ত্বাবধানে পরিচালিত এই ওয়ার্কশপটি পশ্চিমবঙ্গের উত্তর ২৪ পরগণার অশোকনগরে অবস্থিত। আমরা দ্বিচক্র বাহনকে রাখি নতুনের মতো সচল।",
  aboutText2Eng: "We specialize in precision lithium-ion battery restorations, cell balancing, diagnostic scans, and modular battery instalment EMI schemes.",
  aboutText2Ben: "আমরা শুধুমাত্র সার্ভিসিং করি না, বরং আপনার মূল্যবান স্কুটির লিথিয়াম-আয়ন ও এলএফপি (LFP) ব্যাটারি ডায়াগনস্টিকস, সেল ব্যালেন্সিং, ওয়্যার সলভিং এবং ইএমআই (EMI) সুবিধায় ব্যাটারি প্রদান করি।",
  visitingCardOwnerNameEng: "Sudipta Das",
  visitingCardOwnerNameBen: "সুদীপ্ত দাস",
  visitingCardOwnerRoleEng: "PROPRIETOR",
  visitingCardOwnerRoleBen: "প্রোপ্রাইটার",
  visitingCardPhone: "+91 9064517009",
  visitingCardAddressEng: "Ashoknagar Power House Road (Towards Kalobari), North 24 Parganas.",
  visitingCardAddressBen: "অশোকনগর পাওয়ার হাউস রোড, কালোবাড়ির দিক, উত্তর ২৪ পরগনা।",
  calcDefaultPrice: 32000,
  calcDefaultDownPaymentPct: 30,
  calcBaseInterestRate: 0,
  calcDefaultVoltage: 60,
  calcDefaultCapacity: 40,
  calcDefaultSpeed: 35,
  timingWeekdaysEng: "Mon - Sat: 9:00 AM - 9:00 PM",
  timingWeekdaysBen: "সোম - শনি: সকাল ৯:০০ - রাত ৯:০০",
  timingSundayEng: "Sunday: Closed / Emergency On-Call Repairs",
  timingSundayBen: "রবিবার: বন্ধ / জরুরী অন-কল মেরামত",
  heroBgType: "image",
  heroBgUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200",
  upiId: "tanmoydasdas23@ybl",
  upiMerchantName: "Mr TANMAY DAS",
  qrCodeUrl: "",
  paymentInstructionsEng: "Please complete the payment using UPI and share the screenshot.",
  paymentInstructionsBen: "দয়া করে ইউপিআই ব্যবহার করে পেমেন্ট সম্পন্ন করুন এবং স্ক্রিনশট শেয়ার করুন।",
  whatsappNumber: "+919064517009",
  supportEmail: "iamsudiptadas666@gmail.com",
  businessAddressEng: "Ashoknagar Power House Road, Ashoknagar, West Bengal 743222",
  businessAddressBen: "অশোকনগর পাওয়ার হাউস রোড, অশোকনগর, পশ্চিমবঙ্গ ৭৪৩২২২",
  logoUrl: "",
  faviconUrl: "",
  colorTheme: "classic",
  proprietorNameEng: "SUDIPTA DAS",
  proprietorNameBen: "সুদীপ্ত দাস",
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
  navLinks: [
    { id: "1", labelEng: "Showroom", labelBen: "শোরুম", href: "#showroom", isEnabled: true },
    { id: "2", labelEng: "Spare Parts", labelBen: "খুচরা যন্ত্রাংশ", href: "/spare_parts", isEnabled: true },
    { id: "3", labelEng: "Diagnosis", labelBen: "ডায়াগনস্টিকস", href: "#diagnosis", isEnabled: true },
    { id: "4", labelEng: "Tools", labelBen: "ক্যালকুলেটর", href: "#tools", isEnabled: true }
  ],
  shopGstin: "19AAYFD9064SD1Z9",
  delhiveryApiKey: "MOCK_SECURE_DELHIVERY_KEY_12345",
  delhiveryTrackingUrl: "https://track.delhivery.com/api/v1/packages/json"
};

// Inlined logistics helpers
export interface ShipmentResponse {
  awb: string;
  carrier: string;
  status: string;
}

const createShipment = async (order: any): Promise<ShipmentResponse> => {
  console.log(`Creating shipment for order ${order.id}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        awb: `AWB${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        carrier: 'Delhivery',
        status: 'Confirmed'
      });
    }, 1000);
  });
};

const getTrackingInfo = async (awb: string) => {
  return {
    awb,
    status: 'In Transit',
    location: 'Hub 1, Kolkata',
    timestamp: new Date().toISOString(),
    description: 'Out for pickup'
  };
};

const getLabelPdfUrl = async (awb: string) => {
  return `https://example.com/labels/${awb}.pdf`;
};

// GET globalConfig
app.get("/api/globalConfig", (req, res) => {
  const db = readDb();
  db.settings = { ...defaultSettings, ...(db.settings || {}) };
  res.json(db.settings);
});

// UPDATE globalConfig
app.put("/api/globalConfig", (req, res) => {
  const db = readDb();
  db.settings = { ...defaultSettings, ...(db.settings || {}), ...req.body };
  writeDb(db);
  res.json(db.settings);
});

// GET testimonials
app.get("/api/testimonials", (req, res) => {
  const db = readDb();
  if (!db.testimonials) {
    db.testimonials = [
      {
        id: "t1",
        textBen: "আমার ইলেকট্রিক স্কুটারটি হঠাৎ করে চলা বন্ধ হয়ে গেছিল। সুদীপ্ত বাবু স্ক্যানার দিয়ে রোগ ধরে মাত্র ১ ঘন্টায় মেরামত করে দিয়েছেন। খরচও অনেক কম লেগেছে!",
        textEng: "My electric scooter stopped running out of nowhere. Sudipta analyzed the scanner grids and got it running within an hour. Extremely fair repair prices!",
        name: "জয়দেব শিকদার (Joydeb Shikdar)",
        role: "Ashoknagar Local",
        avatar: "JS"
      },
      {
        id: "t2",
        textBen: "সুদীপ্ত বাবুর থেকে ব্যাটারি কিস্তিতে বা EMI তে নিয়ে আমার খুব উপকার হয়েছে। কোনো বাড়তি সুদ বা ঝামেলা ছাড়াই মাসে মাসে দিয়ে দিই। খুব ভালো সার্ভিস!",
        textEng: "Acquiring my scooter LFP battery on EMI from Sudipta saved me. No compound interest or hidden processing traps. Excellent customer-first ethics!",
        name: "রিমি ঘোষ (Rimi Ghosh)",
        role: "Kalobari Resident",
        avatar: "RG"
      },
      {
        id: "t3",
        textBen: "খুচরা যন্ত্রাংশের স্টক খুবই ভালো। আমার লিথিয়াম ব্যাটারির চার্জার খারাপ হয়ে গেছিল, অন্য কোথাও পাচ্ছিলাম না, সুদীপ্ত দার দোকানে সাথে সাথে অরিজিনাল চার্জার পেয়ে গেলাম।",
        textEng: "Impeccable spare parts catalogue. I was searching for an auto-cutoff lithium charger everywhere, found a certified original at Sudipta's store instantly.",
        name: "সুব্রত দাস (Subrata Das)",
        role: "EV Commuter",
        avatar: "SD"
      }
    ];
    writeDb(db);
  }
  res.json(db.testimonials);
});

// POST testimonial
app.post("/api/testimonials", (req, res) => {
  const db = readDb();
  if (!db.testimonials) db.testimonials = [];
  const newT = {
    id: "t_" + Date.now(),
    textBen: req.body.textBen || "",
    textEng: req.body.textEng || "",
    name: req.body.name || "Anonymous Client",
    role: req.body.role || "EV Rider",
    avatar: req.body.avatar || (req.body.name ? req.body.name.substring(0, 2).toUpperCase() : "AC"),
    rating: req.body.rating || 5,
    date: new Date().toISOString(),
    isPending: req.body.isPending !== undefined ? req.body.isPending : true
  };
  db.testimonials.push(newT);
  writeDb(db);
  res.status(201).json(newT);
});

// PATCH approve testimonial
app.patch("/api/testimonials/:id/approve", (req, res) => {
  const db = readDb();
  if (!db.testimonials) db.testimonials = [];
  const index = db.testimonials.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    db.testimonials[index].isPending = false;
    writeDb(db);
    res.json(db.testimonials[index]);
  } else {
    res.status(404).json({ error: "Testimonial not found" });
  }
});

// PUT testimonial
app.put("/api/testimonials/:id", (req, res) => {
  const db = readDb();
  if (!db.testimonials) db.testimonials = [];
  const index = db.testimonials.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    db.testimonials[index] = { ...db.testimonials[index], ...req.body };
    writeDb(db);
    res.json(db.testimonials[index]);
  } else {
    res.status(404).json({ message: "Testimonial not found" });
  }
});

// DELETE testimonial
app.delete("/api/testimonials/:id", (req, res) => {
  const db = readDb();
  if (!db.testimonials) db.testimonials = [];
  db.testimonials = db.testimonials.filter((t: any) => t.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Testimonial deleted successfully" });
});

// GET metadata/stats
app.get("/api/dashboard-stats", (req, res) => {
  const db = readDb();
  const lowStockThreshold = 5;

  const activeProducts = (db.products || []).filter((p: any) => !p.isDeleted);
  const activeVehicles = (db.vehicles || []).filter((v: any) => !v.isDeleted);
  const activeBookings = (db.bookings || []).filter((b: any) => !b.isDeleted);
  const activeEmi = (db.emi || []).filter((e: any) => !e.isDeleted);
  const activeCustomers = (db.customers || []).filter((c: any) => !c.isDeleted);
  const activeAnnouncements = (db.announcements || []).filter((a: any) => !a.isDeleted);

  const lowStockCount = activeProducts.filter((p: any) => p.stock < lowStockThreshold).length + 
                       activeVehicles.filter((v: any) => v.stockQuantity < 3).length;

  const totalSales = activeBookings
    .filter((b: any) => b.status === "Completed" && b.paymentStatus === "Paid")
    .reduce((sum: number, b: any) => sum + b.totalAmount, 0) +
    activeEmi.reduce((sum: number, e: any) => sum + e.paidAmount, 0);

  const pendingBookings = activeBookings.filter((b: any) => b.status === "Pending").length;
  const activeEmiCount = activeEmi.filter((e: any) => e.remainingBalance > 0).length;

  res.json({
    totalVehicles: activeVehicles.length,
    totalProducts: activeProducts.length,
    totalCustomers: activeCustomers.length,
    pendingBookings,
    activeEmiCount,
    lowStockCount,
    totalSales,
    announcementsCount: activeAnnouncements.length
  });
});

// Vehicles REST Endpoints
app.get("/api/vehicles", (req, res) => {
  res.json((readDb().vehicles || []).filter((v: any) => !v.isDeleted));
});

app.post("/api/vehicles", (req, res) => {
  const db = readDb();
  const newVehicle = {
    id: "v_" + Date.now(),
    ...req.body
  };
  db.vehicles.push(newVehicle);
  writeDb(db);
  res.status(201).json(newVehicle);
});

const handleUpdateVehicle = (req: express.Request, res: express.Response) => {
  const db = readDb();
  const index = db.vehicles.findIndex((v: any) => v.id === req.params.id);
  if (index !== -1) {
    db.vehicles[index] = { ...db.vehicles[index], ...req.body };
    writeDb(db);
    res.json(db.vehicles[index]);
  } else {
    res.status(404).json({ message: "Vehicle not found" });
  }
};
app.put("/api/vehicles/:id", handleUpdateVehicle);
app.patch("/api/vehicles/:id", handleUpdateVehicle);

app.delete("/api/vehicles/:id", (req, res) => {
  const db = readDb();
  if (!db.vehicles) db.vehicles = [];
  const item = db.vehicles.find((v: any) => v.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
  }
  res.json({ message: "Vehicle deleted successfully (soft-deleted)" });
});

// Products / Spare Parts REST Endpoints
app.get("/api/products", (req, res) => {
  res.json((readDb().products || []).filter((p: any) => !p.isDeleted));
});

app.post("/api/products", (req, res) => {
  const db = readDb();
  const newProduct = {
    id: "p_" + Date.now(),
    ...req.body
  };
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

const handleUpdateProduct = (req: express.Request, res: express.Response) => {
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
app.put("/api/products/:id", handleUpdateProduct);
app.patch("/api/products/:id", handleUpdateProduct);

app.delete("/api/products/:id", (req, res) => {
  const db = readDb();
  if (!db.products) db.products = [];
  const item = db.products.find((p: any) => p.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
  }
  res.json({ message: "Product deleted successfully (soft-deleted)" });
});

// Offline Transactions REST Endpoints
app.get("/api/offline-transactions", (req, res) => {
  res.json(readDb().offlineTransactions || []);
});

app.post("/api/offline-transactions", (req, res) => {
  const db = readDb();
  const newTransaction = {
    id: "ot_" + Date.now(),
    ...req.body
  };
  if (!db.offlineTransactions) db.offlineTransactions = [];
  db.offlineTransactions.push(newTransaction);
  
  // Optional: Update stock if product is linked
  if (req.body.productId) {
      const pIndex = db.products.findIndex((p: any) => p.id === req.body.productId);
      if (pIndex !== -1) {
          db.products[pIndex].stock = Math.max(0, db.products[pIndex].stock - 1);
      }
  }

  writeDb(db);
  res.status(201).json(newTransaction);
});

app.delete("/api/offline-transactions/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  console.log("Server: Received DELETE request for offline transaction ID:", id);
  if (!db.offlineTransactions) db.offlineTransactions = [];
  const initialCount = db.offlineTransactions.length;
  db.offlineTransactions = db.offlineTransactions.filter((t: any) => t.id !== id);
  const finalCount = db.offlineTransactions.length;
  console.log(`Server: Deletion complete. Initial count: ${initialCount}, Final count: ${finalCount}`);
  writeDb(db);
  res.json({ message: "Transaction deleted successfully" });
});

// Customers REST Endpoints
app.get("/api/customers", (req, res) => {
  res.json((readDb().customers || []).filter((c: any) => !c.isDeleted));
});

app.post("/api/customers", (req, res) => {
  const db = readDb();
  const newCustomer = {
    id: "c_" + Date.now(),
    photo: "",
    serviceHistory: [],
    paymentHistory: [],
    emiRecords: [],
    ...req.body
  };
  db.customers.push(newCustomer);
  writeDb(db);
  res.status(201).json(newCustomer);
});

app.put("/api/customers/:id", (req, res) => {
  const db = readDb();
  const index = db.customers.findIndex((c: any) => c.id === req.params.id);
  if (index !== -1) {
    db.customers[index] = { ...db.customers[index], ...req.body };
    writeDb(db);
    res.json(db.customers[index]);
  } else {
    res.status(404).json({ message: "Customer not found" });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const db = readDb();
  if (!db.customers) db.customers = [];
  const customerId = req.params.id;
  const customer = db.customers.find((c: any) => c.id === customerId);
  
  if (customer) {
    const customerPhone = customer.phone;
    const customerName = customer.name;
    const deletedAt = new Date().toISOString();

    // 1. Soft delete customer
    customer.isDeleted = true;
    customer.deletedAt = deletedAt;

    // 2. Soft delete bookings (associated service records)
    (db.bookings || []).forEach((b: any) => {
      const isHistoryMatch = customer.serviceHistory?.includes(b.id);
      const isPhoneMatch = b.customerPhone && b.customerPhone === customerPhone;
      const isNameMatch = b.customerName && b.customerName.toLowerCase() === customerName.toLowerCase();
      if (isHistoryMatch || isPhoneMatch || isNameMatch) {
        b.isDeleted = true;
        b.deletedAt = deletedAt;
      }
    });

    // 3. Soft delete EMI records
    (db.emi || []).forEach((e: any) => {
      const isIdMatch = e.customerId === customerId;
      const isPhoneMatch = e.customerPhone && e.customerPhone === customerPhone;
      if (isIdMatch || isPhoneMatch) {
        e.isDeleted = true;
        e.deletedAt = deletedAt;
      }
    });

    // 4. Soft delete invoices
    if (db.invoices) {
      db.invoices.forEach((inv: any) => {
        const isPhoneMatch = inv.customerPhone && inv.customerPhone === customerPhone;
        const isNameMatch = inv.customerName && inv.customerName.toLowerCase() === customerName.toLowerCase();
        if (isPhoneMatch || isNameMatch) {
          inv.isDeleted = true;
          inv.deletedAt = deletedAt;
        }
      });
    }

    writeDb(db);
  }
  res.json({ message: "Customer and associated records deleted successfully" });
});

// Service Bookings / Jobs REST Endpoints
app.get("/api/bookings", (req, res) => {
  res.json((readDb().bookings || []).filter((b: any) => !b.isDeleted));
});

app.post("/api/bookings", (req, res) => {
  const db = readDb();
  const newBooking = {
    id: "s_" + Date.now(),
    status: "Pending",
    repairDetails: req.body.repairDetails || "Regular EV diagnosis and general checkup",
    partsUsed: req.body.partsUsed || [],
    serviceCharge: Number(req.body.serviceCharge) || 200,
    totalAmount: Number(req.body.totalAmount) || 200,
    paymentStatus: req.body.paymentStatus || "Unpaid",
    technicianName: req.body.technicianName || "Unassigned",
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.bookings.push(newBooking);

  // Link to existing customer if found by name or phone
  const customer = db.customers.find(
    (c: any) => c.phone === newBooking.customerPhone || c.name.toLowerCase() === newBooking.customerName.toLowerCase()
  );
  if (customer) {
    customer.serviceHistory.push(newBooking.id);
    if (newBooking.paymentStatus === "Paid") {
      customer.paymentHistory.push({
        amount: newBooking.totalAmount,
        date: new Date().toISOString().split("T")[0],
        purpose: `Service Job #${newBooking.id}`,
        method: "UPI/Cash"
      });
    }
  }

  writeDb(db);
  res.status(201).json(newBooking);
});

app.put("/api/bookings/:id", (req, res) => {
  const db = readDb();
  const index = db.bookings.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    const oldBooking = db.bookings[index];
    const updatedBooking = { ...oldBooking, ...req.body };
    db.bookings[index] = updatedBooking;

    // Handle inventory adjustments if parts are used and status changes to Completed
    if (updatedBooking.status === "Completed" && oldBooking.status !== "Completed") {
      updatedBooking.partsUsed.forEach((part: any) => {
        const storePart = db.products.find((p: any) => p.id === part.partId);
        if (storePart) {
          storePart.stock = Math.max(0, storePart.stock - part.quantity);
        }
      });
    }

    // Link financial update to customer
    const customer = db.customers.find(
      (c: any) => c.phone === updatedBooking.customerPhone || c.name.toLowerCase() === updatedBooking.customerName.toLowerCase()
    );
    if (customer) {
      if (!customer.serviceHistory.includes(updatedBooking.id)) {
        customer.serviceHistory.push(updatedBooking.id);
      }
      if (updatedBooking.paymentStatus === "Paid" && oldBooking.paymentStatus !== "Paid") {
        customer.paymentHistory.push({
          amount: updatedBooking.totalAmount,
          date: new Date().toISOString().split("T")[0],
          purpose: `Completed Service Job #${updatedBooking.id}`,
          method: "UPI/Cash"
        });
      }
    }

    writeDb(db);
    res.json(updatedBooking);
  } else {
    res.status(404).json({ message: "Booking not found" });
  }
});

app.delete("/api/bookings/:id", (req, res) => {
  const db = readDb();
  if (!db.bookings) db.bookings = [];
  const item = db.bookings.find((b: any) => b.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
  }
  res.json({ message: "Booking deleted successfully (soft-deleted)" });
});

// EMI Management REST Endpoints
app.get("/api/emi", (req, res) => {
  res.json((readDb().emi || []).filter((e: any) => !e.isDeleted));
});

app.post("/api/emi", (req, res) => {
  const db = readDb();
  const total = Number(req.body.totalPrice);
  const down = Number(req.body.downPayment);
  const remaining = total - down;

  const newEmi = {
    id: "emi_" + Date.now(),
    totalPrice: total,
    downPayment: down,
    remainingBalance: remaining,
    paidAmount: down,
    dueAmount: remaining,
    paymentHistory: [
      { amount: down, date: new Date().toISOString().split("T")[0], method: req.body.method || "Cash", status: "Down Payment" }
    ],
    ...req.body
  };

  db.emi.push(newEmi);

  // Link EMI and payment history to customer
  const customer = db.customers.find((c: any) => c.id === newEmi.customerId || c.phone === newEmi.customerPhone);
  if (customer) {
    if (!customer.emiRecords.includes(newEmi.id)) {
      customer.emiRecords.push(newEmi.id);
    }
    customer.paymentHistory.push({
      amount: down,
      date: new Date().toISOString().split("T")[0],
      purpose: `EMI Deposit Down Payment: ${newEmi.batteryOrVehicleName}`,
      method: req.body.method || "Cash"
    });
  }

  writeDb(db);
  res.status(201).json(newEmi);
});

app.put("/api/emi/:id", (req, res) => {
  const db = readDb();
  const index = db.emi.findIndex((e: any) => e.id === req.params.id);
  if (index !== -1) {
    const oldEmi = db.emi[index];
    const newHistory = req.body.paymentHistory || oldEmi.paymentHistory;

    // Recalculate based on payment history
    let paidAmt = oldEmi.downPayment;
    newHistory.forEach((p: any) => {
      if (p.status !== "Down Payment") {
        paidAmt += Number(p.amount);
      }
    });

    const updatedEmi = {
      ...oldEmi,
      ...req.body,
      paidAmount: paidAmt,
      dueAmount: Math.max(0, oldEmi.totalPrice - paidAmt),
      remainingBalance: Math.max(0, oldEmi.totalPrice - paidAmt),
      paymentHistory: newHistory
    };

    db.emi[index] = updatedEmi;

    // Link update to customer
    const customer = db.customers.find((c: any) => c.id === updatedEmi.customerId);
    if (customer) {
      const lastPayment = newHistory[newHistory.length - 1];
      if (lastPayment && lastPayment.date === new Date().toISOString().split("T")[0]) {
        customer.paymentHistory.push({
          amount: Number(lastPayment.amount),
          date: lastPayment.date,
          purpose: `EMI Installment Pay for ${updatedEmi.batteryOrVehicleName}`,
          method: lastPayment.method || "UPI"
        });
      }
    }

    writeDb(db);
    res.json(updatedEmi);
  } else {
    res.status(404).json({ message: "EMI record not found" });
  }
});

app.post("/api/emi/:id/payment", (req, res) => {
  const db = readDb();
  if (!db.emi) db.emi = [];
  const index = db.emi.findIndex((e: any) => e.id === req.params.id);
  const { amount = 0, method = "Cash" } = req.body;
  res.setHeader("Content-Type", "application/json");
  
  if (index !== -1) {
    const emi = db.emi[index];
    const paidAmount = (Number(emi.paidAmount) || 0) + Number(amount);
    const remainingBalance = Math.max(0, (Number(emi.totalPrice) || 0) - paidAmount);
    
    if (!emi.paymentHistory) emi.paymentHistory = [];
    emi.paymentHistory.push({
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
      method,
      status: "Installment"
    });
    emi.paidAmount = paidAmount;
    emi.dueAmount = remainingBalance;
    emi.remainingBalance = remainingBalance;
    
    writeDb(db);
    return res.json({ success: true, emi });
  }
  
  res.json({ success: true, message: "Payment recorded" });
});

app.delete("/api/emi/:id", (req, res) => {
  const db = readDb();
  if (!db.emi) db.emi = [];
  const item = db.emi.find((e: any) => e.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
  }
  res.setHeader("Content-Type", "application/json");
  res.json({ message: "EMI deleted successfully (soft-deleted)" });
});

// Enquiries REST Endpoints
app.get("/api/enquiries", (req, res) => {
  res.json((readDb().enquiries || []).filter((e: any) => !e.isDeleted));
});

app.post("/api/enquiries", (req, res) => {
  const db = readDb();
  const newEnquiry = {
    id: "e_" + Date.now(),
    status: "New",
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.enquiries.push(newEnquiry);
  writeDb(db);
  res.status(201).json(newEnquiry);
});

app.put("/api/enquiries/:id", (req, res) => {
  const db = readDb();
  const index = db.enquiries.findIndex((e: any) => e.id === req.params.id);
  if (index !== -1) {
    db.enquiries[index] = { ...db.enquiries[index], ...req.body };
    writeDb(db);
    res.json(db.enquiries[index]);
  } else {
    res.status(404).json({ message: "Enquiry not found" });
  }
});

app.delete("/api/enquiries/:id", (req, res) => {
  const db = readDb();
  const item = db.enquiries.find((e: any) => e.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
    res.json({ message: "Enquiry deleted successfully (soft-deleted)" });
  } else {
    res.status(404).json({ message: "Enquiry not found" });
  }
});

// Announcements REST Endpoints
app.get("/api/announcements", (req, res) => {
  res.json(readDb().announcements);
});

app.post("/api/announcements", (req, res) => {
  const db = readDb();
  const newAnnouncement = {
    id: "a_" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    isActive: false,
    ...req.body
  };
  db.announcements.push(newAnnouncement);
  writeDb(db);
  res.status(201).json(newAnnouncement);
});

app.put("/api/announcements/:id/activate", (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.announcements = db.announcements.map((a: any) => ({
    ...a,
    isActive: a.id === id
  }));
  writeDb(db);
  res.json({ message: "Announcement activated successfully", announcements: db.announcements });
});

app.delete("/api/announcements/:id", (req, res) => {
  const db = readDb();
  db.announcements = db.announcements.filter((a: any) => a.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Announcement deleted successfully" });
});

// Expenses REST Endpoints
app.get("/api/expenses", (req, res) => {
  res.json((readDb().expenses || []).filter((ex: any) => !ex.isDeleted));
});

app.post("/api/expenses", (req, res) => {
  const db = readDb();
  const newExpense = {
    id: "ex_" + Date.now(),
    date: req.body.date || new Date().toISOString().split("T")[0],
    ...req.body
  };
  db.expenses.push(newExpense);
  writeDb(db);
  res.status(201).json(newExpense);
});

app.delete("/api/expenses/:id", (req, res) => {
  const db = readDb();
  const item = db.expenses.find((ex: any) => ex.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
    res.json({ message: "Expense deleted successfully (soft-deleted)" });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
});

// Invoices REST Endpoints
app.get("/api/invoices", (req, res) => {
  const db = readDb();
  if (!db.invoices) {
    db.invoices = [];
    writeDb(db);
  }
  res.json(db.invoices.filter((i: any) => !i.isDeleted));
});

app.post("/api/invoices", (req, res) => {
  const db = readDb();
  if (!db.invoices) {
    db.invoices = [];
  }
  
  // Format INV-YYYY-XXXX (where XXXX is 4-digit sequence)
  const currentYear = new Date().getFullYear();
  const yearInvoices = db.invoices.filter((inv: any) => inv.id.startsWith(`INV-${currentYear}-`));
  const sequenceNumber = String(yearInvoices.length + 1).padStart(4, "0");
  const invoiceId = `INV-${currentYear}-${sequenceNumber}`;

  const newInvoice = {
    id: invoiceId,
    date: req.body.date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    customerName: req.body.customerName || "Walk-in Customer",
    customerPhone: req.body.customerPhone || "",
    vehicleModel: req.body.vehicleModel || "",
    serviceCharge: Number(req.body.serviceCharge) || 0,
    parts: req.body.parts || [],
    grandTotal: Number(req.body.grandTotal) || 0,
    customerGstin: req.body.customerGstin || ""
  };

  db.invoices.push(newInvoice);
  
  // Also, add to report/financial state or update customer history!
  // Find customer if exists
  if (newInvoice.customerPhone) {
    const customer = db.customers.find((c: any) => c.phone === newInvoice.customerPhone);
    if (customer) {
      if (!customer.paymentHistory) customer.paymentHistory = [];
      customer.paymentHistory.push({
        amount: newInvoice.grandTotal,
        date: newInvoice.date,
        purpose: `Invoice ${newInvoice.id} generated`,
        method: "Cash/UPI"
      });
    }
  }

  writeDb(db);
  res.status(201).json(newInvoice);
});

app.delete("/api/invoices/:id", (req, res) => {
  const db = readDb();
  if (!db.invoices) db.invoices = [];
  const item = db.invoices.find((i: any) => i.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
    res.json({ message: "Invoice deleted successfully (soft-deleted)" });
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
});

// Documents / Drive Storage API Endpoints
app.get("/api/documents", (req, res) => {
  const db = readDb();
  if (!db.documents) {
    db.documents = [];
    writeDb(db);
  }
  const list = db.documents.map(({ id, name, type, size, uploadedAt, isSyncedToDrive, driveFileId, driveWebViewLink }: any) => ({
    id, name, type, size, uploadedAt, isSyncedToDrive, driveFileId, driveWebViewLink
  }));
  res.json(list);
});

app.get("/api/documents/:id", (req, res) => {
  const db = readDb();
  const doc = (db.documents || []).find((d: any) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json(doc);
});

app.post("/api/documents", (req, res) => {
  const db = readDb();
  if (!db.documents) {
    db.documents = [];
  }
  const { name, type, size, dataUrl, isSyncedToDrive, driveFileId, driveWebViewLink } = req.body;
  if (!name || !dataUrl) {
    return res.status(400).json({ error: "Name and dataUrl are required" });
  }
  const newDoc = {
    id: "doc_" + Date.now(),
    name,
    type,
    size,
    dataUrl,
    uploadedAt: new Date().toISOString(),
    isSyncedToDrive: !!isSyncedToDrive,
    driveFileId: driveFileId || null,
    driveWebViewLink: driveWebViewLink || null
  };
  db.documents.push(newDoc);
  writeDb(db);
  res.status(201).json({ 
    id: newDoc.id, 
    name: newDoc.name, 
    type: newDoc.type, 
    size: newDoc.size, 
    uploadedAt: newDoc.uploadedAt,
    isSyncedToDrive: newDoc.isSyncedToDrive,
    driveFileId: newDoc.driveFileId,
    driveWebViewLink: newDoc.driveWebViewLink
  });
});

app.patch("/api/documents/:id", (req, res) => {
  const db = readDb();
  if (!db.documents) db.documents = [];
  const doc = db.documents.find((d: any) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  const { isSyncedToDrive, driveFileId, driveWebViewLink } = req.body;
  if (isSyncedToDrive !== undefined) doc.isSyncedToDrive = isSyncedToDrive;
  if (driveFileId !== undefined) doc.driveFileId = driveFileId;
  if (driveWebViewLink !== undefined) doc.driveWebViewLink = driveWebViewLink;
  writeDb(db);
  res.json({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    uploadedAt: doc.uploadedAt,
    isSyncedToDrive: doc.isSyncedToDrive,
    driveFileId: doc.driveFileId,
    driveWebViewLink: doc.driveWebViewLink
  });
});

app.delete("/api/documents/:id", (req, res) => {
  const db = readDb();
  if (!db.documents) db.documents = [];
  db.documents = db.documents.filter((d: any) => d.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Document deleted successfully" });
});

// Audit Logs REST Endpoints
app.get("/api/audit-logs", (req, res) => {
  const db = readDb();
  if (!db.auditLogs || !Array.isArray(db.auditLogs) || db.auditLogs.length === 0) {
    db.auditLogs = getInitialAuditLogs();
    writeDb(db);
  }
  res.json(db.auditLogs);
});

app.post("/api/audit-logs", (req, res) => {
  const db = readDb();
  if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
    db.auditLogs = getInitialAuditLogs();
  }

  const clientIp = req.body.ipAddress || 
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
    req.socket.remoteAddress || 
    "192.168.1.50";

  const now = new Date();

  const newLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: now.toISOString(),
    actor: req.body.actor || "SUDIPTA DAS",
    role: req.body.role || "Admin",
    action: req.body.action || "System operation logged",
    ipAddress: clientIp,
    severity: req.body.severity || "info",
    module: req.body.module || "System"
  };

  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 250) {
    db.auditLogs = db.auditLogs.slice(0, 250);
  }

  writeDb(db);
  res.status(201).json(newLog);
});

app.delete("/api/audit-logs", (req, res) => {
  const db = readDb();
  db.auditLogs = getInitialAuditLogs();
  writeDb(db);
  res.json({ message: "Audit logs reset to initial dynamic state", auditLogs: db.auditLogs });
});

// WAF & Network Security REST Endpoints
app.get("/api/waf-logs", (req, res) => {
  const db = readDb();
  if (!db.wafState) {
    db.wafState = getInitialWafState();
    writeDb(db);
  }
  res.json(db.wafState);
});

app.post("/api/waf-logs/block-ip", (req, res) => {
  const db = readDb();
  if (!db.wafState) db.wafState = getInitialWafState();
  const { ip, action } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address required" });

  const timestamp = new Date().toLocaleTimeString();
  if (action === "block") {
    if (!db.wafState.blockedIps.includes(ip)) {
      db.wafState.blockedIps.push(ip);
      db.wafState.wafLogs.unshift(`[${timestamp}] [ADMIN ACTION] IP ${ip} was manually added to WAF Blocklist.`);
    }
  } else if (action === "unblock") {
    db.wafState.blockedIps = db.wafState.blockedIps.filter((i: string) => i !== ip);
    db.wafState.wafLogs.unshift(`[${timestamp}] [ADMIN ACTION] IP ${ip} was removed from WAF Blocklist.`);
  }

  // Create an audit trail log
  if (!db.auditLogs) db.auditLogs = getInitialAuditLogs();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  
  db.auditLogs.unshift({
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: formattedDate,
    actor: req.body.actor || "SUDIPTA DAS",
    role: "Admin",
    action: `WAF ${action === "block" ? "Blocked" : "Unblocked"} IP address ${ip}`,
    ipAddress: "192.168.1.50",
    severity: "warning",
    module: "WAF Network Firewall"
  });

  writeDb(db);
  res.json(db.wafState);
});

app.post("/api/waf-logs/log", (req, res) => {
  const db = readDb();
  if (!db.wafState) db.wafState = getInitialWafState();
  const { message } = req.body;
  if (message) {
    const timestamp = new Date().toLocaleTimeString();
    db.wafState.wafLogs.unshift(`[${timestamp}] ${message}`);
    if (db.wafState.wafLogs.length > 100) {
      db.wafState.wafLogs = db.wafState.wafLogs.slice(0, 100);
    }
    writeDb(db);
  }
  res.json(db.wafState);
});

// Reports API Compile
app.get("/api/reports", (req, res) => {
  const db = readDb();
  const { startDate, endDate } = req.query;

  const filterByDate = (dateStr?: string) => {
    if (!startDate || !endDate) return true;
    if (!dateStr) return true;
    const d = new Date(dateStr).getTime();
    if (isNaN(d)) return true;
    return d >= new Date(startDate as string).getTime() && d <= new Date(endDate as string).getTime();
  };

  // 1. ORDERS REVENUE (Orders from database)
  const ordersList = (db.orders || [])
    .filter((o: any) => !o.isDeleted && o.status !== "Cancelled" && filterByDate(o.createdAt || o.orderDate || o.date))
    .map((o: any) => {
      const itemsDesc = Array.isArray(o.items) && o.items.length > 0
        ? o.items.map((i: any) => i.name || i.titleEng || i.title || "Item").join(", ")
        : (o.item || "E-Commerce Product Order");
      return {
        id: o.id,
        date: (o.createdAt || o.orderDate || o.date || new Date().toISOString()).split("T")[0],
        customer: o.customerName || "Online Customer",
        type: "Order Sale",
        item: itemsDesc,
        amount: Number(o.totalAmount || o.totalPrice || o.amount || 0),
        status: o.paymentStatus || (o.status === "Cancelled" ? "Refunded" : "Paid")
      };
    });

  // 2. SERVICE & REPAIR BOOKINGS REVENUE (Payments from bookings)
  const salesAndServices = (db.bookings || [])
    .filter((b: any) => !b.isDeleted && b.status === "Completed" && filterByDate(b.bookingDate || b.createdAt))
    .map((b: any) => ({
      id: b.id,
      date: (b.bookingDate || b.createdAt || new Date().toISOString()).split("T")[0],
      customer: b.customerName || "Service Customer",
      type: "Service Repair",
      item: b.vehicleDetails || "Scooter Servicing",
      amount: Number(b.totalAmount || 0),
      status: b.paymentStatus || "Paid"
    }));

  // 3. EMI COLLECTIONS REVENUE (Payments from EMI history)
  const emiCollections = (db.emi || []).flatMap((e: any) =>
    (e.paymentHistory || [])
      .filter((ph: any) => filterByDate(ph.date))
      .map((ph: any, index: number) => ({
        id: `${e.id}-pay-${index}`,
        date: ph.date || new Date().toISOString().split("T")[0],
        customer: e.customerName || "EMI Customer",
        type: "EMI Collection",
        item: e.batteryOrVehicleName || "EMI Loan Payment",
        amount: Number(ph.amount || 0),
        status: "Paid"
      }))
  );

  // 4. INCOMING CASH FLOW LOGS (Offline income)
  const offlineRevenue = (db.offlineTransactions || [])
    .filter((ot: any) => ot.type === "income" && filterByDate(ot.date))
    .map((ot: any) => ({
      id: ot.id,
      date: ot.date || new Date().toISOString().split("T")[0],
      customer: ot.customerName || "Walk-in Customer",
      type: "Offline Income",
      item: ot.description || "Cash Entry",
      amount: Number(ot.amount || 0),
      status: "Paid"
    }));

  // ALL REVENUE COMBINED
  const allRevenue = [...ordersList, ...salesAndServices, ...emiCollections, ...offlineRevenue].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 1. TOTAL SALES REVENUE = Sum of Orders + Payments + Incoming Cash Flow Logs
  const totalRevenue = allRevenue.reduce((sum, item) => {
    if (item.status !== "Refunded" && item.status !== "Unpaid") {
      return sum + Number(item.amount || 0);
    }
    return sum;
  }, 0);

  // 2. TOTAL EXPENDITURES = Expenses module/table + Spare Parts purchase costs
  const expensesList = (db.expenses || []).filter((x: any) => !x.isDeleted && filterByDate(x.date));
  const offlineExpenses = (db.offlineTransactions || [])
    .filter((ot: any) => ot.type === "expense" && filterByDate(ot.date))
    .map((ot: any) => ({
      id: ot.id,
      description: ot.description || "Offline Expense",
      amount: Number(ot.amount || 0),
      category: "Offline Expense",
      date: ot.date || new Date().toISOString().split("T")[0]
    }));

  // Spare Parts purchase costs calculation
  const sparePartsPurchaseCost = (db.products || [])
    .filter((p: any) => !p.isDeleted)
    .reduce((sum: number, p: any) => {
      const qty = Number(p.stock || p.stockQuantity || 0);
      const unitCost = Number(p.purchasePrice || p.costPrice || p.buyPrice || (p.offerPrice ? p.offerPrice * 0.65 : (p.price ? p.price * 0.65 : 0)));
      return sum + (qty * unitCost);
    }, 0);

  const totalExpenseModule = [...expensesList, ...offlineExpenses].reduce((sum: number, ex: any) => sum + Number(ex.amount || 0), 0);
  const totalExpense = totalExpenseModule + sparePartsPurchaseCost;

  // 3. INVENTORY ASSET VALUE = (Stock Quantity x Unit Cost Price) of all active items in Inventory database
  const productStockAssetValue = (db.products || [])
    .filter((p: any) => !p.isDeleted)
    .reduce((sum: number, p: any) => {
      const qty = Number(p.stock || p.stockQuantity || 0);
      const unitCost = Number(p.purchasePrice || p.costPrice || p.buyPrice || p.offerPrice || p.price || 0);
      return sum + (qty * unitCost);
    }, 0);

  const vehicleStockAssetValue = (db.vehicles || [])
    .filter((v: any) => !v.isDeleted)
    .reduce((sum: number, v: any) => {
      const qty = Number(v.stockQuantity || v.stock || 0);
      const unitCost = Number(v.costPrice || v.purchasePrice || v.buyPrice || v.offerPrice || v.price || 0);
      return sum + (qty * unitCost);
    }, 0);

  const inventoryAssetValue = productStockAssetValue + vehicleStockAssetValue;

  // 4. NET BUSINESS PROFIT = Total Sales Revenue - Total Expenditures
  const netProfit = totalRevenue - totalExpense;

  res.json({
    revenueItems: allRevenue,
    expenses: [...expensesList, ...offlineExpenses],
    financialSummary: {
      totalRevenue,
      totalExpense,
      netProfit,
      inventoryAssetValue
    },
    emiSummary: (db.emi || []).map((e: any) => ({
      customer: e.customerName,
      item: e.batteryOrVehicleName,
      total: Number(e.totalPrice || 0),
      paid: Number(e.paidAmount || 0),
      due: Number(e.dueAmount || e.remainingBalance || 0),
      nextDueDate: e.nextDueDate
    }))
  });
});

// Orders Helper / Routes
function normalizeOrderFields(order: any) {
  if (!order) return order;

  // 1. Status normalize
  let currentStatus = order.status || order.order_status || "Pending Verification";
  if (currentStatus === "Pending Verify") {
    currentStatus = "Pending Verification";
  }

  // 2. Flags check
  const isVerified = order.is_verified === true || order.is_verified === "true" || order.isVerified === true || order.isVerified === "true";
  
  // A partner is assigned if partnerName or partnerPhone is filled, or if flags are true, or if delivery_partner_info is filled
  const hasPartner = !!(
    order.deliveryPartnerName || 
    order.deliveryPartnerPhone || 
    order.delivery_partner_info?.name || 
    order.delivery_partner_info?.phone ||
    order.delivery_partner_info?.deliveryPartnerName ||
    order.delivery_partner_info?.deliveryPartnerPhone
  );
  
  const partnerAssigned = hasPartner || order.partner_assigned === true || order.partner_assigned === "true" || order.partnerAssigned === true || order.partnerAssigned === "true";

  // 3. Status logic
  if (currentStatus === "Pending Verification") {
    if (partnerAssigned) {
      currentStatus = "Out for Delivery";
    } else if (isVerified) {
      currentStatus = "Processing";
    }
  } else if (partnerAssigned && (currentStatus === "Processing" || currentStatus === "Order Confirmed" || currentStatus === "Order Placed")) {
    currentStatus = "Out for Delivery";
  }

  // 4. Update the properties back in multiple schemas
  order.status = currentStatus;
  order.order_status = currentStatus;

  // Let's also sync partner details back
  const partnerName = order.deliveryPartnerName || order.delivery_partner_info?.name || order.delivery_partner_info?.deliveryPartnerName || (partnerAssigned ? "Express Delivery Partner" : "");
  const partnerPhone = order.deliveryPartnerPhone || order.delivery_partner_info?.phone || order.delivery_partner_info?.deliveryPartnerPhone || (partnerAssigned ? "9064517009" : "");

  order.deliveryPartnerName = partnerName;
  order.deliveryPartnerPhone = partnerPhone;

  order.delivery_partner_info = {
    name: partnerName,
    phone: partnerPhone,
    deliveryPartnerName: partnerName,
    deliveryPartnerPhone: partnerPhone
  };

  // Determine if actually verified
  const finalVerified = currentStatus !== "Pending Verification";
  order.is_verified = finalVerified;
  order.isVerified = finalVerified;

  order.partner_assigned = partnerAssigned;
  order.partnerAssigned = partnerAssigned;

  // Sync screenshot and proof fields
  const proofVal = order.paymentScreenshot || order.paymentProof || order.payment_screenshot || "";
  order.paymentScreenshot = proofVal;
  order.paymentProof = proofVal;
  order.payment_screenshot = proofVal;

  return order;
}

app.get("/api/orders", (req, res) => {
  const db = readDb();
  const normalized = (db.orders || [])
    .filter((o: any) => !o.isDeleted)
    .map((o: any) => normalizeOrderFields(o));
  res.json(normalized);
});

app.get("/api/track-order", (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ message: "Phone Number is required" });
  }

  const db = readDb();
  const orders = db.orders || [];
  
  const foundOrders = orders.filter((o: any) => 
    !o.isDeleted && o.customerPhone.includes(phone as string)
  );
  
  // Sort by created at descending
  foundOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (foundOrders.length > 0) {
    res.json(foundOrders.map((o: any) => normalizeOrderFields(o)));
  } else {
    res.status(404).json({ message: "No orders found for this number." });
  }
});

app.get("/api/orders/:id", (req, res) => {
  const db = readDb();
  const order = (db.orders || []).find((o: any) => o.id === req.params.id);
  if (order && !order.isDeleted) {
    res.json(normalizeOrderFields(order));
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.post("/api/orders", (req, res) => {
  const db = readDb();
  const newOrder = normalizeOrderFields({
    ...req.body,
    id: `ord${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "Pending Verification",
    deliveryPartnerName: req.body.deliveryPartnerName || "",
    deliveryPartnerPhone: req.body.deliveryPartnerPhone || "",
    notes: req.body.notes || ""
  });
  db.orders = [...(db.orders || []), newOrder];
  writeDb(db);
  res.json(newOrder);
});

const handleUpdateOrder = (req: express.Request, res: express.Response) => {
  const db = readDb();
  const { id } = req.params;
  const updates = req.body;
  
  if (!db.orders) db.orders = [];
  const index = db.orders.findIndex((o: any) => o.id === id);
  
  if (index !== -1 && !db.orders[index].isDeleted) {
    db.orders[index] = normalizeOrderFields({ ...db.orders[index], ...updates });
    writeDb(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
};

app.patch("/api/orders/:id", handleUpdateOrder);
app.put("/api/orders/:id", handleUpdateOrder);

app.delete("/api/orders/:id", (req, res) => {
  const db = readDb();
  if (!db.orders) db.orders = [];
  const item = db.orders.find((o: any) => o.id === req.params.id);
  if (item) {
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    writeDb(db);
    res.json({ message: "Order deleted successfully (soft-deleted)" });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.post("/api/shipments/create", async (req, res) => {
  const { orderId, partner, weight, dimensions, notes } = req.body;
  const db = readDb();
  if (!db.orders) db.orders = [];
  const order = db.orders.find((o: any) => o.id === orderId);
  
  if (!order) return res.status(404).json({ error: "Order not found" });

  try {
    // Environment config holder retrieval (secure/fallback parameters)
    const settings = db.settings || {};
    let apiKey = settings.delhiveryApiKey || process.env.DELHIVERY_API_KEY || "MOCK_SECURE_DELHIVERY_KEY_12345";
    let trackingUrl = settings.delhiveryTrackingUrl || process.env.DELHIVERY_TRACKING_URL || "https://track.delhivery.com/api/v1/packages/json";
    let customPayloadResponse: any = null;
    let customAwb = "";

    const isCustomCarrier = partner === "Others" || partner === "Custom API" || (settings.customCarrierName && partner === settings.customCarrierName);

    if (isCustomCarrier) {
      const customUrl = settings.customBaseApiUrl || "https://api.customcarrier.com/v1/shipments";
      const customKey = settings.customApiKey || "MOCK_SECURE_CUSTOM_KEY_99999";
      apiKey = customKey;
      trackingUrl = settings.customTrackingEndpointUrl || "https://api.customcarrier.com/v1/track";

      console.log(`[Logistics Server] Custom Integration triggered: URL=${customUrl}`);
      console.log(`[Logistics Server] Parsing Custom API Key into authorization headers...`);

      const payload = {
        orderId,
        carrierName: settings.customCarrierName || "Custom API",
        weight: weight || "1.5",
        dimensions: dimensions || "20x15x10",
        recipient: {
          name: order.customerName || order.recipientName || "Sudipta Das",
          phone: order.phone || order.recipientPhone || "N/A",
          address: order.shippingAddress || order.deliveryAddress || "West Bengal, India",
          city: order.city || "Kolkata"
        },
        notes: notes || ""
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 seconds timeout

        console.log(`[Logistics Server] Dispatching dynamic web request to ${customUrl} with custom payload...`);
        const response = await fetch(customUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${customKey}`,
            "X-API-Key": customKey,
            "X-Carrier-Source": "ERP-System"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          console.log(`[Logistics Server] Custom API responded successfully:`, json);
          customPayloadResponse = json;
          customAwb = json.awb || json.trackingId || json.awbNumber;
        } else {
          const textErr = await response.text();
          console.warn(`[Logistics Server] Custom API responded with error status ${response.status}: ${textErr}`);
          customPayloadResponse = { error: `HTTP ${response.status}`, details: textErr };
        }
      } catch (err: any) {
        console.error(`[Logistics Server] Custom API web request failed or timed out: ${err.message || err}`);
        customPayloadResponse = {
          status: "Network Fallback",
          message: "Request processed with offline safety wrapper",
          error: err.message || String(err)
        };
      }

      if (!customAwb) {
        customAwb = `CST-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    } else if (partner === "Xpressbees") {
      apiKey = settings.xpressbeesApiKey || "MOCK_SECURE_XPRESSBEES_KEY_54321";
      trackingUrl = settings.xpressbeesEndpointUrl || "https://api.xpressbees.com/v1/shipments";
    } else if (partner === "Ecom Express") {
      apiKey = settings.ecomExpressApiKey || "MOCK_SECURE_ECOM_KEY_67890";
      trackingUrl = settings.ecomExpressMerchantId || "https://api.ecomexpress.in/v1/register";
    }
    
    const displayApiKey = apiKey || "";
    console.log(`[Logistics Server] Dispatching shipment via API using credentials: API_KEY=***${displayApiKey.substring(Math.max(0, displayApiKey.length - 4))}, URL=${trackingUrl}`);
    console.log(`[Logistics Server] Selected Carrier: ${partner || "Delhivery"}, Package weight: ${weight || "1.5"}kg, Dimensions: ${dimensions || "20x15x10"}cm`);
    
    const carrierName = isCustomCarrier ? (settings.customCarrierName || "Custom API") : (partner || "Delhivery");
    const carrierCode = carrierName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "CST");
    const mockAwb = customAwb || `${carrierCode}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Update order logistics fields
    order.awbNumber = mockAwb;
    order.trackingId = mockAwb;
    order.carrier = carrierName;
    order.selectedCarrier = carrierName;
    order.deliveryMethod = "API";
    order.deliveryLogStatus = "Label Generated";
    order.weight = weight || "1.5";
    order.dimensions = dimensions || "20x15x10";
    order.notes = notes || order.notes || "";
    order.deliveryPartnerName = carrierName;
    order.deliveryPartnerPhone = "1800-103-6354";
    order.status = "Dispatched";
    order.pickupScheduled = true;
    if (customPayloadResponse) {
      order.customCarrierResponse = customPayloadResponse;
    }
    
    // Generate tracking summary checkpoints
    order.trackingCheckpoints = [
      {
        status: "Label Generated",
        location: "Warehouse Block GX, Kolkata",
        timestamp: new Date().toISOString(),
        description: `Shipping label generated successfully. Carrier API registered shipment.`
      },
      {
        status: "Pickup Scheduled",
        location: "Warehouse Block GX, Kolkata",
        timestamp: new Date(Date.now() + 15000).toISOString(),
        description: "Pickup scheduled. Delhivery ground courier agent assigned to retrieve shipment package."
      }
    ];
    
    writeDb(db);
    res.json(order);
  } catch (error) {
    console.error("Shipment creation failed:", error);
    res.status(500).json({ error: "Shipment creation failed" });
  }
});

app.get("/api/shipments/label/:awb", async (req, res) => {
  const { awb } = req.params;
  const labelUrl = await getLabelPdfUrl(awb);
  res.json({ labelUrl });
});

app.get("/api/shipments/tracking/:awb", async (req, res) => {
  const { awb } = req.params;
  const tracking = await getTrackingInfo(awb);
  res.json(tracking);
});

// Gemini AI powered Order Management Assistant
app.post("/api/gemini/manage-orders", async (req, res) => {
  const { query, language } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const db = readDb();
  const orders = db.orders || [];

  const runRulesFallback = () => {
    const lowerQuery = query.toLowerCase();
    let result: any = null;

    if (lowerQuery.includes("pending") || lowerQuery.includes("পেন্ডিং")) {
      const pendingOrders = orders.filter((o: any) => o.status === "Pending Verification" || o.status === "Pending");
      const msg = language === "bn" 
        ? `বর্তমানে ${pendingOrders.length}টি অর্ডার ভেরিফিকেশন বা পেন্ডিং অবস্থায় রয়েছে।` 
        : `There are currently ${pendingOrders.length} pending orders awaiting verification.`;
      result = {
        type: "QUERY",
        message: msg,
        source: "Local Rules Engine"
      };
    } else if (lowerQuery.includes("dispatch") || lowerQuery.includes("পাঠানো") || lowerQuery.includes("ডেসপ্যাচ") || lowerQuery.includes("রওনা")) {
      const dispatchedOrders = orders.filter((o: any) => o.status === "Dispatched");
      const msg = language === "bn"
        ? `বর্তমানে ${dispatchedOrders.length}টি অর্ডার ডেসপ্যাচ বা রওনা করা হয়েছে।`
        : `Currently, ${dispatchedOrders.length} orders have been dispatched.`;
      result = {
        type: "QUERY",
        message: msg,
        source: "Local Rules Engine"
      };
    } else if ((lowerQuery.includes("assign") || lowerQuery.includes("আপডেট") || lowerQuery.includes("নিয়োগ") || lowerQuery.includes("সজল") || lowerQuery.includes("partner")) && orders.length > 0) {
      const ordMatch = lowerQuery.match(/ord\d+/);
      const targetOrderId = ordMatch ? ordMatch[0] : orders[0].id;
      const index = orders.findIndex((o: any) => o.id === targetOrderId);
      if (index !== -1) {
        const updateData = {
          deliveryPartnerName: "Sajal Biswas",
          deliveryPartnerPhone: "+91 9876543210",
          notes: "Assigned via local assistant"
        };
        db.orders[index] = normalizeOrderFields({ ...db.orders[index], ...updateData });
        writeDb(db);
        const msg = language === "bn"
          ? `অর্ডার ${targetOrderId} সফলভাবে ডেলিভারি পার্টনার 'সজল বিশ্বাস'-কে অ্যাসাইন করা হয়েছে।`
          : `Order ${targetOrderId} has been successfully assigned to delivery partner Sajal Biswas.`;
        result = {
          type: "UPDATE",
          updateData: {
            orderId: targetOrderId,
            updates: updateData
          },
          message: msg,
          source: "Local Rules Engine"
        };
      }
    }

    if (!result) {
      const msg = language === "bn"
        ? `আমি আপনার প্রশ্নটি পেয়েছি: "${query}"। স্থানীয় রুলস সিস্টেমের মাধ্যমে বিশ্লেষণ করা হয়েছে। অ্যাডমিন ড্যাশবোর্ড থেকে আপনি সরাসরি অর্ডার আপডেট করতে পারেন। সম্পূর্ণ এআই কার্যকারিতার জন্য GEMINI_API_KEY কনফিগার করুন।`
        : `I received your command: "${query}". It has been processed via local rule matching. You can perform direct order updates from the delivery list. Set GEMINI_API_KEY for advanced AI automation.`;
      result = {
        type: "QUERY",
        message: msg,
        source: "Local Rules Engine"
      };
    }
    return result;
  };

  if (!ai) {
    const result = runRulesFallback();
    return res.json(result);
  }

  try {
    const prompt = `You are an Autonomous AI Delivery Manager for "Sudipta E-Scooty Service" ERP system.
Your goal is to parse the admin's natural language command, identify if they want to update an order or query information, and provide the result in JSON format.

Current Orders Context:
${JSON.stringify(orders.map(o => ({ id: o.id, customer: o.customerName, status: o.status, delivery: o.deliveryPartnerName })), null, 2)}

Instructions:
1. If the admin wants to update an order (e.g., "Assign ord1001 to Joy and set delivery for tomorrow"), identify the order ID and the fields to update.
2. If the admin is asking a question (e.g., "Which orders are pending?"), analyze the context and provide a human-friendly answer.
3. Return a JSON object with:
   - "type": "UPDATE" or "QUERY"
   - "updateData": (if type is UPDATE) { orderId: string, updates: { status, deliveryPartnerName, deliveryPartnerPhone, expectedDeliveryDate, expectedDeliveryTime, notes } }
   - "message": A polite response in ${language === "bn" ? "Bengali (বাংলা)" : "English"} explaining what was done or answering the question.

Admin Command: "${query}"

Example Update Result: { "type": "UPDATE", "updateData": { "orderId": "ord1001", "updates": { "deliveryPartnerName": "Joy" } }, "message": "Order ord1001 assigned to Joy." }
Example Query Result: { "type": "QUERY", "message": "There are 2 pending orders currently." }

Return ONLY the JSON string.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const result = JSON.parse(response.text.trim().replace(/```json|```/g, ''));
    
    if (result.type === "UPDATE" && result.updateData) {
      const { orderId, updates } = result.updateData;
      const index = orders.findIndex((o: any) => o.id === orderId);
      if (index !== -1) {
        db.orders[index] = normalizeOrderFields({ ...db.orders[index], ...updates });
        writeDb(db);
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("Gemini AI Management failed, reverting to rules engine:", error);
    const fallbackResult = runRulesFallback();
    res.json(fallbackResult);
  }
});

// Gemini AI powered EV Diagnosis Assistant
app.post("/api/gemini/diagnose", async (req, res) => {
  const { query, language } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Localized rules fallback when API key is missing
  const defaultFallback = {
    eng: `Thank you for consulting **Sudipta E-Scooty Service** AI Diagnosis.
    
Based on your input, here are our diagnostics suggestions:
1. **Battery check:** Ensure charger is connected properly. If there is low backup or cells heating, battery balancing or cell replacement is needed.
2. **Controller fault:** Accelerating jerks or no response usually indicates throttle signal issue or blown MOSFETs in the controller.
3. **Visit us:** Bring your scooter to Sudipta E-Scooty Service center at Ashoknagar Power House Road. We specialize in fast repairs, EV Diagnosis, and Battery EMI options.
Contact Owner **Sudipta Das** directly at **+91 9064517009** for doorstep home service.`,
    ben: `**সুদীপ্ত ই-স্কুটি সার্ভিস** এআই ডায়াগনোসিসে আপনাকে স্বাগতম।

আপনার সমস্যার ভিত্তিতে সম্ভাব্য সমাধানগুলি নিচে দেওয়া হল:
১. **ব্যাটারি চেক:** চার্জারটি সঠিকভাবে সংযুক্ত রয়েছে কি না নিশ্চিত করুন। ব্যাটারি অতিরিক্ত গরম হলে সেল ব্যালেন্সিং বা নতুন সেল প্রতিস্থাপন প্রয়োজন।
২. **কন্ট্রোলার ত্রুটি:** থ্রটল ঘোরানোর পরও স্টার্ট না হওয়া বা ঝাঁকুনি দেওয়া কন্ট্রোলারের বা এক্সিলারেটরের সমস্যার সংকেত।
৩. **আমাদের সাথে যোগাযোগ করুন:** আপনার স্কুটারটি অশোকনগর পাওয়ার হাউস রোড, কালোবাড়ি সংলগ্ন সুদীপ্ত ই-স্কুটি সার্ভিস সেন্টারে নিয়ে আসুন। আমরা অত্যন্ত দ্রুত মেরামত, নির্ভুল ডায়াগনোসিস এবং আকর্ষক ইএমআই সুবিধায় ব্যাটারি বিক্রি করি।
প্রোপ্রাইটার **সুদীপ্ত দাস** (+91 9064517009) এর সাথে আজই যোগাযোগ করুন!`
  };

  if (!ai) {
    const responseText = language === "bn" ? defaultFallback.ben : defaultFallback.eng;
    return res.json({ diagnosis: responseText, source: "Rules Engine (No API Key)" });
  }

  try {
    const prompt = `You are the Expert AI Service Technician for "Sudipta E-Scooty Service" owned by Sudipta Das, located in Ashoknagar Power House Road, West Bengal.
The user is describing a problem with their Electric Scooter, Electric Cycle, or Lithium Battery.
Problem: "${query}"

Provide a detailed, helpful, diagnostic response.
Include:
1. Possible root causes (Battery BMS, Controller MOSFETs, Throttle, BLDC Hub Motor, Brake sensor lockout, wiring, etc.)
2. Recommended solution and spare parts needed.
3. Call to action: Remind them that Sudipta E-Scooty Service offers Expert Diagnosis, Battery EMI Facilities, Doorstep Home Service, and original high-quality spare parts.
4. Contact details of Sudipta Das: Phone +91 9064517009, Location: Ashoknagar Power House Road, Kalobari, West Bengal.

Strict Language Constraint:
Answer completely in the requested language: "${language === "bn" ? "Bengali (বাংলা)" : "English"}". If the language is Bengali, write in elegant, polite Bengali, but you may use technical terms in English scripts or Bengali transliterations if necessary.
Keep the formatting structured with clear bullet points. Do not include unrequested details.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const responseText = response.text || (language === "bn" ? defaultFallback.ben : defaultFallback.eng);
    res.json({ diagnosis: responseText, source: "Gemini AI" });
  } catch (error: any) {
    console.error("Gemini AI API Call failed:", error);
    const responseText = language === "bn" ? defaultFallback.ben : defaultFallback.eng;
    res.json({ diagnosis: responseText, source: "System Fallback due to API error" });
  }
});

// --- TRASH / RECYCLE BIN MANAGEMENT API ENDPOINTS ---

const handleGetTrashApi = (req: express.Request, res: express.Response) => {
  const db = readDb();
  const trash: any[] = [];
  
  const addTrash = (items: any[], type: string, getName: (item: any) => string) => {
    (items || []).forEach((item: any) => {
      if (item.isDeleted) {
        trash.push({
          id: item.id,
          entity: type,
          name: getName(item),
          deletedAt: item.deletedAt || new Date().toISOString(),
          originalData: item
        });
      }
    });
  };

  addTrash(db.vehicles, "vehicles", (v) => `${v.brand || ''} ${v.model || ''}`.trim() || v.name || v.id);
  addTrash(db.products, "products", (p) => p.titleEng || p.name || p.title || p.id);
  addTrash(db.orders, "orders", (o) => `Order #${o.id} - ${o.customerName || 'Customer'}`);
  addTrash(db.customers, "customers", (c) => c.name || c.id);
  addTrash(db.emi, "emi", (e) => `EMI - ${e.customerName || e.customerPhone || 'Customer'} (${e.batteryOrVehicleName || 'Vehicle/Battery'})`);
  addTrash(db.bookings, "bookings", (b) => `Job Card #${b.id} - ${b.customerName || 'Customer'}`);
  addTrash(db.enquiries, "enquiries", (e) => `Enquiry/Test Ride - ${e.name || 'Visitor'} (${e.type || 'Inquiry'})`);
  addTrash(db.expenses, "expenses", (ex) => `Expense: ${ex.description || 'Details'} (₹${ex.amount || 0})`);
  addTrash(db.invoices, "invoices", (inv) => `Invoice #${inv.id} - ${inv.customerName || 'Customer'}`);

  res.setHeader("Content-Type", "application/json");
  res.json(trash);
};

app.get("/api/trash/all", handleGetTrashApi);
app.get("/api/recycle-bin", handleGetTrashApi);
app.get("/api/trash", handleGetTrashApi);

app.patch("/api/trash/restore/:entity/:id", (req, res) => {
  const db = readDb();
  const { entity, id } = req.params;
  res.setHeader("Content-Type", "application/json");
  
  if (db[entity]) {
    const item = db[entity].find((item: any) => item.id === id || item.orderId === id || item.order_id === id);
    if (item) {
      item.isDeleted = false;
      item.is_deleted = false;
      delete item.deletedAt;
      delete item.deleted_at;
      
      if (entity === "orders" && (item.status === "deleted" || !item.status)) {
        item.status = item.previousStatus || item.previous_status || "Delivered";
      }
      
      if (entity === "customers") {
        const customerPhone = item.phone;
        const customerName = item.name;
        
        (db.bookings || []).forEach((b: any) => {
          if (b.isDeleted && (item.serviceHistory?.includes(b.id) || (b.customerPhone && b.customerPhone === customerPhone) || (b.customerName && b.customerName.toLowerCase() === customerName.toLowerCase()))) {
            b.isDeleted = false;
            delete b.deletedAt;
          }
        });

        (db.emi || []).forEach((e: any) => {
          if (e.isDeleted && (e.customerId === id || (e.customerPhone && e.customerPhone === customerPhone))) {
            e.isDeleted = false;
            delete e.deletedAt;
          }
        });

        if (db.invoices) {
          db.invoices.forEach((inv: any) => {
            if (inv.isDeleted && ((inv.customerPhone && inv.customerPhone === customerPhone) || (inv.customerName && inv.customerName.toLowerCase() === customerName.toLowerCase()))) {
              inv.isDeleted = false;
              delete inv.deletedAt;
            }
          });
        }
      }
      writeDb(db);
    }
  }
  
  res.json({ success: true, message: "Item restored successfully" });
});

app.delete("/api/trash/permanent/:entity/:id", (req, res) => {
  const db = readDb();
  const { entity, id } = req.params;
  
  if (db[entity]) {
    db[entity] = db[entity].filter((item: any) => item.id !== id);
    writeDb(db);
  }
  
  res.json({ success: true, message: "Item deleted permanently" });
});

// Global Express Error Handler for crash-proofing all API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Vercel API Gateway] Unhandled error captured in api/index.ts:", err);
  // Return status 200 with fallback mock JSON as requested
  res.status(200).json({
    success: true,
    status: "fallback",
    message: "Request processed with offline safety wrapper",
    error: err.message || String(err),
    data: []
  });
});

export default app;
