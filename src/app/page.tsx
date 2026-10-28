'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CycleSelector } from '@/components/CycleSelector';
import { CashflowDashboard } from '@/components/CashflowDashboard';
import { AccountsSection } from '@/components/AccountsSection';
import { DebtsSection } from '@/components/DebtsSection';
import { ExpensesSection } from '@/components/ExpensesSection';
import { AdvisorModal } from '@/components/AdvisorModal';
import { BottomNav, TabType } from '@/components/BottomNav';
import { Compass, Palmtree, Wrench, Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Top App Header */}
      <Navbar onOpenAdvisor={() => setIsAdvisorOpen(true)} />

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 pb-24 space-y-5 flex-1">
        {/* Priority Financial Goals Banner */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Palmtree className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="font-semibold text-zinc-200">Meta: Viaje Playa 18 Dic</p>
              <p className="text-[11px] text-zinc-400">Preservando fondo en Simple Earn</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="font-semibold text-zinc-300">Corsa al día</p>
              <p className="text-[10px] text-zinc-500">Mantenimiento</p>
            </div>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Tab-driven Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CycleSelector />
            <CashflowDashboard onOpenAdvisor={() => setIsAdvisorOpen(true)} />

            {/* Quick Glimpse of Accounts */}
            <div className="pt-2">
              <AccountsSection />
            </div>

            {/* Quick Glimpse of Debts */}
            <div className="pt-2">
              <DebtsSection />
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="animate-in fade-in duration-200">
            <AccountsSection />
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="animate-in fade-in duration-200">
            <DebtsSection />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="animate-in fade-in duration-200">
            <ExpensesSection />
          </div>
        )}
      </main>

      {/* Floating Gemini Advisor Modal */}
      <AdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />

      {/* Bottom Dock Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />
    </div>
  );
}
