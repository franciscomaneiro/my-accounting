'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Target,
  Palmtree,
  Wrench,
  Laptop,
  ShieldAlert,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react';
import { FinancialGoal } from '@/types';

export function GoalsSection() {
  const { goals, addGoal, updateGoalAmount, deleteGoal } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<FinancialGoal['category']>('trip');
  const [notes, setNotes] = useState('');

  const getGoalIcon = (cat: FinancialGoal['category'], title: string) => {
    const t = title.toLowerCase();
    if (cat === 'trip' || t.includes('playa') || t.includes('viaje')) {
      return <Palmtree className="w-4 h-4 text-indigo-400" />;
    }
    if (cat === 'car' || t.includes('corsa') || t.includes('carro')) {
      return <Wrench className="w-4 h-4 text-amber-400" />;
    }
    if (cat === 'tech' || t.includes('epson') || t.includes('impresora') || t.includes('teléfono')) {
      return <Laptop className="w-4 h-4 text-sky-400" />;
    }
    if (cat === 'emergency' || t.includes('fondo') || t.includes('emergencia')) {
      return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
    }
    return <Target className="w-4 h-4 text-purple-400" />;
  };

  const getDaysLeft = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Meta para hoy';
    if (diff > 0) return `En ${diff} días`;
    return 'Fecha cumplida';
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]}`;
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(initialAmount) || 0;
    if (!title || isNaN(target) || target <= 0) return;

    addGoal({
      title,
      target_amount: target,
      current_amount: initial,
      target_date: targetDate || undefined,
      category,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setTargetDate('');
    setNotes('');
  };

  const handleAddContribution = (goal: FinancialGoal) => {
    const add = parseFloat(contributionAmount);
    if (!isNaN(add) && add > 0) {
      updateGoalAmount(goal.id, goal.current_amount + add);
      setContributingGoalId(null);
      setContributionAmount('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Metas & Fondos de Ahorro
          </h2>
          <p className="text-xs text-zinc-400">Progreso hacia tus metas financieras</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* Global Progress Summary Card */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 font-medium">Progreso Global de Metas</span>
            <span className="font-mono text-emerald-400 font-bold">{overallPercent}%</span>
          </div>

          <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div
              style={{ width: `${Math.min(100, overallPercent)}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>
              Total Ahorrado: <strong className="text-white font-mono">${totalSaved.toFixed(2)}</strong>
            </span>
            <span>
              Objetivo: <strong className="text-zinc-300 font-mono">${totalTarget.toFixed(2)} USDT</strong>
            </span>
          </div>
        </div>
      )}

      {/* List of Goals */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current_amount / (goal.target_amount || 1)) * 100));
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const isDone = goal.current_amount >= goal.target_amount;
          const daysInfo = getDaysLeft(goal.target_date);

          return (
            <div
              key={goal.id}
              className={`border rounded-2xl p-4 transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {getGoalIcon(goal.category, goal.title)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {goal.title}
                      {isDone && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-medium">
                          ¡Completada! 🎉
                        </span>
                      )}
                    </h3>
                    {goal.target_date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>Fecha: {formatDateDisplay(goal.target_date)}</span>
                        {daysInfo && (
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 rounded border border-indigo-500/20">
                            {daysInfo}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar la meta "${goal.title}"?`)) {
                      deleteGoal(goal.id);
                    }
                  }}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors active:scale-95"
                  title="Eliminar meta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {goal.notes && (
                <p className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/60 mb-3">
                  {goal.notes}
                </p>
              )}

              {/* Progress & Target numbers */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-zinc-400">
                    Acumulado: <strong className="text-emerald-400 font-mono">${goal.current_amount.toFixed(2)}</strong> / ${goal.target_amount.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-300">{percent}%</span>
                </div>

                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                  <span>{isDone ? 'Objetivo alcanzado' : `Faltan $${remaining.toFixed(2)} USDT`}</span>
                  <span>{goal.target_amount.toFixed(0)} USDT total</span>
                </div>
              </div>

              {/* Action buttons: Aportar a la meta */}
              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                {contributingGoalId === goal.id ? (
                  <div className="flex items-center gap-1.5 w-full animate-in fade-in">
                    <input
                      type="number"
                      step="1"
                      placeholder="Monto a sumar ($)"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddContribution(goal)}
                      className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-semibold rounded-xl active:scale-95"
                    >
                      Sumar
                    </button>
                    <button
                      type="button"
                      onClick={() => setContributingGoalId(null)}
                      className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-zinc-400">
                      {isDone ? 'Meta completada con éxito' : 'Abonar a esta meta:'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setContributingGoalId(goal.id);
                        setContributionAmount('');
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Aportar Progreso</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nueva Meta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Crear Nueva Meta
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre de la Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Viaje Playa, Repuestos Corsa, etc."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Monto Objetivo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="400.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Monto Inicial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="trip">Viaje / Ocio</option>
                    <option value="car">Vehículo / Corsa</option>
                    <option value="emergency">Emergencia / Reserva</option>
                    <option value="tech">Tecnología / Compra</option>
                    <option value="custom">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notas / Objetivo</label>
                <input
                  type="text"
                  placeholder="Ej. Resguardar en Simple Earn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
