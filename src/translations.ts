export type Language = "bn" | "en";

export interface TranslationDict {
  brandName: string;
  ownerName: string;
  ownerRole: string;
  phone: string;
  email: string;
  address: string;
  addressLabel: string;
  whatsappButton: string;
  callNowButton: string;
  facebookButton: string;
  emailButton: string;
  followOnFacebook: string;
  facebookUpdatesTitle: string;
  facebookUpdatesDesc: string;
  facebookUpdatesNote: string;
  bengali: string;
  english: string;
  homeMenu: string;
  showroomMenu: string;
  partsStoreMenu: string;
  diagnosisMenu: string;
  adminMenu: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA1: string;
  heroCTA2: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  servicesTitle: string;
  servicesSubtitle: string;
  featuredProductsTitle: string;
  reviewsTitle: string;
  whyChooseUsTitle: string;
  contactTitle: string;
  contactSubtitle: string;
  footerRights: string;
  footerDeveloper: string;
  showroomTitle: string;
  showroomSubtitle: string;
  partsStoreTitle: string;
  partsStoreSubtitle: string;
  diagnosisTitle: string;
  diagnosisSubtitle: string;
  diagnosisPlaceholder: string;
  diagnosisAskButton: string;
  diagnosisDisclaimer: string;
  bookTestRide: string;
  enquireNow: string;
  availableColors: string;
  specifications: string;
  brand: string;
  model: string;
  price: string;
  offerPrice: string;
  emiStarting: string;
  range: string;
  topSpeed: string;
  motorPower: string;
  batteryType: string;
  chargingTime: string;
  warranty: string;
  stockStatus: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  bookingFormTitle: string;
  fullName: string;
  phoneNumber: string;
  selectVehicle: string;
  selectType: string;
  testRide: string;
  generalEnquiry: string;
  serviceEnquiry: string;
  message: string;
  submitButton: string;
  submittingButton: string;
  successMessage: string;
  closeButton: string;
  adminLoginTitle: string;
  passcodeLabel: string;
  loginButton: string;
  invalidPasscode: string;
  logoutButton: string;
  erpDashboardTitle: string;
  erpDashboardSubtitle: string;
  statsTotalSales: string;
  statsActiveEMI: string;
  statsLowStock: string;
  statsPendingBookings: string;
  statsTotalVehicles: string;
  statsTotalProducts: string;
  statsTotalCustomers: string;
  secDashboard: string;
  secVehicles: string;
  secSpareParts: string;
  secCustomers: string;
  secEMI: string;
  secServices: string;
  secEnquiries: string;
  secExpenses: string;
  secAnnouncements: string;
  secReports: string;
  btnAddNewVehicle: string;
  btnAddNewPart: string;
  btnAddNewCustomer: string;
  btnCreateServiceBooking: string;
  btnCreateEMIPlan: string;
  btnLogExpense: string;
  btnCreateAnnouncement: string;
  thAction: string;
  thStatus: string;
  thDate: string;
  thCustomer: string;
  thAmount: string;
  thPhone: string;
  thVehicle: string;
  invoiceTitle: string;
  invoiceSubtitle: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceTo: string;
  partsUsedTable: string;
  serviceChargeLabel: string;
  totalBillAmount: string;
  paymentStatusLabel: string;
  paymentMethodLabel: string;
  printInvoice: string;
  downloadReceipt: string;
  emiCalculatorTitle: string;
  emiCalcDownPayment: string;
  emiCalcMonthlyEMI: string;
  emiCalcRemaining: string;
  emiCalcAutoButton: string;
  emiNextDueDate: string;
  lowStockAlert: string;
  expenseCategory: string;
}

