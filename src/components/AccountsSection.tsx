'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/store';
import {
  Wallet,
  Home,
  PiggyBank,
  ArrowRightLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  ShieldCheck,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { Account, Transaction } from '@/types';

export function AccountsSection() {
  const { accounts, updateAccountBalance, transferFunds, transactions, addTransaction } = useFinance();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // New movement state inside account detail
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  const [movementType, setMovementType] = useState<'income' | 'expense'>('income');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementDescription, setMovementDescription] = useState('');

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
    if (name.includes('Hogar')) return 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50';
    if (name.includes('Simple Earn')) return 'border-indigo-500/30 bg-indigo-950/10 hover:border-indigo-500/50';
    return 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50';
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount > 0 && fromAccountId !== toAccountId) {
      transferFunds(fromAccountId, toAccountId, amount, transferNote);
      setIsTransferModalOpen(false);
    }
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0 || !movementDescription.trim()) return;

    const newBalance =
      movementType === 'income'
        ? selectedAccount.current_balance + amount
        : Math.max(0, selectedAccount.current_balance - amount);

    updateAccountBalance(selectedAccount.id, newBalance);

    addTransaction({
      account_id: selectedAccount.id,
      amount,
      description: movementDescription.trim(),
      type: movementType,
      category: movementType === 'income' ? 'Ingreso / Ajuste' : 'Gasto / Ajuste',
      is_settled: true,
    });

    // Update local modal state
    setSelectedAccount({
      ...selectedAccount,
      current_balance: newBalance,
      updated_at: new Date().toISOString(),
    });

    setIsAddingMovement(false);
    setMovementAmount('');
    setMovementDescription('');
  };

  // Filter transactions for selected account
  const accountTransactions = selectedAccount
    ? transactions.filter(
        (t) => t.account_id === selectedAccount.id || t.to_account_id === selectedAccount.id
      )
    : [];

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Cuentas & Fondos en Binance
          </h2>
          <p className="text-xs text-zinc-400">Toca una cuenta para ver su historial y movimientos</p>
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

      {/* Account Cards (Tappable to see history and register movements) */}
      <div className="space-y-2.5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => {
              setSelectedAccount(acc);
              setIsAddingMovement(false);
            }}
            className={`border rounded-2xl p-4 transition-all cursor-pointer active:scale-[0.99] group ${getCardBorder(
              acc.name
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
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
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-1">
                    {acc.purpose}
                  </p>
                </div>
              </div>

              {/* Balance & Arrow */}
              <div className="flex items-center gap-2 pl-2">
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white">
                    ${acc.current_balance.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">USDT</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Detail & Movement History Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  {getAccountIcon(selectedAccount.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedAccount.name}</h3>
                  <div className="text-xl font-extrabold font-mono text-emerald-400">
                    ${selectedAccount.current_balance.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-zinc-400">USDT</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Purpose */}
            <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/60 text-[11px] text-zinc-400">
              {selectedAccount.purpose}
            </div>

            {/* Body: Form or History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Toggle Add Movement Button */}
              {!isAddingMovement ? (
                <button
                  type="button"
                  onClick={() => setIsAddingMovement(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registrar Movimiento / Ajuste con motivo</span>
                </button>
              ) : (
                /* Add Movement Form */
                <form
                  onSubmit={handleSaveMovement}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                    <span className="text-xs font-bold text-zinc-200">Nuevo Movimiento</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMovement(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Type Selector: Ingreso vs Egreso */}
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-900 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMovementType('income')}
                      className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                        movementType === 'income'
                          ? 'bg-emerald-500 text-black shadow'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ingreso (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovementType('expense')}
                      className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                        movementType === 'expense'
                          ? 'bg-rose-500 text-white shadow'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                      <span>Gasto / Retiro (-)</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Monto (USDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={movementAmount}
                      onChange={(e) => setMovementAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Concepto o Motivo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rendimiento Earn, Gasolina extra, Ajuste..."
                      value={movementDescription}
                      onChange={(e) => setMovementDescription(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    Guardar en Historial
                  </button>
                </form>
              )}

              {/* Transactions List */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-2">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Historial Reciente de la Cuenta</span>
                </div>

                {accountTransactions.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                    No hay movimientos registrados recientemente.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {accountTransactions.map((tx) => {
                      const isIncoming =
                        tx.type === 'income' || tx.to_account_id === selectedAccount.id;
                      return (
                        <div
                          key={tx.id}
                          className="bg-zinc-950/60 border border-zinc-800/70 rounded-xl p-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isIncoming
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {isIncoming ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-200">{tx.description}</p>
                              <p className="text-[10px] text-zinc-500">{formatDate(tx.created_at)}</p>
                            </div>
                          </div>

                          <div
                            className={`font-mono font-bold text-xs ${
                              isIncoming ? 'text-emerald-400' : 'text-zinc-200'
                            }`}
                          >
                            {isIncoming ? '+' : '-'}${tx.amount.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
