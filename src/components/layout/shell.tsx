"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface ShellProps {
  children: React.ReactNode;
  initialCompanies: { id: string; name: string; tagline?: string | null; workspaceId: string }[];
}

export function Shell({ children, initialCompanies }: ShellProps) {
  const [companies] = useState(initialCompanies);
  const [activeCompany, setActiveCompany] = useState(companies[0] || { id: "", name: "No Company", tagline: "", workspaceId: "" });

  const handleSelectCompany = (id: string) => {
    const selected = companies.find(c => c.id === id);
    if (selected) {
      setActiveCompany(selected);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar navigation */}
      <Sidebar 
        companies={companies} 
        activeCompany={activeCompany} 
        onSelectCompany={handleSelectCompany}
      />

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow grid background effect */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none z-0" />

        {/* Top Header */}
        <Header 
          workspaceName="Production Workspace" 
          activeAgentsCount={4} 
          totalAgentsCount={25} 
        />

        {/* Children content area */}
        <main className="flex-1 overflow-y-auto z-10 relative">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
