import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/src/assets", express.static(path.join(__dirname, "src/assets")));

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

// Create data directory if not exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
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
        "/src/assets/images/fleeto_wolf_warrior_moped_1782481931851.jpg"
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
        "/src/assets/images/fleeto_panther_scooter_1782481064099.jpg"
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
      images: ["/src/assets/images/fleeto_60v_30ah_battery_1782482443273.jpg"],
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
      images: ["/src/assets/images/sudipta_power_controller_1782484517289.jpg"],
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
      images: ["/src/assets/images/regenerated_image_1782484212276.jpg"],
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
      contentBen: "সম্পূর্ণ ইভি ডায়াগনোসিস এবং ওয়্যারিং সার্ভিসিং-এ সরাসরি ২০% ছাড় পান। বর্ষার স্যাঁতসেঁতে ভাব থেকে আপনার স্কুটার রক্ষা করুন। আজই যোগাযোগ করুন সুদীপ্ত দাসের সাথে!",
      date: "2026-06-24"
    },
    {
      id: "a2",
      titleEng: "Easy Battery EMI Facility Now Open",
      titleBen: "সহজ ব্যাটারি ইএমআই সুবিধা এখন উপলব্ধ",
      contentEng: "Don't pay all at once! Get your high-speed LFP or Lithium-ion battery with easy monthly installments. Low down payment starts from only ₹5000.",
      contentBen: "একবারে সব টাকা দিতে হবে না! সহজ মাসিক কিস্তিতে আপনার হাই-স্পিড এলএফপি বা লিথিয়াম-আয়ন ব্যাটারি পান। মাত্র ৫০০০ টাকা থেকে ডাউন পেমেন্ট শুরু হচ্ছে।",
      date: "2026-06-20"
    }
  ],
  expenses: [
    { id: "ex1", description: "Workshop rent", amount: 6500, category: "Rent", date: "2026-06-01" },
    { id: "ex2", description: "Hydraulic lift maintenance grease", amount: 450, category: "Maintenance", date: "2026-06-05" },
    { id: "ex3", description: "Tea and snacks for clients", amount: 320, category: "Refreshments", date: "2026-06-10" },
    { id: "ex4", description: "Electric bill", amount: 1850, category: "Utilities", date: "2026-06-20" }
  ]
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json", error);
    return initialData;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing db.json", error);
  }
}

// REST API routes

// GET metadata/stats
app.get("/api/dashboard-stats", (req, res) => {
  const db = readDb();
  const lowStockThreshold = 5;
  const lowStockCount = db.products.filter((p: any) => p.stock < lowStockThreshold).length + 
                       db.vehicles.filter((v: any) => v.stockQuantity < 3).length;

  const totalSales = db.bookings
    .filter((b: any) => b.status === "Completed" && b.paymentStatus === "Paid")
    .reduce((sum: number, b: any) => sum + b.totalAmount, 0) +
    db.emi.reduce((sum: number, e: any) => sum + e.paidAmount, 0);

  const pendingBookings = db.bookings.filter((b: any) => b.status === "Pending").length;
  const activeEmiCount = db.emi.filter((e: any) => e.remainingBalance > 0).length;

  res.json({
    totalVehicles: db.vehicles.length,
    totalProducts: db.products.length,
    totalCustomers: db.customers.length,
    pendingBookings,
    activeEmiCount,
    lowStockCount,
    totalSales,
    announcementsCount: db.announcements.length
  });
});

