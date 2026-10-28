'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Home,
  ShoppingCart,
  Wifi,
  Fuel,
  Cat,
  Sparkles,
  Receipt,
  Plus,
  Check,
  Edit2,
  X,
} from 'lucide-react';

export function ExpensesSection() {
  const { expenses, toggleExpense, updateExpenseAmount, addExpense } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const getExpenseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('alquiler')) return <Home className="w-4 h-4 text-emerald-400" />;
    if (n.includes('mercado') || n.includes('comida')) return <ShoppingCart className="w-4 h-4 text-amber-400" />;
    if (n.includes('servicio') || n.includes('internet')) return <Wifi className="w-4 h-4 text-sky-400" />;
    if (n.includes('gasolina') || n.includes('corsa')) return <Fuel className="w-4 h-4 text-rose-400" />;
    if (n.includes('gato')) return <Cat className="w-4 h-4 text-orange-400" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  const handleStartEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setTempAmount(currentAmount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(tempAmount);
    if (!isNaN(val) && val >= 0) {
      updateExpenseAmount(id, val);
    }
    setEditingId(null);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (!newName || isNaN(val)) return;

    addExpense({
      name: newName,
      default_amount: val,
      periodicity: 'biweekly',
      target_account_id: 'acc-principal',
      is_active: true,
    });

    setIsAddOpen(false);
    setNewName('');
    setNewAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Gastos Fijos Quincenales
          </h2>
          <p className="text-xs text-zinc-400">Compromisos ineludibles por ciclo de nómina</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-2">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className={`border rounded-xl p-3 flex items-center justify-between transition-all ${
              exp.is_active
                ? 'bg-zinc-900/80 border-zinc-800'
                : 'bg-zinc-950/40 border-zinc-800/40 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleExpense(exp.id)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  exp.is_active
                    ? 'bg-emerald-500 border-emerald-500 text-black'
                    : 'border-zinc-700 bg-zinc-800 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>

              <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                {getExpenseIcon(exp.name)}
              </div>

              <div>
                <p className="text-xs font-medium text-white flex items-center gap-1.5">
                  {exp.name}
                  {exp.starts_at && (
                    <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      Desde {exp.starts_at}
                    </span>
                  )}
                </p>
                {exp.note && <p className="text-[10px] text-zinc-400">{exp.note}</p>}
              </div>
            </div>

            {/* Amount & Edit */}
            <div>
              {editingId === exp.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)}
                    className="w-16 bg-zinc-950 text-white font-mono text-xs px-1.5 py-1 rounded border border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveEdit(exp.id)}
                    className="p-1 bg-emerald-500 text-black rounded"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 bg-zinc-800 text-zinc-400 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    ${exp.default_amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleStartEdit(exp.id, exp.default_amount)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xs p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Nuevo Gasto Fijo Quincenal</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gimnasio, Seguro..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Monto por quincena ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="20.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-semibold bg-emerald-500 text-black rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
