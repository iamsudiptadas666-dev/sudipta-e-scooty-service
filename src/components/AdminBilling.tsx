import React, { useState, useEffect } from "react";
import { 
  Printer, FileText, Plus, Trash, Search, ChevronRight, 
  User, Phone, ShieldCheck, DollarSign, Wrench, Sparkles, Check, Trash2, Download, X
} from "lucide-react";
import { Language, TranslationDict } from "../translations";
import { Invoice, InvoicePart, Settings, OfflineTransaction } from "../types";
import { jsPDF } from "jspdf";
import { formatInvoiceItemDescription } from "../utils";

interface AdminBillingProps {
  lang: Language;
  t: TranslationDict;
  settings?: Settings | null;
}

export default function AdminBilling({ lang, t, settings }: AdminBillingProps) {
  // Database states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<"create" | "history" | "offline">("create");

  // Customizable dynamic invoice metadata states
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [helplineNumber, setHelplineNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookPage, setFacebookPage] = useState("");
  const [shopGstin, setShopGstin] = useState("");
  const initialized = React.useRef(false);

  useEffect(() => {
    const savedMetadata = JSON.parse(localStorage.getItem("sudipta_invoice_metadata") || "{}");
    
    if (initialized.current) return;
    
    if (Object.keys(savedMetadata).length > 0) {
      setWorkshopAddress(savedMetadata.workshopAddress || "");
      setBusinessHours(savedMetadata.businessHours || "");
      setHelplineNumber(savedMetadata.helplineNumber || "");
      setWhatsappNumber(savedMetadata.whatsappNumber || "");
      setFacebookPage(savedMetadata.facebookPage || "");
      setShopGstin(savedMetadata.shopGstin || "");
    } else if (settings) {
      setWorkshopAddress(lang === "bn" 
        ? (settings.visitingCardAddressBen || "পাওয়ার হাউস রোড, কালোবাড়ির দিক, বাঘাযতীন খেলার মাঠ সংলগ্ন উত্তর পার্শ্বে, অশোকনগর, উত্তর ২৪ পরগনা।")
        : (settings.visitingCardAddressEng || "Power House Road Workshop, Near Baghajatin Playground (Towards Kalobari), Ashoknagar, North 24 Parganas.")
      );
      setBusinessHours(lang === "bn"
        ? "সকাল ১০:০০ - রাত ০৮:৩০ (বৃহস্পতিবার বন্ধ)"
        : "10:00 AM - 08:30 PM (Thursdays Closed)"
      );
      setHelplineNumber(settings.phone || "+91 9064517009 / +91 9064517009");
      setWhatsappNumber(settings.whatsappLink ? settings.whatsappLink.replace("https://wa.me/", "+") : "+91 9064517009");
      setFacebookPage(settings.facebookUrl || "Sudipta E-Scooty Service");
      setShopGstin(settings.shopGstin || "");
    } else {
      setWorkshopAddress(lang === "bn" 
        ? "পাওয়ার হাউস রোড, কালোবাড়ির দিক, বাঘাযতীন খেলার মাঠ সংলগ্ন উত্তর পার্শ্বে, অশোকনগর, উত্তর ২৪ পরগনা।" 
        : "Power House Road Workshop, Near Baghajatin Playground (Towards Kalobari), Ashoknagar, North 24 Parganas."
      );
      setBusinessHours(lang === "bn"
        ? "সকাল ১০:০০ - রাত ০৮:৩০ (বৃহস্পতিবার বন্ধ)"
        : "10:00 AM - 08:30 PM (Thursdays Closed)"
      );
      setHelplineNumber("+91 9064517009 / +91 9064517009");
      setWhatsappNumber("+91 9064517009");
      setFacebookPage("Sudipta E-Scooty Service");
      setShopGstin("");
    }
    initialized.current = true;
  }, [settings, lang]);

  // Save to localStorage whenever any metadata field changes
  useEffect(() => {
    if (!initialized.current) return;
    const metadata = { workshopAddress, businessHours, helplineNumber, whatsappNumber, facebookPage, shopGstin };
    localStorage.setItem("sudipta_invoice_metadata", JSON.stringify(metadata));
  }, [workshopAddress, businessHours, helplineNumber, whatsappNumber, facebookPage, shopGstin]);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [serviceCharge, setServiceCharge] = useState<number>(200);
  const [partsList, setPartsList] = useState<InvoicePart[]>([{ partName: "", price: 0 }]);
  const [searchQuery, setSearchQuery] = useState("");

  // Viewing past invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Load Invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invRes, offRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/offline-transactions")
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (offRes.ok) setOfflineTransactions(await offRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  // Parts List manipulations
  const [offlineInventory, setOfflineInventory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sudipta_offline_inventory');
    if (saved) {
      setOfflineInventory(JSON.parse(saved));
    }
  }, []);

  const handleAddPartRow = () => {
    setPartsList([...partsList, { partName: "", price: 0, fittingCharge: 0 }]);
  };

  const handleRemovePartRow = (index: number) => {
    if (partsList.length > 1) {
      setPartsList(partsList.filter((_, i) => i !== index));
    } else {
      setPartsList([{ partName: "", price: 0 }]);
    }
  };

  const handlePartChange = (index: number, field: keyof InvoicePart, value: any) => {
    const updated = [...partsList];
    if (field === "price") {
      updated[index].price = Number(value) || 0;
    } else if (field === "fittingCharge") {
      updated[index].fittingCharge = Number(value) || 0;
    } else {
      updated[index].partName = value;
    }
    setPartsList(updated);
  };

  // Grand Total calculation
  const partsTotal = partsList.reduce((sum, p) => sum + p.price + (p.fittingCharge || 0), 0);
  const currentGrandTotal = serviceCharge + partsTotal;

  // Handle Save
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up parts list (exclude empty rows)
    const validParts = partsList.filter(p => p.partName.trim() !== "" && p.price > 0);

    const payload = {
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone,
      vehicleModel: vehicleModel,
      customerGstin: customerGstin,
      serviceCharge: serviceCharge,
      parts: validParts,
      grandTotal: currentGrandTotal,
      date: new Date().toISOString().split("T")[0]
    };

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newInv = await response.json();
        setInvoices([newInv, ...invoices]);
        alert(lang === "bn" ? "ইনভয়েস সফলভাবে ডেটাবেসে সংরক্ষণ করা হয়েছে!" : "Invoice successfully saved to database!");
        
        // Open the newly created invoice to print or download PDF
        setSelectedInvoice(newInv);
        
        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setVehicleModel("");
        setCustomerGstin("");
        setServiceCharge(200);
        setPartsList([{ partName: "", price: 0 }]);
      } else {
        alert("Failed to save invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving invoice.");
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm(lang === "bn" ? "আপনি কি নিশ্চিত যে এই ইনভয়েসটি ডিলিট করতে চান?" : "Are you sure you want to delete this invoice?")) {
      return;
    }
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(invoices.filter(i => i.id !== id));
        if (selectedInvoice?.id === id) {
          setSelectedInvoice(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Direct Print trigger
  const triggerDirectPrint = (invoiceObj: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print invoices");
      return;
    }

    const partsRows = invoiceObj.parts.map((p) => `
      <tr>
        <td style="padding: 12px; font-size: 13px;">${formatInvoiceItemDescription(p.partName)}</td>
        <td style="padding: 12px; font-size: 13px; text-align: right; font-family: monospace;">₹ ${(p.price || 0).toLocaleString()}</td>
        <td style="padding: 12px; font-size: 13px; text-align: center;">1</td>
        <td style="padding: 12px; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">₹ ${(p.price || 0).toLocaleString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceObj.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2f855a; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-name { font-size: 26px; font-weight: 800; color: #2f855a; margin: 0; }
            .subtitle { font-size: 11px; color: #16a34a; font-weight: bold; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-info { text-align: right; }
            .invoice-title { font-size: 28px; font-weight: 900; color: #2f855a; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-id { font-family: monospace; font-size: 14px; font-weight: bold; color: #475569; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .card { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; }
            th { background-color: #2f855a; color: white; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f9fbf9; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-top: 35px; }
            .total-box { background-color: #f0fdf4; border: 1.5px solid #2f855a; border-radius: 8px; padding: 12px 20px; width: 280px; }
            .grand-total { font-weight: bold; font-size: 18px; color: #2f855a; display: flex; justify-content: space-between; align-items: center; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand-name">Sudipta E-Scooty Service</h1>
              <p class="subtitle">Electric Scooter Sales, Repairs & Battery Specialist</p>
              <div style="font-size: 11px; color: #475569; margin-top: 8px; max-width: 480px; line-height: 1.6;">
                <strong>Workshop Address:</strong> ${workshopAddress}<br/>
                ${shopGstin ? `<strong>GSTIN:</strong> ${shopGstin}<br/>` : ''}
                <strong>Helpline:</strong> ${helplineNumber} | <strong>WhatsApp:</strong> ${whatsappNumber}<br/>
                <strong>Hours:</strong> ${businessHours} | <strong>Facebook:</strong> ${facebookPage}
              </div>
            </div>
            <div class="meta-info">
              <h2 class="invoice-title">BILL / INVOICE</h2>
              <div class="invoice-id">Invoice No: ${invoiceObj.id}</div>
              <div style="font-size: 12px; margin-top: 4px; color: #475569; font-weight: 500;">Date: ${invoiceObj.date}</div>
            </div>
          </div>
          <div class="grid-2">
            <div class="card">
              <div style="font-size: 10px; color: #16a34a; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">INVOICE TO:</div>
              <div style="font-weight: bold; font-size: 15px; color: #0f172a;">${invoiceObj.customerName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Phone: ${invoiceObj.customerPhone || "N/A"}</div>
            </div>
            <div class="card">
              <div style="font-size: 10px; color: #16a34a; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">VEHICLE DETAILS:</div>
              <div style="font-weight: bold; font-size: 15px; color: #0f172a;">${invoiceObj.vehicleModel || "General EV Scooter"}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">Item Description</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 10px;">EV Diagnostic & Repair Labor Charge</td>
                <td style="padding: 12px 10px; text-align: right; font-family: monospace;">₹ ${(invoiceObj.serviceCharge || 0).toLocaleString()}</td>
                <td style="padding: 12px 10px; text-align: center;">1</td>
                <td style="padding: 12px 10px; text-align: right; font-family: monospace; font-weight: bold;">₹ ${(invoiceObj.serviceCharge || 0).toLocaleString()}</td>
              </tr>
              ${partsRows}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-box">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px;">
                <span>Subtotal:</span>
                <span style="font-family: monospace;">₹ ${(invoiceObj.grandTotal || 0).toLocaleString()}</span>
              </div>
              <div class="grand-total">
                <span>Grand Total:</span>
                <span style="font-family: monospace;">₹ ${(invoiceObj.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compile PDF using jsPDF
  const handleDownloadPDF = (invoiceObj: Invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(47, 133, 90); // Deep green brand
    doc.text("Sudipta E-Scooty Service", 15, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Electric Scooter Sales, Repairs & Battery Specialist", 15, 23);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(`Workshop Address: ${workshopAddress || "Power House Road Workshop, Ashoknagar"}`, 15, 27);
    if (shopGstin) {
      doc.text(`GSTIN: ${shopGstin}`, 15, 31);
      doc.text(`Helpline: ${helplineNumber} | WhatsApp: ${whatsappNumber}`, 15, 35);
      doc.text(`Hours: ${businessHours} | Facebook: ${facebookPage}`, 15, 39);
    } else {
      doc.text(`Helpline: ${helplineNumber} | WhatsApp: ${whatsappNumber}`, 15, 31);
      doc.text(`Hours: ${businessHours} | Facebook: ${facebookPage}`, 15, 35);
    }
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(47, 133, 90);
    doc.text("BILL / INVOICE", 150, 18);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice No: ${invoiceObj.id}`, 150, 23);
    doc.text(`Date: ${invoiceObj.date}`, 150, 27);

    doc.setDrawColor(47, 133, 90);
    doc.setLineWidth(0.5);
    doc.line(15, 39, 195, 39);

    // Customer section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(47, 133, 90);
    doc.text("CUSTOMER DETAILS:", 15, 47);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Name: ${invoiceObj.customerName}`, 15, 52);
    doc.text(`Phone: ${invoiceObj.customerPhone || "N/A"}`, 15, 57);
    doc.text(`Vehicle: ${invoiceObj.vehicleModel || "General EV Scooter"}`, 15, 62);

    let y = 70;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(47, 133, 90);
    doc.text("DESCRIPTION", 15, y);
    doc.text("TOTAL", 180, y, { align: "right" });
    y += 2;
    doc.setDrawColor(47, 133, 90);
    doc.line(15, y, 195, y);
    y += 8;

    // Labor Row
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text("EV Diagnostic & Repair Labor Charge", 15, y);
    doc.text(`INR ${(invoiceObj.serviceCharge || 0).toLocaleString()}`, 180, y, { align: "right" });
    y += 8;

    // Parts
    invoiceObj.parts.forEach((p) => {
      doc.text(formatInvoiceItemDescription(p.partName), 15, y);
      doc.text(`INR ${(p.price || 0).toLocaleString()}`, 180, y, { align: "right" });
      y += 8;
      if (p.fittingCharge) {
        doc.setFont("Helvetica", "italic");
        doc.text(`  + Fitting Charge: INR ${(p.fittingCharge || 0).toLocaleString()}`, 15, y);
        y += 8;
        doc.setFont("Helvetica", "normal");
      }
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 8;

    // Total box shaded light green
    doc.setFillColor(240, 253, 244); // Light Mint Green
    doc.rect(15, y - 6, 180, 10, "F");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(47, 133, 90);
    doc.text("GRAND TOTAL:", 18, y);
    doc.text(`INR ${(invoiceObj.grandTotal || 0).toLocaleString()}`, 177, y, { align: "right" });

    doc.save(`Invoice_${invoiceObj.id}.pdf`);
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerPhone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {lang === "bn" ? "বিলিং এবং ইনভয়েস মডিউল" : "Billing & Invoice Generation"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "bn" ? "নতুন বিল তৈরি করুন এবং ডেটাবেসে সংরক্ষণ করুন।" : "Generate printable bills and persist digital records."}
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("create")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "create" ? "bg-white dark:bg-slate-850 text-indigo-600 shadow" : "text-slate-500"}`}
          >
            {lang === "bn" ? "নতুন বিল" : "Create"}
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "history" ? "bg-white dark:bg-slate-850 text-indigo-600 shadow" : "text-slate-500"}`}
          >
            {lang === "bn" ? "ইতিহাস" : "History"}
          </button>
          <button
            onClick={() => setActiveSubTab("offline")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "offline" ? "bg-white dark:bg-slate-850 text-indigo-600 shadow" : "text-slate-500"}`}
          >
            {lang === "bn" ? "অফলাইন" : "Offline"}
          </button>
        </div>
      </div>

      {activeSubTab === "create" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <form onSubmit={handleSaveInvoice} className="xl:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{lang === "bn" ? "গ্রাহকের নাম" : "Customer Name"}</label>
                <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{lang === "bn" ? "ফোন নম্বর" : "Phone"}</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{lang === "bn" ? "মডেল" : "Vehicle Model"}</label>
                <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">{lang === "bn" ? "সার্ভিস চার্জ" : "Labor Charge (₹)"}</label>
                <input type="number" required value={serviceCharge} onChange={e => setServiceCharge(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>

            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-4">
              <h4 className="text-xs font-bold text-emerald-850 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {lang === "bn" ? "ইনভয়েস মেটাডেটা কাস্টমাইজেশন (ডায়নামিক)" : "Invoice Metadata Customization (Dynamic)"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                {lang === "bn" ? "এই তথ্যগুলো সরাসরি জেনারেট হওয়া ইনভয়েসের হেডার ও ফুটারে বসে যাবে।" : "These values map dynamically to the generated invoice header & footer."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "ওয়ার্কশপ ঠিকানা" : "Workshop Address"}</label>
                  <input type="text" value={workshopAddress} onChange={e => setWorkshopAddress(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "ব্যবসার সময়" : "Business Hours"}</label>
                  <input type="text" value={businessHours} onChange={e => setBusinessHours(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "হেল্পলাইন নম্বর" : "Helpline Number"}</label>
                  <input type="text" value={helplineNumber} onChange={e => setHelplineNumber(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}</label>
                  <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "ফেসবুক পেজ" : "Facebook Page"}</label>
                  <input type="text" value={facebookPage} onChange={e => setFacebookPage(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "bn" ? "বিজনেস জিএসটি নম্বর" : "Business GSTIN"}</label>
                  <input type="text" value={shopGstin} onChange={e => setShopGstin(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="Enter GSTIN (Optional)" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                <label className="text-xs font-bold text-slate-500">SPARE PARTS</label>
                <button type="button" onClick={handleAddPartRow} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[10px] font-bold rounded-lg"><Plus className="w-3.5 h-3.5" /> ADD ROW</button>
              </div>
              {partsList.map((part, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    list="spare-parts-list"
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    value={part.partName}
                    placeholder="Type or select a part..."
                    onChange={e => {
                      const value = e.target.value;
                      const selectedPart = offlineInventory.find(p => p.name === value);
                      const updated = [...partsList];
                      updated[index].partName = value;
                      updated[index].price = selectedPart ? selectedPart.retail : (updated[index].price || 0);
                      updated[index].fittingCharge = selectedPart ? selectedPart.fittingCharge : (updated[index].fittingCharge || 0);
                      setPartsList(updated);
                    }}
                  />
                  <datalist id="spare-parts-list">
                    {offlineInventory.map(p => <option key={p.id} value={p.name} />)}
                  </datalist>
                  
                  <input type="number" placeholder="Price" value={part.price || ""} onChange={e => handlePartChange(index, "price", e.target.value)} className="w-24 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                  <input type="number" placeholder="Fitting" value={part.fittingCharge || ""} onChange={e => handlePartChange(index, "fittingCharge" as any, e.target.value)} className="w-24 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                  <button type="button" onClick={() => handleRemovePartRow(index)} className="text-rose-500"><Trash className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20">SAVE & GENERATE</button>
            </div>
          </form>

          <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
             <div className="bg-slate-950 text-white p-4 flex justify-between">
               <span className="text-[10px] font-bold tracking-widest">INVOICE PREVIEW</span>
               <span className="text-[10px] text-emerald-400 font-mono tracking-widest">₹ {(currentGrandTotal || 0).toLocaleString()}</span>
             </div>
             <div className="p-6 space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm">Sudipta E-Scooty Service</h4>
                  <p className="text-[10px] text-slate-400">Ashoknagar Power House Road</p>
                </div>
                <div className="space-y-2 text-[11px] bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span className="text-slate-400">Customer:</span> <span className="font-bold">{customerName || "Walk-in"}</span></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span className="text-slate-400">Labor:</span> <span className="font-bold">₹ {serviceCharge}</span></div>
                  <div className="flex justify-between border-t border-emerald-100 dark:border-emerald-900/40 pt-2"><span className="text-emerald-700 dark:text-emerald-400 font-bold">TOTAL:</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">₹ {currentGrandTotal}</span></div>
                </div>
             </div>
          </div>
        </div>
      ) : activeSubTab === "offline" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md p-6">
            <h2 className="text-sm font-bold text-slate-800">Offline Transaction Log</h2>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-400">SECURE SALES LOG</h4>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search history..." className="w-full text-[10px] p-2 pl-9 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </div>
          </div>
          {loading ? <div className="text-center py-10 text-xs text-slate-400">Loading records...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3">ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-indigo-600">{inv.id}</td>
                      <td className="p-3">{inv.date}</td>
                      <td className="p-3 font-bold">{inv.customerName}</td>
                      <td className="p-3 text-right font-bold">₹ {(inv.grandTotal || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setSelectedInvoice(inv)} className="text-indigo-600"><FileText className="w-4 h-4" /></button>
                          <button onClick={() => triggerDirectPrint(inv)} className="text-emerald-600"><Printer className="w-4 h-4" /></button>
                          <button onClick={() => handleDownloadPDF(inv)} className="text-amber-600"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteInvoice(inv.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-emerald-950 text-white px-6 py-4 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider">Invoice Details</span>
              <button onClick={() => setSelectedInvoice(null)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">Sudipta E-Scooty Service</h2>
                  <p className="text-[10px] text-slate-400">{workshopAddress}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{selectedInvoice.id}</p>
                  <p className="text-[10px] text-slate-400">{selectedInvoice.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/10">
                   <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase mb-1">Customer</p>
                   <p className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.customerName}</p>
                   <p className="text-slate-500">{selectedInvoice.customerPhone}</p>
                </div>
                <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/10">
                   <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase mb-1">Vehicle</p>
                   <p className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.vehicleModel || "General EV"}</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Labor Charge:</span>
                  <span className="font-bold">₹ {(selectedInvoice.serviceCharge || 0).toLocaleString()}</span>
                </div>
                {selectedInvoice.parts.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-500">
                    <span>{p.partName}:</span>
                    <span>₹ {(p.price || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Grand Total:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">₹ {(selectedInvoice.grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => triggerDirectPrint(selectedInvoice)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-bold transition">PRINT BILL</button>
                <button onClick={() => handleDownloadPDF(selectedInvoice)} className="flex-1 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/40 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"><Download className="w-4 h-4" /> PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
