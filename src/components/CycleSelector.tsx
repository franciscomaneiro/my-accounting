'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/lib/store';
import {
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export function CycleSelector() {
  const { cycles, activeCycleId, setActiveCycleId, updateCycleHours, activeCycle } = useFinance();
  const [mounted, setMounted] = useState(false);
  const [isProjectionOpen, setIsProjectionOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDaysDiff = (dateStr: string) => {
    if (!mounted) return 'Calculando...';
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy es día de cobro';
    if (diffDays === 1) return 'Cobras mañana';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Cobro liquidado`;
  };

  const formatDateHuman = (dateStr: string) => {
    const parts = dateStr.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const month = months[parseInt(parts[1], 10) - 1];
    return `${parseInt(parts[2], 10)} de ${month}`;
  };

  const currentCycle = activeCycle || cycles[0];

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Glow decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Caja de la Quincena + Selector discreto para proyectar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-300">
              Caja de la Quincena
            </h2>
            <p className="text-[11px] text-zinc-400">
              Presupuesto operativo del ciclo
            </p>
          </div>
        </div>

        {/* Proyectar otra quincena (Dropdown discreto sin saturar la pantalla) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectionOpen(!isProjectionOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700/60 active:scale-95 transition-all"
          >
            <span>{currentCycle.cycle_date === '2026-10-30' ? 'Cobro Actual' : formatDateHuman(currentCycle.cycle_date)}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isProjectionOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-30 animate-in fade-in">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2 py-1">
                Elegir quincena a gestionar
              </div>
              {cycles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCycleId(c.id);
                    setIsProjectionOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                    c.id === activeCycleId
                      ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                      : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{formatDateHuman(c.cycle_date)}</span>
                    <span className="text-[10px] text-zinc-500">{c.hours_worked}h · ${c.gross_income.toFixed(2)}</span>
                  </div>
                  {c.id === activeCycleId && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Hero: Monto exacto que entra en la caja este cobro */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 mb-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Próximo cobro: <strong className="text-zinc-200">{formatDateHuman(currentCycle.cycle_date)}</strong></span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
              {getDaysDiff(currentCycle.cycle_date)}
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
            ${currentCycle.gross_income.toFixed(2)}
            <span className="text-sm font-normal text-zinc-400 ml-1.5 font-sans">USDT</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Ingreso bruto a transferir a tus cuentas para cubrir gastos y deudas
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
            $8,10 / h
          </span>
        </div>
      </div>

      {/* Control interactivo de horas trabajadas para este cobro */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">
            Horas liquidadas en esta quincena:
          </span>
          <span className="font-mono text-emerald-400 font-bold text-sm">
            {currentCycle.hours_worked} horas
          </span>
        </div>

        {/* Quick presets (56h vs 80h) + Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={currentCycle.hours_worked}
            onChange={(e) => updateCycleHours(currentCycle.id, parseFloat(e.target.value) || 0)}
            className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => updateCycleHours(currentCycle.id, 56)}
              className={`px-2.5 py-1 text-xs font-mono rounded-xl border transition-all ${
                currentCycle.hours_worked === 56
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              56h ($453,60)
            </button>
            <button
              type="button"
              onClick={() => updateCycleHours(currentCycle.id, 80)}
              className={`px-2.5 py-1 text-xs font-mono rounded-xl border transition-all ${
                currentCycle.hours_worked === 80
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              80h ($648,00)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
