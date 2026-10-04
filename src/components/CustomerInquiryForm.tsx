import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Ticket, Send, ShieldCheck, Phone, User, FileText, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { SupportTicket } from '../types';

interface CustomerInquiryFormProps {
  lang: 'bn' | 'en';
}

const CustomerInquiryForm: React.FC<CustomerInquiryFormProps> = ({ lang }) => {
  const isBng = lang === 'bn';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'general' as SupportTicket['category'],
    description: '',
    screenshotUrl: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshotUrl: reader.result as string }));
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call and persistence
    const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const priority: SupportTicket['priority'] = 
      (formData.category === 'battery_issue' || formData.category === 'scooter_breakdown') ? 'high' : 'medium';
    
    const newTicket: SupportTicket = {
      id: ticketId,
      customerName: formData.name,
      phone: formData.phone,
      category: formData.category,
      description: formData.description,
      priority: priority,
      status: 'open',
      createdAt: new Date().toLocaleString(),
      screenshotUrl: formData.screenshotUrl || '',
      chatLog: [
        { 
          sender: 'customer', 
          message: formData.description, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]
    };

    // Save to localStorage
    const savedTickets = JSON.parse(localStorage.getItem('sudipta_support_tickets') || '[]');
    localStorage.setItem('sudipta_support_tickets', JSON.stringify([...savedTickets, newTicket]));

    setTimeout(() => {
      setSuccessTicket(ticketId);
      setSubmitting(false);
      setFormData({ name: '', phone: '', category: 'general', description: '', screenshotUrl: '' });
      setImageError(false);
    }, 1500);
  };

  if (successTicket) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 p-8 rounded-3xl text-center space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBng ? 'আপনার ইনকোয়ারি নথিভুক্ত হয়েছে!' : 'Inquiry Submitted Successfully!'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isBng ? 'আমাদের প্রতিনিধি আপনার সাথে শীঘ্রই যোগাযোগ করবেন।' : 'Our representative will contact you shortly.'}
        </p>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block font-mono font-bold text-emerald-600">
          {isBng ? 'টিকেট নম্বর' : 'Ticket ID'}: {successTicket}
        </div>
        <button 
          onClick={() => setSuccessTicket(null)}
          className="block w-full max-w-xs mx-auto py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
        >
          {isBng ? 'আরেকটি ইনকোয়ারি করুন' : 'Submit Another Inquiry'}
        </button>
      </motion.div>
    );
  }

  const hasValidImage = formData.screenshotUrl && formData.screenshotUrl.trim() !== "" && !imageError;

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl">
          <Ticket className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {isBng ? 'ইনকোয়ারি ও সাপোর্ট' : 'Inquiry & Support'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-450">
            {isBng ? 'যেকোনো যান্ত্রিক সমস্যা বা প্রশ্নের জন্য টিকেট খুলুন' : 'Open a ticket for any technical issue or query'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
              <User className="w-3.5 h-3.5" />
              {isBng ? 'আপনার নাম' : 'Customer Name'}
            </label>
            <input 
              required
              type="text" 
              placeholder={isBng ? 'উদাঃ সুদীপ্ত দাস' : 'e.g. Sudipta Das'}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
              <Phone className="w-3.5 h-3.5" />
              {isBng ? 'ফোন নম্বর' : 'Phone Number'}
            </label>
            <input 
              required
              type="tel" 
              placeholder="9830XXXXXX"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
            <FileText className="w-3.5 h-3.5" />
            {isBng ? 'ক্যাটাগরি' : 'Inquiry Category'}
          </label>
          <select 
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as any})}
          >
            <option value="general">{isBng ? 'সাধারণ জিজ্ঞাসা' : 'General Enquiry'}</option>
            <option value="battery_issue">{isBng ? 'ব্যাটারি সংক্রান্ত সমস্যা' : 'Battery Issue'}</option>
            <option value="scooter_breakdown">{isBng ? 'স্কুটার ব্রেকডাউন' : 'Scooter Breakdown'}</option>
            <option value="emi_billing">{isBng ? 'ইএমআই ও বিলিং' : 'EMI & Billing'}</option>
            <option value="spare_parts_delay">{isBng ? 'খুচরা যন্ত্রাংশ পেতে দেরি' : 'Spare Parts Delay'}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
            <FileText className="w-3.5 h-3.5" />
            {isBng ? 'সমস্যার বিবরণ' : 'Issue Description'}
          </label>
          <textarea 
            required
            rows={4}
            placeholder={isBng ? 'আপনার সমস্যার কথা বিস্তারিত লিখুন...' : 'Describe your issue in detail...'}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
            <ImageIcon className="w-3.5 h-3.5" />
            {isBng ? 'স্ক্রিনশট বা ছবি (আপলোড করুন)' : 'Screenshot or Image (Upload)'}
          </label>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <div 
            className="relative group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {hasValidImage ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                <img 
                  src={formData.screenshotUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">{isBng ? 'পরিবর্তন করুন' : 'Change Image'}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full">
                  <UploadCloud className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {isBng ? 'স্ক্রিনশট আপলোড করতে ক্লিক করুন (ঐচ্ছিক)' : 'Click to upload or drag screenshot (Optional)'}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isBng ? 'ইনকোয়ারি জমা দিন' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default CustomerInquiryForm;
