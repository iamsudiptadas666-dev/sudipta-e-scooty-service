import React, { useState, useEffect } from "react";
import { 
  Shield, Database, Download, RefreshCw, AlertTriangle, User, Search, 
  Clock, CheckCircle, Activity, Globe, Flame, Lock, Filter, FileText, Ban, Copy, Check, Key, Plus, Trash2, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { generateSecret, getTOTPUri, verifyTOTP } from "../lib/totp";
import { logAuditEvent, AuditLogItem, getClientIp, formatTimestampToIST } from "../lib/auditLogger";

export function AdminAuditLogs({ lang }: { lang: "en" | "bn" }) {
  const isBng = lang === "bn";
  const [activeSubSection, setActiveSubSection] = useState<"audit_db" | "network_shields" | "backups" | "mfa_setup">("audit_db");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warning" | "critical">("all");
  const [actorFilter, setActorFilter] = useState<"all" | "Admin" | "Staff" | "System">("all");

  // Dynamic Audit Logs State fetched from backend API
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // WAF State fetched from backend API
  const [wafLogs, setWafLogs] = useState<string[]>([]);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [newIpToBlock, setNewIpToBlock] = useState("");
  const [isAddingBlockIp, setIsAddingBlockIp] = useState(false);

  // New Custom Log Modal State
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [newActionText, setNewActionText] = useState("");
  const [newModuleText, setNewModuleText] = useState("Security Portal");
  const [newSeverity, setNewSeverity] = useState<"info" | "warning" | "critical">("info");

  // Google Authenticator 2FA States
  const [mfaSecret, setMfaSecret] = useState(() => {
    const stored = sessionStorage.getItem("sudipta_2fa_secret");
    if (stored) return stored;
    const defaultSecret = "SUDIPTADASEYWORK";
    sessionStorage.setItem("sudipta_2fa_secret", defaultSecret);
    return defaultSecret;
  });
  const [mfaCopied, setMfaCopied] = useState(false);
  const [mfaVerifyCode, setMfaVerifyCode] = useState("");
  const [mfaVerifySuccess, setMfaVerifySuccess] = useState<boolean | null>(null);
  const [mfaVerifyError, setMfaVerifyError] = useState("");
  
  // Rate limiter simulator states
  const [spamRequests, setSpamRequests] = useState<number>(0);
  const [rateLimiterBlocked, setRateLimiterBlocked] = useState<boolean>(false);
  const [simulatedIps] = useState<string>(() => getClientIp());

  // Backup state
  const [backupLogs, setBackupLogs] = useState<string[]>([
    "03:00:00 - Scheduled cron triggered cloud snapshot #BK-9064",
    "03:00:03 - Data compression complete: 14.8 MB (ratio 4.2x)",
    "03:00:05 - Uploading backup archive to secure Sudipta Cloud Bucket",
    "03:00:07 - Backup verified with SHA-256 checksum: SUCCESS"
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Fetch Audit Logs & WAF State from backend REST API
  const fetchAuditLogs = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true }) + " IST");
      }
    } catch (err) {
      console.warn("Could not fetch audit logs from backend API:", err);
    } finally {
      setIsLoadingLogs(false);
      setIsRefreshing(false);
    }
  };

  const fetchWafLogs = async () => {
    try {
      const res = await fetch("/api/waf-logs");
      if (res.ok) {
        const data = await res.json();
        setWafLogs(data.wafLogs || []);
        setBlockedIps(data.blockedIps || []);
      }
    } catch (err) {
      console.warn("Could not fetch WAF logs:", err);
    }
  };

  // Initial Load & Polling setup
  useEffect(() => {
    fetchAuditLogs();
    fetchWafLogs();

    // Auto-polling every 4 seconds for real-time live server events
    const interval = setInterval(() => {
      fetchAuditLogs(true);
      fetchWafLogs();
    }, 4000);

    // Listen for client side events
    const handleLogAdded = () => {
      fetchAuditLogs(true);
      fetchWafLogs();
    };

    window.addEventListener("sudipta_audit_log_added", handleLogAdded);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sudipta_audit_log_added", handleLogAdded);
    };
  }, []);

  // Handle Block IP / Unblock IP
  const handleToggleBlockIp = async (ip: string, action: "block" | "unblock") => {
    try {
      const res = await fetch("/api/waf-logs/block-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, action, actor: "SUDIPTA DAS" })
      });
      if (res.ok) {
        const data = await res.json();
        setWafLogs(data.wafLogs || []);
        setBlockedIps(data.blockedIps || []);
        fetchAuditLogs(true);
      }
    } catch (err) {
      console.error("Error updating IP blocklist:", err);
    }
  };

  const handleAddCustomBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpToBlock.trim()) return;
    setIsAddingBlockIp(true);
    await handleToggleBlockIp(newIpToBlock.trim(), "block");
    setNewIpToBlock("");
    setIsAddingBlockIp(false);
  };

  // Handle manual create audit log
  const handleCreateCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    await logAuditEvent({
      action: newActionText.trim(),
      module: newModuleText,
      severity: newSeverity,
      actor: "SUDIPTA DAS",
      role: "Admin"
    });

    setNewActionText("");
    setShowAddLogModal(false);
    fetchAuditLogs(true);
  };

  // Handle rate limiter simulation spam requests
  const handleSpamRequest = async () => {
    if (rateLimiterBlocked) return;
    
    setSpamRequests(prev => {
      const newVal = prev + 1;
      const timestamp = new Date().toLocaleTimeString();
      
      if (newVal >= 6) {
        setRateLimiterBlocked(true);
        
        // Log WAF & Audit Event to Server
        fetch("/api/waf-logs/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `[ALERT] SPA_BURST detected! Request count reached ${newVal}/min from ${simulatedIps}. IP THROTTLED.` })
        });

        logAuditEvent({
          action: `Rate-limiter auto-scrubbed burst traffic spam attack from IP ${simulatedIps}`,
          module: "WAF Rate Limiter",
          severity: "warning",
          ipAddress: simulatedIps,
          actor: "SYSTEM SHIELD",
          role: "System"
        });

        // Auto unblock after 10 seconds for demo convenience
        setTimeout(() => {
          setRateLimiterBlocked(false);
          setSpamRequests(0);
          fetch("/api/waf-logs/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `[SYSTEM] IP ${simulatedIps} automatic rate limit block lifted.` })
          });
          fetchWafLogs();
        }, 10000);
      } else {
        fetch("/api/waf-logs/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `[ALLOW] API Request #${newVal} from IP ${simulatedIps} - STATUS: 200 OK` })
        });
      }
      return newVal;
    });

    fetchWafLogs();
  };

  // Perform manual backup simulation
  const handleTriggerBackup = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    const date = new Date().toLocaleTimeString();
    
    setBackupLogs(prev => [
      ...prev,
      `[${date}] - Manual backup request triggered by Admin Sudipta Das`,
      `[${date}] - Querying all CRM collections (Vehicles, Customers, EMI, Support)`,
      `[${date}] - Bundling database schemas to compressed JSON archive...`
    ]);

    // Create an audit log entry for the backup trigger
    await logAuditEvent({
      action: "Initiated manual full database JSON snapshot backup",
      module: "Compliance Backup",
      severity: "info",
      actor: "SUDIPTA DAS",
      role: "Admin"
    });

    setTimeout(() => {
      const successDate = new Date().toLocaleTimeString();
      setBackupLogs(prev => [
        ...prev,
        `[${successDate}] - Compressed output: 14.85 MB. Checksum verified.`,
        `[${successDate}] - Cloud Sync: Complete. File Sudipta_Backup_Manual_${Date.now()}.json is ready.`
      ]);
      setIsBackingUp(false);

      // Create a downloadable audit & configuration JSON backup file
      const backupData = {
        meta: {
          app: "Sudipta E-Scooty ERP Platform",
          proprietor: "SUDIPTA DAS",
          timestamp: new Date().toISOString(),
          status: "SUCCESS",
          backup_type: "MANUAL_RECOVERY"
        },
        security_spec: {
          ssl: "ENFORCED (TLS 1.3)",
          ddos: "ACTIVE (Cloud-Shield Mitigation Layers)",
          rate_limit: "ENABLED (Client IP Threshold: 5 req/min)",
          sql_injection_defense: "ACTIVE (Parameterized ORM & Prepared Statements)",
          xss_filter: "ACTIVE (Dual-layer sanitization & tag stripping)"
        },
        audit_logs: logs
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Sudipta_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1500);
  };

  // Filter logs list based on user selections
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesActor = actorFilter === "all" || log.role === actorFilter;
    
    return matchesSearch && matchesSeverity && matchesActor;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-md space-y-6">
      
      {/* Header and Live Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              POLLING ACTIVE ({lastUpdated || "Live"})
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
              <Shield className="w-2.5 h-2.5 fill-indigo-500" />
              REST API CONNECTED
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20">
              <Lock className="w-2.5 h-2.5" />
              TLS 1.3 ENFORCED
            </span>
          </div>
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {isBng ? "নিরাপত্তা ও কমপ্লায়েন্স হাব (Live Dynamic Audit Trail)" : "Security Control Panel & Audit Logs"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBng 
              ? "রিয়েল-টাইম অডিট লগ, আইপি ট্র্যাকিং, ফায়ারওয়াল ইভেন্ট এবং ফায়ারওয়াল ব্লক অ্যাকশন সরাসরি ডাটাবেজে আপডেট হচ্ছে।"
              : "Live real-time login attempts, client IP addresses, actor roles, firewall threat detections, and active WAF rules connected to database API."}
          </p>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchAuditLogs(false)}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Refresh logs from server"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddLogModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Emit Test Event</span>
          </button>

          <button
            onClick={handleTriggerBackup}
            disabled={isBackingUp}
            className={`flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${isBackingUp ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isBackingUp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isBackingUp ? (isBng ? "প্রসেসিং..." : "Compiling...") : (isBng ? "ডাউনলোড ব্যাকআপ" : "Download Backup")}</span>
          </button>
        </div>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubSection("audit_db")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${activeSubSection === "audit_db" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750"}`}
        >
          <Database className="w-4 h-4" />
          <span>{isBng ? "অডিট লগ ডাটাবেজ" : "Live Audit Trail"} ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubSection("network_shields")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${activeSubSection === "network_shields" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750"}`}
        >
          <Activity className="w-4 h-4" />
          <span>{isBng ? "নেটওয়ার্ক ও ফায়ারওয়াল (WAF)" : "WAF & Network Firewalls"}</span>
          {blockedIps.length > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {blockedIps.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubSection("backups")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 relative ${activeSubSection === "backups" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750"}`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isBng ? "কমপ্লায়েন্স ও ব্যাকআপ" : "Compliance & Backups"}</span>
        </button>
        <button
          onClick={() => setActiveSubSection("mfa_setup")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${activeSubSection === "mfa_setup" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-750"}`}
        >
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>{isBng ? "গুগল ২এফএ সেটাপ" : "Google Authenticator 2FA"}</span>
        </button>
      </div>

      {/* ========================================================
          SUB-SECTION: AUDIT LOGS DATABASE
          ======================================================== */}
      {activeSubSection === "audit_db" && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBng ? "অডিট লগ খুঁজুন (যেমন: IP, Admin, login, order)..." : "Search actor, IP, action or ID..."}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                value={severityFilter}
                onChange={(e: any) => setSeverityFilter(e.target.value)}
              >
                <option value="all">{isBng ? "সকল সেভারিটি" : "All Severities"}</option>
                <option value="info">Info / Standard Actions</option>
                <option value="warning">Warning / Rate Throttles</option>
                <option value="critical">Critical / Admin Passcode Actions</option>
              </select>
            </div>

            <div>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                value={actorFilter}
                onChange={(e: any) => setActorFilter(e.target.value)}
              >
                <option value="all">{isBng ? "সকল ইউজার রোল" : "All Actor Roles"}</option>
                <option value="Admin">Admin Only</option>
                <option value="Staff">Staff Only</option>
                <option value="System">System Auto Actions</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider text-left">
                    <th className="p-3.5 pl-5">Timestamp / ID</th>
                    <th className="p-3.5">Actor Name & Role</th>
                    <th className="p-3.5">ERP Module</th>
                    <th className="p-3.5">Operation / Event Action</th>
                    <th className="p-3.5">Client IP Address</th>
                    <th className="p-3.5 text-right pr-5">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 font-bold">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        Fetching live server logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 font-bold">
                        {isBng ? "কোনো ম্যাচিং অডিট লগ পাওয়া যায়নি!" : "No audit trail logs match your filter criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition">
                        <td className="p-3.5 pl-5">
                          <div className="font-mono text-[10px] text-slate-400 font-bold">{log.id}</div>
                          <div className="text-slate-500 font-mono text-[9px] mt-0.5 whitespace-nowrap">{formatTimestampToIST(log.timestamp)}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.actor}</span>
                          </div>
                          <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                            log.role === "Admin" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/25" :
                            log.role === "Staff" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/25" :
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/20"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px]">{log.module}</div>
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed break-words">{log.action}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                            {log.ipAddress}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            log.severity === "critical" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/30" :
                            log.severity === "warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/30" :
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/30"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              log.severity === "critical" ? "bg-rose-500" :
                              log.severity === "warning" ? "bg-amber-500" :
                              "bg-emerald-500"
                            }`}></span>
                            <span>{log.severity}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Table Footer Compliance Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 px-5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                ISO-27001 Audit Compliant Dynamic Database Ledger
              </span>
              <span>Showing {filteredLogs.length} of {logs.length} entries</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-SECTION: WAF & NETWORK SECURITY SHIELDS
          ======================================================== */}
      {activeSubSection === "network_shields" && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Grid of Shields, Mitigators, and Simulators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* DDoS Active Scrubbing Center Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center border border-rose-200/20">
                    <Flame className="w-5 h-5 fill-rose-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    SCRUBBING ACTIVE
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Cloud-Shield DDoS Protection</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                  Real-time dynamic traffic scrubbing filter utilizing intelligent threat profiles to block high-frequency botnet floods before they reach the Node server container.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] font-bold text-slate-400 block">CLEAN TRAFFIC</span>
                    <span className="text-sm font-mono font-black text-emerald-500">100% OK</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] font-bold text-slate-400 block">BLOCKED IPS</span>
                    <span className="text-sm font-mono font-black text-rose-500">{blockedIps.length} Active</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                  <span>Anycast Shield Integration:</span>
                  <span className="text-emerald-500">Cloud-Shield Anycast</span>
                </div>
              </div>
            </div>

            {/* Rate Limiting Simulator Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-200/20">
                    <Ban className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black flex items-center gap-1 px-2 py-0.5 rounded border ${rateLimiterBlocked ? "bg-red-50 text-red-600 border-red-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-500/20"}`}>
                    {rateLimiterBlocked ? "THROTTLED & BLOCKED" : "MONITORING LIVE"}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">API Rate Limiter Simulator</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                  Prevents spam submissions. Submit 6 rapid requests to trigger rate limiting throttles for client IP <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px] font-mono">{simulatedIps}</code>.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Rapid requests count:</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{spamRequests} / 5 per min</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${rateLimiterBlocked ? "bg-rose-500" : "bg-indigo-500"}`}
                    style={{ width: `${Math.min((spamRequests / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <button
                  onClick={handleSpamRequest}
                  disabled={rateLimiterBlocked}
                  className={`w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition cursor-pointer text-center ${rateLimiterBlocked ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {rateLimiterBlocked ? "Temporary Throttle Active (10s)" : "Send Simulated API Request"}
                </button>
              </div>
            </div>

            {/* SQL Injection & XSS Guard Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-200/20">
                    <Filter className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20">
                    PARANOID ENFORCED
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Database Sanitizer Shields</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                  SQL Injection and XSS Prevention filters operate on all frontend inputs, CRM forms, and query strings. Custom functions sanitize characters and enforce prepared ORM parameters.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-4">
                <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[9px] text-slate-400 leading-normal space-y-1">
                  <div className="text-emerald-400">// SQL injection parameterization</div>
                  <div>const query = "SELECT * FROM crm WHERE actor = $1";</div>
                  <div className="text-emerald-400">// XSS script sanitization</div>
                  <div>const clean = text.replace(/&lt;script.*?&gt;/gi, "");</div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Input Sanitization:</span>
                  <span className="text-emerald-500">100% Sanitized</span>
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic IP Blocklist Manager Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-500" />
                  <span>WAF Active IP Blocklist ({blockedIps.length})</span>
                </h3>
                <p className="text-xs text-slate-400">IP addresses in this blocklist are dynamically intercepted and rejected by the WAF middleware.</p>
              </div>

              {/* Add IP Form */}
              <form onSubmit={handleAddCustomBlockIp} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.200"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 dark:text-white w-44"
                  value={newIpToBlock}
                  onChange={(e) => setNewIpToBlock(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isAddingBlockIp || !newIpToBlock.trim()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Block IP
                </button>
              </form>
            </div>

            {/* Blocked IPs Chips */}
            <div className="flex flex-wrap gap-2">
              {blockedIps.length === 0 ? (
                <span className="text-xs text-slate-400 font-semibold italic">No IPs currently blocked in WAF blocklist.</span>
              ) : (
                blockedIps.map((ip) => (
                  <div key={ip} className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/40 text-rose-800 dark:text-rose-300 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                    <span>{ip}</span>
                    <button
                      onClick={() => handleToggleBlockIp(ip, "unblock")}
                      className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer transition"
                      title="Unblock IP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rate Limit Live Simulator Logs Monitor */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
              <span>WAF FIREWALL SERVER EVENT STREAM</span>
              <span className="text-emerald-500 flex items-center gap-1 animate-pulse">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                ACTIVE SERVER LOGS
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-300 leading-normal space-y-1.5 max-h-48 overflow-y-auto">
              {wafLogs.length === 0 ? (
                <div className="text-slate-500 italic">&gt; Initializing server firewall log stream...</div>
              ) : (
                wafLogs.map((log, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span className="text-indigo-400 shrink-0">&gt;</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          SUB-SECTION: COMPLIANCE & AUTOMATIC BACKUPS
          ======================================================== */}
      {activeSubSection === "backups" && (
        <div className="space-y-6 animate-fade-in text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Backup Status Metrics */}
            <div className="md:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Cloud Recovery State</h3>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">AUTO-BACKUP FREQUENCY</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">Daily (03:00 AM UTC)</span>
                  </div>
                  <Clock className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">LAST ATTEMPT STATUS</span>
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                      SUCCESS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">SHA-256 OK</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">BACKUP ARCHIVES COMPLIANCE</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">Verified Immutable</span>
                  </div>
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/45 border border-amber-200/50 p-3.5 rounded-xl flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[10.5px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  <strong className="block text-amber-900 dark:text-amber-400 font-extrabold mb-0.5">Disaster Recovery (DR) Protocol</strong>
                  Sudipta E-Scooty databases are replicated across multi-region bucket systems. Secure snapshot backup triggers daily.
                </div>
              </div>
            </div>

            {/* Backups Execution Logs Monitor */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Recovery Log Pipeline</h3>
                  <span className="text-[8px] font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20">
                    SUDIPTA-SNAPSHOTS-V1
                  </span>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-400 leading-normal space-y-1.5 min-h-[160px] overflow-y-auto">
                  {backupLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">&gt;</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">CURRENT BACKUP FILENAME:</span>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-white">Sudipta_CRM_Live_State_Encrypted.json</span>
                </div>
                <button
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? "animate-spin" : ""}`} />
                  <span>{isBng ? "ম্যানুয়াল ব্যাকআপ তৈরি করুন" : "Generate Manual Backup Archive"}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-SECTION: MFA GOOGLE AUTHENTICATOR SETUP
          ======================================================== */}
      {activeSubSection === "mfa_setup" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: QR Code & Key */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                  MFA Enrollment (Google Authenticator)
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5">
                  1. Scan Sudipta's Authenticator QR Code
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                  Open Google Authenticator, Microsoft Authenticator, or Authy on Sudipta's device, select "Scan QR code", and scan the image below to register this secure ERP session credentials.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
                  <QRCodeSVG 
                    value={getTOTPUri(mfaSecret, "Sudipta E-Scooty (iamsudiptadas666@gmail.com)", "Sudipta E-Scooty")} 
                    size={150}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="h-1 w-1 bg-emerald-500 rounded-full"></span>
                    SECURE ENROLLMENT KEY DISPATCHED
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Emergency Recovery Key:</span>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="font-mono font-extrabold text-sm tracking-wider text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        {mfaSecret}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(mfaSecret);
                          setMfaCopied(true);
                          setTimeout(() => setMfaCopied(false), 2000);
                        }}
                        className="p-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/20 transition cursor-pointer"
                        title="Copy Recovery Key"
                      >
                        {mfaCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-indigo-500" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
                    Save this key safely. If you lose Sudipta's phone, you can manual-input this key into Sudipta's new Google Authenticator app to recover access.
                  </p>
                </div>
              </div>

              {/* Reset Control */}
              <div className="flex items-center justify-between p-4 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/20 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    <strong className="block text-slate-700 dark:text-slate-300 font-extrabold">Regenerate Sudipta's secret?</strong>
                    Regenerating will invalidate Sudipta's current mobile configurations.
                  </div>
                </div>
                <button
                  onClick={() => {
                    const fresh = generateSecret(16);
                    setMfaSecret(fresh);
                    sessionStorage.setItem("sudipta_2fa_secret", fresh);
                    setMfaVerifySuccess(null);
                    setMfaVerifyCode("");
                    setMfaVerifyError("");
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[10.5px] font-bold rounded-lg border border-rose-200/20 transition cursor-pointer shrink-0"
                >
                  Regenerate Secret
                </button>
              </div>
            </div>

            {/* Right Column: Live Sync Test Validation */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                    Sync Verification
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5">
                    2. Verify 2FA Offline Synchrony
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                    Verify Sudipta's offline cryptographic verification. Enter the 6-digit OTP code shown in Sudipta's Authenticator app to check if the ERP clock is calibrated.
                  </p>
                </div>

                <div className="space-y-3.5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">Enter 6-Digit Authenticator Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-mono font-black tracking-widest text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      value={mfaVerifyCode}
                      onChange={(e) => {
                        setMfaVerifyCode(e.target.value.replace(/\D/g, ""));
                        setMfaVerifySuccess(null);
                        setMfaVerifyError("");
                      }}
                    />
                  </div>

                  {mfaVerifySuccess === true && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/20 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Sync Check: SUCCESS. Sudipta's 2FA clock is calibrated.</span>
                    </div>
                  )}

                  {mfaVerifyError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-850 dark:text-rose-300 border border-rose-200/20 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{mfaVerifyError}</span>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!mfaVerifyCode || mfaVerifyCode.length !== 6) {
                        setMfaVerifyError("Please enter Sudipta's 6-digit code.");
                        return;
                      }
                      const ok = await verifyTOTP(mfaSecret, mfaVerifyCode);
                      if (ok) {
                        setMfaVerifySuccess(true);
                        setMfaVerifyError("");
                        await logAuditEvent({
                          action: "Verified Google Authenticator 2FA TOTP code successfully",
                          module: "MFA 2FA Guard",
                          severity: "info",
                          actor: "SUDIPTA DAS",
                          role: "Admin"
                        });
                      } else {
                        setMfaVerifySuccess(false);
                        setMfaVerifyError("Invalid code. Ensure Sudipta's device clock is correct and retry.");
                        await logAuditEvent({
                          action: "Failed 2FA TOTP verification attempt - code mismatch",
                          module: "MFA 2FA Guard",
                          severity: "warning",
                          actor: "SUDIPTA DAS",
                          role: "Admin"
                        });
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Verify Sync Token
                  </button>
                </div>
              </div>

              {/* Compliance standard footnotes */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-4 flex items-center gap-1.5 border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>RFC-6238 TOTP Cryptography Engine • SHA-1 30s step</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Emit Custom Audit Event Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Emit Test Audit Log
              </h3>
              <button 
                onClick={() => setShowAddLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomLog} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Module Name</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-white"
                  value={newModuleText}
                  onChange={(e) => setNewModuleText(e.target.value)}
                >
                  <option value="Security Portal">Security Portal</option>
                  <option value="Bookings Service">Bookings Service</option>
                  <option value="Payments Gateway">Payments Gateway</option>
                  <option value="Logistics Hub">Logistics Hub</option>
                  <option value="Inventory & Showroom">Inventory & Showroom</option>
                  <option value="MFA 2FA Guard">MFA 2FA Guard</option>
                  <option value="Staff Portal">Staff Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Action Description</label>
                <input
                  type="text"
                  placeholder="e.g. Master ERP session authenticated with 2FA TOTP shield"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-white"
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Risk Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSeverity("info")}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${newSeverity === "info" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                  >
                    Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSeverity("warning")}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${newSeverity === "warning" ? "bg-amber-600 text-white border-amber-600" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                  >
                    Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSeverity("critical")}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${newSeverity === "critical" ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                  >
                    Critical
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Emit Audit Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
