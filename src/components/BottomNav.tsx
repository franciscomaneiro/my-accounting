'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react';

export type TabType = 'dashboard' | 'accounts' | 'debts' | 'expenses';

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenAdvisor,
}: {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAdvisor: () => void;
}) {
  const tabs = [
    { id: 'dashboard', label: 'Quincena', icon: LayoutDashboard },
    { id: 'accounts', label: 'Cuentas', icon: Wallet },
    { id: 'debts', label: 'Deudas', icon: CreditCard },
    { id: 'expenses', label: 'Fijos', icon: Receipt },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800/80 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id as TabType)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1">{t.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Center/Side floating AI pill */}
        <button
          onClick={onOpenAdvisor}
          className="flex flex-col items-center justify-center flex-1 h-full text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all group"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 mt-1">Asesor IA</span>
        </button>
      </div>
    </nav>
  );
}
