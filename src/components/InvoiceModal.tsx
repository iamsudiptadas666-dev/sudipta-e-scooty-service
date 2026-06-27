import { Printer, X, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Booking, Customer, EmiRecord } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: TranslationDict;
  booking?: Booking | null;
  emiRecord?: EmiRecord | null;
  customer?: Customer | null;
}

export default function InvoiceModal({ isOpen, onClose, lang, t, booking, emiRecord, customer }: InvoiceModalProps) {
  if (!isOpen) return null;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Generate unique dynamic invoice code
  const invoiceId = booking ? `INV-SRV-${booking.id.toUpperCase()}` : emiRecord ? `INV-EMI-${emiRecord.id.toUpperCase()}` : `INV-GEN-${Date.now().toString().slice(-6)}`;
  const invoiceDate = booking ? booking.bookingDate : emiRecord ? emiRecord.paymentHistory[0]?.date || new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const clientName = booking ? booking.customerName : emiRecord ? emiRecord.customerName : customer ? customer.name : "Walk-in Customer";
  const clientPhone = booking ? booking.customerPhone : emiRecord ? emiRecord.customerPhone : customer ? customer.phone : "+91 9000000000";
  const clientAddress = customer ? customer.address : booking ? "Ashoknagar Local Area" : "North 24 Parganas, WB";

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div id="invoice-modal-content" className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-8 animate-fade-in print:my-0 print:shadow-none print:rounded-none">
        {/* Header bar - hidden in print */}
        <div className="flex justify-between items-center bg-slate-950 text-white px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">{t.invoiceTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {t.printInvoice}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice-area" className="p-8 md:p-12 text-slate-800 flex-1 overflow-y-auto print:p-0 print:overflow-visible font-sans">
          {/* Sudipta Brand Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-6 mb-8 gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xl">S</span>
                {t.brandName}
              </h1>
              <p className="text-xs font-semibold text-emerald-700 mt-1 uppercase tracking-wider">
                {t.ownerRole}: {t.ownerName}
              </p>
              <div className="mt-4 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.email}</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right md:min-w-48 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-none">
              <div className="text-xs font-semibold text-slate-400 uppercase">{t.invoiceNo}</div>
              <div className="text-sm font-mono font-bold text-slate-800">{invoiceId}</div>

              <div className="text-xs font-semibold text-slate-400 uppercase mt-3">{t.invoiceDate}</div>
              <div className="text-sm font-semibold text-slate-700">{invoiceDate}</div>

              <div className="text-xs font-semibold text-emerald-700 uppercase mt-3">GSTIN PLACEHOLDER</div>
              <div className="text-[10px] font-mono text-slate-400">19AAYFD9064SD1Z9</div>
            </div>
          </div>

          {/* Customer info */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.invoiceTo}:</h3>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-800">{clientName}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {clientPhone}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {clientAddress}
              </p>
              {booking && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">{t.specifications.split(" ")[0]} Vehicle:</span>{" "}
                    <span className="font-semibold text-slate-700">{booking.vehicleDetails}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Job Code:</span>{" "}
                    <span className="font-semibold font-mono text-slate-700">JOB-{booking.id.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items / Charges Grid */}
          <div className="mb-8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase tracking-wider font-semibold print:bg-slate-200 print:text-slate-800">
                  <th className="py-2.5 px-4 rounded-l-lg">Item / Service Description</th>
                  <th className="py-2.5 px-4 text-right">Rate</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right rounded-r-lg">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking ? (
                  <>
                    {/* Labor service charge */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-3.5 px-4 font-medium">
                        EV Scooter Maintenance and Complete Diagnostic Charge
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">₹ {booking.serviceCharge}</td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        ₹ {booking.serviceCharge}
                      </td>
                    </tr>
                    {/* Spare parts used */}
                    {booking.partsUsed.map((part, index) => (
                      <tr key={index} className="hover:bg-slate-50/30">
                        <td className="py-3.5 px-4">
                          <span className="font-medium">{part.partName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono ml-2">
                            {part.partId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">₹ {part.price}</td>
                        <td className="py-3.5 px-4 text-center">{part.quantity}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold">
                          ₹ {(part.price * part.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : emiRecord ? (
                  <>
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-3.5 px-4">
                        <span className="font-medium">Easy EMI Battery Purchase Plan Setup</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Battery/Asset: {emiRecord.batteryOrVehicleName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">₹ {emiRecord.totalPrice}</td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        ₹ {emiRecord.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 bg-emerald-50/30 print:bg-white">
                      <td className="py-3.5 px-4 text-emerald-800 font-semibold">
                        Less: Initial Down Payment Received
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-800">
                        - ₹ {emiRecord.downPayment}
                      </td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-800 font-bold">
                        - ₹ {emiRecord.downPayment.toLocaleString()}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr className="hover:bg-slate-50/30">
                    <td className="py-4 px-4 font-medium">General Walk-in Consultation / Diagnostics Fee</td>
                    <td className="py-4 px-4 text-right font-mono">₹ 200</td>
                    <td className="py-4 px-4 text-center">1</td>
                    <td className="py-4 px-4 text-right font-mono font-semibold">₹ 200</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing calculations */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
            <div className="max-w-sm text-xs text-slate-500">
              <h4 className="font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Warranty & Terms
              </h4>
              <p className="leading-relaxed">
                {lang === "bn"
                  ? "১. আমাদের এখানে ফিট করা আসল ব্যাটারিতে ৩ বছর এবং কন্ডিশন করা ব্যাটারিতে ৬ মাসের সার্ভিস ওয়ারেন্টি রয়েছে।\n২. মেকানিক্যাল কাজের ওপর ৭ দিনের ফ্রি ট্রায়াল সুবিধা উপলব্ধ।"
                  : "1. All fitted new LFP batteries include 3 years warranty, while reconditioned batteries carry a 6-month workshop service warranty.\n2. Standard mechanical repairs enjoy 7 days troubleshooting trial period."}
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">
                  ₹{" "}
                  {booking
                    ? booking.totalAmount.toLocaleString()
                    : emiRecord
                    ? emiRecord.totalPrice.toLocaleString()
                    : "200"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CGST (0%)</span>
                <span>₹ 0.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST (0%)</span>
                <span>₹ 0.00</span>
              </div>
              {emiRecord && (
                <div className="flex justify-between text-slate-500 font-semibold pt-1 border-t border-slate-100">
                  <span>Down Payment Paid</span>
                  <span className="font-mono text-emerald-600">- ₹ {emiRecord.downPayment.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-800 font-bold text-sm pt-2 border-t-2 border-slate-200">
                <span>{booking ? t.totalBillAmount.split(" ")[1] : emiRecord ? t.emiCalcRemaining : "Grand Total"}</span>
                <span className="font-mono text-indigo-700 text-base">
                  ₹{" "}
                  {booking
                    ? booking.totalAmount.toLocaleString()
                    : emiRecord
                    ? emiRecord.remainingBalance.toLocaleString()
                    : "200"}
                </span>
              </div>

              <div className="pt-4 flex flex-col items-end">
                <span className="text-[10px] uppercase font-semibold text-slate-400 mb-1">{t.paymentStatusLabel}</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    booking?.paymentStatus === "Paid" || emiRecord?.remainingBalance === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {booking
                    ? booking.paymentStatus === "Paid"
                      ? "PAID"
                      : "UNPAID"
                    : emiRecord
                    ? emiRecord.remainingBalance === 0
                      ? "COMPLETED"
                      : `RUNNING EMI (Bal: ₹${emiRecord.remainingBalance})`
                    : "PAID"}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="mt-16 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400">Thank you for choosing Sudipta E-Scooty Service!</p>
              <p className="text-[9px] text-slate-300">Generated on North 24 Parganas ERP Node #01</p>
            </div>
            <div className="text-center w-48">
              <div className="font-mono text-xs italic font-bold text-indigo-700 border-b border-slate-300 pb-2 mb-1">
                Sudipta Das
              </div>
              <p className="text-[9px] uppercase font-bold text-slate-400">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar - Hidden in print */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            {t.closeButton}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {t.printInvoice}
          </button>
        </div>
      </div>
    </div>
  );
}
