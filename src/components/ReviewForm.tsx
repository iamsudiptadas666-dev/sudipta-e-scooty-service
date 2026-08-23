import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewFormProps {
  lang: 'bn' | 'en';
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ lang, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          textBen: lang === 'bn' ? review : '',
          textEng: lang === 'en' ? review : '',
          rating,
          isPending: true, // Explicitly pending
          role: lang === 'bn' ? 'কাস্টমার' : 'Customer',
          avatar: name.substring(0, 2).toUpperCase()
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative my-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                {lang === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {lang === 'bn' 
                  ? 'আপনার মন্তব্যটি সফলভাবে জমা হয়েছে। অ্যাডমিন অ্যাপ্রুভ করার পর এটি পাবলিশ করা হবে।' 
                  : 'Your review has been submitted successfully. It will be published after admin approval.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                  {lang === 'bn' ? 'আপনার মন্তব্য জানান' : 'Write a Review'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'আমাদের সার্ভিস সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share your experience with our services'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'কাস্টমারের নাম' : 'Customer Name'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: সুদীপ্ত দাস' : 'e.g. Sudipta Das'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'রেটিং' : 'Rating'}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-transform active:scale-90 ${star <= rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                      >
                        <Star className={`w-7 h-7 ${star <= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'আপনার মন্তব্য' : 'Your Review'}
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder={lang === 'bn' ? 'আমাদের সার্ভিস কেমন লাগলো?' : 'How was your experience?'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'সাবমিট করুন' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
