"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle } from "lucide-react";

export default function GoalsPage() {
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

  const goals = [
    {
      id: "1",
      title: "Launch AURA OS Platform",
      type: "COMPANY",
      progress: 68,
      status: "IN_PROGRESS",
      subGoals: [
        { title: "Stabilize auth & db integration schema", type: "DEPARTMENT", status: "ACHIEVED" },
        { title: "Develop beautiful Linear-inspired dashboard shells", type: "PROJECT", status: "ACHIEVED" },
        { title: "Assemble autonomous heartbeat runner cron", type: "AGENT", status: "PENDING" },
      ],
    },
    {
      id: "2",
      title: "Establish Apple-Level UI components",
      type: "DEPARTMENT",
      progress: 90,
      status: "IN_PROGRESS",
      subGoals: [
        { title: "Verify dark/light theme tokens in globals.css", type: "PROJECT", status: "ACHIEVED" },
        { title: "Audit Framer Motion component entries", type: "AGENT", status: "IN_PROGRESS" },
      ],
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Organizational Goals</h1>
        <p className="text-sm text-zinc-400 mt-1">Hierarchical tree representation from Company objectives down to Agent tasks.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        {goals.map((goal) => (
          <div 
            key={goal.id}
            className="p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/5 border border-accent/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{goal.title}</h3>
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{goal.type} GOAL</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-medium">Alignment</span>
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-white font-semibold">{goal.progress}%</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Key Deliverables</span>
              <div className="space-y-2">
                {goal.subGoals.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#18181B]/50 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      {sub.status === "ACHIEVED" ? (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600" />
                      )}
                      <span className="text-xs text-zinc-300 font-medium">{sub.title}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-500 font-semibold uppercase">
                      {sub.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
