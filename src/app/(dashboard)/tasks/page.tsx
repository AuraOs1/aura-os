"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, User, Layers, AlertCircle, Trash2, ArrowRight } from "lucide-react";
import { getAgents } from "@/lib/actions/agents";
import { createTask, updateTaskStatus, getTasks, deleteTask, dispatchFounderInstruction } from "@/lib/actions/tasks";

interface Agent {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  createdAt: Date | string;
  agentId: string | null;
  agent: Agent | null;
  dependencies: { id: string; title: string }[];
  dependents: { id: string; title: string }[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("NO_PRIORITY");
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = "default-company-id";

  const [founderPrompt, setFounderPrompt] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderPrompt.trim()) return;
    setDispatching(true);
    const result = await dispatchFounderInstruction(companyId, founderPrompt);
    setDispatching(false);
    if (result.success) {
      setFounderPrompt("");
      loadData();
    } else {
      alert(result.error || "Failed to dispatch strategy instruction.");
    }
  };

  const loadData = async () => {
    const [tasksRes, agentsRes] = await Promise.all([
      getTasks(companyId),
      getAgents(companyId),
    ]);

    if (tasksRes.success && tasksRes.tasks) {
      setTasks(tasksRes.tasks as unknown as Task[]);
    }
    if (agentsRes.success && agentsRes.agents) {
      setAgents(agentsRes.agents as Agent[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    const result = await createTask({
      companyId,
      title,
      description: description || undefined,
      priority,
      assigneeId: assignedAgentId || undefined,
    } as any);

    setIsSubmitting(false);
    if (result.success) {
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("NO_PRIORITY");
      setAssignedAgentId("");
      setDueDate("");
      setSelectedDependencies([]);
      loadData();
    } else {
      alert(result.error || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const result = await updateTaskStatus(taskId, newStatus as any);
    if (result.success) {
      loadData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const result = await deleteTask(taskId);
    if (result.success) {
      setSelectedTask(null);
      loadData();
    }
  };

  const columns = [
    { id: "BACKLOG", name: "Backlog", color: "text-zinc-500 border-zinc-500/20 bg-zinc-500/5" },
    { id: "TODO", name: "To Do", color: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
    { id: "IN_PROGRESS", name: "In Progress", color: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
    { id: "IN_REVIEW", name: "In Review", color: "text-purple-400 border-purple-400/20 bg-purple-400/5" },
    { id: "DONE", name: "Done", color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
    { id: "CANCELLED", name: "Cancelled", color: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
  ];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "URGENT": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "HIGH": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "MEDIUM": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "LOW": return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      default: return "text-zinc-500 bg-zinc-500/5 border-white/5";
    }
  };

  const toggleDependency = (id: string) => {
    setSelectedDependencies(prev => 
      prev.includes(id) ? prev.filter(depId => depId !== id) : [...prev, id]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 h-full flex flex-col">
      {/* Board Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Active Tasks Board</h1>
          <p className="text-sm text-zinc-400 mt-1">Stripe-style task scheduling. Assign dependency nodes and check AI backlog status.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all cursor-pointer glow-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </motion.div>

      {/* Founder Autonomous Strategy Console */}
      <motion.div 
        variants={itemVariants} 
        className="p-5 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-4"
      >
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Founder Strategy Dispatch Console
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">
            Instruct the active Zenbudget workforce. Write your high-level product plan (e.g. &ldquo;Draft social hook campaigns for new features, test code adapters, and verify logo branding outputs&rdquo;). The CEO AI will automatically analyze it, create tasks, and assign them to your 30-agent team.
          </p>
        </div>

        <form onSubmit={handleDispatch} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="Describe company roadmap strategy objective..."
            value={founderPrompt}
            onChange={(e) => setFounderPrompt(e.target.value)}
            disabled={dispatching}
            className="flex-1 px-4 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
          />
          <button
            type="submit"
            disabled={dispatching || !founderPrompt.trim()}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 glow-btn"
          >
            <span>{dispatching ? "AI Dispatching..." : "Dispatch Team"}</span>
          </button>
        </form>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500 text-xs">
          Syncing workforce tickets...
        </div>
      ) : (
        /* Board Columns */
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="flex flex-col rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.06)] p-4 min-h-[500px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${col.color.split(" ")[0]}`}>{col.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-semibold">{colTasks.length}</span>
                </div>

                {/* Column cards container */}
                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-4 rounded-xl bg-[#18181B] border border-white/5 hover:border-white/10 transition-all cursor-pointer space-y-3 group"
                    >
                      <h4 className="text-xs font-semibold text-white group-hover:text-accent transition-colors leading-normal">{task.title}</h4>
                      
                      {task.description && (
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      {/* Dependency indicators */}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded w-max font-medium">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Blocked ({task.dependencies.length})</span>
                        </div>
                      )}

                      {/* Card footer details */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                          {task.agent ? (
                            <>
                              <User className="w-2.5 h-2.5" />
                              <span className="text-zinc-400 font-medium">{task.agent.name}</span>
                            </>
                          ) : (
                            <span className="italic text-zinc-600">Unassigned</span>
                          )}
                        </div>

                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center py-10 border border-dashed border-white/[0.03] rounded-xl text-[10px] text-zinc-700 italic">
                      Empty Column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Ticket Create Dialog */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">Create New Task</h2>
              <p className="text-xs text-zinc-500 mb-6">Create operational task tokens for AI agents to schedule workflow execution.</p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Ticket Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Code database index migrations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none focus:border-accent/40"
                    >
                      <option value="BACKLOG">Backlog</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none focus:border-accent/40"
                    >
                      <option value="NO_PRIORITY">No Priority</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Assignee */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">AI Assignee</label>
                    <select
                      value={assignedAgentId}
                      onChange={(e) => setAssignedAgentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none focus:border-accent/40"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.role.replace("_", " ")})</option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>

                {/* Dependencies Checklist */}
                {tasks.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">Blocking Dependencies (Select blockages)</label>
                    <div className="max-h-24 overflow-y-auto p-2 bg-[#18181B] border border-white/5 rounded-xl space-y-1.5">
                      {tasks.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedDependencies.includes(t.id)}
                            onChange={() => toggleDependency(t.id)}
                            className="accent-white rounded bg-black"
                          />
                          <span className="line-clamp-1">{t.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-55"
                  >
                    {isSubmitting ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task detailed inspect modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="absolute inset-0" onClick={() => setSelectedTask(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-2xl bg-[#111113] border border-[rgba(255,255,255,0.08)] shadow-2xl relative my-8 z-10 space-y-6"
            >
              <button 
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority.replace("_", " ")} Priority
                </span>
                <h3 className="text-base font-bold text-white mt-3 leading-normal">{selectedTask.title}</h3>
              </div>

              {selectedTask.description && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Description</span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Dependency Chain Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blocked by */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Blocked By (Depends on)</span>
                  </span>
                  <div className="space-y-1.5">
                    {selectedTask.dependencies && selectedTask.dependencies.length > 0 ? (
                      selectedTask.dependencies.map(dep => (
                        <div key={dep.id} className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-white/[0.01] border border-white/5 p-2 rounded-lg leading-normal">
                          <ArrowRight className="w-3 h-3 text-amber-500" />
                          <span className="line-clamp-1">{dep.title}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic block">No blockages. Free to start.</span>
                    )}
                  </div>
                </div>

                {/* Blocking */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Blocking (Dependents)</span>
                  </span>
                  <div className="space-y-1.5">
                    {selectedTask.dependents && selectedTask.dependents.length > 0 ? (
                      selectedTask.dependents.map(dep => (
                        <div key={dep.id} className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-white/[0.01] border border-white/5 p-2 rounded-lg leading-normal">
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                          <span className="line-clamp-1">{dep.title}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic block">No blocking dependents.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings layout info */}
              <div className="grid grid-cols-2 gap-4 bg-[#18181B]/40 p-4 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">Assignee</span>
                  <span className="text-white font-medium mt-1 block flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                    {selectedTask.agent ? selectedTask.agent.name : "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">Due Date</span>
                  <span className="text-white font-medium mt-1 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
              </div>

              {/* Action controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDelete(selectedTask.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Ticket</span>
                </button>

                <div className="flex gap-2">
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#18181B] border border-white/5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
