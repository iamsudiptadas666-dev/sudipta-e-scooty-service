import { useState, useEffect } from "react";
import { Calculator, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Language, TranslationDict } from "../translations";

interface EmiCalculatorProps {
  lang: Language;
  t: TranslationDict;
  defaultPrice?: number;
}

export default function EmiCalculator({ lang, t, defaultPrice = 32000 }: EmiCalculatorProps) {
  const [price, setPrice] = useState<number>(defaultPrice);
  const [downPayment, setDownPayment] = useState<number>(10000);
  const [months, setMonths] = useState<number>(6);
  const [interestRate, setInterestRate] = useState<number>(0); // Default 0% interest for promotions
  const [monthlyEmi, setMonthlyEmi] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (defaultPrice) {
      setPrice(defaultPrice);
      setDownPayment(Math.floor(defaultPrice * 0.3)); // Default 30% downpayment
    }
  }, [defaultPrice]);

  useEffect(() => {
    const loanAmount = Math.max(0, price - downPayment);
    setRemaining(loanAmount);

    if (loanAmount <= 0) {
      setMonthlyEmi(0);
      return;
    }

    if (interestRate === 0) {
      setMonthlyEmi(Math.round(loanAmount / months));
    } else {
      const r = interestRate / 12 / 100;
      const emi = (loanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      setMonthlyEmi(Math.round(emi));
    }
  }, [price, downPayment, months, interestRate]);

  // Next due date mock helper
  const getNextDueDate = (monthOffset = 1) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(10); // Sudipta standard collection date: 10th of every month
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div id="emi-calculator-panel" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner">
      <div className="flex items-center gap-2.5 mb-5">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h4 className="font-display font-semibold text-slate-800 text-lg">{t.emiCalculatorTitle}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.batteryType === "ব্যাটারির ধরণ" ? "পণ্যের বাজার মূল্য (₹)" : "Product Price (₹)"}</label>
          <input
            type="number"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800 font-medium"
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.emiCalcDownPayment} (₹)</label>
          <input
            type="number"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800 font-medium"
            value={downPayment}
            onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{lang === "bn" ? "কিস্তির মেয়াদ (মাস)" : "EMI Tenure (Months)"}</label>
          <select
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            <option value={3}>3 {lang === "bn" ? "মাস" : "Months"}</option>
            <option value={6}>6 {lang === "bn" ? "মাস" : "Months"}</option>
            <option value={9}>9 {lang === "bn" ? "মাস" : "Months"}</option>
            <option value={12}>12 {lang === "bn" ? "মাস" : "Months"}</option>
            <option value={18}>18 {lang === "bn" ? "মাস" : "Months"}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{lang === "bn" ? "বার্ষিক সুদের হার (%)" : "Interest Rate (%)"}</label>
          <select
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
          >
            <option value={0}>0% {lang === "bn" ? "(বিশেষ অফার)" : "(Special Offer)"}</option>
            <option value={4}>4% {lang === "bn" ? "(গ্রাহক কল্যাণ)" : "(Customer Welfare)"}</option>
            <option value={8}>8% {lang === "bn" ? "(স্ট্যান্ডার্ড ব্যাংক রেট)" : "(Standard Bank)"}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">{t.emiCalcRemaining}</span>
          <span className="text-2xl font-mono font-bold text-slate-800">₹ {remaining.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">({price} - {downPayment})</span>
        </div>

        <div className="flex flex-col border-t md:border-t-0 md:border-x border-slate-100 pt-3 md:pt-0 md:px-5">
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            {t.emiCalcMonthlyEMI}
          </span>
          <span className="text-2xl font-mono font-bold text-indigo-600">₹ {monthlyEmi.toLocaleString()} / {lang === "bn" ? "মাস" : "mo"}</span>
          <span className="text-[10px] text-slate-400">{lang === "bn" ? `মোট ${months} কিস্তিতে পরিশোধ করতে হবে` : `To be paid in ${months} installments`}</span>
        </div>

        <div className="flex flex-col pt-3 md:pt-0 md:pl-5">
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t.emiNextDueDate}
          </span>
          <span className="text-lg font-semibold text-slate-800">{getNextDueDate(1)}</span>
          <span className="text-[10px] text-slate-400">{lang === "bn" ? "১০ই জুলাই ২০২৬ (প্রতি মাসের ১০ তারিখে কিস্তি সংগ্রহ)" : "Standard collection on the 10th of every month"}</span>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 flex items-center gap-2">
        <span className="font-semibold">{lang === "bn" ? "বিশেষ সুবিধা:" : "Special Facility:"}</span>
        <span>{lang === "bn" ? "সুদীপ্ত ই-স্কুটি সার্ভিসে কোনো গোপন চার্জ ছাড়াই ০% ফিনান্সিয়াল স্কিম উপলব্ধ।" : "0% promotional financing schemes available at Sudipta E-Scooty workshop."}</span>
      </div>
    </div>
  );
}
