"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Play, Pause, Plus, X, Sparkles, Search, ShieldCheck, Crown, Layers, ChevronDown, ChevronRight, UserCheck } from "lucide-react";
import { getAgents, toggleAgentStatus } from "@/lib/actions/agents";
import { getDepartments } from "@/lib/actions/companies";

interface DatabaseAgent {
  id: string;
  name: string;
  role: string;
  mission: string;
  status: string;
  modelProvider: string;
  modelName: string;
  temperature: number;
  responsibilities: string[];
  department?: { name: string } | null;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<DatabaseAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkers, setShowWorkers] = useState(false);

  const companyId = "default-company-id";

  const loadData = async () => {
    const agentsRes = await getAgents(companyId);
    if (agentsRes.success && agentsRes.agents) {
      setAgents(agentsRes.agents as DatabaseAgent[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "IDLE" ? "WORKING" : "IDLE";
    await toggleAgentStatus(agentId, newStatus as any);
    loadData();
  };

  // Group agents by Executive Hierarchy Level
  const chiefOfStaff = agents.find(a => a.role === "CHIEF_OF_STAFF") || {
    id: "cos-agent-id",
    name: "Aura",
    role: "CHIEF_OF_STAFF",
    mission: "Act as Founder's AI Co-Founder and orchestrate full company operations.",
    status: "IDLE",
    modelProvider: "openai",
    modelName: "gpt-4o-mini",
    responsibilities: ["Single Point of Contact for Founder", "Synthesize Vision into Strategy"],
  };

  const ceo = agents.find(a => a.role === "CEO") || {
    id: "ceo-agent-id",
    name: "Sarah",
    role: "CEO",
    mission: "Maximize company execution speed and department alignment.",
    status: "WORKING",
    modelProvider: "gemini",
    modelName: "gemini-2.5-flash",
    responsibilities: ["Manage Executive Council", "Approve Operational Roadmaps"],
  };

  const executiveCouncil = agents.filter(a => 
    ["CTO", "CMO", "COO", "CFO", "HEAD_OF_PRODUCT", "HEAD_OF_DESIGN", "HEAD_OF_RESEARCH"].includes(a.role)
  );

  const workers = agents.filter(a => 
    !["CHIEF_OF_STAFF", "CEO", "CTO", "CMO", "COO", "CFO", "HEAD_OF_PRODUCT", "HEAD_OF_DESIGN", "HEAD_OF_RESEARCH"].includes(a.role)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 text-xs font-medium animate-pulse flex items-center gap-2">
          <Bot className="w-4 h-4 animate-spin text-accent" />
          <span>Synchronizing Executive Organizational Hierarchy...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 select-none max-w-5xl">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Executive Hierarchy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
            Company Organization Structure
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">Founder communicates only with Chief of Staff. Executive Council manages departments beneath.</p>
        </div>
      </motion.div>

      {/* LEVEL 1: CHIEF OF STAFF (AI CO-FOUNDER) */}
      <motion.div variants={itemVariants} className="space-y-3 text-left">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Level 1: Chief of Staff (AI Co-Founder & Single Founder Interface)</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111113] border-2 border-amber-400/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-xl font-bold text-amber-400 shadow-lg">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{chiefOfStaff.name}</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  CO-FOUNDER
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{chiefOfStaff.mission}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500">Provider: <strong className="text-accent">{chiefOfStaff.modelProvider} ({chiefOfStaff.modelName})</strong></span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-success/15 border border-success/30 text-success uppercase">
              ACTIVE CO-FOUNDER
            </span>
          </div>
        </div>
      </motion.div>

      {/* LEVEL 2: CEO */}
      <motion.div variants={itemVariants} className="space-y-3 text-left pl-0 sm:pl-6 border-l-2 border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Level 2: Chief Executive Officer (Reports ONLY to Chief of Staff)</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-lg">
              👑
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{ceo.name}</h3>
              <p className="text-xs text-zinc-400">{ceo.mission}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500">Provider: <strong className="text-white">{ceo.modelProvider}</strong></span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/15 border border-success/30 text-success uppercase">
              REPORTS TO CHIEF OF STAFF
            </span>
          </div>
        </div>
      </motion.div>

      {/* LEVEL 3: EXECUTIVE COUNCIL */}
      <motion.div variants={itemVariants} className="space-y-3 text-left pl-0 sm:pl-12 border-l-2 border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span>Level 3: C-Suite Executive Officers (Manage Autonomous Departments)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {executiveCouncil.map((exec) => (
            <div key={exec.id} className="p-4 rounded-xl bg-[#111113] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                  {exec.role === "CTO" ? "💻" : exec.role === "CMO" ? "🚀" : exec.role === "COO" ? "⚡" : "📊"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{exec.name} ({exec.role})</h4>
                  <span className="text-[10px] text-zinc-500">{exec.modelProvider} • {exec.modelName}</span>
                </div>
              </div>

              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-zinc-400 uppercase">
                EXECUTIVE
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* LEVEL 4: WORKERS SQUAD TOGGLE */}
      <motion.div variants={itemVariants} className="pt-4 border-t border-white/5 text-left">
        <button
          onClick={() => setShowWorkers(!showWorkers)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
        >
          {showWorkers ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-accent" />}
          <span>{showWorkers ? "Hide Department Workers Squad" : `Expand Department Workers Squad (${workers.length} Autonomous Agents)`}</span>
        </button>

        <AnimatePresence>
          {showWorkers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {workers.map((worker) => (
                <div key={worker.id} className="p-3.5 rounded-xl bg-[#111113] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-zinc-500" />
                    <div>
                      <h5 className="text-xs font-semibold text-white">{worker.name}</h5>
                      <span className="text-[9px] text-zinc-500">{worker.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(worker.id, worker.status)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold border cursor-pointer ${
                      worker.status === "WORKING"
                        ? "bg-success/15 border-success/30 text-success"
                        : "bg-white/5 border-white/10 text-zinc-500"
                    }`}
                  >
                    {worker.status}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
