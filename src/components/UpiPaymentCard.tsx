import React, { useState, useEffect } from "react";
import { QrCode, Check, Copy, CheckCircle2, DollarSign, Shield, ArrowRight, Smartphone, Zap, CreditCard, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../translations";

interface UpiPaymentCardProps {
  lang: Language;
  initialAmount?: string;
  settings?: any;
}

export const UpiPaymentCard: React.FC<UpiPaymentCardProps> = ({ lang, initialAmount = "", settings }) => {
  const [amount, setAmount] = useState<string>(initialAmount);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrLoaded, setQrLoaded] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update amount if initialAmount prop changes
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  const upiId = settings?.upiId || "Tanmoydasdas23@ybl";
  const payeeName = settings?.upiPayeeName || "Sudipta Das";
  const transactionNote = "Sudipta E-Scooty Service Payment";

  // Build the real UPI payment link
  const getUpiLink = () => {
    const base = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      return `${base}&am=${amount}`;
    }
    return base;
  };

  const upiLink = getUpiLink();
  // Using QRServer API for Black & White QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&data=${encodeURIComponent(upiLink)}`;

  useEffect(() => {
    setQrLoaded(false);
  }, [amount]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectPreset = (val: string) => {
    setAmount(val);
  };

  const t = {
    title: lang === "bn" ? "সহজ ইউপিআই পেমেন্ট" : "Easy UPI Payment",
    subtitle: lang === "bn" ? "সরাসরি আপনার মোবাইল থেকে পেমেন্ট করুন" : "Pay securely directly from your phone",
    amountLabel: lang === "bn" ? "টাকার পরিমাণ লিখুন (ঐচ্ছিক)" : "Enter Amount (Optional)",
    amountPlaceholder: lang === "bn" ? "যেমন: ৫০০, ১০০০" : "e.g. 500, 1000",
    verifiedMerchant: lang === "bn" ? "ভেরিফাইড মার্চেন্ট" : "Verified Receiver",
    copyBtn: lang === "bn" ? "ইউপিআই আইডি কপি করুন" : "Copy UPI ID",
    copiedBtn: lang === "bn" ? "কপি হয়েছে!" : "Copied!",
    scanInstructions: lang === "bn" 
      ? "যেকোনো ইউপিআই অ্যাপ (GPay, PhonePe, Paytm, BHIM) দিয়ে স্ক্যান করে সরাসরি নিরাপদ ও দ্রুত পেমেন্ট করুন।"
      : "Scan with any UPI App (GPay, PhonePe, Paytm, BHIM) to make a fast and secure payment.",
    presetsLabel: lang === "bn" ? "পেমেন্ট প্রিসেট:" : "Presets:",
    securedBy: lang === "bn" ? "১০০% নিরাপদ ইউপিআই পেমেন্ট" : "100% Secured UPI Network"
  };

  return (
    <div className="bg-black dark:bg-black p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <QrCode className="w-5.5 h-5.5 text-emerald-500" />
              {t.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          <span className="flex items-center gap-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.verifiedMerchant}
          </span>
        </div>

        {/* UPI ID display row */}
        <div className="bg-slate-950 p-3 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">UPI ADDRESS</span>
            <span className="font-mono text-xs font-bold text-slate-300">{upiId}</span>
          </div>
          <button
            onClick={handleCopyUpi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">{t.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.copyBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Optional amount field */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {t.amountLabel}
          </label>
          <div className="relative rounded-2xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold text-sm">₹</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.amountPlaceholder}
              className="block w-full pl-8 pr-3 py-2.5 text-sm bg-slate-950 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
            {amount && (
              <button
                onClick={() => setAmount("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 p-1 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Preset options */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400">{t.presetsLabel}</span>
            <div className="flex gap-1.5 flex-wrap">
              {["100", "500", "1000", "2000", "5000"].map((p) => (
                <button
                  key={p}
                  onClick={() => selectPreset(p)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    amount === p
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Payment Interaction */}
        <div className="space-y-6">
          {/* 2. QR Code as Secondary Option */}
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950/40 rounded-3xl relative border border-slate-800">
            <button 
              onClick={() => setShowQr(!showQr)} 
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-500" />
              {showQr ? (lang === "bn" ? "কিউআর কোড লুকান" : "Hide QR Code") : (lang === "bn" ? "কিউআর কোড দেখুন (স্ক্যান করার জন্য)" : "Show QR Code (For Scanning)")}
            </button>

            {showQr && (
              <div className="relative bg-white p-3 rounded-2xl shadow-md flex items-center justify-center mt-4 animate-in fade-in zoom-in-95 duration-300">
                {!qrLoaded && (
                  <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  className="w-40 h-40 object-contain"
                  onLoad={() => setQrLoaded(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          {t.scanInstructions}
        </p>
      </div>
    </div>
  );
};
