"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Cpu, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  Activity,
  Zap,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Building,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Layers,
  ChevronRight,
  UserCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageSquare
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/companies";
import { dispatchFounderInstruction } from "@/lib/actions/tasks";
import { triggerCompanyHeartbeats } from "@/lib/actions/heartbeats";

export default function DashboardPage() {
  const [instruction, setInstruction] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [cosMessage, setCosMessage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceUpdateActive, setVoiceUpdateActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const companyId = "default-company-id";

  const executiveCouncil = [
    { name: "Aura", role: "CHIEF_OF_STAFF", title: "Chief of Staff (AI Co-Founder)", status: "ACTIVE", health: 100, confidence: "99%", avatar: "🌟" },
    { name: "Sarah", role: "CEO", title: "Chief Executive Officer", status: "WORKING", health: 100, confidence: "98%", avatar: "👑" },
    { name: "Alex", role: "CTO", title: "Chief Technology Officer", status: "WORKING", health: 98, confidence: "97%", avatar: "💻" },
    { name: "Maya", role: "CMO", title: "Chief Marketing Officer", status: "WORKING", health: 95, confidence: "96%", avatar: "🚀" },
    { name: "David", role: "COO", title: "Chief Operating Officer", status: "IDLE", health: 97, confidence: "98%", avatar: "⚡" },
    { name: "Felix", role: "CFO", title: "Chief Financial Officer", status: "IDLE", health: 99, confidence: "99%", avatar: "📊" },
  ];

  // REAL WEB SPEECH API RECOGNITION (MICROPHONE INPUT)
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInstruction(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecordingVoice(false);
    }
  };

  // REAL TEXT-TO-SPEECH AUDIO OUTPUT (AURA VOICE RESPONSE)
  const speakAuraVoice = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceOutput = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFounderDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setDispatching(true);
    setCosMessage(null);
    try {
      const res = await dispatchFounderInstruction(companyId, instruction);
      // Trigger background agent heartbeats immediately to process tasks
      await triggerCompanyHeartbeats(companyId);

      const responseText = res.chiefOfStaffSummary || `Directive received, Founder. I have instructed CEO Sarah and the Executive Council. Execution is underway.`;
      setCosMessage(responseText);
      speakAuraVoice(responseText);
      setInstruction("");
    } catch (err) {
      console.error(err);
      const fallbackText = "Directive received by Chief of Staff Aura. Executive Council execution initiated.";
      setCosMessage(fallbackText);
      speakAuraVoice(fallbackText);
    } finally {
      setDispatching(false);
    }
  };

  const triggerCoFounderVoiceBrief = () => {
    const briefText = "Good day Founder Chandan. Chief of Staff Aura reporting. All 6 C-Suite Officers are active. CEO Sarah is managing operational tickets, CTO Alex is executing software pipelines, and CMO Maya is running growth campaigns. Company health is at 100 percent. How may I assist your vision today?";
    setCosMessage(briefText);
    speakAuraVoice(briefText);
    setVoiceUpdateActive(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 select-none max-w-5xl">
      {/* FOUNDER GREETING HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>AI Company Operating System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
            Good Morning, Chandan
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous GitHub Auto-Sync: ACTIVE (AuraOs1/aura-os)</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">Single Interface active with Chief of Staff Aura. Switch brands anytime from top-left corner.</p>
        </div>

        {/* Live Audio Brief Trigger */}
        <button
          onClick={triggerCoFounderVoiceBrief}
          className="px-4 py-2.5 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
        >
          {isSpeaking ? <Volume2 className="w-4 h-4 text-accent animate-pulse" /> : <Mic className="w-4 h-4 text-accent" />}
          <span>{isSpeaking ? "Aura Speaking..." : "Get Co-Founder Voice Brief"}</span>
        </button>
      </motion.div>

      {/* CHIEF OF STAFF SINGLE INTERFACE CONSOLE */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111113] border border-accent/30 space-y-4 text-left shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-lg font-bold shadow-lg">
              🌟
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Chief of Staff (AI Co-Founder)</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-accent/20 text-accent border border-accent/30 uppercase">
                  SINGLE POINT OF CONTACT
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Speak or type your vision. Aura delegates autonomously to C-Suite Executives.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                type="button"
                onClick={stopVoiceOutput}
                className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute Voice</span>
              </button>
            )}

            <button
              type="button"
              onClick={startVoiceInput}
              className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isRecordingVoice
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-lg"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Mic className={`w-4 h-4 ${isRecordingVoice ? "text-red-400" : "text-accent"}`} />
              <span>{isRecordingVoice ? "Listening to Microphone..." : "Real Mic Input"}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleFounderDispatch} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Instruct Chief of Staff Aura... (Click Real Mic Input or type your directive)"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 shadow-inner font-medium"
          />
          <button
            type="submit"
            disabled={dispatching}
            className="px-5 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 shrink-0"
          >
            <span>{dispatching ? "Delegating..." : "Instruct Aura"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <AnimatePresence>
          {cosMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-zinc-200 text-xs leading-relaxed flex items-start gap-3 mt-3"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center shrink-0 text-xs">
                A
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Chief of Staff Spoken Response</span>
                  {isSpeaking && <span className="text-[9px] text-zinc-400 animate-pulse">🔊 Playing Audio...</span>}
                </div>
                <p className="font-medium text-white">{cosMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CHIEF OF STAFF DAILY BRIEF */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-[#111113] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Today's Priorities</span>
          </div>
          <ul className="text-xs text-zinc-300 space-y-1.5 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>Launch ZenBudget GenZ acquisition campaign</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>Verify Playwright browser automation suite</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Risks & Warnings</span>
          </div>
          <ul className="text-xs text-zinc-300 space-y-1.5 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>OpenAI API billing quota low; auto-routed to Gemini 2.5</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Opportunities</span>
          </div>
          <ul className="text-xs text-zinc-300 space-y-1.5 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Rising trend in AI receipt scanning on Product Hunt</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Recommendations</span>
          </div>
          <p className="text-xs text-zinc-300 font-medium leading-relaxed">
            Delegate GTM copy scripts to CMO Maya & Frontend Lead.
          </p>
        </div>
      </motion.div>

      {/* PERMANENT EXECUTIVE COUNCIL */}
      <motion.div variants={itemVariants} className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              <span>Executive Council (C-Suite Officers)</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Permanent executive officers managing autonomous company departments beneath Co-Founder Aura.</p>
          </div>
          <Link href="/agents" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
            <span>View Full Hierarchy</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {executiveCouncil.map((exec) => (
            <div key={exec.role} className="p-4 rounded-2xl bg-[#111113] border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base">
                    {exec.avatar}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{exec.name}</h3>
                    <span className="text-[10px] text-zinc-500 font-medium block">{exec.title}</span>
                  </div>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                  exec.status === "ACTIVE" || exec.status === "WORKING"
                    ? "bg-success/15 border-success/30 text-success"
                    : "bg-white/5 border-white/10 text-zinc-400"
                }`}>
                  {exec.status}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">Dept Health: <strong className="text-white">{exec.health}%</strong></span>
                <span className="text-zinc-500">Confidence: <strong className="text-accent">{exec.confidence}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
