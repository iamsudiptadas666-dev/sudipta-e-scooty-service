// Shared Audit Logging Utility for Sudipta E-Scooty ERP Platform

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: "Admin" | "Staff" | "System";
  action: string;
  ipAddress: string;
  severity: "info" | "warning" | "critical";
  module: string;
}

// Get client IP address approximation from client session or fallback
export function getClientIp(): string {
  try {
    const stored = localStorage.getItem("sudipta_client_ip");
    if (stored) return stored;
    // Generate realistic local or dynamic subnet IP
    const simulatedIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;
    localStorage.setItem("sudipta_client_ip", simulatedIp);
    return simulatedIp;
  } catch {
    return "192.168.1.50";
  }
}

// Helper function to format any timestamp (ISO string, UTC string, Date) into Indian Standard Time (IST / Asia/Kolkata - UTC+5:30)
export function formatTimestampToIST(timestampStr: string): string {
  if (!timestampStr) return "";
  try {
    let dateObj: Date;
    if (timestampStr.includes("T") || timestampStr.endsWith("Z")) {
      dateObj = new Date(timestampStr);
    } else if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(timestampStr)) {
      dateObj = new Date(timestampStr.replace(" ", "T") + "Z");
    } else {
      dateObj = new Date(timestampStr);
    }

    if (isNaN(dateObj.getTime())) {
      return timestampStr;
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };

    const parts = new Intl.DateTimeFormat("en-IN", options).formatToParts(dateObj);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || "";

    const day = getPart("day");
    const month = getPart("month");
    const year = getPart("year");
    const hour = getPart("hour");
    const minute = getPart("minute");
    const second = getPart("second");
    const dayPeriod = getPart("dayPeriod").toUpperCase();

    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${dayPeriod} (IST)`;
  } catch (e) {
    return timestampStr;
  }
}

// Log an action dynamically to backend API and local store
export async function logAuditEvent(params: {
  actor?: string;
  role?: "Admin" | "Staff" | "System";
  action: string;
  module: string;
  severity?: "info" | "warning" | "critical";
  ipAddress?: string;
}): Promise<AuditLogItem | null> {
  const currentActor = params.actor || (localStorage.getItem("sudipta_user_name") || "SUDIPTA DAS");
  const currentRole = params.role || (localStorage.getItem("sudipta_user_role") as any || "Admin");
  const ipAddress = params.ipAddress || getClientIp();
  const severity = params.severity || "info";

  const payload = {
    actor: currentActor,
    role: currentRole,
    action: params.action,
    module: params.module,
    severity: severity,
    ipAddress: ipAddress
  };

  try {
    const res = await fetch("/api/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      // Dispatch custom event for real-time reactivity in UI components
      window.dispatchEvent(new CustomEvent("sudipta_audit_log_added", { detail: data }));
      return data;
    }
  } catch (err) {
    console.warn("Backend audit logging failed, persisting in local fallback:", err);
  }

  // Fallback log item
  const now = new Date();
  const fallbackLog: AuditLogItem = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: now.toISOString(),
    actor: currentActor,
    role: currentRole,
    action: params.action,
    ipAddress,
    severity,
    module: params.module
  };

  try {
    const existingStr = localStorage.getItem("sudipta_audit_logs");
    const existing: AuditLogItem[] = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(fallbackLog);
    localStorage.setItem("sudipta_audit_logs", JSON.stringify(existing.slice(0, 200)));
    window.dispatchEvent(new CustomEvent("sudipta_audit_log_added", { detail: fallbackLog }));
  } catch (e) {
    console.error("Local storage audit log write error:", e);
  }

  return fallbackLog;
}
