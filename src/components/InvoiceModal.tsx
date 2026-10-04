import { Printer, X } from "lucide-react";
import { Language } from "../translations";
import { Booking, Customer, EmiRecord, Settings } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: any;
  booking?: Booking | null;
  emiRecord?: EmiRecord | null;
  customer?: Customer | null;
  settings?: Settings | null;
}

const BILINGUAL_PARTS_MAP: Record<string, string> = {
  "EV Diagnostic & Repair Labor Charge": "ইভি ডায়াগনস্টিক এবং লেবার সার্ভিসিং চার্জ",
  "EV Smart Charger Repairing & Service": "স্মার্ট চার্জার সার্ভিসিং এবং যন্ত্রাংশ মেরামত",
  "Break Sensor": "ব্রেক সেন্সর মেরামত ও পরিবর্তন",
  "Break Pad": "ব্রেক প্যাড পরিবর্তন",
  "Drum Pad": "ড্রাম প্যাড সার্ভিসিং",
  "Lithium Battery BMS 60V": "লিথিয়াম ব্যাটারি বিএমএস ৬০ ভোল্ট",
  "Hub Motor Controller": "হাব মোটর কন্ট্রোলার রিপ্লেসমেন্ট"
};

export default function InvoiceModal({ isOpen, onClose, lang, booking, customer, settings }: InvoiceModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };
  
  const isBng = lang === "bn";

  // Customer Details
  const clientName = booking?.customerName || customer?.name || "Walk-in Customer";
  const clientPhone = booking?.customerPhone || customer?.phone || "N/A";
  
  // Job Card & Date Details
  const jobCardId = booking?.id 
    ? (booking.id.startsWith("JC-") || booking.id.startsWith("INV-") ? booking.id : `JC-${booking.id}`) 
    : "JC-2026-0001";
  
  const memoDate = booking?.bookingDate || new Date().toISOString().split('T')[0];

  // Vehicle & Service Details
  const vehicleModel = booking?.vehicleDetails || "Electric Scooter";
  const repairsLog = booking?.repairDetails || "EV Maintenance, Inspection & Servicing";
  const mechanicName = booking?.technicianName || "Senior EV Mechanic";
  const paymentStatus = booking?.paymentStatus || "Paid";

  // Parts and Labor breakdown
  const laborCharge = booking?.serviceCharge || 0;
  const partsList = booking?.partsUsed || [];
  
  const calculatedTotal = laborCharge + partsList.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const grandTotal = booking?.totalAmount || calculatedTotal;

  return (
    <div id="printable-invoice-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto print:block print:relative print:inset-auto">
      <div className="bg-white max-w-4xl w-full shadow-2xl rounded-2xl flex flex-col my-6 print:my-0 print:shadow-none print:rounded-none print:w-full print:max-w-none p-6 md:p-8">
        
        {/* Top Control Bar - Hidden in Print */}
        <div className="flex justify-between items-center bg-slate-900 text-white px-6 py-3.5 print:hidden mb-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">Cash Memo & Service Receipt Preview</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              {jobCardId}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              {isBng ? "ক্যাশ মেমো প্রিন্ট করুন" : "Print Cash Memo"}
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CASH MEMO AREA */}
        <div 
          id="printable-invoice-area" 
          className="font-sans text-slate-800 bg-white print:p-0"
          style={{ width: "100%", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box" }}
        >
          {/* Outer Border Box */}
          <div className="border-2 border-slate-900 p-6 md:p-8 rounded-xl print:rounded-none print:border-slate-800">
            
            {/* 1. SHOP HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-emerald-800 tracking-tight uppercase print:text-2xl">
                  {settings?.siteName || settings?.businessName || "Sudipta E-Scooty Service"}
                </h1>
                <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Electric Scooter Sales, Repairs & Battery Specialist
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-lg mt-1">
                  <strong>Workshop:</strong> Power House Road Workshop, Near Baghajatin Playground (Towards Kalobari), Ashoknagar, North 24 Parganas, West Bengal - 743222<br />
                  <strong>Helpline / WhatsApp:</strong> +91 9064517009 | <strong>GSTIN:</strong> {settings?.gstin || settings?.shopGstin || "19ABCDE1234F1ZH"}<br />
                  <strong>Timing:</strong> 10:00 AM – 08:30 PM (Thursdays Closed)
                </p>
              </div>

              <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-0 border-slate-900 pl-3 md:pl-0 pt-1">
                <span className="inline-block bg-slate-900 text-white text-xs font-black px-3 py-1 uppercase rounded tracking-wider mb-2 print:bg-slate-900 print:text-white">
                  CASH MEMO / JOB RECEIPT
                </span>
                <div className="text-xs font-mono space-y-0.5 text-slate-800">
                  <p><strong>Job Card ID:</strong> <span className="font-bold text-indigo-900">{jobCardId}</span></p>
                  <p><strong>Date:</strong> {memoDate}</p>
                  <p><strong>Payment Status:</strong> <span className={`font-bold ${paymentStatus === "Paid" ? "text-emerald-700" : "text-amber-700"}`}>{paymentStatus.toUpperCase()}</span></p>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & VEHICLE DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-300 p-4 rounded-lg mb-6 text-xs print:bg-slate-50">
              {/* Customer Column */}
              <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:pr-4">
                <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
                  <span>Customer Details</span>
                  <span className="text-[10px] text-slate-500 font-normal">গ্রাহকের বিবরণ</span>
                </div>
                <p><strong>Customer Name:</strong> <span className="font-bold text-slate-900">{clientName}</span></p>
                <p><strong>Phone Number:</strong> {clientPhone}</p>
                {booking?.customerGstin && <p><strong>Customer GSTIN:</strong> {booking.customerGstin}</p>}
              </div>

              {/* Vehicle Column */}
              <div className="space-y-1">
                <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
                  <span>Vehicle & Service Details</span>
                  <span className="text-[10px] text-slate-500 font-normal">গাড়ির বিবরণ</span>
                </div>
                <p><strong>Vehicle Model:</strong> <span className="font-bold text-slate-900">{vehicleModel}</span></p>
                <p><strong>Repairs Log:</strong> {repairsLog}</p>
                <p><strong>Assigned Mechanic:</strong> {mechanicName}</p>
              </div>
            </div>

            {/* 3. PRICING BREAKDOWN TABLE */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold uppercase text-[11px]">
                    <th className="border border-slate-300 p-2 text-center w-12">#</th>
                    <th className="border border-slate-300 p-2 text-left">Item / Service Description (বিবরণ)</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Qty</th>
                    <th className="border border-slate-300 p-2 text-right w-24">Rate (₹)</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {/* Labor / Service Charges Row */}
                  <tr>
                    <td className="border border-slate-300 p-2.5 text-center font-mono">1</td>
                    <td className="border border-slate-300 p-2.5">
                      <div className="font-bold text-slate-900">EV Diagnostic & Repair Labor Charge</div>
                      <div className="text-[10px] text-slate-500 italic">ইভি ডায়াগনস্টিক এবং লেবার সার্ভিসিং চার্জ</div>
                    </td>
                    <td className="border border-slate-300 p-2.5 text-center font-mono">1</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono">₹ {(laborCharge || 0).toLocaleString()}</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">₹ {(laborCharge || 0).toLocaleString()}</td>
                  </tr>

                  {/* Spare Parts Rows */}
                  {partsList.map((part, index) => (
                    <tr key={part.partId || index}>
                      <td className="border border-slate-300 p-2.5 text-center font-mono">{index + 2}</td>
                      <td className="border border-slate-300 p-2.5">
                        <div className="font-bold text-slate-900">{part.partName}</div>
                        {BILINGUAL_PARTS_MAP[part.partName] && (
                          <div className="text-[10px] text-slate-500 italic">{BILINGUAL_PARTS_MAP[part.partName]}</div>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono">{part.quantity}</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono">₹ {(part.price || 0).toLocaleString()}</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">₹ {((part.price || 0) * (part.quantity || 0)).toLocaleString()}</td>
                    </tr>
                  ))}

                  {/* Empty fallback row if no parts or labor */}
                  {laborCharge === 0 && partsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">No parts or service charges added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Calculation Summary */}
              <div className="mt-3 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 border border-slate-300 p-3 bg-slate-50 rounded-lg text-xs print:bg-slate-50">
                  <div className="flex justify-between text-slate-600">
                    <span>Labor / Service Charge:</span>
                    <span className="font-mono">₹ {(laborCharge || 0).toLocaleString()}</span>
                  </div>
                  {partsList.length > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Spare Parts Subtotal:</span>
                      <span className="font-mono">₹ {partsList.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-2 mt-1">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono text-emerald-800 text-base">₹ {(grandTotal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. FOOTER & SIGNATURE SECTION */}
            <div className="border-t-2 border-slate-900 pt-6 mt-6 flex flex-col md:flex-row justify-between items-end gap-6 text-xs">
              {/* Terms & Thank You */}
              <div className="space-y-1 max-w-md">
                <p className="font-bold text-emerald-800 text-xs">
                  আমাদের ওপর আস্থা রাখার জন্য আপনাকে ধন্যবাদ! (Thank you for visiting!)
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  • All repair work comes with standard workshop testing. Electrical spare parts carry manufacturer warranty terms if applicable.<br />
                  • Please produce this cash memo for any follow-up service queries or battery health checkups.
                </p>
              </div>

              {/* Authorized Signature Box */}
              <div className="text-center space-y-2 min-w-[200px]">
                <div className="h-10 border-b border-dashed border-slate-800"></div>
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Authorized Signature</p>
                <p className="text-[9px] text-slate-500">For Sudipta E-Scooty Service</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
