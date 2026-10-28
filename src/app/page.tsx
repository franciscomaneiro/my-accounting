'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CycleSelector } from '@/components/CycleSelector';
import { CashflowDashboard } from '@/components/CashflowDashboard';
import { AccountsSection } from '@/components/AccountsSection';
import { DebtsSection } from '@/components/DebtsSection';
import { ExpensesSection } from '@/components/ExpensesSection';
import { GoalsSection } from '@/components/GoalsSection';
import { AdvisorModal } from '@/components/AdvisorModal';
import { BottomNav, TabType } from '@/components/BottomNav';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Top App Header */}
      <Navbar onOpenAdvisor={() => setIsAdvisorOpen(true)} />

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 pb-24 space-y-5 flex-1">
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

        {activeTab === 'goals' && (
          <div className="animate-in fade-in duration-200">
            <GoalsSection />
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
