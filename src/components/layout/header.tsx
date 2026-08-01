"use client";

import React from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  workspaceName?: string;
  activeAgentsCount?: number;
  totalAgentsCount?: number;
}

export function Header({ workspaceName = "Primary Workspace", activeAgentsCount = 0, totalAgentsCount = 0 }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const notifications = [
    { id: 1, agent: "Sarah (CEO)", message: "Dispatched new sprint goals to the engineering division.", time: "2 min ago" },
    { id: 2, agent: "Alex (CTO)", message: "Prisma schema optimization completed successfully.", time: "10 min ago" },
    { id: 3, agent: "Elena (UI Designer)", message: "Published new Framer motion variables.", time: "25 min ago" },
    { id: 4, agent: "Julian (DevOps)", message: "Local Docker daemon connection established.", time: "1 hour ago" },
  ];

  React.useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 relative">
      {/* Left side: Workspace & Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspace</span>
        <span className="text-xs text-zinc-500">/</span>
        <span className="text-sm font-medium text-white">{workspaceName}</span>
      </div>

      {/* Right side: Search, Status, Notification */}
      <div className="flex items-center gap-4">
        {/* Global Search trigger bar */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111113] hover:bg-[#18181B] border border-[rgba(255,255,255,0.04)] text-xs text-zinc-500 transition-all select-none w-48 cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="bg-white/5 border border-white/10 rounded px-1 text-[9px] font-mono text-zinc-400">⌘K</kbd>
        </button>

        {/* Live heartbeat indicator widget */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-accent/5 border border-accent/20 text-accent text-xs font-medium select-none">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </div>
          <span>{activeAgentsCount}/{totalAgentsCount} Agents Awake</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 border-l border-[rgba(255,255,255,0.08)] pl-4 relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-8 w-80 p-2 z-50 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] shadow-2xl space-y-1.5 top-5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/5">
                    <span className="text-xs font-bold text-white">Agent Operations Activity</span>
                    <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Live</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-left space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-accent">{n.agent}</span>
                          <span className="text-[9px] text-zinc-500 font-medium">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-zinc-300 leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {mounted && (
            <button 
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