export const translations: Record<Language, TranslationDict> = {
  bn: {
    brandName: "সুদীপ্ত ই-স্কুটি সার্ভিস",
    ownerName: "সুদীপ্ত দাস",
    ownerRole: "প্রোপ্রাইটার",
    phone: "+91 9064517009",
    email: "iamsudiptadas666@gmail.com",
    address: "অশোকনগর পাওয়ার হাউস রোড, কালোবাড়ি, বাঘাযতীন খেলার মাঠ সংলগ্ন, উত্তর ২৪ পরগণা, পশ্চিমবঙ্গ – ৭৪৩২২২, ভারত",
    addressLabel: "ঠিকানা",
    whatsappButton: "হোয়াটসঅ্যাপ চ্যাট",
    callNowButton: "কল করুন",
    facebookButton: "ফেসবুক পেজ",
    emailButton: "ইমেইল পাঠান",
    followOnFacebook: "আমাদের ফেসবুকে ফলো করুন",
    facebookUpdatesTitle: "ফেসবুক থেকে সর্বশেষ আপডেট",
    facebookUpdatesDesc: "আমরা আমাদের ফেসবুক পেজে নিয়মিত বিভিন্ন শিক্ষণীয় ভিডিও, নতুন গাড়ি লঞ্চ, আকর্ষণীয় অফার এবং সফল ডেলিভারির ছবি পোস্ট করি।",
    facebookUpdatesNote: "নতুন মডেলের রিভিউ ভিডিও, ইভি সার্ভিসিং টিপস এবং গ্রাহকদের অভিজ্ঞতা জানতে নিচের বাটনে ক্লিক করে আমাদের অফিসিয়াল ফেসবুক পেজে যুক্ত হন।",
    bengali: "বাংলা",
    english: "English",
    homeMenu: "হোম",
    showroomMenu: "গাড়ির শোরুম",
    partsStoreMenu: "খুচরা যন্ত্রাংশ",
    diagnosisMenu: "এআই ইভি ডায়াগনোসিস",
    adminMenu: "এডমিন ইআরপি (ERP)",
    heroTitle: "আধুনিক ইলেকট্রিক স্কুটার সার্ভিস এবং নির্ভরযোগ্য ইভি পার্টস ডিলার",
    heroSubtitle: "সুদীপ্ত ই-স্কুটি সার্ভিস - আমরা অত্যন্ত যত্ন সহকারে ই-স্কুটার রিপেয়ার, ব্যাটারি সার্ভিসিং এবং ইএমআই (EMI) সুবিধায় ব্যাটারি প্রদান করি।",
    heroCTA1: "শোরুম ব্রাউজ করুন",
    heroCTA2: "সার্ভিস বুকিং করুন",
    aboutTitle: "আমাদের সম্পর্কে",
    aboutText1: "সুদীপ্ত ই-স্কুটি সার্ভিস উত্তর ২৪ পরগণা জেলার অশোকনগরে অবস্থিত একটি প্রিমিয়াম ইলেকট্রিক স্কুটার এবং সাইকেল মেরামতের বিশ্বস্ত প্রতিষ্ঠান। অভিজ্ঞ ইভি ইঞ্জিনিয়ার এবং অত্যাধুনিক রোগ নির্ণয় (EV Diagnosis) প্রযুক্তির সাহায্যে আমরা আপনার দ্বিচক্র বাহনকে রাখি নতুনের মতো সচল।",
    aboutText2: "আমাদের এখানে ইলেকট্রিক স্কুটার ও সাইকেলের সকল প্রকার আসল খুচরা যন্ত্রাংশ ও উন্নতমানের ব্যাটারি অত্যন্ত সুলভ মূল্যে পাওয়া যায়। তাছাড়া আমরা গ্রাহকদের সুবিধার্থে ব্যাটারির ওপর সহজ ইএমআই (EMI) সুবিধা এবং হোম সার্ভিস প্রদান করি।",
    servicesTitle: "আমাদের সেবাসমূহ",
    servicesSubtitle: "অত্যন্ত দক্ষতার সাথে আপনার ইলেকট্রিক স্কুটারের যত্ন নিই",
    featuredProductsTitle: "সেরা ব্যাটারি এবং খুচরা যন্ত্রাংশ",
    reviewsTitle: "সন্তুষ্ট গ্রাহকদের মতামত",
    whyChooseUsTitle: "কেন আমাদের বেছে নেবেন?",
    contactTitle: "যোগাযোগ করুন",
    contactSubtitle: "যেকোনো ধরণের পরামর্শ, বুকিং বা ইভি ব্যাটারি ক্রয়ের জন্য সরাসরি যোগাযোগ করুন",
    footerRights: "সর্বস্বত্ব সংরক্ষিত। সুদীপ্ত ই-স্কুটি সার্ভিস।",
    footerDeveloper: "ডিজাইন ও ডেভেলপমেন্ট: এআই স্টুডিও বিল্ড টিম",
    showroomTitle: "সুদীপ্ত ইভি ওয়ার্ল্ড (Sudipta EV World)",
    showroomSubtitle: "আমাদের স্টক করা অত্যাধুনিক ই-স্কুটারগুলি দেখুন, বিস্তারিত স্পেসিফিকেশন জানুন এবং আজই আপনার টেস্ট রাইড বুক করুন।",
    partsStoreTitle: "খুচরা যন্ত্রাংশের দোকান",
    partsStoreSubtitle: "আসল ব্যাটারি, চার্জার, ইন্টেলিজেন্ট কন্ট্রোলার, মোটর এবং আনুষঙ্গিক সমস্ত ইভি পার্টস সেরা অফার মূল্যে কিনুন।",
    diagnosisTitle: "স্মার্ট এআই (AI) ইভি রোগ নির্ণয় সহকারী",
    diagnosisSubtitle: "আপনার ইলেকট্রিক স্কুটার বা সাইকেলে কি কোনো সমস্যা হচ্ছে? সমস্যাটি এখানে বিস্তারিত লিখুন, আমাদের এআই অ্যাসিস্ট্যান্ট সাথে সাথে সম্ভাব্য সমাধান জানাবে।",
    diagnosisPlaceholder: "উদাহরণ: আমার স্কুটারটি চার্জ হচ্ছে না / এক্সিলারেটর দিলেও চাকা ঘুরছে না / ব্যাটারি ব্যাকআপ কম দিচ্ছে...",
    diagnosisAskButton: "এআই ডায়াগনোসিস শুরু করুন",
    diagnosisDisclaimer: "*দ্রষ্টব্য: এই রোগ নির্ণয়টি এআই (AI) দ্বারা পরিচালিত। চূড়ান্ত সমাধান এবং মেরামতের জন্য আমাদের ওয়ার্কশপে স্কুটারটি নিয়ে আসার পরামর্শ দেওয়া হচ্ছে।",
    bookTestRide: "টেস্ট রাইড বুক করুন",
    enquireNow: "অনুসন্ধান পাঠান",
    availableColors: "উপলব্ধ কালারসমূহ",
    specifications: "কারিগরি স্পেসিফিকেশন",
    brand: "ব্র্যান্ড",
    model: "মডেল",
    price: "বাজার মূল্য",
    offerPrice: "বিশেষ অফার মূল্য",
    emiStarting: "মাসিক ইএমআই শুরু",
    range: "মাইलेज / রেঞ্জ (Range)",
    topSpeed: "সর্বোচ্চ গতি (Top Speed)",
    motorPower: "মোটর ক্ষমতা (Motor Power)",
    batteryType: "ব্যাটারির ধরণ",
    chargingTime: "চার্জিং সময়",
    warranty: "ওয়ারেন্টি",
    stockStatus: "স্টক পরিস্থিতি",
    inStock: "স্টকে আছে",
    lowStock: "সীমিত স্টক",
    outOfStock: "স্টক শেষ",
    bookingFormTitle: "অনুসন্ধান ও টেস্ট রাইড বুকিং ফর্ম",
    fullName: "সম্পূর্ণ নাম",
    phoneNumber: "মোবাইল নম্বর",
    selectVehicle: "স্কুটার মডেল নির্বাচন করুন",
    selectType: "অনুরোধের ধরণ",
    testRide: "টেস্ট রাইড (Test Ride) বুকিং",
    generalEnquiry: "সাধারণ অনুসন্ধান",
    serviceEnquiry: "সার্ভিসিং ও পার্টস অনুসন্ধান",
    message: "আপনার বার্তা / সমস্যা",
    submitButton: "আবেদন জমা দিন",
    submittingButton: "জমা হচ্ছে...",
    successMessage: "আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে! সুদীপ্ত বাবু বা আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
    closeButton: "বন্ধ করুন",
    adminLoginTitle: "এডমিন ইআরপি পোর্টাল লগইন",
    passcodeLabel: "এডমিন সিকিউরিটি পাসকোড দিন",
    loginButton: "লগইন করুন",
    invalidPasscode: "ভুল পাসকোড! আবার চেষ্টা করুন। (ডিফল্ট: 9064)",
    logoutButton: "লগআউট",
    erpDashboardTitle: "সুদীপ্ত ই-স্কুটি সার্ভিস - ব্যবসা পরিচালনা ও ইআরপি ড্যাশবোর্ড",
    erpDashboardSubtitle: "শোরুম বুকিং, কাস্টমার সার্ভিস হিস্ট্রি, ব্যাটারি ইএমআই ট্র্যাকার, স্টক এবং আর্থিক রিপোর্টের সম্পূর্ণ লাইভ কন্ট্রোল প্যানেল।",
    statsTotalSales: "মোট আদায়/বিক্রয়",
    statsActiveEMI: "চলতি ব্যাটারি ইএমআই হিসাব",
    statsLowStock: "স্টক অ্যালার্ট",
    statsPendingBookings: "বকেয়া সার্ভিসিং বুকিং",
    statsTotalVehicles: "শোরুম মডেল",
    statsTotalProducts: "খুচরা আইটেম সংখ্যা",
    statsTotalCustomers: "নথিভুক্ত কাস্টমার",
    secDashboard: "একনজরে ড্যাশবোর্ড",
    secVehicles: "গাড়ি স্টক ও শোরুম CMS",
    secSpareParts: "খুচরা যন্ত্রাংশ ও ব্যাটারি স্টক",
    secCustomers: "কাস্টমার খাতা",
    secEMI: "ব্যাটারি ইএমআই লেজার",
    secServices: "সার্ভিসিং জব কার্ড ও বুকিং",
    secEnquiries: "গ্রাহক লিড ও টেস্ট রাইড",
    secExpenses: "দৈনিক খরচের খাতা",
    secAnnouncements: "অনলাইন নোটিশ ও অফার",
    secReports: "লাভ-ক্ষতি ও আর্থিক রিপোর্ট",
    btnAddNewVehicle: "নতুন স্কুটার যুক্ত করুন",
    btnAddNewPart: "নতুন পার্টস আইটেম যুক্ত করুন",
    btnAddNewCustomer: "নতুন কাস্টমার নিবন্ধন",
    btnCreateServiceBooking: "নতুন সার্ভিসিং এন্ট্রি করুন",
    btnCreateEMIPlan: "নতুন ব্যাটারি ইএমআই অ্যাকাউন্ট",
    btnLogExpense: "খরচ এন্ট্রি করুন",
    btnCreateAnnouncement: "নতুন অফার বা নোটিশ লিখুন",
    thAction: "অ্যাকশন",
    thStatus: "স্ট্যাটাস",
    thDate: "তারিখ",
    thCustomer: "কাস্টমার",
    thAmount: "পরিমাণ",
    thPhone: "মোবাইল",
    thVehicle: "বাহনের তথ্য",
    invoiceTitle: "ট্যাক্স ইনভয়েস ও রসিদ",
    invoiceSubtitle: "সুদীপ্ত ই-স্কুটি সার্ভিস সেন্টারের আসল ক্যাশ মেমো",
    invoiceNo: "ইনভয়েস নম্বর",
    invoiceDate: "বিলিং তারিখ",
    invoiceTo: "বিল প্রাপক কাস্টমার",
    partsUsedTable: "ব্যবহৃত যন্ত্রাংশ ও উপকরণ",
    serviceChargeLabel: "সার্ভিসিং এবং লেবার চার্জ",
    totalBillAmount: "সর্বমোট পরিশোধিত বিল",
    paymentStatusLabel: "পেমেন্ট অবস্থা",
    paymentMethodLabel: "পেমেন্ট মাধ্যম",
    printInvoice: "ইনভয়েস প্রিন্ট করুন",
    downloadReceipt: "রসিদ ডাউনলোড (প্রিন্ট ভিউ)",
    emiCalculatorTitle: "ব্যাটারি ও স্কুটার অটো ইএমআই ক্যালকুলেটর",
    emiCalcDownPayment: "ডাউন পেমেন্ট (জমা টাকা)",
    emiCalcMonthlyEMI: "মাসিক কিস্তির পরিমাণ",
    emiCalcRemaining: "বকেয়া ঋণের পরিমাণ",
    emiCalcAutoButton: "কিস্তি হিসাব করুন",
    emiNextDueDate: "পরবর্তী কিস্তির তারিখ",
    lowStockAlert: "সতর্কতা: এই আইটেমটি স্টকে খুবই কম আছে! এখনই ক্রয় করুন।",
    expenseCategory: "খরচের খাত"
  },
  en: {
    brandName: "Sudipta E-Scooty Service",
    ownerName: "Sudipta Das",
    ownerRole: "Proprietor",
    phone: "+91 9064517009",
    email: "iamsudiptadas666@gmail.com",
    address: "Ashoknagar Power House Road, Kalobari, Bhajajatin Playground, North 24 Parganas, West Bengal – 743222, India",
    addressLabel: "Address",
    whatsappButton: "WhatsApp Chat",
    callNowButton: "Call Now",
    facebookButton: "Facebook Page",
    emailButton: "Send Email",
    followOnFacebook: "Follow Us on Facebook",
    facebookUpdatesTitle: "Latest Updates from Facebook",
    facebookUpdatesDesc: "We regularly publish tutorials, educational videos, new vehicle launches, exciting offers, and customer delivery photos on our page.",
    facebookUpdatesNote: "To watch hands-on service videos, vehicle reviews, and connect with our large online community, click below to join Sudipta's official Facebook Page.",
    bengali: "বাংলা",
    english: "English",
    homeMenu: "Home",
    showroomMenu: "Vehicle Showroom",
    partsStoreMenu: "Spare Parts",
    diagnosisMenu: "AI EV Diagnosis",
    adminMenu: "Admin ERP",
    heroTitle: "Premium Electric Scooter Servicing & Certified Spare Parts",
    heroSubtitle: "Sudipta E-Scooty Service - We specialize in precision EV repairs, advanced battery reconditioning, and flexible Battery EMI facilities.",
    heroCTA1: "Explore Showroom",
    heroCTA2: "Book Service Now",
    aboutTitle: "About Us",
    aboutText1: "Sudipta E-Scooty Service is a leading, certified Electric Vehicle servicing center based in Ashoknagar, West Bengal. Equipped with advanced diagnostic scanners and skilled mechanics, we guarantee high-efficiency repairs for all EV scooters and cycles.",
    aboutText2: "We stock premium, authentic lithium batteries, intelligent speed controllers, heavy-duty tubeless tyres, and custom spares. Committed to customer comfort, we offer home pickup-drop services and affordable financing (EMI) options.",
    servicesTitle: "Our Services",
    servicesSubtitle: "Professional care and repairs for your valued electric rides",
    featuredProductsTitle: "Premium Batteries & Spares",
    reviewsTitle: "What Our Customers Say",
    whyChooseUsTitle: "Why Choose Us",
    contactTitle: "Contact Us",
    contactSubtitle: "Get in touch for expert consultations, spare parts inquiries, or quick service bookings",
    footerRights: "All Rights Reserved. Sudipta E-Scooty Service.",
    footerDeveloper: "Design & Dev: AI Studio Build Team",
    showroomTitle: "Sudipta EV World",
    showroomSubtitle: "Explore our premium selection of cutting-edge electric scooters, check specifications, and book your test ride instantly.",
    partsStoreTitle: "Spare Parts Store",
    partsStoreSubtitle: "Browse and buy original high-capacity batteries, intelligent controllers, auto-cutoff chargers, and authentic spares at discounted rates.",
    diagnosisTitle: "Smart AI EV Diagnosis Assistant",
    diagnosisSubtitle: "Having trouble with your Electric Scooter or Cycle? Describe the symptoms below, and our server-side AI will diagnose the potential faults instantly.",
    diagnosisPlaceholder: "e.g., My scooter turns on but does not move / Battery drops suddenly / Throttle jerks when accelerating...",
    diagnosisAskButton: "Initiate AI Diagnosis",
    diagnosisDisclaimer: "*Note: This is an automated diagnostic recommendation. For exact repair and certified safety, please schedule an in-person physical inspection at our workshop.",
    bookTestRide: "Book Test Ride",
    enquireNow: "Send Enquiry",
    availableColors: "Available Colours",
    specifications: "Technical Specifications",
    brand: "Brand",
    model: "Model",
    price: "List Price",
    offerPrice: "Special Offer Price",
    emiStarting: "EMI Starts From",
    range: "Certified Range",
    topSpeed: "Top Speed",
    motorPower: "Motor Power",
    batteryType: "Battery Type",
    chargingTime: "Charging Time",
    warranty: "Warranty",
    stockStatus: "Stock Status",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    bookingFormTitle: "Enquiry & Test Ride Request",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    selectVehicle: "Select Vehicle Model",
    selectType: "Request Type",
    testRide: "Test Ride Booking",
    generalEnquiry: "General Inquiry",
    serviceEnquiry: "Service & Spares Inquiry",
    message: "Message / Issue description",
    submitButton: "Submit Booking",
    submittingButton: "Submitting...",
    successMessage: "Your enquiry has been successfully registered! Sudipta Das or our support representative will contact you very soon.",
    closeButton: "Close",
    adminLoginTitle: "Admin ERP Portal Access",
    passcodeLabel: "Enter Admin Security Passcode",
    loginButton: "Authenticate",
    invalidPasscode: "Invalid security passcode! Please try again. (Default: 9064)",
    logoutButton: "Logout",
    erpDashboardTitle: "Sudipta E-Scooty - Live Business Management & ERP",
    erpDashboardSubtitle: "Unified control center to manage bookings, service jobs, customer databases, battery EMI plans, and live financial statements.",
    statsTotalSales: "Total ERP Cash Flow",
    statsActiveEMI: "Active Battery EMIs",
    statsLowStock: "Low Stock Alerts",
    statsPendingBookings: "Pending Workorders",
    statsTotalVehicles: "Showroom Models",
    statsTotalProducts: "Spares Catalogue",
    statsTotalCustomers: "Registered Clients",
    secDashboard: "Dashboard Overview",
    secVehicles: "Vehicle Showroom & CMS",
    secSpareParts: "Spares & Battery Inventory",
    secCustomers: "Customer Database",
    secEMI: "EMI Management & Ledgers",
    secServices: "Service Job Cards",
    secEnquiries: "Showroom Leads & Test Rides",
    secExpenses: "Expenses Logbook",
    secAnnouncements: "Promotions & Announcements",
    secReports: "Profit-Loss & Statements",
    btnAddNewVehicle: "Add New Vehicle",
    btnAddNewPart: "Add Spare Part",
    btnAddNewCustomer: "Register New Customer",
    btnCreateServiceBooking: "Create Service Workorder",
    btnCreateEMIPlan: "Setup New EMI Account",
    btnLogExpense: "Record Business Expense",
    btnCreateAnnouncement: "Publish New Announcement",
    thAction: "Action",
    thStatus: "Status",
    thDate: "Date",
    thCustomer: "Customer",
    thAmount: "Amount",
    thPhone: "Phone",
    thVehicle: "Vehicle Info",
    invoiceTitle: "Tax Invoice & Bill of Supply",
    invoiceSubtitle: "Cash Memo of Sudipta E-Scooty Service Center",
    invoiceNo: "Invoice No",
    invoiceDate: "Billing Date",
    invoiceTo: "Billed To (Customer)",
    partsUsedTable: "Parts Used & Consumables",
    serviceChargeLabel: "Servicing & Labor Charges",
    totalBillAmount: "Grand Total Paid Amount",
    paymentStatusLabel: "Payment Status",
    paymentMethodLabel: "Payment Method",
    printInvoice: "Print Invoice Document",
    downloadReceipt: "Download Bill (Print-friendly)",
    emiCalculatorTitle: "Battery & Scooter EMI Auto-Calculator",
    emiCalcDownPayment: "Down Payment Deposit",
    emiCalcMonthlyEMI: "Monthly EMI Installment",
    emiCalcRemaining: "Outstanding Loan Principal",
    emiCalcAutoButton: "Calculate Plan",
    emiNextDueDate: "Next Due Date",
    lowStockAlert: "Warning: Low Stock alert! Order fresh items immediately to meet client demand.",
    expenseCategory: "Expense Category"
  }
};
