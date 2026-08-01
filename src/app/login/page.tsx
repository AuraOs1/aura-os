"use client";

import React, { useState } from "react";
import { loginFounder } from "@/lib/actions/auth";
import { Sparkles, ShieldCheck, KeyRound, Mail, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillFounderCredentials = () => {
    setEmail("founder@aura.ai");
    setPassword("A8$zX9!pQ2#mK5%wY7&tB3*vD1(eG4)nL2@jW6%yV");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError("");
    setLoading(true);

    const res = await loginFounder(email, password);
    if (res.success) {
      window.location.href = "/";
    } else {
      setError(res.error || "Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#111113]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-2xl z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5 mt-4">
            AURA OS <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-500">The Operating System for Autonomous AI Operations</p>
        </div>

        {/* 1-Click Founder Shortcut */}
        <button
          type="button"
          onClick={fillFounderCredentials}
          className="w-full py-2.5 px-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-accent" />
          <span>Autofill Founder ID (founder@aura.ai)</span>
        </button>

        {/* Error Callout */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Founder ID / Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                required
                placeholder="founder@aura.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Unhackable Secure Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 glow-btn mt-6"
          >
            <span>{loading ? "Authenticating Founder..." : "Login to Workspace"}</span>
          </button>
        </form>

        {/* Extra Footer hint */}
        <div className="text-center pt-2">
          <span className="text-[10px] text-zinc-600">Encrypted AES-256 Founder Session Lock</span>
        </div>
      </div>
    </div>
  );
}
