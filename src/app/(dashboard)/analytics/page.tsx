"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Cpu, Clock, Activity, Play, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { getAnalyticsData } from "@/lib/actions/analytics";
import { runSystemDiagnostics, TestResult } from "@/lib/testing/systemVerifier";

interface AgentBreakdown {
  name: string;
  role: string;
  cost: number;
  queries: number;
  tokens: number;
}

interface TimelineItem {
  time: string;
  cost: number;
  tokens: number;
}

interface RawTelemetryLog {
  id: string;
  timestamp: string | Date;
  agentName: string;
  agentRole: string;
  action: string;
  tokenUsage: number;
  cost: number;
  provider: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [data, setData] = useState({
    totalCost: 0,
    totalTokens: 0,
    totalQueries: 0,
    agentBreakdown: [] as AgentBreakdown[],
    providerStats: { gemini: 0, claude: 0, openai: 0, simulated: 0 },
    timelineData: [] as TimelineItem[],
    rawLogs: [] as RawTelemetryLog[]
  });

  const companyId = "default-company-id";

  const loadAnalytics = async () => {
    const res = await getAnalyticsData(companyId);
    if (res.success && res.rawLogs) {
      setData({
        totalCost: res.totalCost || 0,
        totalTokens: res.totalTokens || 0,
        totalQueries: res.totalQueries || 0,
        agentBreakdown: res.agentBreakdown as AgentBreakdown[],
        providerStats: res.providerStats || { gemini: 0, claude: 0, openai: 0, simulated: 0 },
        timelineData: res.timelineData as TimelineItem[],
        rawLogs: res.rawLogs as RawTelemetryLog[]
      });
    }
    setLoading(false);
  };

  const handleRunDiagnostics = async () => {
    setRunningTests(true);
    try {
      const results = await runSystemDiagnostics();
      setTestResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningTests(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadAnalytics();
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 select-none max-w-4xl">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Analytics & Verification Suite
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time compute telemetry, cost tracking, and end-to-end integration test verifications.</p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={runningTests}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {runningTests ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Verification Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-black fill-black" />
              <span>Run System Diagnostics</span>
            </>
          )}
        </button>
      </motion.div>

      {/* SYSTEM VERIFICATION TEST RESULTS PANEL */}
      {testResults.length > 0 && (
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111113] border border-accent/30 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>End-to-End Verification Test Results</span>
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono">Executed just now</span>
          </div>

          <div className="space-y-3">
            {testResults.map((test, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/5 text-zinc-400 border border-white/10 uppercase">
                      {test.suite}
                    </span>
                    <h4 className="text-xs font-semibold text-white">{test.name}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-400">{test.details}</p>
                </div>

                <div className="flex items-center gap-3">
                  {test.status === "PASS" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/15 border border-success/30 text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  )}
                  {test.status === "FAIL" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> FAIL
                    </span>
                  )}
                  {test.status === "PENDING_CREDENTIALS" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> CONFIGURE KEY
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* METRICS OVERVIEW */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Total Spend</span>
            <h3 className="text-2xl font-bold text-white mt-1">${data.totalCost.toFixed(4)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Total Tokens</span>
            <h3 className="text-2xl font-bold text-white mt-1">{(data.totalTokens / 1000).toFixed(1)}k</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Execution Cycles</span>
            <h3 className="text-2xl font-bold text-white mt-1">{data.totalQueries}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
