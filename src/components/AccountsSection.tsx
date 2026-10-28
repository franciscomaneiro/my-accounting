'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Wallet,
  Home,
  PiggyBank,
  ArrowRightLeft,
  Edit2,
  Check,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function AccountsSection() {
  const { accounts, updateAccountBalance, transferFunds } = useFinance();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [tempBalance, setTempBalance] = useState<string>('');

  // Transfer form state
  const [fromAccountId, setFromAccountId] = useState('acc-principal');
  const [toAccountId, setToAccountId] = useState('acc-hogar');
  const [transferAmount, setTransferAmount] = useState('82.50');
  const [transferNote, setTransferNote] = useState('Reserva 50% Alquiler quincenal');

  const getAccountIcon = (name: string) => {
    if (name.includes('Hogar')) return <Home className="w-5 h-5 text-emerald-400" />;
    if (name.includes('Simple Earn')) return <PiggyBank className="w-5 h-5 text-indigo-400" />;
    return <Wallet className="w-5 h-5 text-amber-400" />;
  };

  const getCardBorder = (name: string) => {
    if (name.includes('Hogar')) return 'border-emerald-500/30 bg-emerald-950/10';
    if (name.includes('Simple Earn')) return 'border-indigo-500/30 bg-indigo-950/10';
    return 'border-amber-500/30 bg-amber-950/10';
  };

  const handleStartEdit = (accId: string, currentVal: number) => {
    setEditingAccountId(accId);
    setTempBalance(currentVal.toString());
  };

  const handleSaveBalance = (accId: string) => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val)) {
      updateAccountBalance(accId, val);
    }
    setEditingAccountId(null);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount > 0 && fromAccountId !== toAccountId) {
      transferFunds(fromAccountId, toAccountId, amount, transferNote);
      setIsTransferModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Cuentas & Fondos en Binance
          </h2>
          <p className="text-xs text-zinc-400">Estructura multicuenta y reservas blindadas</p>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 active:scale-95 transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transferir</span>
        </button>
      </div>

      {/* Quick Action: Rent reserve button */}
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-emerald-300">Aporte Alquiler 50% ($82,50)</p>
            <p className="text-zinc-400 text-[11px]">Blindar de Binance Principal a Subcuenta Hogar</p>
          </div>
        </div>
        <button
          onClick={() => {
            transferFunds('acc-principal', 'acc-hogar', 82.50, 'Aporte Alquiler 50% (Blindado)');
            alert('¡$82.50 transferidos a Subcuenta Hogar exitosamente!');
          }}
          className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-lg active:scale-95 transition-all"
        >
          Enviar $82,50
        </button>
      </div>

      {/* Account Cards */}
      <div className="space-y-2.5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`border rounded-2xl p-4 transition-all ${getCardBorder(acc.name)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  {getAccountIcon(acc.name)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    {acc.name}
                    {acc.name.includes('Hogar') && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium">
                        Blindada
                      </span>
                    )}
                    {acc.name.includes('Simple Earn') && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                        Rendimiento + Playa
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{acc.purpose}</p>
                </div>
              </div>

              {/* Balance & Edit */}
              <div className="text-right">
                {editingAccountId === acc.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={tempBalance}
                      onChange={(e) => setTempBalance(e.target.value)}
                      className="w-24 bg-zinc-900 text-white font-mono text-sm px-2 py-1 rounded-lg border border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveBalance(acc.id)}
                      className="p-1 bg-emerald-500 text-black rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingAccountId(null)}
                      className="p-1 bg-zinc-800 text-zinc-400 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group">
                    <div>
                      <div className="text-lg font-mono font-bold text-white">
                        ${acc.current_balance.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{acc.currency}</span>
                    </div>
                    <button
                      onClick={() => handleStartEdit(acc.id, acc.current_balance)}
                      className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                      title="Ajustar saldo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                Transferir entre Fondos
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Cuenta Origen</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (${a.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Cuenta Destino</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                      {a.name} (${a.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Monto (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nota o Concepto</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="Ej. Blindar Alquiler, Ahorro Playa..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
