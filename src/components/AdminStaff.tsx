import React, { useState } from 'react';
import { Shield, UserPlus, Trash2, Edit2, CheckCircle, Info, ToggleLeft, ToggleRight, UserCheck, Key, RefreshCw, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StaffMember } from '../types';

interface AdminStaffProps {
  lang: 'bn' | 'en';
  staffMembers: StaffMember[];
  setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Owner': ['Product Showroom Management', 'Logistics & AWB Generation', 'Full Customer Database access', 'Financial and Revenue Graphs', 'Coupon and Discount controller', 'Technician & Role configurations'],
  'Sub-admin': ['Product Showroom Management', 'Logistics & AWB Generation', 'Full Customer Database access', 'Coupon and Discount controller'],
  'Technician': ['Read Showroom Specifications', 'Access Diagnostic Helpdesk Tickets', 'Update Inventory Stock Quantities'],
  'Desk Executive': ['Read Showroom Specifications', 'Access Customer Database profiles', 'Access Diagnostic Helpdesk Tickets'],
  'Delivery Rider': ['Access Logistics Hub', 'Scan & Print Shipping Labels', 'Update Dispatch queue statuses']
};

export const AdminStaff: React.FC<AdminStaffProps> = ({ lang, staffMembers, setStaffMembers }) => {
  const isBng = lang === 'bn';
  const staff = staffMembers;
  const setStaff = setStaffMembers;

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Owner' | 'Sub-admin' | 'Technician' | 'Desk Executive' | 'Delivery Rider'>('Technician');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [selectedRole, setSelectedRole] = useState<string>('Technician');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return;

    if (editingStaff) {
      setStaff(prev => prev.map(s => {
        if (s.id === editingStaff.id) {
          return {
            ...s,
            name,
            role,
            email,
            phone,
            password
          };
        }
        return s;
      }));
      setEditingStaff(null);
    } else {
      const newStaff: StaffMember = {
        id: 'STF-' + Math.floor(10 + Math.random() * 90),
        name,
        role,
        email,
        phone,
        password,
        status: 'active',
        assignedTasksCount: 0
      };

      setStaff(prev => [...prev, newStaff]);
    }
    
    setShowAddForm(false);
    
    // Clear form
    setName('');
    setRole('Technician');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const startEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setEmail(member.email);
    setPhone(member.phone);
    setPassword(member.password || member.phone || '1234');
    setShowAddForm(true);
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'active' ? 'suspended' : 'active'
        };
      }
      return s;
    }));
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm(isBng ? 'আপনি কি নিশ্চিতভাবে এই স্টাফ মেম্বারকে বাদ দিতে চান?' : 'Are you sure you want to delete this staff member?')) {
      setStaff(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="w-5.5 h-5.5 text-indigo-500" />
            <span>{isBng ? 'স্টাফ ও পারমিশন কন্ট্রোল' : 'Staff & Role Management'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            {isBng ? 'উপ-এডমিন এবং মেকানিকদের জন্য ইআরপি অ্যাক্সেস রোল এবং দায়িত্ব নির্ধারণ করুন।' : 'Add employee records, assign technician roles, and view granular ERP access privileges per staff rank.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingStaff(null);
              setName('');
              setRole('Technician');
              setEmail('');
              setPhone('');
              setPassword('');
            } else {
              setEditingStaff(null);
              setName('');
              setRole('Technician');
              setEmail('');
              setPhone('');
              setPassword('');
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {isBng ? 'নতুন কর্মচারী যোগ করুন' : 'Add Employee'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Staff Directory */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-800/60">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>
                      {editingStaff 
                        ? (isBng ? `স্টাফ বিবরণ সম্পাদনা: ${editingStaff.name}` : `Edit Employee: ${editingStaff.name}`) 
                        : (isBng ? 'নতুন কর্মচারী নিয়োগ করুন' : 'Recruit New Employee')}
                    </span>
                  </h4>
                </div>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'স্টাফের নাম' : 'Employee Name'}</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Subir Sen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'পদমর্যাদা (Role)' : 'Role Assignment'}</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Sub-admin">Sub-admin</option>
                      <option value="Technician">Technician</option>
                      <option value="Desk Executive">Desk Executive</option>
                      <option value="Delivery Rider">Delivery Rider</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'ইমেল আইডি' : 'Email ID'}</label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. subir@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">{isBng ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                    <input 
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider">
                      {isBng ? 'লগইন পাসওয়ার্ড নির্ধারণ করুন' : 'Assign Login Password'}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={isBng ? 'পাসওয়ার্ড লিখুন (যেমন: 1234)' : 'Enter Login Password (e.g. 1234)'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingStaff(null);
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {isBng ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                    >
                      {editingStaff 
                        ? (isBng ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes') 
                        : (isBng ? 'যোগ করুন' : 'Confirm Hiring')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{isBng ? 'স্টাফের বিবরণ' : 'Staff Member'}</th>
                    <th className="p-4">{isBng ? 'যোগাযোগ' : 'Contact'}</th>
                    <th className="p-4">{isBng ? 'রোল' : 'Designation'}</th>
                    <th className="p-4">{isBng ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="p-4 text-center">{isBng ? 'কন্ট্রোল' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                        {isBng ? 'কোনো স্টাফ সদস্য তথ্য উপলব্ধ নেই।' : 'No staff members registered.'}
                      </td>
                    </tr>
                  ) : (
                    staff.map(member => {
                    const isSuspended = member.status === 'suspended';
                    return (
                      <tr key={member.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors ${isSuspended ? 'bg-slate-100/30 dark:bg-slate-950/10 opacity-60' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {member.name ? member.name.split(' ').map(n => n?.[0] || '').join('') : 'ST'}
                            </div>
                            <div>
                              <strong className="text-slate-850 dark:text-white block font-bold leading-normal">{member.name}</strong>
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{member.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-500 dark:text-slate-455">
                          <div>{member.email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>{member.phone}</span>
                            {member.password && (
                              <span className="text-[9px] bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-0.5" title="Login Password">
                                <Key className="w-2.5 h-2.5" />
                                <span>{member.password}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight ${
                            member.role === 'Owner'
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                              : member.role === 'Sub-admin'
                                ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {member.role}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(member.id)}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            {member.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEdit(member)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-400 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                              title={isBng ? 'সম্পাদনা করুন' : 'Edit Staff'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                              title={isBng ? 'বাদ দিন' : 'De-board Staff'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Role Permission Checklist */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
              <span className="text-[10px] uppercase font-black text-indigo-300 tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                {isBng ? 'রোল পারমিশন কনফিগারেশন' : 'Role Access Matrix'}
              </span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300 font-bold">{isBng ? 'পারমিশন প্রিভিউ রোল' : 'Select Designation to Preview:'}</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="Owner" className="text-slate-900">Owner</option>
                <option value="Sub-admin" className="text-slate-900">Sub-admin</option>
                <option value="Technician" className="text-slate-900">Technician</option>
                <option value="Desk Executive" className="text-slate-900">Desk Executive</option>
                <option value="Delivery Rider" className="text-slate-900">Delivery Rider</option>
              </select>
            </div>

            {/* Permissions list checklist display */}
            <div className="space-y-2.5 pt-2">
              <span className="block text-[10px] font-bold text-indigo-200 uppercase tracking-widest">{isBng ? 'অনুমোদিত ইআরপি ফিচার তালিকা:' : 'Authorized ERP Capabilities:'}</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {ROLE_PERMISSIONS[selectedRole]?.map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-250 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 fill-emerald-500/20" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[10px] text-indigo-200 border-t border-white/10 leading-relaxed font-mono">
              ⚡ Multi-Factor Authentication (2FA) is automatically mandated for all staff logins accessing customer profiles.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
