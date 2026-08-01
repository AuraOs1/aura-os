"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createCompany } from "@/lib/actions/companies";
import { logoutFounder } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Bot,
  Target,
  CheckSquare,
  BookOpen,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  Plus,
  User,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  companies: { id: string; name: string; tagline?: string | null; workspaceId: string }[];
  activeCompany?: { id: string; name: string; tagline?: string | null; workspaceId: string };
  onSelectCompany?: (id: string) => void;
}

export function Sidebar({ companies, activeCompany, onSelectCompany }: SidebarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyTagline, setNewCompanyTagline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setIsSubmitting(true);
    const result = await createCompany({
      name: newCompanyName,
      tagline: newCompanyTagline || undefined,
      workspaceId: activeCompany?.workspaceId || "default-workspace-id",
    });
    setIsSubmitting(false);
    if (result.success) {
      setIsCreateCompanyOpen(false);
      setNewCompanyName("");
      setNewCompanyTagline("");
      window.location.reload();
    } else {
      alert(result.error || "Failed to create company");
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Agents", href: "/agents", icon: Bot },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[rgba(255,255,255,0.08)] bg-[#111113]/90 backdrop-blur-xl flex flex-col h-full z-30 select-none">
      {/* Brand Header & Company Selector */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] relative">
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between p-2 rounded-xl bg-[#18181B]/50 hover:bg-[#18181B] border border-[rgba(255,255,255,0.04)] cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white tracking-tight leading-none">
                {activeCompany?.name || "Select Company"}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-0.5 uppercase">
                {activeCompany?.tagline ? activeCompany.tagline.substring(0, 18) + "..." : "AURA OS Core"}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Company Selection Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-4 right-4 mt-2 p-1.5 z-50 rounded-xl bg-[#18181B] border border-[rgba(255,255,255,0.08)] shadow-2xl"
              >
                <div className="text-[10px] text-zinc-500 font-semibold px-2 py-1 uppercase tracking-wider">
                  My Companies
                </div>
                <div className="max-h-40 overflow-y-auto mt-1 space-y-0.5">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        onSelectCompany?.(company.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeCompany?.id === company.id
                          ? "bg-white/5 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{company.name}</span>
                      {activeCompany?.id === company.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[rgba(255,255,255,0.06)] mt-1.5 pt-1.5">
                  <button 
                    onClick={() => {
                      setIsCreateCompanyOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-accent hover:bg-accent/5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Company</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "text-white bg-white/5 border border-[rgba(255,255,255,0.04)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-accent' : 'text-zinc-400 group-hover:text-white'}`} />
              <span>{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-5 rounded-r bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section / Footer */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#09090b]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-none">Founder</span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-0.5 leading-none">aura@founder.ai</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const res = await logoutFounder();
              if (res.success) {
                window.location.href = "/login";
              } else {
                alert(res.error || "Logout failed");
              }
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreateCompanyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] shadow-2xl relative"
            >
              <h3 className="text-sm font-semibold text-white mb-1">Establish New AI Company</h3>
              <p className="text-[10px] text-zinc-500 mb-5 leading-normal">Create an autonomous agency company with its own department workflows and goals.</p>

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Labs"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Tagline (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Next-gen autonomous SaaS pipelines"
                    value={newCompanyTagline}
                    onChange={(e) => setNewCompanyTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateCompanyOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-55"
                  >
                    {isSubmitting ? "Creating..." : "Establish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
