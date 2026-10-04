export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  descriptionEng: string;
  descriptionBen: string;
  batteryTypeEng: string;
  batteryTypeBen: string;
  motorPower: string;
  range: string;
  chargingTime: string;
  topSpeed: string;
  colorsEng: string;
  colorsBen: string;
  warrantyEng: string;
  warrantyBen: string;
  price: number;
  offerPrice: number;
  emiPrice: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  stockQuantity: number;
  images: string[];
  image?: string;
  videoUrl: string;
  spin360Url?: string;
  videoPromoUrl?: string;
}

export interface Product {
  id: string;
  titleEng: string;
  titleBen: string;
  category: "Battery" | "Charger" | "Controller" | "Motor" | "Brake Parts" | "Tyres" | "Lights" | "Accessories" | "Other";
  brand: string;
  price: number;
  offerPrice: number;
  purchasePrice: number;
  stock: number;
  images: string[];
  image?: string;
  descriptionEng: string;
  descriptionBen: string;
  deliveryCharge: number;
}

export interface OfflineTransaction {
  id: string;
  date: string;
  customerName: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  productId?: string; // Optional: linked product for inventory adjustment
}

export interface Customer {
  id: string;
  name: string;
  photo?: string;
  address: string;
  phone: string;
  vehicleDetails: string;
  serviceHistory: string[];
  paymentHistory: Array<{
    amount: number;
    date: string;
    purpose: string;
    method: string;
  }>;
  emiRecords: string[];
  isDeleted?: boolean;
  status?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleDetails: string;
  bookingDate: string;
  technicianName: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  repairDetails: string;
  partsUsed: Array<{
    partId: string;
    partName: string;
    quantity: number;
    price: number;
  }>;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: "Unpaid" | "Paid" | "Partial";
  createdAt: string;
  customerGstin?: string;
}

export interface EmiRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  batteryOrVehicleName: string;
  totalPrice: number;
  downPayment: number;
  monthlyEmi: number;
  remainingBalance: number;
  paidAmount: number;
  dueAmount: number;
  nextDueDate: string;
  paymentHistory: Array<{
    amount: number;
    date: string;
    method: string;
    status: string;
  }>;
  isDeleted?: boolean;
  status?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId?: string;
  type: "Test Ride" | "General Enquiry" | "Service Enquiry";
  message: string;
  status: "New" | "Contacted" | "Closed";
  createdAt: string;
}

