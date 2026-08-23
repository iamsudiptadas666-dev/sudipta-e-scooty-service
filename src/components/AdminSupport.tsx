import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Ticket, AlertTriangle, CheckCircle, Clock, Eye, Send, ShieldAlert, Sparkles, Image, Check, ChevronRight, User, Settings, Filter, Wrench, X } from 'lucide-react';
import { SupportTicket, StaffMember } from '../types';

interface AdminSupportProps {
  lang: 'bn' | 'en';
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  staffMembers: StaffMember[];
}

export const AdminSupport: React.FC<AdminSupportProps> = ({ lang, tickets, setTickets, staffMembers }) => {
  const isBng = lang === 'bn';

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets?.[0]?.id || '');
  const [chatMessage, setChatMessage] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const activeTicket = (tickets || []).find(t => t.id === selectedTicketId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicket) return;

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          chatLog: [
            ...t.chatLog,
            {
              sender: 'admin',
              message: chatMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return t;
    }));
    setChatMessage('');
  };

  const handleUpdateStatus = (id: string, status: SupportTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleAssignEngineer = (id: string, engineerId: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { 
      ...t, 
      assignedEngineer: engineerId,
      status: t.status === 'open' ? 'assigned' : t.status 
    } : t));
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch(status) {
      case 'open': return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
      case 'assigned': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
      case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
      case 'solved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <MessageSquare className="w-5.5 h-5.5 text-indigo-500" />
          <span>{isBng ? 'হেল্পডেস্ক টিকিট ও গ্রাহক সাপোর্ট' : 'Customer Helpdesk Tickets'}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
          {isBng ? 'গ্রাহকদের যান্ত্রিক সমস্যা, ইএমআই অভিযোগ ও সেবামূলক প্রশ্নের সমাধান করুন।' : 'Review technical fault tickets, chat with customers live, and inspect uploaded telemetry screenshot proofs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Ticket Queue list */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {isBng ? 'টিকিট কিউ তালিকা' : 'Active Ticket Queue'}
          </span>
          
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {tickets.map(ticket => {
              const statusColor = getStatusColor(ticket.status);

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    selectedTicketId === ticket.id
                      ? 'bg-slate-50 dark:bg-slate-900 border-indigo-500 dark:border-indigo-400 shadow-md shadow-indigo-500/2'
                      : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">{ticket.id}</span>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {ticket.createdAt}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                      ticket.priority === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        : ticket.priority === 'high'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <strong className="text-xs text-slate-850 dark:text-white block font-bold leading-normal truncate">
                    {ticket.description}
                  </strong>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.customerName}
                    </span>
                    
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] ${statusColor}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive workspace, diagnostics viewer and chat logs */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 flex flex-col justify-between min-h-[550px]">
              
              {/* Ticket Meta Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>{activeTicket.id}</span>
                      <span>•</span>
                      <span>{activeTicket.createdAt}</span>
                      <span>•</span>
                      <span className="capitalize">{activeTicket.category.replace('_', ' ')}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-normal">
                      {activeTicket.description}
                    </h4>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-bold">
                      Customer: {activeTicket.customerName} ({activeTicket.phone})
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select 
                      className={`text-[10px] font-bold p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 outline-none ${getStatusColor(activeTicket.status)}`}
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(activeTicket.id, e.target.value as any)}
                    >
                      <option value="open">Open</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="solved">Solved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <select
                      className="text-[10px] font-bold p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                      value={activeTicket.assignedEngineer || ''}
                      onChange={(e) => handleAssignEngineer(activeTicket.id, e.target.value)}
                    >
                      <option value="">Assign Engineer</option>
                      {staffMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {activeTicket.assignedEngineer && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Assigned to: {staffMembers.find(e => e.id === activeTicket.assignedEngineer)?.name || 'Unknown Staff'}</span>
                  </div>
                )}
              </div>

              {/* Diagnostic/Screenshot proof viewer (requested by prompt) */}
              {activeTicket.screenshotUrl && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/55 dark:border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-450 dark:text-slate-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-indigo-500" />
                      {isBng ? 'গ্রাহক আপলোডকৃত ডায়াগনস্টিক প্রুফ' : 'Diagnostic Screenshot / Telemetry Proof'}
                    </span>
                    <button
                      onClick={() => setShowScreenshot(!showScreenshot)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showScreenshot ? (isBng ? 'লুকান' : 'Hide Proof') : (isBng ? 'বিশদে দেখুন' : 'Inspect Screenshot')}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showScreenshot && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 relative group"
                      >
                        <img
                          src={activeTicket.screenshotUrl}
                          alt="Diagnostic proof upload"
                          className="w-full h-48 object-cover cursor-zoom-in"
                          onClick={() => setIsFullScreen(true)}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            Click to View Full Size
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Full Screen Image Modal */}
              <AnimatePresence>
                {isFullScreen && activeTicket?.screenshotUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10"
                    onClick={() => setIsFullScreen(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={activeTicket.screenshotUrl}
                        alt="Full size proof"
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                      />
                      <button
                        onClick={() => setIsFullScreen(false)}
                        className="absolute -top-12 right-0 text-white/70 hover:text-white transition flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                        <span>Close</span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat log interaction simulation */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {isBng ? 'লাইভ চ্যাট হিস্ট্রি' : 'Live Dialogue Chat Feed'}
                </span>
                
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[220px] overflow-y-auto space-y-3">
                  {activeTicket.chatLog.map((chat, idx) => {
                    const isAdminSender = chat.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[80%] ${
                          isAdminSender ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5">
                          {isAdminSender ? 'Admin Agent' : activeTicket.customerName}
                        </span>
                        <div
                          className={`p-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            isAdminSender
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-250 rounded-tl-none'
                          }`}
                        >
                          {chat.message}
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono mt-0.5">{chat.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply box */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { bn: 'আমরা দেখছি', en: 'We are looking into it' },
                      { bn: 'ইঞ্জিনিয়ার পাঠানো হচ্ছে', en: 'Engineer dispatched' },
                      { bn: 'সমস্যার সমাধান হয়েছে', en: 'Issue resolved' }
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChatMessage(isBng ? tpl.bn : tpl.en)}
                        className="text-[9px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition cursor-pointer"
                      >
                        {isBng ? tpl.bn : tpl.en}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder={isBng ? 'গ্রাহককে উত্তর লিখুন...' : 'Type a reply to direct-message customer...'}
                      className="flex-1 p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              {isBng ? 'কোনো একটি টিকিট বেছে নিন।' : 'Select an active customer ticket to start real-time fault diagnostics and chat logs.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
