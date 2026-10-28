'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Plus,
  X,
  AlertCircle,
  Smartphone,
  Scissors,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { DebtPlan } from '@/types';

export function DebtsSection() {
  const { debts, payDebtInstallment, unpayDebtInstallment, addDebt, deleteDebt } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [startDate, setStartDate] = useState('');
  const [frequency, setFrequency] = useState<'biweekly' | 'monthly_fixed_day'>('biweekly');
  const [notes, setNotes] = useState('');

  const getDebtIcon = (title: string) => {
    if (title.toLowerCase().includes('teléfono')) return <Smartphone className="w-4 h-4 text-sky-400" />;
    if (title.toLowerCase().includes('cricut')) return <Scissors className="w-4 h-4 text-purple-400" />;
    if (title.toLowerCase().includes('cashea')) return <ShoppingBag className="w-4 h-4 text-amber-400" />;
    return <CreditCard className="w-4 h-4 text-emerald-400" />;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(totalAmount);
    const inst = parseFloat(installmentAmount);
    const count = parseInt(totalInstallments, 10);
    if (!title || isNaN(tot) || isNaN(inst) || isNaN(count)) return;

    addDebt({
      title,
      total_amount: tot,
      installment_amount: inst,
      total_installments: count,
      start_date: startDate || new Date().toISOString().split('T')[0],
      frequency,
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setTotalAmount('');
    setInstallmentAmount('');
    setTotalInstallments('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Deudas & Cuotas a Finiquitar
          </h2>
          <p className="text-xs text-zinc-400">Créditos con saldo finito (Cashea, Cricut, Teléfono...)</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nueva Cuota</span>
        </button>
      </div>

      {/* Debt Cards */}
      <div className="space-y-3">
        {debts.map((debt) => {
          const progressPercent = Math.round((debt.installments_paid / (debt.total_installments || 1)) * 100);
          const remainingAmount = Math.max(0, debt.total_amount - (debt.installments_paid * debt.installment_amount));
          const isDone = debt.installments_paid >= debt.total_installments;

          return (
            <div
              key={debt.id}
              className={`border rounded-2xl p-4 transition-all ${
                isDone
                  ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {getDebtIcon(debt.title)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {debt.title}
                      {isDone && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          Finiquitada
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="font-mono text-zinc-300">
                        ${debt.installment_amount.toFixed(2)} / cuota
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {debt.frequency === 'biweekly' ? 'Quincenal' : `Día ${debt.fixed_day || 14} de cada mes`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-zinc-200">
                      ${remainingAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-500">Saldo pendiente</div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Estás seguro de que deseas eliminar "${debt.title}"?`)) {
                        deleteDebt(debt.id);
                      }
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors active:scale-95 ml-1"
                    title="Eliminar este compromiso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {debt.notes && (
                <p className="text-[11px] text-zinc-400 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60 mb-3">
                  {debt.notes}
                </p>
              )}

              {/* Progress and Installment Stepper */}
              <div className="mt-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">
                    Cuotas pagadas: <strong className="text-white font-mono">{debt.installments_paid}</strong> / {debt.total_installments}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">{progressPercent}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`h-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {Array.from({ length: debt.total_installments }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                          i < debt.installments_paid
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {debt.installments_paid > 0 && (
                      <button
                        onClick={() => unpayDebtInstallment(debt.id)}
                        className="px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-lg"
                      >
                        -1 Cuota
                      </button>
                    )}
                    {!isDone && (
                      <button
                        onClick={() => payDebtInstallment(debt.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Pagar Cuota (${debt.installment_amount.toFixed(2)})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Registrar Compromiso / Deuda
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
                <label className="text-xs text-zinc-400 block mb-1">Título del compromiso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cashea, Mantenimiento Corsa, etc."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Cuota ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="30.00"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Total Cuotas</label>
                  <input
                    type="number"
                    required
                    placeholder="4"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly_fixed_day">Mensual (Día fijo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Fecha de inicio / Primer vencimiento</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notas / Calendario</label>
                <input
                  type="text"
                  placeholder="Ej. Cuotas los 14 de cada mes..."
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
                  Guardar Compromiso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
