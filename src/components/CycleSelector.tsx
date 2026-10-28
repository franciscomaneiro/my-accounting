'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export function CycleSelector() {
  const { cycles, activeCycleId, setActiveCycleId, updateCycleHours, activeCycle } = useFinance();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getDaysDiff = (dateStr: string) => {
    if (!mounted) return 'Calculando...';
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy es día de cobro';
    if (diffDays === 1) return 'Mañana cobras';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Pasó hace ${Math.abs(diffDays)} días`;
  };

  const formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = months[parseInt(parts[1], 10) - 1];
    return `${parts[2]} ${month}`;
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      {/* Horizontal Cycle Scroll */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ciclo Bi-semanal Activo (14 días)</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Tarifa: $8,10 / hora
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {cycles.map((c) => {
          const isSelected = c.id === activeCycleId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCycleId(c.id)}
              className={`flex-shrink-0 snap-start px-3 py-2 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-zinc-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/50 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {formatDateDisplay(c.cycle_date)}
                </span>
                {c.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] font-mono mt-0.5 text-zinc-400">
                {c.hours_worked}h · <span className="text-emerald-400">${c.gross_income.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Cycle Control & Hours Adjuster */}
      {activeCycle && (
        <div className="mt-3 pt-3 border-t border-zinc-800/70">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Cobro: <strong className="text-zinc-200">{activeCycle.cycle_date}</strong> ({getDaysDiff(activeCycle.cycle_date)})
            </span>
            <span className="text-[11px] text-zinc-400">
              Fórmula: <code className="text-zinc-300 font-mono">{activeCycle.hours_worked}h × $8,10</code>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400 font-medium">Horas trabajadas</span>
                <span className="font-mono text-emerald-400 font-semibold">{activeCycle.hours_worked} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={activeCycle.hours_worked}
                onChange={(e) => updateCycleHours(activeCycle.id, parseFloat(e.target.value) || 0)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateCycleHours(activeCycle.id, 56)}
                className={`px-2 py-1 text-xs font-mono rounded-lg border transition-all ${
                  activeCycle.hours_worked === 56
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
                title="56 horas (Cobro Octubre: $453,60)"
              >
                56h
              </button>
              <button
                type="button"
                onClick={() => updateCycleHours(activeCycle.id, 80)}
                className={`px-2 py-1 text-xs font-mono rounded-lg border transition-all ${
                  activeCycle.hours_worked === 80
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
                title="80 horas (Base estándar: $648,00)"
              >
                80h
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
