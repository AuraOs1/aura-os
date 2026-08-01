"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Server, CheckCircle2, Building, Users, ShieldCheck, UserCheck, Power, Lock, ExternalLink } from "lucide-react";
import { getApiKeys, saveApiKeys, ApiKeys } from "@/lib/actions/keys";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"api" | "workspace" | "members">("api");
  const [keys, setKeys] = useState<ApiKeys>({
    geminiApiKey: "",
    openaiApiKey: "",
    anthropicApiKey: "",
    groqApiKey: "",
    ollamaEndpoint: "http://127.0.0.1:11434",
    googleClientId: "",
    googleClientSecret: "",
    githubClientId: "",
    githubClientSecret: "",
    metaAppId: "",
    metaAppSecret: "",
    googleConnected: false,
    githubConnected: false,
    metaConnected: false,
    youtubeConnected: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const [workspaceName, setWorkspaceName] = useState("Primary Workspace");
  const [workspaceRegion, setWorkspaceRegion] = useState("US East (N. Virginia)");

  const members = [
    { id: "1", name: "Chandan Swaraj", email: "chandanswaraj7482@gmail.com", role: "WORKSPACE OWNER", status: "Active" },
    { id: "2", name: "Sarah (CEO)", email: "sarah@aura.ai", role: "CEO AGENT", status: "Active" },
    { id: "3", name: "Alex (CTO)", email: "alex@aura.ai", role: "CTO AGENT", status: "Active" },
    { id: "4", name: "Elena (UI Designer)", email: "elena@aura.ai", role: "DESIGNER AGENT", status: "Active" },
  ];

  useEffect(() => {
    async function loadKeys() {
      try {
        const res = await getApiKeys();
        setKeys(res);
      } catch (err) {
        console.error("Failed to load settings keys:", err);
      } finally {
        setLoading(false);
      }
    }
    loadKeys();
  }, []);

  const handleSave = async (updatedKeys?: Partial<ApiKeys>) => {
    setSaving(true);
    setError("");
    setShowSuccess(false);
    try {
      const keysToSave = updatedKeys ? { ...keys, ...updatedKeys } : keys;
      const res = await saveApiKeys(keysToSave);
      if (res.success) {
        setKeys(keysToSave);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to save configuration settings.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartOAuth = (type: "google" | "github" | "meta") => {
    if (type === "google") {
      window.location.href = "/api/auth/oauth/google";
    } else if (type === "github") {
      window.location.href = "/api/auth/oauth/github";
    } else if (type === "meta") {
      window.location.href = "https://www.facebook.com/v18.0/dialog/oauth?client_id=aura_public_app&redirect_uri=" + encodeURIComponent(window.location.origin + "/settings");
    }
  };

  const handleDisconnect = async (type: "google" | "github" | "meta") => {
    const flagKey = `${type}Connected` as keyof ApiKeys;
    const updated = { [flagKey]: false };
    await handleSave(updated);
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

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 text-xs font-medium animate-pulse flex items-center gap-2">
          <Server className="w-4 h-4 animate-spin text-accent" />
          <span>Synchronizing System Configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-4xl select-none">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          System Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Configure credentials, model routing, OAuth Apps, and workspace preferences.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab("api")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "api"
                ? "text-white bg-white/5 border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            API Keys & Providers
          </button>
          <button 
            onClick={() => setActiveTab("workspace")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "workspace"
                ? "text-white bg-white/5 border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Workspace & OAuth Apps
          </button>
          <button 
            onClick={() => setActiveTab("members")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "members"
                ? "text-white bg-white/5 border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Members & Permissions
          </button>
        </div>

        {/* Configurations pane */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "api" && (
              <motion.div
                key="api"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-6"
              >
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-accent" />
                    <span>AI Providers API Keys</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Keys are stored locally in the secure workspace environment (`keys.json`).</p>
                </div>

                {showSuccess && (
                  <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>API Configuration Saved Successfully! Live model routing active.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">OpenAI API Key (ACTIVE)</label>
                    <input 
                      type="password" 
                      placeholder="sk-proj-..." 
                      value={keys.openaiApiKey}
                      onChange={(e) => setKeys({ ...keys, openaiApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                    />
                    <span className="text-[10px] text-emerald-400 font-medium">Live OpenAI API key configured. System heartbeats call real GPT-4o-mini completions.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Gemini API Key</label>
                    <input 
                      type="password" 
                      placeholder="Enter Gemini API Key..." 
                      value={keys.geminiApiKey}
                      onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Claude API Key (Anthropic)</label>
                    <input 
                      type="password" 
                      placeholder="Enter Anthropic API Key..." 
                      value={keys.anthropicApiKey}
                      onChange={(e) => setKeys({ ...keys, anthropicApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Groq API Key</label>
                    <input 
                      type="password" 
                      placeholder="Enter Groq API Key..." 
                      value={keys.groqApiKey}
                      onChange={(e) => setKeys({ ...keys, groqApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Ollama local Endpoint</label>
                    <input 
                      type="text" 
                      placeholder="http://127.0.0.1:11434" 
                      value={keys.ollamaEndpoint}
                      onChange={(e) => setKeys({ ...keys, ollamaEndpoint: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-end">
                  <button 
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save API Credentials"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-6"
              >
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-accent" />
                    <span>Workspace & OAuth Integration Apps</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Configure your official Developer OAuth Apps credentials to enable live accounts connections.</p>
                </div>

                {showSuccess && (
                  <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OAuth App Credentials Saved Successfully!</span>
                  </div>
                )}

                {/* OAuth Credentials Forms */}
                <div className="space-y-4 border-b border-white/5 pb-6">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-accent" />
                    <span>Developer OAuth App Credentials</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">Google OAuth Client ID</label>
                      <input 
                        type="text"
                        placeholder="...apps.googleusercontent.com"
                        value={keys.googleClientId || ""}
                        onChange={(e) => setKeys({ ...keys, googleClientId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">Google Client Secret</label>
                      <input 
                        type="password"
                        placeholder="GOCSPX-..."
                        value={keys.googleClientSecret || ""}
                        onChange={(e) => setKeys({ ...keys, googleClientSecret: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">GitHub OAuth Client ID</label>
                      <input 
                        type="text"
                        placeholder="e.g. Ov23rt..."
                        value={keys.githubClientId || ""}
                        onChange={(e) => setKeys({ ...keys, githubClientId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">GitHub Client Secret</label>
                      <input 
                        type="password"
                        placeholder="GitHub Client Secret"
                        value={keys.githubClientSecret || ""}
                        onChange={(e) => setKeys({ ...keys, githubClientSecret: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save App Credentials"}
                    </button>
                  </div>
                </div>

                {/* OAuth Active Integrations List */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Live OAuth Connections</h3>
                    <p className="text-xs text-zinc-500 mt-1">Initiate real OAuth 2.0 handshake with configured provider endpoints.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google OAuth Card */}
                    <div className="p-4 rounded-xl bg-[#18181B]/60 border border-white/5 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Google Workspace</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          keys.googleConnected 
                            ? "bg-success/15 border-success/30 text-success" 
                            : "bg-zinc-800/60 border-zinc-700 text-zinc-500"
                        }`}>
                          {keys.googleConnected ? "CONNECTED (LIVE TOKENS)" : "DISCONNECTED"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Gmail & Drive API access scopes for autonomous agent search.</p>
                      {keys.googleConnected ? (
                        <button 
                          onClick={() => handleDisconnect("google")}
                          className="w-full py-2 rounded-xl font-bold text-[10px] bg-zinc-800 text-white hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Power className="w-3 h-3" />
                          <span>Disconnect Google Account</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStartOAuth("google")}
                          className="w-full py-2 rounded-xl font-bold text-[10px] bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Initiate Google OAuth Handshake</span>
                        </button>
                      )}
                    </div>

                    {/* GitHub OAuth Card */}
                    <div className="p-4 rounded-xl bg-[#18181B]/60 border border-white/5 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">GitHub OAuth</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          keys.githubConnected 
                            ? "bg-success/15 border-success/30 text-success" 
                            : "bg-zinc-800/60 border-zinc-700 text-zinc-500"
                        }`}>
                          {keys.githubConnected ? "CONNECTED (LIVE TOKENS)" : "DISCONNECTED"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Repository write and workflow dispatch access scopes.</p>
                      {keys.githubConnected ? (
                        <button 
                          onClick={() => handleDisconnect("github")}
                          className="w-full py-2 rounded-xl font-bold text-[10px] bg-zinc-800 text-white hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Power className="w-3 h-3" />
                          <span>Disconnect GitHub Account</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStartOAuth("github")}
                          className="w-full py-2 rounded-xl font-bold text-[10px] bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Initiate GitHub OAuth Handshake</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "members" && (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-6"
              >
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span>Members & Permissions</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Manage active workspace users, permissions, and specialized AI employees.</p>
                </div>

                <div className="space-y-3.5">
                  {members.map((member) => (
                    <div 
                      key={member.id}
                      className="p-4 rounded-xl bg-[#18181B]/55 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          {member.id === "1" ? (
                            <ShieldCheck className="w-4 h-4 text-accent" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-semibold text-white leading-tight">{member.name}</h4>
                          <span className="text-[10px] text-zinc-500">{member.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-zinc-500 uppercase">
                          {member.role}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          <span className="text-[10px] text-zinc-400 font-semibold">{member.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
