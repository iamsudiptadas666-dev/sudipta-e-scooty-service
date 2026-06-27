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
  videoUrl: string;
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
  descriptionEng: string;
  descriptionBen: string;
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
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
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
