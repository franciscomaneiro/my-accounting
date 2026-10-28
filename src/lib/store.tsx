'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Account,
  PayrollCycle,
  ExpenseCategory,
  DebtPlan,
  Transaction,
  CashflowSummary,
} from '@/types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CYCLES,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_DEBTS,
  INITIAL_TRANSACTIONS,
} from './seed-data';
import { supabase, isSupabaseConfigured } from './supabase';

interface FinanceContextType {
  accounts: Account[];
  cycles: PayrollCycle[];
  expenses: ExpenseCategory[];
  debts: DebtPlan[];
  transactions: Transaction[];
  activeCycleId: string;
  isCloudSynced: boolean;
  setActiveCycleId: (id: string) => void;
  updateAccountBalance: (id: string, newBalance: number) => void;
  transferFunds: (fromId: string, toId: string, amount: number, note?: string) => void;
  updateCycleHours: (cycleId: string, hours: number) => void;
  toggleExpense: (id: string) => void;
  updateExpenseAmount: (id: string, amount: number) => void;
  addExpense: (expense: Omit<ExpenseCategory, 'id'>) => void;
  payDebtInstallment: (debtId: string) => void;
  unpayDebtInstallment: (debtId: string) => void;
  addDebt: (debt: Omit<DebtPlan, 'id' | 'installments_paid' | 'is_completed'>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => void;
  resetAllData: () => void;
  getCashflowForCycle: (cycleId: string) => CashflowSummary;
  activeCycle: PayrollCycle | undefined;
  activeCashflow: CashflowSummary;
  totalLiquidBalance: number;
}

const STORAGE_KEYS = {
  ACCOUNTS: 'cashflow_accounts_v1',
  CYCLES: 'cashflow_cycles_v1',
  EXPENSES: 'cashflow_expenses_v1',
  DEBTS: 'cashflow_debts_v1',
  TRANSACTIONS: 'cashflow_transactions_v1',
  ACTIVE_CYCLE: 'cashflow_active_cycle_v1',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [cycles, setCycles] = useState<PayrollCycle[]>(INITIAL_CYCLES);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);
  const [debts, setDebts] = useState<DebtPlan[]>(INITIAL_DEBTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeCycleId, setActiveCycleId] = useState<string>('cycle-2026-10-30');

