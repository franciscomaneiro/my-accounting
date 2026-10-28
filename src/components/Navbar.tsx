'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { Sparkles, RotateCcw, ShieldCheck, Wallet } from 'lucide-react';

export function Navbar({ onOpenAdvisor }: { onOpenAdvisor: () => void }) {
  const { totalLiquidBalance, resetAllData } = useFinance();

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 pt-safe">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-black font-bold shadow-sm shadow-emerald-500/20">
            <Wallet className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              Cashflow AI
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                14d
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Fondos Totales: <span className="font-mono font-medium text-zinc-200">${totalLiquidBalance.toFixed(2)} USDT</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Asesor</span> IA
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer datos al estado inicial de la especificación?')) {
                resetAllData();
              }
            }}
            title="Restablecer datos iniciales"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
