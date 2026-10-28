'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/lib/store';
import {
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Plus,
  Minus,
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
  const hours = currentCycle.hours_worked || 0;

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Glow decorativo sutil */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Caja de la Quincena + Selector de Quincena */}
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

        {/* Dropdown discreto para alternar quincenas */}
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
                Elegir quincena
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

      {/* Hero Card: Próximo cobro y monto resultante */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 mb-4">
        {/* Fila 1: Fecha a la izquierda y días restantes a la derecha (sin colisiones) */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Próximo cobro: <strong className="text-zinc-100">{formatDateHuman(currentCycle.cycle_date)}</strong></span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            {getDaysDiff(currentCycle.cycle_date)}
          </span>
        </div>

        {/* Fila 2: Monto en grande y tarifa fija */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5">
            ${currentCycle.gross_income.toFixed(2)}
            <span className="text-xs font-normal text-zinc-400 font-sans">USDT</span>
          </div>

          <div className="text-right text-xs font-mono text-zinc-400">
            Tarifa: <span className="text-zinc-200 font-semibold">$8,10 / h</span>
          </div>
        </div>
      </div>

      {/* Control simple y limpio de horas: Stepper + Slider */}
      <div className="space-y-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-300 font-medium">
            Horas trabajadas:
          </label>

          {/* Stepper con campo numérico editable */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-700/80 rounded-xl p-1">
            <button
              type="button"
              onClick={() => updateCycleHours(currentCycle.id, Math.max(0, hours - 1))}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95"
              title="Restar 1 hora"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-baseline px-2">
              <input
                type="number"
                min="0"
                max="200"
                step="0.5"
                value={hours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateCycleHours(currentCycle.id, isNaN(val) ? 0 : val);
                }}
                className="w-14 bg-transparent text-center font-mono font-bold text-emerald-400 text-sm focus:outline-none focus:ring-0"
              />
              <span className="text-[11px] text-zinc-500 font-mono">hrs</span>
            </div>

            <button
              type="button"
              onClick={() => updateCycleHours(currentCycle.id, hours + 1)}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors active:scale-95"
              title="Sumar 1 hora"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Deslizador fluido */}
        <input
          type="range"
          min="0"
          max="150"
          step="0.5"
          value={hours}
          onChange={(e) => updateCycleHours(currentCycle.id, parseFloat(e.target.value) || 0)}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </div>
  );
}
