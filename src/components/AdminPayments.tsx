import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, Search, Filter, ShieldCheck, QrCode, Clipboard, Check, RefreshCw, Layers, DollarSign, Wallet, Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'UPI_QR' | 'Cash' | 'Bank_Transfer' | 'Card_Swipe';
  gatewayStatus: 'success' | 'pending' | 'failed';
  timestamp: string;
  refId: string;
}

interface AdminPaymentsProps {
  lang: 'bn' | 'en';
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({ lang }) => {
  const isBng = lang === 'bn';

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sudipta_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
    return [
      { id: 'TXN-901', orderId: '#3821', customerName: 'Rabin Chatterjee', amount: 85000, paymentMethod: 'Bank_Transfer', gatewayStatus: 'success', timestamp: '2026-07-13 11:20', refId: 'IMPS90384710091' },
      { id: 'TXN-902', orderId: '#3790', customerName: 'Sujay Mondal', amount: 3500, paymentMethod: 'UPI_QR', gatewayStatus: 'success', timestamp: '2026-07-13 10:15', refId: 'UPI90284719201' },
      { id: 'TXN-903', orderId: '#3712', customerName: 'Kakali Ghosh', amount: 3200, paymentMethod: 'UPI_QR', gatewayStatus: 'pending', timestamp: '2026-07-12 16:45', refId: 'UPI10482910482' },
      { id: 'TXN-904', orderId: '#3650', customerName: 'Bipul Sen', amount: 12000, paymentMethod: 'Cash', gatewayStatus: 'success', timestamp: '2026-07-11 12:00', refId: 'CASH-REC-102' },
      { id: 'TXN-905', orderId: '#3599', customerName: 'Nisha Parveen', amount: 62000, paymentMethod: 'Card_Swipe', gatewayStatus: 'failed', timestamp: '2026-07-10 15:30', refId: 'HDFC90184710' }
    ];
  });

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('sudipta_transactions', JSON.stringify(updated));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Dynamic QR Code Generator states
  const [qrAmount, setQrAmount] = useState('1500');
  const [qrNote, setQrNote] = useState('Service Charge');
  const [generatedUpiString, setGeneratedUpiString] = useState('upi://pay?pa=9064517009@ybl&pn=Sudipta%20Das&am=1500&cu=INR&tn=Service%20Charge');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxnId(id);
    setTimeout(() => setCopiedTxnId(null), 1500);
  };

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(qrAmount) || 0;
    const note = encodeURIComponent(qrNote || 'EV Payment');
    const upiUri = `upi://pay?pa=9064517009@ybl&pn=Sudipta%20Das&am=${amount}&cu=INR&tn=${note}`;
    setGeneratedUpiString(upiUri);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.refId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.gatewayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const successSum = transactions.filter(t => t.gatewayStatus === 'success').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingSum = transactions.filter(t => t.gatewayStatus === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <CreditCard className="w-5.5 h-5.5 text-indigo-500" />
          <span>{isBng ? 'পেমেন্ট গেটওয়ে এবং ট্রানজেকশন লগ' : 'Payments & Transaction Gateway'}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
          {isBng ? 'সব অনলাইন ইউপিআই, অফলাইন ক্যাশ, এবং ইএমআই কিস্তির পেমেন্ট রেকর্ড ট্র্যাক করুন।' : 'Monitor real-time card swipe authorizations, instant UPI QR collections, bank wire clearances, and generate customer payment codes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transaction Log Gateway */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Stats Summaries */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-500/20 text-xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? 'সফল পেমেন্ট সেটেলমেন্ট' : 'Successful Settlements'}</span>
              <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">₹{(successSum || 0).toLocaleString()}</strong>
              <p className="text-[10px] text-slate-500 mt-1">{isBng ? 'সরাসরি ব্যাংক অ্যাকাউন্টে জমা হয়েছে' : 'Credited safely in SBI Proprietor account'}</p>
            </div>
            <div className="bg-amber-500/5 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-500/20 text-xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isBng ? 'অপেক্ষমাণ ট্রানজেকশন' : 'Pending Approvals'}</span>
              <strong className="text-xl font-black text-amber-600 dark:text-amber-400 block mt-1 font-mono font-bold">₹{(pendingSum || 0).toLocaleString()}</strong>
              <p className="text-[10px] text-slate-500 mt-1">{isBng ? 'ব্যাংক কনফার্মেশনের জন্য অপেক্ষমাণ' : 'Awaiting merchant ledger sync'}</p>
            </div>
          </div>

          {/* Search & Filter Options */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBng ? 'গ্রাহক বা ট্রানজেকশন আইডি দিয়ে খুঁজুন...' : 'Search customer or reference ID...'}
                className="w-full p-2.5 pl-9 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 min-w-[120px]"
            >
              <option value="all">{isBng ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="success">{isBng ? 'সফল' : 'Successful'}</option>
              <option value="pending">{isBng ? 'অপেক্ষমাণ' : 'Pending'}</option>
              <option value="failed">{isBng ? 'ব্যর্থ' : 'Failed'}</option>
            </select>
          </div>

          {/* Transactions list */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">TXN ID</th>
                    <th className="p-4">{isBng ? 'গ্রাহক' : 'Customer'}</th>
                    <th className="p-4">{isBng ? 'তারিখ' : 'Date'}</th>
                    <th className="p-4">{isBng ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                    <th className="p-4">{isBng ? 'পরিমাণ' : 'Amount'}</th>
                    <th className="p-4">Gateway Status</th>
                    <th className="p-4">Reference No.</th>
                    <th className="p-4 text-right">{isBng ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTransactions.map(txn => {
                    const isSuccess = txn.gatewayStatus === 'success';
                    const isPending = txn.gatewayStatus === 'pending';
                    const isFailed = txn.gatewayStatus === 'failed';

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="p-4 font-mono text-slate-800 dark:text-slate-200 select-all font-bold">{txn.id}</td>
                        <td className="p-4">
                          <strong className="text-slate-850 dark:text-white block font-bold leading-normal">{txn.customerName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Order {txn.orderId}</span>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {txn.timestamp}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {txn.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800 dark:text-white">₹{(txn.amount || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-tight ${
                            isSuccess 
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' 
                              : isPending 
                                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' 
                                : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          }`}>
                            {txn.gatewayStatus}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>{txn.refId}</span>
                            <button
                              onClick={() => handleCopy(txn.refId, txn.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                            >
                              {copiedTxnId === txn.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Clipboard className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteTransaction(txn.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title={isBng ? 'মুছে ফেলুন' : 'Delete transaction'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic UPI QR Code Generator (Requested by Prompt) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-indigo-500" />
              {isBng ? 'ইউপিআই কিউআর কোড জেনারেটর' : 'Dynamic UPI QR Generator'}
            </span>

            <form onSubmit={handleGenerateQR} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">{isBng ? 'পেমেন্ট মূল্য (₹)' : 'Requested Amount (₹)'}</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">{isBng ? 'পেমেন্ট নোট (যেমন: সার্ভিসিং)' : 'Reference / Remarks Note'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spare Battery Servicing"
                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                  value={qrNote}
                  onChange={(e) => setQrNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isBng ? 'নতুন পেমেন্ট কিউআর কোড জেনারেট করুন' : 'Generate UPI QR'}
              </button>
            </form>

            {/* Generated SVG QR Container */}
            <div className="bg-white dark:bg-white p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-inner">
              <QRCodeSVG
                value={generatedUpiString}
                size={140}
                level="M"
                includeMargin={true}
              />
              <span className="text-[10px] font-bold text-slate-600 mt-2 font-mono uppercase">Payee: Sudipta Das (9064517009)</span>
              <span className="text-[11px] font-mono font-black text-indigo-600 mt-1">₹{parseFloat(qrAmount || '0').toLocaleString()}</span>
            </div>

            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-semibold">
              ⭐ Scan with BHIM, Google Pay, PhonePe, or Paytm. Funds route directly to Sudipta Das's private business UPI address with SSL-secured logs.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