export interface Announcement {
  id: string;
  titleEng: string;
  titleBen: string;
  contentEng: string;
  contentBen: string;
  date: string;
  isActive?: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending Verification" | "Order Confirmed" | "Order Placed" | "Dispatched" | "Out for Delivery" | "Delivered";
  utrNumber?: string;
  paymentPhone?: string;
  paymentScreenshot?: string;
  paymentProof?: string;
  expectedDeliveryDate: string;
  expectedDeliveryTime: string;
  deliveryPartnerName: string;
  deliveryPartnerPhone: string;
  notes: string;
  createdAt: string;
  awbNumber?: string;
  trackingId?: string;
  carrier?: string;
  deliveryMethod?: "API" | "Self";
  selectedCarrier?: "Delhivery" | "Xpressbees" | "Ecom Express" | "DTDC" | "Own Fleet";
  deliveryLogStatus?: "Pending Assignment" | "Label Generated" | "Out for Delivery" | "Delivered";
  shippingLabelUrl?: string;
  weight?: string;
  dimensions?: string;
  pickupScheduled?: boolean;
  is_deleted?: boolean;
  isDeleted?: boolean;
  trackingCheckpoints?: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

export interface OrderUpdate {
  status?: Order["status"];
  is_deleted?: boolean;
  isDeleted?: boolean;
  utrNumber?: string;
  paymentPhone?: string;
  paymentScreenshot?: string;
  paymentProof?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  expectedDeliveryDate?: string;
  expectedDeliveryTime?: string;
  notes?: string;
  awbNumber?: string;
  trackingId?: string;
  carrier?: string;
  deliveryMethod?: "API" | "Self";
  selectedCarrier?: "Delhivery" | "Xpressbees" | "Ecom Express" | "DTDC" | "Own Fleet";
  deliveryLogStatus?: "Pending Assignment" | "Label Generated" | "Out for Delivery" | "Delivered";
  shippingLabelUrl?: string;
  weight?: string;
  dimensions?: string;
  pickupScheduled?: boolean;
  trackingCheckpoints?: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

export interface DashboardStats {
  totalVehicles: number;
  totalProducts: number;
  totalCustomers: number;
  pendingBookings: number;
  activeEmiCount: number;
  lowStockCount: number;
  totalSales: number;
  announcementsCount: number;
}

export interface ReportData {
  revenueItems: Array<{
    id: string;
    date: string;
    customer: string;
    type: string;
    item: string;
    amount: number;
    status: string;
  }>;
  expenses: Expense[];
  financialSummary: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    inventoryAssetValue: number;
  };
  emiSummary: Array<{
    customer: string;
    item: string;
    total: number;
    paid: number;
    due: number;
    nextDueDate: string;
  }>;
}

export interface Testimonial {
  id: string;
  textBen: string;
  textEng: string;
  name: string;
  role: string;
  avatar: string;
  rating?: number;
  date?: string;
  isPending?: boolean;
}

export type SystemConfig = {
  businessNameEng?: string;
  businessNameBen?: string;
  businessName: string;
  siteName?: string;
  gstin?: string;
  businessPhone?: string;
  phone: string;
  address: string;
  addressEng?: string;
  addressBen?: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  googleBusinessUrl: string;
  whatsappLink: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroHeading: string;
  heroSubheading: string;
  heroTitleEng?: string;
  heroTitleBen?: string;
  heroSubtitleEng?: string;
  heroSubtitleBen?: string;
  festivalTheme: string;
  shopGstin?: string;
  
  // Brand Identity
  logoUrl?: string;
  faviconUrl?: string;
  colorTheme?: 'classic' | 'modern' | 'vibrant' | 'minimal';
  proprietorNameEng?: string;
  proprietorNameBen?: string;

  // ERP Specific
  erpPasscode?: string;

  // About Section
  aboutHeadingEng?: string;
  aboutHeadingBen?: string;
  aboutText1Eng?: string;
  aboutText1Ben?: string;
  aboutText2Eng?: string;
  aboutText2Ben?: string;

  // Payment Gateway Settings
  upiId?: string;
  upiMerchantName?: string;
  qrCodeUrl?: string;
  paymentInstructionsEng?: string;
  paymentInstructionsBen?: string;

  // Contact Information
  whatsappNumber?: string;
  supportEmail?: string;
  businessAddressEng?: string;
  businessAddressBen?: string;

  // UI/UX Control
  enabledModules?: {
    vehicles?: boolean;
    spareParts?: boolean;
    service?: boolean;
    emi?: boolean;
    ecommerce?: boolean;
  };
  buttonTexts?: {
    buyNowEng?: string;
    buyNowBen?: string;
    bookNowEng?: string;
    bookNowBen?: string;
  };
  navLinks?: Array<{
    id: string;
    labelEng: string;
    labelBen: string;
    href: string;
    isEnabled: boolean;
  }>;

  // Visiting Card Customizer
  visitingCardOwnerNameEng?: string;
  visitingCardOwnerNameBen?: string;
  visitingCardOwnerRoleEng?: string;
  visitingCardOwnerRoleBen?: string;
  visitingCardPhone?: string;
  visitingCardAddressEng?: string;
  visitingCardAddressBen?: string;

  // Smart Calculator Parameters
  calcDefaultPrice?: number;
  calcDefaultDownPaymentPct?: number;
  calcBaseInterestRate?: number;
  calcDefaultVoltage?: number;
  calcDefaultCapacity?: number;
  calcDefaultSpeed?: number;

  // Footer Operational Timings
  timingWeekdaysEng?: string;
  timingWeekdaysBen?: string;
  timingSundayEng?: string;
  timingSundayBen?: string;
  heroBgType?: 'image' | 'video';
  heroBgUrl?: string;
  delhiveryApiKey?: string;
  delhiveryTrackingUrl?: string;
  xpressbeesApiKey?: string;
  xpressbeesEndpointUrl?: string;
  ecomExpressApiKey?: string;
  ecomExpressMerchantId?: string;
  customCarrierName?: string;
  customBaseApiUrl?: string;
  customApiKey?: string;
  customTrackingEndpointUrl?: string;
}

export type Settings = SystemConfig;

export interface InvoicePart {
  partName: string;
  price: number;
  fittingCharge?: number;
}

export interface Invoice {
  id: string;
  date: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  serviceCharge: number;
  parts: InvoicePart[];
  grandTotal: number;
  customerGstin?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Owner' | 'Sub-admin' | 'Technician' | 'Desk Executive' | 'Delivery Rider';
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  assignedTasksCount: number;
  password?: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  phone: string;
  category: 'battery_issue' | 'scooter_breakdown' | 'emi_billing' | 'spare_parts_delay' | 'general';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'assigned' | 'in_progress' | 'solved' | 'closed';
  createdAt: string;
  screenshotUrl?: string;
  assignedEngineer?: string;
  chatLog: { sender: 'customer' | 'admin'; message: string; timestamp: string }[];
}

export interface Course {
  id: string;
  titleEng: string;
  titleBen: string;
  descriptionEng: string;
  descriptionBen: string;
  price: number;
  videoLink?: string;
  statusBadge: "Coming Soon" | "Pre-Book" | "Active / Published";
  thumbnailUrl?: string;
}


