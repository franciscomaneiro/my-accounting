'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/lib/store';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingDown,
  Clock,
  HelpCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Receipt,
  Target,
  ArrowRightLeft,
  DollarSign,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionPayload {
  entity: 'gasto' | 'deuda' | 'fijo' | 'meta' | 'transferencia';
  title: string;
  summary: string;
  data: any;
}

export function AdvisorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    accounts,
    activeCycle,
    activeCashflow,
    addTransaction,
    updateAccountBalance,
    addDebt,
    addExpense,
    goals,
    addGoal,
    updateGoalAmount,
    transferFunds,
  } = useFinance();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu Asesor Financiero Personal con **Gemini**.

Conozco tu ciclo a **$8,10/h**, tus saldos en Binance, deudas y metas.

Además de evaluar compras, **puedo crear y guardar registros directamente** para ti:
- *"Gasté $15 en gasolina en la Principal"* (crea un **Gasto**)
- *"Compré X en Cashea a $40 en 2 cuotas"* (crea una **Deuda**)
- *"Agrega un fijo de $25 para gimnasio"* (crea un **Gasto Fijo**)
- *"Aparté $30 para la playa"* (abona a una **Meta**)
- *"Pasa $82.50 a Hogar"* (hace una **Transferencia**)

¿Qué evaluamos o registramos hoy?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Gasté $15 de gasolina en la Principal, anótalo',
    'Compré $60 en Cashea a 3 cuotas, regístralo',
    'Aparté $30 para el viaje de la playa',
    'Pasa $82.50 a la Subcuenta Hogar',
  ];

  const parseMessageContent = (raw: string): { text: string; action: ActionPayload | null } => {
    const match = raw.match(/```action\s*([\s\S]*?)\s*```/);
    if (!match) return { text: raw, action: null };

    const text = raw.replace(/```action[\s\S]*?```/, '').trim();
    try {
      const action = JSON.parse(match[1]);
      return { text, action };
    } catch {
      return { text: raw, action: null };
    }
  };

  const handleExecuteAction = (action: ActionPayload, msgIndex: number) => {
    if (executedActions[msgIndex]) return;

    try {
      if (action.entity === 'gasto') {
        const { amount, account_id, description } = action.data;
        const targetAcc = accounts.find((a) => a.id === account_id) || accounts[0];
        const newBal = Math.max(0, targetAcc.current_balance - amount);
        updateAccountBalance(targetAcc.id, newBal);
        addTransaction({
          account_id: targetAcc.id,
          amount,
          description: description || action.title,
          type: 'expense',
          category: 'Gasto / Asesor IA',
          is_settled: true,
        });
      } else if (action.entity === 'deuda') {
        const { title, total_amount, installment_amount, total_installments, frequency, notes } = action.data;
        addDebt({
          title: title || action.title,
          total_amount: Number(total_amount),
          installment_amount: Number(installment_amount),
          total_installments: Number(total_installments),
          frequency: frequency || 'biweekly',
          start_date: new Date().toISOString().split('T')[0],
          notes: notes || 'Registrado por Asesor IA',
        });
      } else if (action.entity === 'fijo') {
        const { name, default_amount, periodicity } = action.data;
        addExpense({
          name: name || action.title,
          default_amount: Number(default_amount),
          periodicity: periodicity || 'biweekly',
          target_account_id: 'acc-principal',
          is_active: true,
        });
      } else if (action.entity === 'meta') {
        const { goal_id, amount_to_add, title, target_amount } = action.data;
        if (goal_id) {
          const g = goals.find((item) => item.id === goal_id);
          if (g) {
            updateGoalAmount(g.id, g.current_amount + (Number(amount_to_add) || 0));
          }
        } else if (title && target_amount) {
          addGoal({
            title,
            target_amount: Number(target_amount),
            current_amount: Number(amount_to_add) || 0,
            category: 'custom',
          });
        }
      } else if (action.entity === 'transferencia') {
        const { from_account_id, to_account_id, amount, note } = action.data;
        transferFunds(from_account_id || 'acc-principal', to_account_id || 'acc-hogar', Number(amount), note);
      }

      setExecutedActions((prev) => ({ ...prev, [msgIndex]: true }));
    } catch (e: any) {
      alert('Error ejecutando la acción: ' + e.message);
    }
  };

  const getEntityBadge = (entity: ActionPayload['entity']) => {
    switch (entity) {
      case 'gasto':
        return { label: 'GASTO', icon: DollarSign, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'deuda':
        return { label: 'DEUDA / FINANCIAMIENTO', icon: CreditCard, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'fijo':
        return { label: 'GASTO FIJO', icon: Receipt, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'meta':
        return { label: 'META DE AHORRO', icon: Target, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'transferencia':
        return { label: 'TRANSFERENCIA', icon: ArrowRightLeft, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const principalAcc = accounts.find((a) => a.id === 'acc-principal');
      const hogarAcc = accounts.find((a) => a.id === 'acc-hogar');
      const earnAcc = accounts.find((a) => a.id === 'acc-earn');

      const liveContext = {
        activeCycleDate: activeCycle?.cycle_date || '2026-10-30',
        hoursWorked: activeCycle?.hours_worked || 56,
        grossIncome: activeCashflow.grossIncome,
        fixedExpenses: activeCashflow.fixedExpensesTotal,
        debtInstallments: activeCashflow.debtInstallmentsTotal,
        freePocket: activeCashflow.freePocket,
        weeklyPocket: activeCashflow.weeklyFreePocket,
        safetyStatus: activeCashflow.safetyStatus,
        principalBalance: principalAcc?.current_balance || 75.28,
        hogarBalance: hogarAcc?.current_balance || 167.50,
        earnBalance: earnAcc?.current_balance || 308.93,
      };

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: liveContext,
          history: messages.slice(1),
        }),
      });

      if (!res.ok) {
        throw new Error('Error de conexión con el asesor');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'No obtuve respuesta del asesor.',
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Hubo un inconveniente al consultar: ${err.message}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-xl animate-in fade-in">
      {/* Top Header */}
      <div className="pt-safe border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-black font-bold">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Asesor Financiero Gemini
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono border border-emerald-500/30">
                Acciones Activas
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Crea gastos, deudas, metas y transferencias conversando
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Financial Snapshot Bar */}
      <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400 overflow-x-auto whitespace-nowrap">
        <span>Subcuenta Hogar: <strong className="text-zinc-200 font-mono">${accounts.find(a => a.id === 'acc-hogar')?.current_balance.toFixed(2)}</strong></span>
        <span>·</span>
        <span>Simple Earn (Playa): <strong className="text-indigo-300 font-mono">${accounts.find(a => a.id === 'acc-earn')?.current_balance.toFixed(2)}</strong></span>
        <span>·</span>
        <span>Bolsillo: <strong className="text-emerald-400 font-mono">${activeCashflow.freePocket.toFixed(2)}</strong> (${activeCashflow.weeklyFreePocket.toFixed(2)}/sem)</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const { text, action } = parseMessageContent(m.content);
          const isExecuted = executedActions[idx];

          return (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div className="max-w-[88%] space-y-2.5">
                {/* Text Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-black font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-md whitespace-pre-line'
                  }`}
                >
                  {text}
                </div>

                {/* Interactive Entity Creation Card */}
                {action && (
                  <div className="bg-zinc-900 border-2 border-zinc-700/80 rounded-2xl p-3.5 shadow-xl space-y-2.5 animate-in zoom-in-95">
                    {(() => {
                      const badge = getEntityBadge(action.entity);
                      const Icon = badge.icon;
                      return (
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            Acción Propuesta
                          </span>
                        </div>
                      );
                    })()}

                    <div>
                      <h4 className="text-xs font-bold text-white">{action.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{action.summary}</p>
                    </div>

                    {/* Action Execution Button */}
                    <button
                      type="button"
                      disabled={isExecuted}
                      onClick={() => handleExecuteAction(action, idx)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isExecuted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      }`}
                    >
                      {isExecuted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>¡{action.entity.toUpperCase()} CREADO EXITOSAMENTE!</span>
                        </>
                      ) : (
                        <>
                          <span>Crear {action.entity.toUpperCase()}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-zinc-400 animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
            <span>Analizando impacto y preparando entidad...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/60 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            disabled={isLoading}
            onClick={() => handleSend(p)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-[11px] text-zinc-300 hover:text-emerald-300 active:scale-95 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 pb-safe bg-zinc-900/90 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dile a Gemini: 'Gasté $15...', 'Anota deuda...', 'Abona $20 a meta'..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
