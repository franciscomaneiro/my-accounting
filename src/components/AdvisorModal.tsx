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
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AdvisorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    accounts,
    activeCycle,
    activeCashflow,
  } = useFinance();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu Asesor Financiero Personal impulsado por **Gemini**.

Conozco tu ciclo actual de nómina a **$8,10/h**, tus saldos en Binance (Principal, Subcuenta Hogar blindada y Simple Earn), tus 3 cuotas de Cashea, Cricut y la financiación del teléfono.

¿Qué gasto o compromiso deseas que evaluemos hoy?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    '¿Me puedo comprar la Epson L3250 a $59 quincenales?',
    '¿Cuánto puedo aportar a la playa el 13 de noviembre?',
    '¿Cómo queda mi bolsillo si trabajo 70 horas en vez de 80?',
    '¿Puedo adelantar una cuota de Cashea hoy?',
  ];

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
          history: messages.slice(1), // omit intro
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
          content: `⚠️ Disculpa, hubo un inconveniente al consultar: ${err.message}. Por favor verifica tu clave GEMINI_API_KEY en .env.local`,
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
                Live
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Contexto en vivo: <strong className="text-emerald-400">${activeCashflow.freePocket.toFixed(2)}</strong> libre ($
              {activeCashflow.weeklyFreePocket.toFixed(2)}/sem)
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
        <span>Bolsillo Principal: <strong className="text-amber-300 font-mono">${accounts.find(a => a.id === 'acc-principal')?.current_balance.toFixed(2)}</strong></span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-black font-medium'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-md whitespace-pre-line'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-zinc-400 animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
            <span>Calculando impacto en flujo quincenal y margen libre...</span>
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
            placeholder="Pregunta o simula un gasto (ej. ¿Puedo asumir $40?)..."
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
