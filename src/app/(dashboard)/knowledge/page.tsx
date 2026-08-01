"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Plus, Sparkles, BookOpen, PenTool, CheckCircle2, ShieldAlert, Loader, X, Upload, Eye } from "lucide-react";
import { getBrandGuide, saveBrandGuide, BrandGuide } from "@/lib/actions/brand";
import { getKnowledgeArticles, saveKnowledgeArticle, KnowledgeArticle } from "@/lib/actions/knowledge";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<"wiki" | "brand">("wiki");
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for creating / pasting new articles
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"WIKI" | "MARKDOWN" | "API_DOC" | "PDF">("MARKDOWN");
  const [newContent, setNewContent] = useState("");

  const [guide, setGuide] = useState<BrandGuide>({
    mission: "",
    targetAudience: "",
    brandVoice: "",
    products: "",
    pricing: "",
    competitors: "",
    designColors: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [brandRes, articlesRes] = await Promise.all([
          getBrandGuide(),
          getKnowledgeArticles()
        ]);
        setGuide(brandRes);
        setArticles(articlesRes);
      } catch (err) {
        console.error("Failed to load knowledge base:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setShowSuccess(false);
    try {
      const res = await saveBrandGuide(guide);
      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to save Brand Guide.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please provide both a Title and Article Content.");
      return;
    }
    setSaving(true);
    try {
      const res = await saveKnowledgeArticle({
        title: newTitle,
        type: newType,
        content: newContent
      });

      if (res.success && res.article) {
        setArticles([res.article, ...articles]);
        setIsAddModalOpen(false);
        setNewTitle("");
        setNewContent("");
      } else {
        alert(res.error || "Failed to save article.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setNewContent(text);
      };
      reader.readAsText(file);
    }
  };

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Loader className="w-4 h-4 animate-spin text-accent" />
          <span>Opening Operational Knowledge Base...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 select-none max-w-4xl">
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Knowledge Base <Sparkles className="w-5 h-5 text-accent" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Autonomous articles, uploaded documentations and brand strategy assets.</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-6 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab("wiki")}
          className={`flex items-center gap-2 text-xs font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "wiki"
              ? "border-accent text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <BookOpen className="w-4 h-4 text-accent" />
          <span>Articles & Docs ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("brand")}
          className={`flex items-center gap-2 text-xs font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "brand"
              ? "border-accent text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PenTool className="w-4 h-4 text-accent" />
          <span>Brand Guide & Strategy</span>
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "wiki" ? (
          <motion.div
            key="wiki"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Bar & Upload Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search wiki articles & text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111113] border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/40"
                />
              </div>

              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload / Paste Document</span>
              </button>
            </div>

            {/* Grid of Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] hover:border-accent/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors line-clamp-1">{article.title}</h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Updated {article.updated}</p>
                      </div>
                    </div>

                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-zinc-400 uppercase">
                      {article.type}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 mt-4 text-left leading-relaxed">
                    {article.content.replace(/[#*`]/g, "")}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Brand Guide Form */
          <motion.div
            key="brand"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-6"
          >
            <div>
              <h2 className="text-base font-semibold text-white">Brand Strategy & Persona Wiki</h2>
              <p className="text-xs text-zinc-500 mt-1">This knowledge layer is injected into executive AI prompts (CEO/CTO) during autonomous heartbeats.</p>
            </div>

            {showSuccess && (
              <div className="p-3.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Brand Strategy Updated & Saved Successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveBrand} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Company Mission & Tagline</label>
                <textarea
                  rows={2}
                  value={guide.mission}
                  onChange={(e) => setGuide({ ...guide, mission: e.target.value })}
                  placeholder="e.g. ZenBudget empowers Gen Z entrepreneurs to automate corporate operations..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Target Audience</label>
                <input
                  type="text"
                  value={guide.targetAudience}
                  onChange={(e) => setGuide({ ...guide, targetAudience: e.target.value })}
                  placeholder="e.g. Founders, Gen Z, Tech Enthusiasts"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Brand Voice & Tone</label>
                <input
                  type="text"
                  value={guide.brandVoice}
                  onChange={(e) => setGuide({ ...guide, brandVoice: e.target.value })}
                  placeholder="e.g. Premium, Authoritative, Minimalist, Direct"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Brand Wiki"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-accent uppercase">
                    {selectedArticle.type}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedArticle.title}</h2>
                  <p className="text-[10px] text-zinc-500">Updated {selectedArticle.updated}</p>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#09090b]">
                {selectedArticle.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / PASTE ARTICLE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-5 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-accent" />
                    <span>Upload or Paste Markdown Knowledge Document</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Paste raw text / markdown content directly or upload a .md file.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddArticle} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZenBudget Gen Z Strategy Guide"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Document Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none focus:border-accent/40"
                    >
                      <option value="MARKDOWN">MARKDOWN (.md)</option>
                      <option value="WIKI">WIKI ARTICLE</option>
                      <option value="API_DOC">API DOC</option>
                      <option value="PDF">PDF TEXT</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Optionally Upload File</label>
                    <label className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-zinc-300 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-accent" />
                      <span>Select .md / .txt file</span>
                      <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Paste Text / Markdown Content Here</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Paste raw Markdown or plain text here... (e.g. # Target Audience \n ZenBudget targets Gen Z founders)"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 font-semibold text-xs hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Knowledge Article"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
