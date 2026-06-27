import React, { useState } from "react";
import { Plus, Check, Clipboard, User, Wrench, FileText, Printer, Sparkles, X, PlusCircle, Trash } from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Booking, Product, Customer } from "../types";

interface AdminServicesProps {
  bookings: Booking[];
  products: Product[];
  customers: Customer[];
  onAddBooking: (booking: Omit<Booking, "id" | "createdAt" | "totalAmount">) => Promise<void>;
  onUpdateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  onLaunchInvoice: (booking: Booking) => void;
  lang: Language;
  t: TranslationDict;
}

export default function AdminServices({ bookings, products, customers, onAddBooking, onUpdateBooking, onLaunchInvoice, lang, t }: AdminServicesProps) {
  const isBng = lang === "bn";
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States for New Booking
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("FLEETO Wolf Warrior Lite");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [technicianName, setTechnicianName] = useState("Sudipta Das");
  const [repairDetails, setRepairDetails] = useState("");
  const [serviceCharge, setServiceCharge] = useState(350);

  // States for Editing/Adding Parts to active job card
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQty, setPartQty] = useState(1);
  const [editingParts, setEditingParts] = useState<Booking["partsUsed"]>([]);
  const [editingServiceCharge, setEditingServiceCharge] = useState(350);
  const [editingStatus, setEditingStatus] = useState<Booking["status"]>("In Progress");
  const [editingPayment, setEditingPayment] = useState<Booking["paymentStatus"]>("Unpaid");

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setVehicleDetails("FLEETO Wolf Warrior Lite");
    setBookingDate(new Date().toISOString().split("T")[0]);
    setTechnicianName("Sudipta Das");
    setRepairDetails("");
    setServiceCharge(350);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    await onAddBooking({
      customerName,
      customerPhone,
      vehicleDetails,
      bookingDate,
      technicianName,
      status: "Pending",
      repairDetails,
      partsUsed: [],
      serviceCharge,
      paymentStatus: "Unpaid"
    });
    setIsAdding(false);
    resetForm();
  };

  const handleStartEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditingParts([...b.partsUsed]);
    setEditingServiceCharge(b.serviceCharge);
    setEditingStatus(b.status);
    setEditingPayment(b.paymentStatus);
    setRepairDetails(b.repairDetails);
  };

  const handleAddPartToEditing = () => {
    if (!selectedPartId) return;
    const partObj = products.find(p => p.id === selectedPartId);
    if (!partObj) return;

    const existingPartIndex = editingParts.findIndex(item => item.partId === selectedPartId);
    if (existingPartIndex > -1) {
      const updated = [...editingParts];
      updated[existingPartIndex].quantity += partQty;
      setEditingParts(updated);
    } else {
      setEditingParts([
        ...editingParts,
        {
          partId: partObj.id,
          partName: isBng ? partObj.titleBen : partObj.titleEng,
          quantity: partQty,
          price: partObj.offerPrice
        }
      ]);
    }
    setSelectedPartId("");
    setPartQty(1);
  };

  const handleRemovePartFromEditing = (index: number) => {
    const updated = editingParts.filter((_, idx) => idx !== index);
    setEditingParts(updated);
  };

  const handleSaveUpdate = async (id: string) => {
    // Calculate total amount
    const partsTotal = editingParts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = partsTotal + editingServiceCharge;

    await onUpdateBooking(id, {
      partsUsed: editingParts,
      serviceCharge: editingServiceCharge,
      status: editingStatus,
      paymentStatus: editingPayment,
      repairDetails,
      totalAmount: grandTotal
    });
    setEditingId(null);
  };

  return (
    <div id="admin-services-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.secServices}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBng ? "অর্ডার এন্ট্রি করুন, ব্যবহৃত খুচরা যন্ত্রাংশ বা ব্যাটারি যোগ করুন এবং রসিদ প্রিন্ট করুন" : "Log complaints, allocate mechanics, audit billing and generate invoice sheets"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.btnCreateServiceBooking}
          </button>
        )}
      </div>

      {/* Add New Booking Card */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.btnCreateServiceBooking}
            </h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Joydeb Das" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phoneNumber}</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. +91 9064517009" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "গাড়ির বিবরণ ও মডেল" : "Scooter / Cycle Details"}</label>
              <input type="text" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.thDate}</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "টেকনিশিয়ান নাম" : "Technician Assigned"}</label>
              <input type="text" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "প্রাথমিক সার্ভিস চার্জ (₹)" : "Labor/Service Charge (₹)"}</label>
              <input type="number" value={serviceCharge} onChange={(e) => setServiceCharge(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono font-bold" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{isBng ? "অভিযোগ ও রিপেয়ারিং বিবরণ" : "Complaint / Repairs Needed"}</label>
            <textarea value={repairDetails} onChange={(e) => setRepairDetails(e.target.value)} placeholder="Throttle not working, battery diagnostics, controller heat..." className="w-full p-2.5 border border-slate-200 rounded-lg text-xs h-20" required />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="px-5 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
              {t.closeButton}
            </button>
            <button type="submit" className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer">
              {t.submitButton}
            </button>
          </div>
        </form>
      )}

      {/* Bookings / Workorders list */}
      <div className="space-y-4">
        {bookings.map((b) => {
          const isEditing = editingId === b.id;
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 md:p-6 space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-50 gap-4">
                <div className="flex gap-3 items-center">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <Clipboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{b.customerName}</h4>
                    <span className="text-xs text-slate-400 font-mono font-medium block mt-0.5">{b.customerPhone} | {b.bookingDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status indicators */}
                  {isEditing ? (
                    <select
                      className="p-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as Booking["status"])}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                      b.status === "In Progress" ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                      b.status === "Cancelled" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"
                    }`}>
                      {b.status}
                    </span>
                  )}

                  {isEditing ? (
                    <select
                      className="p-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                      value={editingPayment}
                      onChange={(e) => setEditingPayment(e.target.value as Booking["paymentStatus"])}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.paymentStatus === "Paid" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {b.paymentStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Main details block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                <div className="space-y-2">
                  <p><strong>Vehicle Model:</strong> <span className="font-semibold text-slate-700">{b.vehicleDetails}</span></p>
                  <p><strong>Assigned Mech:</strong> <span className="font-semibold text-slate-700">{b.technicianName}</span></p>
                  {isEditing ? (
                    <div>
                      <label className="block font-semibold text-slate-500 mb-1">Repairs Log</label>
                      <textarea
                        value={repairDetails}
                        onChange={(e) => setRepairDetails(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    <p><strong>Repairs Log:</strong> <span className="italic text-slate-700">"{b.repairDetails}"</span></p>
                  )}
                </div>

                {/* Billing and Parts detail */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-1.5">Parts Used & Pricing Details:</h5>
                    {isEditing ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {/* Parts lists with remove triggers */}
                        {editingParts.length === 0 ? (
                          <p className="text-slate-400 italic text-[11px]">No parts added yet.</p>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {editingParts.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                                <span>{item.partName} x {item.quantity}</span>
                                <div className="flex gap-2 items-center">
                                  <span className="font-mono text-slate-700 font-bold">₹{item.price * item.quantity}</span>
                                  <button type="button" onClick={() => handleRemovePartFromEditing(idx)} className="text-rose-500 hover:text-rose-700">
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive Part Selector */}
                        <div className="flex gap-2 items-center">
                          <select
                            className="p-1 bg-white border border-slate-200 rounded text-[11px] flex-1"
                            value={selectedPartId}
                            onChange={(e) => setSelectedPartId(e.target.value)}
                          >
                            <option value="">-- Add Part --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                                {isBng ? p.titleBen : p.titleEng} (₹{p.offerPrice}) {p.stock === 0 ? "(Out of stock)" : ""}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="w-10 p-1 border border-slate-200 rounded text-center text-[11px]"
                            value={partQty}
                            min={1}
                            onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                          />
                          <button type="button" onClick={handleAddPartToEditing} className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded">
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Labor Charge */}
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Service Charge (₹)</label>
                          <input
                            type="number"
                            value={editingServiceCharge}
                            onChange={(e) => setEditingServiceCharge(Number(e.target.value))}
                            className="p-1 border border-slate-200 rounded w-24 font-mono font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {b.partsUsed.length === 0 ? (
                          <p className="text-slate-400 italic">No custom spare parts added.</p>
                        ) : (
                          b.partsUsed.map((item, idx) => (
                            <div key={idx} className="flex justify-between font-mono bg-slate-50 px-2 py-0.5 rounded">
                              <span>{item.partName} x {item.quantity}</span>
                              <span>₹ {item.price * item.quantity}</span>
                            </div>
                          ))
                        )}
                        <div className="flex justify-between font-mono bg-indigo-50/40 px-2 py-0.5 rounded text-indigo-700 font-medium">
                          <span>Labor Service Charge:</span>
                          <span>₹ {b.serviceCharge}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">Grand Total Amount</span>
                      <strong className="text-lg font-mono font-bold text-slate-800">
                        ₹{" "}
                        {isEditing
                          ? (editingParts.reduce((s, i) => s + (i.price * i.quantity), 0) + editingServiceCharge).toLocaleString()
                          : b.totalAmount?.toLocaleString() || b.serviceCharge.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveUpdate(b.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                            Save Changes
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded-xl cursor-pointer">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(b)} className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition cursor-pointer">
                            Edit Job Card
                          </button>
                          <button
                            onClick={() => onLaunchInvoice(b)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            Print Cash Memo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
