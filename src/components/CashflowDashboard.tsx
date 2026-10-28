'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function CashflowDashboard({ onOpenAdvisor }: { onOpenAdvisor: () => void }) {
  const { activeCashflow } = useFinance();
  const {
    grossIncome,
    fixedExpensesTotal,
    debtInstallmentsTotal,
    freePocket,
    weeklyFreePocket,
    safetyStatus,
  } = activeCashflow;

  const getSafetyBadge = () => {
    switch (safetyStatus) {
      case 'safe':
        return {
          label: 'Margen Seguro (> $40/sem)',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          description: 'Flujo holgado. Puedes aportar a la reserva de la playa o resguardar liquidez.',
        };
      case 'warning':
        return {
          label: 'Alerta de Bolsillo ($30 - $40/sem)',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          description: 'Cerca del umbral de seguridad. No asumas nuevos gastos hormiga ni compras a crédito.',
        };
      case 'danger':
        return {
          label: 'Asfixia Financiera (< $25/sem)',
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          description: 'Bolsillo crítico. Riesgo de no cubrir emergencias del Corsa o la inicial del teléfono.',
        };
    }
  };

  const safety = getSafetyBadge();

  return (
    <div className="space-y-4">
      {/* Pocket & Safety Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Remanente Libre (&ldquo;Bolsillo&rdquo;)
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${safety.badgeClass}`}>
            {safety.icon}
            {safety.label}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
              ${freePocket.toFixed(2)}
              <span className="text-sm font-normal text-zinc-400 ml-1">USDT</span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Equivale a <strong className="text-emerald-400 font-mono">${weeklyFreePocket.toFixed(2)}</strong> por semana
            </div>
          </div>

          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-black text-xs font-semibold shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar IA</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400/90 mt-3 pt-3 border-t border-zinc-800/80">
          {safety.description}
        </p>
      </div>

      {/* 3 Key Metric Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingreso Bruto</span>
          </div>
          <div className="text-base font-bold font-mono text-zinc-100">
            ${grossIncome.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Nómina 14 días</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Gastos Fijos</span>
          </div>
          <div className="text-base font-bold font-mono text-amber-400">
            -${fixedExpensesTotal.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Alquiler, Mercado...</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            <span>Cuotas Deuda</span>
          </div>
          <div className="text-base font-bold font-mono text-rose-400">
            -${debtInstallmentsTotal.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Cashea, Cricut...</div>
        </div>
      </div>

      {/* Visual Cashflow Distribution Bar */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-zinc-400 font-medium">Distribución del Ingreso Quincenal</span>
          <span className="text-zinc-300 font-mono text-[11px]">
            {Math.round(((fixedExpensesTotal + debtInstallmentsTotal) / (grossIncome || 1)) * 100)}% Comprometido
          </span>
        </div>

        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, (fixedExpensesTotal / (grossIncome || 1)) * 100)}%` }}
            className="bg-amber-500/80 h-full"
            title={`Gastos Fijos: $${fixedExpensesTotal}`}
          />
          <div
            style={{ width: `${Math.min(100, (debtInstallmentsTotal / (grossIncome || 1)) * 100)}%` }}
            className="bg-rose-500/80 h-full"
            title={`Deudas: $${debtInstallmentsTotal}`}
          />
          <div
            style={{ width: `${Math.max(0, (freePocket / (grossIncome || 1)) * 100)}%` }}
            className="bg-emerald-500 h-full"
            title={`Bolsillo Libre: $${freePocket}`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-1 border-t border-zinc-800/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Fijos ($
            {fixedExpensesTotal.toFixed(0)})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Deudas ($
            {debtInstallmentsTotal.toFixed(0)})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Libre ($
            {freePocket.toFixed(0)})
          </span>
        </div>
      </div>
    </div>
  );
}
