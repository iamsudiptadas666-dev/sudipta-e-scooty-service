export function formatInvoiceItemDescription(name: string): string {
  if (!name) return "";
  const upper = name.trim().toUpperCase();
  
  if (upper === "CHANGER" || upper === "CHARGER") {
    return "EV Smart Charger (Repairing & Service)";
  }
  if (upper === "CONTROLLER") {
    return "EV Intelligent Sine-Wave Controller (Service & Fitting)";
  }
  if (upper === "BATTERY") {
    return "High-Performance LFP Lithium Battery Pack (Repaired/Reconditioned)";
  }
  if (upper === "MOTOR") {
    return "EV High-Torque BLDC Hub Motor (Diagnostic & Repair)";
  }
  if (upper === "CONVERTER") {
    return "EV Heavy-Duty DC-to-DC Voltage Converter";
  }
  if (upper === "THROTTLE") {
    return "EV Precision Hall-Effect Throttle Handle";
  }
  if (upper === "KEY" || upper === "LOCK") {
    return "Anti-Theft Central Lock System with Key Fob";
  }
  if (upper === "WIRING") {
    return "Complete EV Internal Wiring Harness Restoration";
  }
  
  // If the word matches a standard pattern but with extra info, keep it, otherwise clean uppercase
  if (upper === name) {
    // Title Case
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return name;
}

export function parseNumericValue(val: string): number | "" {
  if (val === "") return "";
  const cleaned = val.replace(/^0+(?=\d)/, "");
  return cleaned === "" ? 0 : Number(cleaned);
}