// Vehicles REST Endpoints
app.get("/api/vehicles", (req, res) => {
  res.json(readDb().vehicles);
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

app.put("/api/vehicles/:id", (req, res) => {
  const db = readDb();
  const index = db.vehicles.findIndex((v: any) => v.id === req.params.id);
  if (index !== -1) {
    db.vehicles[index] = { ...db.vehicles[index], ...req.body };
    writeDb(db);
    res.json(db.vehicles[index]);
  } else {
    res.status(404).json({ message: "Vehicle not found" });
  }
});

app.delete("/api/vehicles/:id", (req, res) => {
  const db = readDb();
  db.vehicles = db.vehicles.filter((v: any) => v.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Vehicle deleted successfully" });
});

// Products / Spare Parts REST Endpoints
app.get("/api/products", (req, res) => {
  res.json(readDb().products);
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

app.put("/api/products/:id", (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDb();
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Product deleted successfully" });
});

// Customers REST Endpoints
app.get("/api/customers", (req, res) => {
  res.json(readDb().customers);
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
  db.customers = db.customers.filter((c: any) => c.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Customer deleted successfully" });
});

// Service Bookings / Jobs REST Endpoints
app.get("/api/bookings", (req, res) => {
  res.json(readDb().bookings);
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
  db.bookings = db.bookings.filter((b: any) => b.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Booking deleted successfully" });
});

// EMI Management REST Endpoints
app.get("/api/emi", (req, res) => {
  res.json(readDb().emi);
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

app.delete("/api/emi/:id", (req, res) => {
  const db = readDb();
  db.emi = db.emi.filter((e: any) => e.id !== req.params.id);
  writeDb(db);
  res.json({ message: "EMI deleted successfully" });
});

// Enquiries REST Endpoints
app.get("/api/enquiries", (req, res) => {
  res.json(readDb().enquiries);
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
  db.enquiries = db.enquiries.filter((e: any) => e.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Enquiry deleted successfully" });
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
    ...req.body
  };
  db.announcements.push(newAnnouncement);
  writeDb(db);
  res.status(201).json(newAnnouncement);
});

app.delete("/api/announcements/:id", (req, res) => {
  const db = readDb();
  db.announcements = db.announcements.filter((a: any) => a.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Announcement deleted successfully" });
});

// Expenses REST Endpoints
app.get("/api/expenses", (req, res) => {
  res.json(readDb().expenses);
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
  db.expenses = db.expenses.filter((ex: any) => ex.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Expense deleted successfully" });
});

// Reports API Compile
app.get("/api/reports", (req, res) => {
  const db = readDb();

  // Sales and Service revenue
  const salesAndServices = db.bookings
    .filter((b: any) => b.status === "Completed")
    .map((b: any) => ({
      id: b.id,
      date: b.bookingDate,
      customer: b.customerName,
      type: "Service Repair",
      item: b.vehicleDetails,
      amount: b.totalAmount,
      status: b.paymentStatus
    }));

  const emiCollections = db.emi.flatMap((e: any) =>
    e.paymentHistory.map((ph: any) => ({
      id: e.id,
      date: ph.date,
      customer: e.customerName,
      type: "EMI Collection",
      item: e.batteryOrVehicleName,
      amount: ph.amount,
      status: "Paid"
    }))
  );

  const allRevenue = [...salesAndServices, ...emiCollections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalRevenue = allRevenue.reduce((sum, item) => sum + (item.status === "Paid" ? Number(item.amount) : 0), 0);
  const totalExpense = db.expenses.reduce((sum: number, ex: any) => sum + Number(ex.amount), 0);

  // Stock values
  const productStockValue = db.products.reduce((sum: number, p: any) => sum + (Number(p.stock) * Number(p.offerPrice)), 0);
  const vehicleStockValue = db.vehicles.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) * Number(v.offerPrice)), 0);

  res.json({
    revenueItems: allRevenue,
    expenses: db.expenses,
    financialSummary: {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      inventoryAssetValue: productStockValue + vehicleStockValue
    },
    emiSummary: db.emi.map((e: any) => ({
      customer: e.customerName,
      item: e.batteryOrVehicleName,
      total: e.totalPrice,
      paid: e.paidAmount,
      due: e.dueAmount,
      nextDueDate: e.nextDueDate
    }))
  });
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

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
