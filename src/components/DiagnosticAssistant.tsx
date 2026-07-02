import React, { useState } from "react";
import { Sparkles, Zap, Phone, MapPin, Send } from "lucide-react";
import { Language, TranslationDict } from "../translations";

interface AiLogEntry {
  id: string;
  query: string;
  response: string;
  source: string;
  createdAt: string;
  language: Language;
}

const readAiLogs = (): AiLogEntry[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem("ai_logs");
    if (!storedValue) return [];

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error("Failed to read ai_logs from localStorage", error);
    return [];
  }
};

const persistAiLogs = (entries: AiLogEntry[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem("ai_logs", JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to write ai_logs to localStorage", error);
  }
};

interface DiagnosticAssistantProps {
  lang: Language;
  t: TranslationDict;
}

export default function DiagnosticAssistant({ lang, t }: DiagnosticAssistantProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [source, setSource] = useState("");

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmedQuery = query.trim();

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery, language: lang })
      });

      const data = await res.json();
      const nextResponse = data?.diagnosis || (lang === "bn" ? "রোগ নির্ণয় সংক্রান্ত উত্তর পাওয়া যায়নি।" : "No diagnosis response could be generated.");
      const nextSource = data?.source || "Local fallback";

      setResponse(nextResponse);
      setSource(nextSource);

      const nextEntry: AiLogEntry = {
        id: `ai-${Date.now()}`,
        query: trimmedQuery,
        response: nextResponse,
        source: nextSource,
        createdAt: new Date().toISOString(),
        language: lang
      };

      const existingLogs = readAiLogs();
      persistAiLogs([nextEntry, ...existingLogs]);
      window.alert(lang === "bn" ? "আপনার AI নির্ণয় অনুরোধ সফলভাবে স্থানীয়ভাবে সংরক্ষিত হয়েছে।" : "Your AI diagnostic request has been saved locally.");
    } catch (error) {
      console.error(error);
      const fallbackResponse = lang === "bn"
        ? "দুঃখিত, রোগ নির্ণয় করতে সমস্যা হয়েছে। দয়া করে সুদীপ্ত বাবুকে সরাসরি ফোন করুন।"
        : "Sorry, diagnosing failed. Please call Sudipta Das directly.";
      setResponse(fallbackResponse);
      setSource("Fallback");

      const nextEntry: AiLogEntry = {
        id: `ai-${Date.now()}`,
        query: trimmedQuery,
        response: fallbackResponse,
        source: "Fallback",
        createdAt: new Date().toISOString(),
        language: lang
      };

      const existingLogs = readAiLogs();
      persistAiLogs([nextEntry, ...existingLogs]);
      window.alert(lang === "bn" ? "AI নির্ণয় অনুরোধ রিজার্ভ মোডে স্থানীয়ভাবে সংরক্ষিত হয়েছে।" : "AI diagnostic request has been saved locally in fallback mode.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div id="ai-diagnose-card" className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800">{t.diagnosisTitle}</h3>
          <p className="text-sm text-slate-500">{t.diagnosisSubtitle}</p>
        </div>
      </div>

      <form onSubmit={handleDiagnose} className="space-y-4">
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 placeholder-slate-400"
          placeholder={t.diagnosisPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition duration-200 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {lang === "bn" ? "বিশ্লেষণ করা হচ্ছে..." : "Analyzing..."}
              </span>
            ) : (
              <>
                <Zap className="w-5 h-5 text-yellow-300" />
                {t.diagnosisAskButton}
              </>
            )}
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono">
              {source}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              2026 AI Agent Diagnosis
            </span>
          </div>

          <div className="prose max-w-none text-slate-700 space-y-4 leading-relaxed whitespace-pre-line">
            {response}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Ashoknagar Power House Road, West Bengal</span>
            </div>
            <a
              href="tel:+919064517009"
              className="flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Phone className="w-4 h-4" />
              <span>+91 906451 7009 ({t.ownerName})</span>
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-6 text-center italic">{t.diagnosisDisclaimer}</p>
    </div>
  );
}