  // 1. Initial Load: LocalStorage first for instant paint, then Supabase if configured
  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedCycles = localStorage.getItem(STORAGE_KEYS.CYCLES);
      const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const storedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedActiveCycle = localStorage.getItem(STORAGE_KEYS.ACTIVE_CYCLE);

      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
      if (storedCycles) setCycles(JSON.parse(storedCycles));
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        if (!parsedExpenses.some((e: any) => e.id === 'exp-ia' || e.name?.toLowerCase().includes('ia'))) {
          parsedExpenses.push({
            id: 'exp-ia',
            name: 'Suscripción IA Pro',
            default_amount: 20.00,
            periodicity: 'monthly',
            fixed_day: 13,
            target_account_id: 'acc-principal',
            is_active: true,
            icon: 'Bot',
            note: 'Cobro fijo mensual los días 13 de cada mes',
          });
        }
        setExpenses(parsedExpenses);
      }
      if (storedDebts) {
        const parsedDebts = JSON.parse(storedDebts).filter((d: any) => d.id !== 'debt-ia');
        setDebts(parsedDebts);
      }
      if (storedTx) setTransactions(JSON.parse(storedTx));
      if (storedActiveCycle) setActiveCycleId(storedActiveCycle);
    } catch (e) {
      console.warn('Could not read from local storage, using initial seed data', e);
    } finally {
      setIsLoaded(true);
    }

    // Fetch from Supabase
    if (isSupabaseConfigured && supabase) {
      async function syncFromSupabase() {
        try {
          const [
            { data: sbAccounts },
            { data: sbCycles },
            { data: sbExpenses },
            { data: sbDebts },
            { data: sbTransactions },
          ] = await Promise.all([
            supabase!.from('accounts').select('*').order('name'),
            supabase!.from('payroll_cycles').select('*').order('cycle_date'),
            supabase!.from('expense_categories').select('*').order('name'),
            supabase!.from('debt_plans').select('*').order('start_date'),
            supabase!.from('transactions').select('*').order('created_at', { ascending: false }).limit(50),
          ]);

          if (sbAccounts && sbAccounts.length > 0) {
            setAccounts(sbAccounts.map((a: any) => ({
              ...a,
              current_balance: Number(a.current_balance),
            })));
          }

          if (sbCycles && sbCycles.length > 0) {
            setCycles(sbCycles.map((c: any) => ({
              ...c,
              hours_worked: Number(c.hours_worked),
              hourly_rate: Number(c.hourly_rate),
              gross_income: Number(c.gross_income),
            })));
          }

          if (sbExpenses && sbExpenses.length > 0) {
            setExpenses(sbExpenses.map((e: any) => ({
              ...e,
              default_amount: Number(e.default_amount),
            })));
          }

          if (sbDebts && sbDebts.length > 0) {
            setDebts(sbDebts.map((d: any) => ({
              ...d,
              total_amount: Number(d.total_amount),
              installment_amount: Number(d.installment_amount),
              total_installments: Number(d.total_installments),
              installments_paid: Number(d.installments_paid),
            })));
          }

          if (sbTransactions && sbTransactions.length > 0) {
            setTransactions(sbTransactions.map((t: any) => ({
              ...t,
              amount: Number(t.amount),
            })));
          }

          setIsCloudSynced(true);
        } catch (err) {
          console.warn('Error fetching from Supabase, operating offline:', err);
        }
      }
      syncFromSupabase();
    }
  }, []);

  // 2. Persist to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CYCLE, activeCycleId);
    } catch (e) {
      console.error('Error saving data to local storage', e);
    }
  }, [accounts, cycles, expenses, debts, transactions, activeCycleId, isLoaded]);

  // Actions with Supabase background sync
  const updateAccountBalance = async (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, current_balance: newBalance, updated_at: new Date().toISOString() }
          : acc
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('accounts')
          .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.error('Supabase update error:', e);
      }
    }
  };

  const transferFunds = async (fromId: string, toId: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    let newFromBal = 0;
    let newToBal = 0;

    setAccounts((prev) => {
      const fromAcc = prev.find((a) => a.id === fromId);
      const toAcc = prev.find((a) => a.id === toId);
      if (!fromAcc || !toAcc) return prev;

      newFromBal = Math.max(0, fromAcc.current_balance - amount);
      newToBal = toAcc.current_balance + amount;

      return prev.map((acc) => {
        if (acc.id === fromId) return { ...acc, current_balance: newFromBal, updated_at: new Date().toISOString() };
        if (acc.id === toId) return { ...acc, current_balance: newToBal, updated_at: new Date().toISOString() };
        return acc;
      });
    });

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      account_id: fromId,
      to_account_id: toId,
      category: 'Transferencia',
      description: note || `Transferencia interna de ${fromId} a ${toId}`,
      amount,
      type: 'transfer',
      is_settled: true,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await Promise.all([
          supabase.from('accounts').update({ current_balance: newFromBal, updated_at: new Date().toISOString() }).eq('id', fromId),
          supabase.from('accounts').update({ current_balance: newToBal, updated_at: new Date().toISOString() }).eq('id', toId),
          supabase.from('transactions').insert({
            account_id: fromId,
            to_account_id: toId,
            category: 'Transferencia',
            description: note || 'Transferencia entre cuentas',
            amount,
            type: 'transfer',
            is_settled: true,
          }),
        ]);
      } catch (e) {
        console.error('Supabase transfer sync error:', e);
      }
    }
  };

  const updateCycleHours = async (cycleId: string, hours: number) => {
    setCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) {
          const gross = Math.round(hours * c.hourly_rate * 100) / 100;
          return { ...c, hours_worked: hours, gross_income: gross };
        }
        return c;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('payroll_cycles')
          .update({ hours_worked: hours })
          .eq('id', cycleId);
      } catch (e) {
        console.error('Supabase updateCycleHours error:', e);
      }
    }
  };

  const toggleExpense = async (id: string) => {
    let nextActive = true;
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          nextActive = !e.is_active;
          return { ...e, is_active: nextActive };
        }
        return e;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expense_categories').update({ is_active: nextActive }).eq('id', id);
      } catch (e) {
        console.error('Supabase toggleExpense error:', e);
      }
    }
  };

  const updateExpenseAmount = async (id: string, amount: number) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, default_amount: amount } : e))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expense_categories').update({ default_amount: amount }).eq('id', id);
      } catch (e) {
        console.error('Supabase updateExpenseAmount error:', e);
      }
    }
  };

  const addExpense = async (expense: Omit<ExpenseCategory, 'id'>) => {
    const newExp: ExpenseCategory = {
      ...expense,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [...prev, newExp]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expense_categories').insert({
          name: expense.name,
          default_amount: expense.default_amount,
          periodicity: expense.periodicity,
          target_account_id: expense.target_account_id,
          is_active: expense.is_active,
        });
      } catch (e) {
        console.error('Supabase addExpense error:', e);
      }
    }
  };

  const payDebtInstallment = async (debtId: string) => {
    let newPaid = 0;
    let isCompleted = false;

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          newPaid = Math.min(d.total_installments, d.installments_paid + 1);
          isCompleted = newPaid >= d.total_installments;
          return { ...d, installments_paid: newPaid, is_completed: isCompleted };
        }
        return d;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('debt_plans')
          .update({ installments_paid: newPaid, is_completed: isCompleted })
          .eq('id', debtId);
      } catch (e) {
        console.error('Supabase payDebt error:', e);
      }
    }
  };

  const unpayDebtInstallment = async (debtId: string) => {
    let newPaid = 0;

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          newPaid = Math.max(0, d.installments_paid - 1);
          return { ...d, installments_paid: newPaid, is_completed: false };
        }
        return d;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('debt_plans')
          .update({ installments_paid: newPaid, is_completed: false })
          .eq('id', debtId);
      } catch (e) {
        console.error('Supabase unpayDebt error:', e);
      }
    }
  };

  const addDebt = async (debt: Omit<DebtPlan, 'id' | 'installments_paid' | 'is_completed'>) => {
    const newDebt: DebtPlan = {
      ...debt,
      id: 'debt-' + Date.now(),
      installments_paid: 0,
      is_completed: false,
    };
    setDebts((prev) => [...prev, newDebt]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('debt_plans').insert({
          title: debt.title,
          total_amount: debt.total_amount,
          installment_amount: debt.installment_amount,
          total_installments: debt.total_installments,
          installments_paid: 0,
          start_date: debt.start_date,
          frequency: debt.frequency,
          notes: debt.notes,
        });
      } catch (e) {
        console.error('Supabase addDebt error:', e);
      }
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('transactions').insert(tx);
      } catch (e) {
        console.error('Supabase addTransaction error:', e);
      }
    }
  };

  const resetAllData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCycles(INITIAL_CYCLES);
    setExpenses(INITIAL_EXPENSE_CATEGORIES);
    setDebts(INITIAL_DEBTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setActiveCycleId('cycle-2026-10-30');
    try {
      localStorage.clear();
    } catch {}
  };

  const getCashflowForCycle = (cycleId: string): CashflowSummary => {
    const cycle = cycles.find((c) => c.id === cycleId) || cycles[0];
    const grossIncome = cycle ? cycle.gross_income : 0;
    const cycleDateStr = cycle?.cycle_date || '2026-10-30';

    const applicableExpenses = expenses.filter((e) => {
      if (!e.is_active) return false;
      if (e.starts_at && e.starts_at > cycleDateStr) return false;
      if (e.periodicity === 'monthly') {
        const cycleDay = new Date(cycleDateStr + 'T00:00:00').getUTCDate();
        if (e.fixed_day) {
          const diff = Math.abs(cycleDay - e.fixed_day);
          return diff <= 7 || cycleDateStr.includes('11-13') || cycleDateStr.includes('12-11');
        }
      }
      return true;
    });
    const fixedExpensesTotal = applicableExpenses.reduce((sum, e) => sum + e.default_amount, 0);

    let debtInstallmentsTotal = 0;
    debts.forEach((debt) => {
      if (debt.is_completed) return;

      if (debt.frequency === 'biweekly') {
        if (debt.specific_dates && debt.specific_dates.length > 0) {
          if (debt.specific_dates.includes(cycleDateStr)) {
            debtInstallmentsTotal += debt.installment_amount;
          }
        } else if (debt.start_date <= cycleDateStr) {
          debtInstallmentsTotal += debt.installment_amount;
        }
      } else if (debt.frequency === 'monthly_fixed_day') {
        const cycleDay = new Date(cycleDateStr).getUTCDate();
        if (debt.fixed_day) {
          const diff = Math.abs(cycleDay - debt.fixed_day);
          if (diff <= 7 || cycleDateStr.includes('11-13') || cycleDateStr.includes('12-11')) {
            debtInstallmentsTotal += debt.installment_amount;
          }
        }
      }
    });

    const totalOutflow = fixedExpensesTotal + debtInstallmentsTotal;
    const freePocket = Math.round((grossIncome - totalOutflow) * 100) / 100;
    const weeklyFreePocket = Math.round((freePocket / 2) * 100) / 100;

    let safetyStatus: 'safe' | 'warning' | 'danger' = 'safe';
    if (weeklyFreePocket < 25) {
      safetyStatus = 'danger';
    } else if (weeklyFreePocket < 40) {
      safetyStatus = 'warning';
    }

    return {
      grossIncome,
      fixedExpensesTotal,
      debtInstallmentsTotal,
      totalOutflow,
      freePocket,
      weeklyFreePocket,
      safetyStatus,
    };
  };

  const activeCycle = useMemo(() => {
    return cycles.find((c) => c.id === activeCycleId) || cycles[0];
  }, [cycles, activeCycleId]);

  const activeCashflow = useMemo(() => {
    return getCashflowForCycle(activeCycleId);
  }, [cycles, expenses, debts, activeCycleId]);

  const totalLiquidBalance = useMemo(() => {
    return Math.round(accounts.reduce((sum, a) => sum + a.current_balance, 0) * 100) / 100;
  }, [accounts]);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        cycles,
        expenses,
        debts,
        transactions,
        activeCycleId,
        isCloudSynced,
        setActiveCycleId,
        updateAccountBalance,
        transferFunds,
        updateCycleHours,
        toggleExpense,
        updateExpenseAmount,
        addExpense,
        payDebtInstallment,
        unpayDebtInstallment,
        addDebt,
        addTransaction,
        resetAllData,
        getCashflowForCycle,
        activeCycle,
        activeCashflow,
        totalLiquidBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
