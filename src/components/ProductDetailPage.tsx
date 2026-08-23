import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Vehicle, Product, Order } from "../types";
import { Language, TranslationDict } from "../translations";
import { triggerDashboardRefresh } from "../hooks/useDashboardRefresh";
import { 
  Zap, 
  ShieldCheck, 
  Battery, 
  Gauge, 
  Hourglass, 
  MessageSquare, 
  Compass, 
  Send, 
  CheckCircle, 
  Tag, 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  Truck, 
  Info, 
  Calendar, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  Clock,
  ChevronRight,
  User,
  Phone,
  MapPin,
  CreditCard,
  X,
  Package,
  Smartphone,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCw,
  Video,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Inline simple CheckoutModal for buying spare parts
interface CheckoutModalProps {
  product: Product;
  lang: Language;
  onClose: () => void;
  finalPrice: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, lang, onClose, finalPrice }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [upiSettings, setUpiSettings] = useState({ id: "tanmoydasdas23@ybl", name: "Mr TANMAY DAS", qrCodeUrl: "", instructionsEng: "", instructionsBen: "" });
  const [showQr, setShowQr] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/globalConfig')
      .then(res => res.json())
      .then(data => {
        setUpiSettings({ 
          id: data.upiId || "tanmoydasdas23@ybl", 
          name: data.upiMerchantName || "Mr TANMAY DAS",
          qrCodeUrl: data.qrCodeUrl || "",
          instructionsEng: data.paymentInstructionsEng || "",
          instructionsBen: data.paymentInstructionsBen || ""
        });
      });
  }, []);

  useEffect(() => {
    if (showQr) {
      const timer = setTimeout(() => {
        setShowManualFallback(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowManualFallback(false);
    }
  }, [showQr]);

  const isBng = lang === "bn";
  const deliveryFee = product.deliveryCharge || 0;
  const grandTotal = finalPrice + deliveryFee;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) return;
    setLoading(true);
    try {
      const orderData: Partial<Order> = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: [{
          id: product.id,
          name: `${isBng ? product.titleBen : product.titleEng}`,
          quantity: 1,
          price: finalPrice
        }],
        totalAmount: grandTotal,
        notes: `Instant UPI Checkout from Detail Page`,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedOrder(data);
        setStep("payment");
        // Instantly notify dashboard of the new manual verification order!
        triggerDashboardRefresh();
      }
    } catch (err) {
      console.error("Order creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerificationSubmit = async () => {
    if (!createdOrder) {
      setStep("success");
      return;
    }
    setLoading(true);
    try {
      const patchData = {
        utrNumber: utrNumber || undefined,
        paymentScreenshot: paymentScreenshot || undefined,
        paymentProof: paymentScreenshot || undefined,
        status: "Pending Verification"
      };
      const res = await fetch(`/api/orders/${createdOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData)
      });
      if (res.ok) {
        setStep("success");
        triggerDashboardRefresh();
      } else {
        setStep("success");
      }
    } catch (err) {
      console.error("Failed to patch order", err);
      setStep("success");
    } finally {
      setLoading(false);
    }
  };

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

  const upiId = upiSettings.id;
  const upiName = upiSettings.name;
  const upiBase = `pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Order Parts`)}`;
  const universalIntentUrl = `upi://pay?${upiBase}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900">{isBng ? "চেকআউট" : "Checkout"}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {isBng ? product.titleBen : product.titleEng}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto pb-10 space-y-4">
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "আপনার নাম" : "Your Name"}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBng ? "উদাঃ সুজয় দাস" : "e.g. Sujoy Das"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "ফোন নম্বর" : "Phone Number"}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="tel" 
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                  <textarea 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isBng ? "আপনার সম্পূর্ণ ঠিকানা দিন..." : "Enter your full address..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{isBng ? "আইটেম মূল্য" : "Item Price"}</span>
                  <span className="font-bold">₹{(finalPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    {isBng ? "ডেলিভারি চার্জ" : "Delivery Fee"}
                    <Truck className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="font-bold">₹{deliveryFee}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>{isBng ? "মোট প্রদেয়" : "Grand Total"}</span>
                  <span className="text-emerald-600">₹{(grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={loading || phone.length !== 10}
              >
                <span>{isBng ? "পেমেন্ট করতে এগিয়ে যান" : "Proceed to Payment"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                  <CreditCard className="w-5 h-5" />
                  <h4 className="font-bold text-slate-900">{isBng ? "UPI পেমেন্ট" : "UPI Payment"}</h4>
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isBng ? "নিচের কিউআর কোডটি স্ক্যান করুন অথবা সরাসরি অ্যাপের মাধ্যমে পেমেন্ট করুন।" : "Scan the QR code below or pay directly using any UPI app."}
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href={universalIntentUrl}
                  className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 text-xs text-center cursor-pointer"
                >
                  {isBng ? "মোবাইল UPI অ্যাপ দিয়ে পেমেন্ট করুন" : "Pay via Mobile UPI App"}
                </a>

                <div className="bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-xs mx-auto w-full">
                  <button 
                    type="button"
                    onClick={() => setShowQr(!showQr)} 
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    {showQr ? (isBng ? "কিউআর কোড লুকান" : "Hide QR Code") : (isBng ? "কিউআর কোড দেখুন (স্ক্যান করুন)" : "Show QR Code for Scanning")}
                  </button>

                  {showQr && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 text-center space-y-3 animate-fade-in">
                      <p className="text-xs font-bold text-indigo-700">{upiSettings.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{upiSettings.id}</p>
                      
                      {/* Dynamic QR Code */}
                      <div className="flex justify-center p-2 bg-white rounded-xl shadow-xs border border-slate-200 w-44 h-44 mx-auto">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=000000&data=${encodeURIComponent(universalIntentUrl)}`} 
                          alt="UPI QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <p className="text-lg font-black text-emerald-600 mt-2">₹{(grandTotal || 0).toLocaleString()}</p>
                      {upiSettings.instructionsEng && (
                        <p className="text-[10px] text-slate-500 mt-2 bg-indigo-50/50 p-2 rounded-lg leading-normal">
                          {isBng ? upiSettings.instructionsBen : upiSettings.instructionsEng}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {showManualFallback && (
                <div className="space-y-4 pt-4 border-t border-slate-200 text-left">
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                    <p className="text-[10px] text-rose-700 font-bold leading-tight">
                      {isBng 
                        ? "স্বয়ংক্রিয় পেমেন্ট ডিটেকশন করতে সমস্যা হচ্ছে? পেমেন্ট প্রুফ জমা দিন।" 
                        : "Having issues? Submit your transaction reference or WhatsApp screenshot."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder={isBng ? "ইউটিআর / লেনদেন আইডি (ঐচ্ছিক)" : "UTR / Transaction ID (Optional)"} 
                      value={utrNumber} 
                      onChange={(e) => setUtrNumber(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    
                    {/* Payment Screenshot Input */}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-2 ${paymentScreenshot ? 'bg-emerald-50 border-emerald-500/50 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {paymentScreenshot ? (isBng ? "স্ক্রিনশট সিলেক্ট করা হয়েছে" : "Screenshot Selected") : (isBng ? "পেমেন্ট স্ক্রিনশট আপলোড করুন" : "Upload Payment Screenshot")}
                      </button>
                    </div>

                    <button 
                      onClick={handleManualVerificationSubmit}
                      disabled={loading || (!utrNumber.trim() && !paymentScreenshot)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{isBng ? "যাচাইয়ের জন্য পাঠান" : "Submit Verification"}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4 py-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isBng ? "অর্ডার সফল হয়েছে!" : "Order Successful!"}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                {isBng 
                  ? "আপনার পেমেন্ট রিকোয়েস্ট জমা নেওয়া হয়েছে। সুদীপ্ত দা খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।" 
                  : "Your order details are successfully registered. Sudipta Das will contact you shortly."}
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition cursor-pointer"
              >
                {isBng ? "বন্ধ করুন" : "Close"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface BookingModalProps {
  vehicle: Vehicle;
  lang: Language;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ vehicle, lang, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const isBng = lang === "bn";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          type: "Test Ride",
          vehicleId: vehicle.id,
          message: `Booking Test Ride for ${vehicle.brand} ${vehicle.model} on date ${date}. Customer note: ${notes}`
        })
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-800 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            {isBng ? "টেস্ট রাইড বুকিং করুন" : "Book a Free Test Ride"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-900">
              {isBng ? "বুকিং সফল হয়েছে!" : "Test Ride Request Registered!"}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              {isBng 
                ? "আমাদের টীম খুব শীঘ্রই আপনাকে ফোন করে রাইডের সময় নিশ্চিত করবে।" 
                : "We have received your details and will call you to confirm the time slot shortly."}
            </p>
            <button onClick={onClose} className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer">
              {isBng ? "বন্ধ করুন" : "Close"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "আপনার নাম" : "Your Name"}</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "ফোন নম্বর" : "Phone Number"}</label>
              <input required type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} placeholder="10 digit number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "পছন্দের তারিখ" : "Preferred Date"}</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{isBng ? "অতিরিক্ত তথ্য (ঐচ্ছিক)" : "Additional Notes (Optional)"}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs h-16 resize-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs mt-2 hover:bg-black cursor-pointer">
              {loading ? "Processing..." : (isBng ? "টেস্ট ড্রাইভ বুক করুন" : "Book Free Ride Now")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface ProductDetailPageProps {
  products: Product[];
  vehicles?: Vehicle[];
  lang: Language;
  t: TranslationDict;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products, vehicles = [], lang, t }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find inside scooters or spare parts catalog
  const vehicle = vehicles.find((v) => v.id === id);
  const product = products.find((p) => p.id === id);
  const isBng = lang === "bn";

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedBattery, setSelectedBattery] = useState<string>("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "description" | "warranty">("specs");

  // Media Gallery & 360 Rotation & Video Playback States
  const [activeMedia, setActiveMedia] = useState<"image" | "video" | "360">("image");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoVolume, setVideoVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [videoQuality, setVideoQuality] = useState("1080p HD");
  const [isDragging360, setIsDragging360] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Reset media when switching products
  useEffect(() => {
    setActiveMedia("image");
    setSelectedImageIndex(0);
    setRotationIndex(0);
    setIsVideoPlaying(false);
    setVideoProgress(0);
  }, [id]);

  // Video progress controller
  useEffect(() => {
    let interval: any;
    if (isVideoPlaying && activeMedia === "video") {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, activeMedia]);

  // 360-degree rotation gesture mechanics
  const handleDragStart = (clientX: number) => {
    setIsDragging360(true);
    setDragStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging360) return;
    const dragDelta = clientX - dragStartX;
    // Every 15px of drag rotates to the next or previous frame
    const steps = Math.floor(dragDelta / 15);
    if (steps !== 0) {
      setRotationIndex((prevIndex) => {
        let nextIndex = (prevIndex + steps) % 8;
        if (nextIndex < 0) nextIndex += 8;
        return nextIndex;
      });
      setDragStartX(clientX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging360(false);
  };

  // Auto initialize specifications options if it's a vehicle
  useEffect(() => {
    if (vehicle) {
      if (vehicle.id === "v2") {
        setSelectedColor("Metallic Blue");
        setSelectedBattery("Lead Acid: 60V 32Ah");
      } else {
        setSelectedColor(isBng ? "মেটালিক ব্লু" : "Metallic Blue");
        setSelectedBattery(isBng ? "৬০V ২৪Ah লিথিয়াম" : "Lithium: 60V 24Ah");
      }
    }
  }, [vehicle, isBng]);

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Pinch-to-zoom refs and states
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const isPinchingRef = useRef(false);
  const startDistRef = useRef(0);
  const startMidpointRef = useRef({ x: 0, y: 0 });
  const currentScaleRef = useRef(1);

  // Bind non-passive touch events to allow preventing default scrolling during pinch
  useEffect(() => {
    const wrapper = imageWrapperRef.current;
    const img = zoomImageRef.current;
    if (!wrapper || !img) return;

    const getDistance = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
        Math.pow(t1.clientY - t2.clientY, 2)
      );
    };

    const getMidpoint = (touches: TouchList) => {
      const t1 = touches[0];
      const t2 = touches[1];
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinchingRef.current = true;
        startDistRef.current = getDistance(e.touches);
        startMidpointRef.current = getMidpoint(e.touches);
        img.style.transition = "none";
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinchingRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const currentDist = getDistance(e.touches);
        const currentMid = getMidpoint(e.touches);

        let scale = currentDist / startDistRef.current;
        if (scale < 1) scale = 1;
        if (scale > 4) scale = 4;
        currentScaleRef.current = scale;

        const dx = currentMid.x - startMidpointRef.current.x;
        const dy = currentMid.y - startMidpointRef.current.y;

        img.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        img.style.transformOrigin = "center center";
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinchingRef.current) {
        isPinchingRef.current = false;
        currentScaleRef.current = 1;
        
        img.style.transition = "transform 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)";
        img.style.transform = "translate(0px, 0px) scale(1)";
      }
    };

    wrapper.addEventListener("touchstart", handleTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: false });
    wrapper.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [selectedImageIndex, activeMedia]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPinchingRef.current) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const img = zoomImageRef.current;
    if (img) {
      img.style.transition = "transform 0.1s ease-out, transform-origin 0.1s ease-out";
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(1.8)";
    }
  };

  const handleMouseLeave = () => {
    const img = zoomImageRef.current;
    if (img) {
      img.style.transition = "transform 0.3s ease, transform-origin 0.3s ease";
      img.style.transformOrigin = "center center";
      img.style.transform = "scale(1)";
    }
  };

  if (!vehicle && !product) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-800 space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-black text-slate-800">{isBng ? "পণ্যটি খুঁজে পাওয়া যায়নি" : "Product Not Found"}</h2>
        <p className="text-xs text-slate-500">{isBng ? "দয়া করে আপনার শোরুম ক্যাটালগ পরীক্ষা করুন।" : "The requested product ID is not registered in our inventory database."}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black cursor-pointer transition">
          {isBng ? "হোমপেজে ফিরে যান" : "Go Back Home"}
        </button>
      </div>
    );
  }

  const isVehicle = !!vehicle;
  const currentItem = vehicle || product!;

  // Map fields
  const title = isBng ? (currentItem as any).model || (currentItem as any).titleBen : (currentItem as any).model || (currentItem as any).titleEng;
  const brand = currentItem.brand;
  const originalPrice = currentItem.price;
  const offerPrice = currentItem.offerPrice;
  const images = currentItem.images && currentItem.images.length > 0 ? currentItem.images : ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"];
  const description = isBng ? currentItem.descriptionBen : currentItem.descriptionEng;

  // Custom multi-media gallery: strictly maps to the live images provided in CMS
  const galleryImages = images;

  // Dynamic conditional flags for 360 and Video Views
  const has360 = isVehicle && !!(vehicle as any).spin360Url;
  const hasVideo = isVehicle && !!(vehicle as any).videoPromoUrl;

  // 8 angled frames for 360-degree rotation view simulator
  const rotationFrames = [
    galleryImages[0],
    galleryImages[1 % galleryImages.length],
    galleryImages[2 % galleryImages.length],
    galleryImages[3 % galleryImages.length],
    galleryImages[4 % galleryImages.length] || galleryImages[0],
    galleryImages[3 % galleryImages.length],
    galleryImages[2 % galleryImages.length],
    galleryImages[1 % galleryImages.length]
  ];

  // Custom metadata for vehicles
  const speed = isVehicle ? vehicle.topSpeed : "";
  const mileage = isVehicle ? vehicle.range : "";
  const batteryType = isVehicle ? (isBng ? vehicle.batteryTypeBen : vehicle.batteryTypeEng) : "";
  const chargingTime = isVehicle ? vehicle.chargingTime : "";
  const motorPower = isVehicle ? vehicle.motorPower : "";
  const warranty = isVehicle ? (isBng ? vehicle.warrantyBen : vehicle.warrantyEng) : "";
  const colorsText = isVehicle ? (isBng ? vehicle.colorsBen : vehicle.colorsEng) : "";

  // Dynamic braking system
  const brakingSystem = isVehicle
    ? vehicle.id === "v1"
      ? (isBng ? "ডুয়াল ডিস্ক ব্রেক সিস্টেম (Dual Disc)" : "Dual Disc Braking System")
      : vehicle.id === "v2"
      ? (isBng ? "ফ্রন্ট ডিস্ক ও রিয়ার ড্রাম ব্রেক" : "Front Disc & Rear Drum Brake")
      : (isBng ? "উন্নত হাইড্রোলিক ডিস্ক ব্রেক" : "Hydraulic Disk Brake System")
    : "";

  // Dynamic colors list array
  const colorsList = isVehicle
    ? vehicle.id === "v1"
      ? ["Metallic Blue", "Cherry Red", "Sea Green"]
      : vehicle.id === "v2"
      ? ["Metallic Blue", "Blazing Red", "Bullet Silver"]
      : ["Metallic Blue", "Cherry Red", "Sea Green"]
    : [];

  const colorMap: Record<string, { bg: string; border: string; labelBn: string }> = {
    "Metallic Blue": { bg: "bg-blue-600", border: "border-blue-300", labelBn: "মেটালিক ব্লু" },
    "Cherry Red": { bg: "bg-red-600", border: "border-red-300", labelBn: "চেরি রেড" },
    "Sea Green": { bg: "bg-emerald-600", border: "border-emerald-300", labelBn: "সি গ্রিন" },
    "Blazing Red": { bg: "bg-red-500", border: "border-red-300", labelBn: "ব্লেজিং রেড" },
    "Bullet Silver": { bg: "bg-slate-300", border: "border-slate-400", labelBn: "বুলেট সিলভার" }
  };

  // WhatsApp Enquiry Link Formulation
  const waEnquiryMessage = isVehicle
    ? isBng
      ? `নমস্কার সুদীপ্ত দা, আমি আপনার শোরুমের ${brand} ${title} স্কুটারটি সম্পর্কে জানতে আগ্রহী।\n\nপছন্দসই কালার: ${colorMap[selectedColor]?.labelBn || selectedColor || colorsText}\nমূল্য: ₹${(offerPrice || 0).toLocaleString()}\nদয়া করে আমাকে বিস্তারিত জানাবেন।`
      : `Hello Sudipta, I am highly interested in your ${brand} ${title} electric scooter with following choices:\n\n- Color: ${selectedColor || "Default"}\n- Battery Configuration: ${selectedBattery || batteryType}\n\nPlease share delivery times and final pricing details.`
    : isBng
    ? `নমস্কার সুদীপ্ত দা, আমি আপনার ক্যাটালগ থেকে স্পেয়ার পার্টস "${title}" (₹${(offerPrice || 0).toLocaleString()}) অর্ডার করতে আগ্রহী।`
    : `Hello Sudipta, I would like to order the Spare Part: ${title} priced at ₹${(offerPrice || 0).toLocaleString()}. Please let me know if it is ready for shipment.`;

  const waEnquiryUrl = `https://wa.me/919064517009?text=${encodeURIComponent(waEnquiryMessage)}`;

  // Recommendation engine: 
  // For Vehicle -> Show other Vehicle models.
  // For Product -> Show other Products of the same category, or same brand, or generic products.
  const recommendedItems = isVehicle
    ? vehicles.filter(v => v.id !== id)
    : (() => {
        const primary = products.filter(p => p.id !== id && (p.category === product!.category || p.brand === product!.brand));
        const primaryIds = new Set(primary.map(p => p.id));
        const secondary = products.filter(p => p.id !== id && !primaryIds.has(p.id));
        return [...primary, ...secondary].slice(0, 4);
      })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 md:py-16 text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{isBng ? "ফিরে যান" : "Back"}</span>
          </button>
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800">
            {isVehicle ? (isBng ? "ইলেকট্রিক স্কুটার" : "Electric Scooter") : (isBng ? "স্পেয়ার পার্টস" : "Genuine Spare Part")}
          </span>
        </div>

        {/* Dynamic Detail Bento Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Visual Asset Gallery */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            {/* Interactive Media Container */}
            <div className="relative aspect-[4/3] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/50 dark:border-slate-800 shadow-md flex flex-col justify-center items-center group">
              
              {/* Media Switcher Badges - Absolute Top Right */}
              <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-20 max-sm:top-2 max-sm:right-2">
                <button
                  onClick={() => setActiveMedia("image")}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight uppercase cursor-pointer transition ${
                    activeMedia === "image"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-850"
                  }`}
                >
                  📸 {isBng ? "ছবি" : "Photos"}
                </button>
                {has360 && (
                  <button
                    onClick={() => setActiveMedia("360")}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight uppercase cursor-pointer transition ${
                      activeMedia === "360"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-900/80 text-slate-300 hover:bg-slate-850"
                    }`}
                  >
                    🔄 {isBng ? "৩৬০° ভিউ" : "360° View"}
                  </button>
                )}
                {hasVideo && (
                  <button
                    onClick={() => {
                      setActiveMedia("video");
                      setIsVideoPlaying(true);
                    }}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight uppercase cursor-pointer transition ${
                      activeMedia === "video"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-900/80 text-slate-300 hover:bg-slate-850"
                    }`}
                  >
                    🎥 {isBng ? "ভিডিও" : "Video"}
                  </button>
                )}
              </div>

              {/* Badges - Absolute Top Left */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20 max-sm:top-2 max-sm:left-2">
                <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[8px] md:text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Zap className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
                  <span>100% ECO</span>
                </span>
                
                {isVehicle ? (
                  <span className={`text-[8px] md:text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-xs ${
                    vehicle.stockStatus === "In Stock" ? "bg-blue-600/95 text-white" : "bg-amber-500/95 text-white animate-pulse"
                  }`}>
                    {vehicle.stockStatus === "In Stock" ? t.inStock : t.lowStock}
                  </span>
                ) : (
                  <span className={`text-[8px] md:text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-xs ${
                    product.stock > 0 ? "bg-blue-600/95 text-white" : "bg-rose-600/95 text-white"
                  }`}>
                    {product.stock > 0 ? `${product.stock} ${isBng ? "পিস উপলব্ধ" : "Available"}` : t.outOfStock}
                  </span>
                )}
              </div>

              {/* MEDIA VIEW CONTENT RENDERING */}
              <div className="w-full h-full flex items-center justify-center relative">
                
                {/* 1. PHOTO VIEW */}
                {activeMedia === "image" && (
                  <div 
                    ref={imageWrapperRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="w-full h-full relative flex items-center justify-center overflow-hidden cursor-zoom-in"
                  >
                    <img 
                      ref={zoomImageRef}
                      src={galleryImages[selectedImageIndex]} 
                      alt={`${title} - Gallery ${selectedImageIndex + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 animate-fade-in" 
                      referrerPolicy="no-referrer"
                    />

                    {/* Floating Next/Prev Arrow Overlays on Hover */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/65 hover:bg-slate-950/80 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block z-10"
                    >
                      &larr;
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/65 hover:bg-slate-950/80 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block z-10"
                    >
                      &rarr;
                    </button>

                    {/* Photo Quick Overlays */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold">
                      IMAGE {selectedImageIndex + 1} / {galleryImages.length}
                    </div>

                    {/* Video and 360 Callout Overlay triggers */}
                    <div className="absolute bottom-3 right-3 flex gap-1.5 max-sm:bottom-2 max-sm:right-2">
                      {hasVideo && (
                        <button
                          onClick={() => {
                            setActiveMedia("video");
                            setIsVideoPlaying(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold p-1.5 px-2 rounded-lg flex items-center gap-1 text-[9px] shadow-lg cursor-pointer active:scale-95 transition"
                        >
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>VIDEO TOUR</span>
                        </button>
                      )}
                      {has360 && (
                        <button
                          onClick={() => setActiveMedia("360")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1.5 px-2 rounded-lg flex items-center gap-1 text-[9px] shadow-lg cursor-pointer active:scale-95 transition"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>360° SPIN</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. INTERACTIVE 360 VIEW */}
                {activeMedia === "360" && has360 && (
                  <div className="w-full h-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                    <iframe
                      src={(vehicle as any).spin360Url}
                      title="360 Interactive View"
                      className="w-full h-full border-0"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-1 rounded text-[8px] font-mono font-bold z-10 pointer-events-none">
                      🔄 INTERACTIVE 360° FRAME
                    </div>
                  </div>
                )}

                {/* 3. CINEMATIC PRODUCT TESTING VIDEO */}
                {activeMedia === "video" && hasVideo && (
                  <div className="w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center relative">
                    {((vehicle as any).videoPromoUrl || "").includes("youtube") || ((vehicle as any).videoPromoUrl || "").includes("youtu.be") || ((vehicle as any).videoPromoUrl || "").includes("vimeo") ? (
                      (() => {
                        const rawUrl = ((vehicle as any).videoPromoUrl || "").trim();
                        let embedSrc = rawUrl;
                        if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
                          let vId = "";
                          if (rawUrl.includes("youtu.be/")) {
                            vId = rawUrl.split("youtu.be/")[1]?.split(/[?#]/)[0];
                          } else if (rawUrl.includes("embed/")) {
                            vId = rawUrl.split("embed/")[1]?.split(/[?#]/)[0];
                          } else {
                            const match = rawUrl.match(/[?&]v=([^&#]+)/);
                            vId = match ? match[1] : "";
                          }
                          if (vId && vId !== "L_LUpnjgPso" && vId !== "pSOn-oXmYwI") {
                            embedSrc = `https://www.youtube.com/embed/${vId}?autoplay=0&rel=0`;
                          } else {
                            embedSrc = "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=0&rel=0";
                          }
                        }
                        return (
                          <iframe
                            src={embedSrc}
                            title="Product Promo Video"
                            className="w-full h-full border-0 animate-fade-in"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                          />
                        );
                      })()
                    ) : (
                      <video
                        src={(vehicle as any).videoPromoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain animate-fade-in"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-1 rounded text-[8px] font-mono font-bold z-10 pointer-events-none">
                      🎥 PROMOTIONAL VIDEO TOUR
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Thumbnail Navigation Strip - Flipkart Style */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase block">
                {isBng ? "গ্যালারি ও ইন্টারেক্টিভ মিডিয়া ব্রাউজ করুন" : "Browse Gallery & Media"}
              </span>
              
              <div className="flex flex-wrap gap-1.5 w-full">
                
                {/* 1. Normal Image Thumbnails */}
                {galleryImages.map((img, idx) => {
                  const isSelected = activeMedia === "image" && selectedImageIndex === idx;
                  return (
                    <button
                      key={`thumb-${idx}`}
                      onClick={() => {
                        setActiveMedia("image");
                        setSelectedImageIndex(idx);
                      }}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs shrink-0 ${
                        isSelected 
                          ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}

                {/* 2. 360 Degree View Thumbnail Shortcut */}
                {has360 && (
                  <button
                    onClick={() => setActiveMedia("360")}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden bg-indigo-950/20 border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs shrink-0 ${
                      activeMedia === "360"
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-indigo-500/30 dark:border-indigo-950 hover:border-indigo-400"
                    }`}
                  >
                    <RotateCw className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                    <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 block mt-0.5 leading-none">
                      360° SPIN
                    </span>
                  </button>
                )}

                {/* 3. Video View Thumbnail Shortcut */}
                {hasVideo && (
                  <button
                    onClick={() => {
                      setActiveMedia("video");
                      setIsVideoPlaying(true);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden bg-red-950/20 border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs shrink-0 ${
                      activeMedia === "video"
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-red-500/30 dark:border-red-950 hover:border-red-500"
                    }`}
                  >
                    <Play className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-[7px] font-black text-red-600 dark:text-red-400 block mt-0.5 leading-none">
                      VIDEO
                    </span>
                  </button>
                )}

              </div>
            </div>

            {/* Slider/Drag Dial Controls for 360 View */}
            {activeMedia === "360" && !has360 && (
              <div className="flex flex-col items-center gap-1 mt-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150/40 dark:border-slate-800/80 max-sm:p-2">
                <div className="flex justify-between w-full items-center">
                  <span className="text-[9px] font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                    🔄 ROTATION DIAL CONTROL
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    ANGLE: {rotationIndex * 45}°
                  </span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={7} 
                  value={rotationIndex} 
                  onChange={(e) => setRotationIndex(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer my-1"
                />
                <div className="flex justify-between w-full text-[8px] font-black text-slate-400">
                  <span>0° (FRONT)</span>
                  <span>90°</span>
                  <span>180° (REAR)</span>
                  <span>270°</span>
                  <span>315°</span>
                </div>
              </div>
            )}

            {/* Quick trust points */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] md:text-xs pt-2">
              <div className="p-3 max-sm:p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1 animate-pulse" />
                <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight block">{isBng ? "১০০% আসল পার্টস" : "Genuine OEM"}</span>
              </div>
              <div className="p-3 max-sm:p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
                <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight block">4.9 {isBng ? "রেটিং" : "Rating"}</span>
              </div>
              <div className="p-3 max-sm:p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <Truck className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight block">{isBng ? "দ্রুত ডেলিভারি" : "Fast Support"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Spec Configurator, pricing, and CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Product title meta */}
              <div className="space-y-1">
                <span className="text-[10px] md:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{brand}</span>
                <h1 className="text-xl sm:text-2xl md:text-3.5xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight max-md:text-[22px] max-sm:text-lg break-words">{title}</h1>
              </div>

              {/* Price Tag module */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 max-sm:p-3 rounded-2xl border border-slate-150/40 dark:border-slate-850 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block uppercase font-bold tracking-wider">{isBng ? "অফার মূল্য" : "Special Offer Price"}</span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl md:text-3xl font-mono font-bold text-emerald-600">₹{(offerPrice || 0).toLocaleString()}</span>
                    <span className="text-[11px] sm:text-xs md:text-sm text-slate-400 line-through font-mono">₹{(originalPrice || 0).toLocaleString()}</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md ml-1">
                      {Math.round(((originalPrice - offerPrice) / originalPrice) * 100)}% OFF
                    </span>
                  </div>
                </div>

                {isVehicle && (
                  <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4 max-sm:pl-0 max-sm:border-l-0 max-sm:text-left max-sm:w-full max-sm:pt-2 max-sm:border-t max-sm:border-slate-200/55 dark:max-sm:border-slate-800">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block uppercase font-bold tracking-wider">{t.emiStarting}</span>
                    <strong className="font-mono text-xs sm:text-sm md:text-base text-indigo-700 dark:text-indigo-300">₹ {(vehicle.emiPrice || 0).toLocaleString()} / {isBng ? "মাস" : "mo"}*</strong>
                  </div>
                )}
              </div>

              {/* Vehicle specific Interactive Configurator pickers */}
              {isVehicle && (
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-4">
                  {/* Color Picker choice */}
                  {colorsList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest block">
                        🎨 {isBng ? "পছন্দের রং নির্বাচন করুন" : "Select Your Favorite Color"}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {colorsList.map((col) => {
                          const conf = colorMap[col] || { bg: "bg-slate-600", border: "border-slate-300", labelBn: col };
                          const isSelected = selectedColor === col;
                          return (
                            <button
                              key={col}
                              onClick={() => setSelectedColor(col)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-sm text-slate-900 dark:text-white" 
                                  : "bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full ${conf.bg} border ${conf.border}`} />
                              <span>{isBng ? conf.labelBn : col}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Battery choice if Panther */}
                  {vehicle.id === "v2" && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest block">
                        🔋 {isBng ? "ব্যাটারি ব্যাকআপ অপশন" : "Battery Setup Option"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          "Lead Acid: 60V 32Ah",
                          "Lithium: 60V 24Ah",
                          "Lithium: 60V 34Ah"
                        ].map((bat) => {
                          const isSelected = selectedBattery === bat;
                          return (
                            <button
                              key={bat}
                              onClick={() => setSelectedBattery(bat)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                                isSelected
                                  ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <span>{bat.replace("Lead Acid: ", "").replace("Lithium: ", "")}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Tabs Section: Specs vs Detailed Description */}
              <div className="pt-2">
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 text-xs font-bold gap-4">
                  <button 
                    onClick={() => setActiveTab("specs")} 
                    className={`pb-2.5 transition relative cursor-pointer ${activeTab === "specs" ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-700"}`}
                  >
                    📊 {isBng ? "পূর্ণাঙ্গ স্পেসিফিকেশন" : "Technical Specifications"}
                  </button>
                  <button 
                    onClick={() => setActiveTab("description")} 
                    className={`pb-2.5 transition relative cursor-pointer ${activeTab === "description" ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-700"}`}
                  >
                    📝 {isBng ? "বর্ণনা ও বৈশিষ্ট্য" : "Detailed Description"}
                  </button>
                  {isVehicle && (
                    <button 
                      onClick={() => setActiveTab("warranty")} 
                      className={`pb-2.5 transition relative cursor-pointer ${activeTab === "warranty" ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-700"}`}
                    >
                      🛡️ {isBng ? "ওয়ারেন্টি গ্যারান্টি" : "Warranty Details"}
                    </button>
                  )}
                </div>

                <div className="min-h-[180px] text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                  
                  {activeTab === "specs" && (
                    <div className="animate-fade-in">
                      {isVehicle ? (
                        /* Complete Specifications table requested by user */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <Gauge className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "সর্বোচ্চ স্পিড" : "Top Speed"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{speed}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <Compass className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "মাইলেজ (রেঞ্জ)" : "Mileage / Range"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{mileage}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <Battery className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "ব্যাটারি টাইপ" : "Battery Type"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{selectedBattery || batteryType}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <Hourglass className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "চার্জিং সময়" : "Charging Time"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{chargingTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <Zap className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "মোটর পাওয়ার" : "Motor Power"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{motorPower}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "ব্রেকিং সিস্টেম" : "Braking System"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{brakingSystem}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-900 col-span-1 sm:col-span-2">
                            <div className="w-4.5 h-4.5 rounded-full bg-slate-200 border border-slate-300 dark:bg-slate-800" />
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "উপলব্ধ কালার ভ্যারিয়েন্ট" : "Available Paint Finishes"}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{colorsText}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Spare Parts specifications table */
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "পার্টস ক্যাটাগরি" : "Parts Category"}</span>
                            <span className="font-bold text-slate-850 dark:text-slate-100">{product.category}</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "ব্র্যান্ড" : "Manufacturer"}</span>
                            <span className="font-bold text-slate-850 dark:text-slate-100">{product.brand}</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "স্টক স্থিতি" : "Stock Levels"}</span>
                            <span className="font-bold text-emerald-600">{product.stock > 0 ? `${product.stock} Units` : t.outOfStock}</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">{isBng ? "শিপিং / ডেলিভারি ফি" : "Delivery Fee"}</span>
                            <span className="font-bold text-slate-850 dark:text-slate-100">₹{product.deliveryCharge || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "description" && (
                    <div className="space-y-3 animate-fade-in">
                      <p className="leading-relaxed text-xs md:text-sm text-slate-750 dark:text-slate-300">
                        {description}
                      </p>
                      
                      {isVehicle && (
                        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-start gap-2">
                          <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            {isBng 
                              ? "সুদীপ্ত ই-স্কুটি সার্ভিস থেকে কেনা প্রতিটি গাড়িতে আপনি পাবেন সম্পূর্ণ টেকনিক্যাল সাপোর্ট এবং সরাসরি প্রোপ্রাইটার সুদীপ্ত দাসের পক্ষ থেকে স্পেশাল ওয়ারেন্টি ও সার্ভিসিং গ্যারান্টি।"
                              : "Every vehicle purchased via Sudipta E-Scooty Service includes complimentary priority support scanning, cellular diagnostic checks, and direct access to workshop mechanics."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "warranty" && isVehicle && (
                    <div className="space-y-3 animate-fade-in p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>{isBng ? "ওয়ারেন্টি গ্যারান্টি নীতিমালা" : "Official Warranty Coverage"}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {isBng
                          ? `এই মডেলটির ব্যাটারি, মোটর এবং কন্ট্রোলারের ওপর রয়েছে অফিসিয়াল ${warranty} ওয়ারেন্টি। যেকোনো যান্ত্রিক ত্রুটি অশোকনগরের ওয়ার্কশপে ফ্রিতে ঠিক করে দেওয়া হবে।`
                          : `The primary motor drive, LFP cell module, and sine wave smart control system are protected under standard warranty for ${warranty}. Quick claims at Ashoknagar desk.`}
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* CTAs and actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              
              {isVehicle ? (
                /* Scooters Call to Actions */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3.5 bg-slate-950 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-black cursor-pointer active:scale-98 transition duration-150"
                  >
                    <Send className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>{t.bookTestRide}</span>
                  </button>

                  <a
                    href={waEnquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition duration-150 text-center"
                  >
                    <MessageSquare className="w-4 h-4 text-white fill-white" />
                    <span>{isBng ? "হোয়াটসঅ্যাপে বুকিং করুন" : "Enquire / Book on WhatsApp"}</span>
                  </a>
                </div>
              ) : (
                /* Spare Parts Call to Actions */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition duration-150"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-200" />
                    <span>{isBng ? "চেকআউট ও অর্ডার" : "Checkout & Order Now"}</span>
                  </button>

                  <a
                    href={waEnquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 cursor-pointer text-center"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{isBng ? "হোয়াটসঅ্যাপে অর্ডার" : "Send WhatsApp Inquiry"}</span>
                  </a>
                </div>
              )}

              {isVehicle && (
                <div className="p-2 bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100/40 dark:border-indigo-900/40 rounded-xl flex items-center gap-1.5 justify-center text-[10px] text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isBng ? "*অফলাইন কিস্তি হিসেবের জন্য হোমপেজে স্মার্ট ইভি ক্যালকুলেটর ব্যবহার করুন।" : "*For personalized offline EMI plans, please navigate to the calculator tab on main page."}</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Recommended Products & Alternatives Section requested by user */}
        <div className="mt-16 md:mt-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500 animate-spin-slow" />
              <span>{isBng ? "বিকল্প অপশন ও রিকমেন্ডেড পণ্য" : "Alternative Options & Recommended Products"}</span>
            </h2>
            <div className="h-[2px] bg-slate-200 dark:bg-slate-850 flex-1 ml-6 hidden md:block" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recommendedItems.map((item: any) => {
              const isRecVehicle = !item.category;
              const rTitle = isBng ? item.model || item.titleBen : item.model || item.titleEng;
              const rDesc = isBng ? item.descriptionBen : item.descriptionEng;
              return (
                <Link 
                  key={item.id} 
                  to={`/product/${item.id}`} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3.5 md:p-5 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group"
                >
                  <div>
                    <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 mb-3 border border-slate-100 dark:border-slate-850/60">
                      <img 
                        src={(item.images && item.images[0]) || item.image || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"} 
                        alt={rTitle} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                        {isRecVehicle ? (isBng ? "স্কুটার" : "EV") : (isBng ? "পার্টস" : "Part")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">{item.brand}</span>
                      <h3 className="font-display font-bold text-slate-850 dark:text-slate-100 text-xs md:text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {rTitle}
                      </h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {rDesc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-semibold">PRICE</span>
                      <span className="text-xs md:text-sm font-bold font-mono text-emerald-600">₹{(item.offerPrice || 0).toLocaleString()}</span>
                    </div>
                    
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>{isBng ? "দেখুন" : "View"}</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Embedded Modals state managers */}
      <AnimatePresence>
        {showCheckoutModal && product && (
          <CheckoutModal 
            product={product} 
            lang={lang} 
            finalPrice={offerPrice} 
            onClose={() => setShowCheckoutModal(false)} 
          />
        )}
        {showBookingModal && vehicle && (
          <BookingModal 
            vehicle={vehicle} 
            lang={lang} 
            onClose={() => setShowBookingModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
