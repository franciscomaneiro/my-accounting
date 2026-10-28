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

interface FinanceContextType {
  accounts: Account[];
  cycles: PayrollCycle[];
  expenses: ExpenseCategory[];
  debts: DebtPlan[];
  transactions: Transaction[];
  activeCycleId: string;
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
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [cycles, setCycles] = useState<PayrollCycle[]>(INITIAL_CYCLES);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);
  const [debts, setDebts] = useState<DebtPlan[]>(INITIAL_DEBTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeCycleId, setActiveCycleId] = useState<string>('cycle-2026-10-30');

  // Load from LocalStorage
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
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      if (storedDebts) setDebts(JSON.parse(storedDebts));
      if (storedTx) setTransactions(JSON.parse(storedTx));
      if (storedActiveCycle) setActiveCycleId(storedActiveCycle);
    } catch (e) {
      console.warn('Could not read from local storage, using initial seed data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
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

  const updateAccountBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, current_balance: newBalance, updated_at: new Date().toISOString() }
          : acc
      )
    );
  };

  const transferFunds = (fromId: string, toId: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    setAccounts((prev) => {
      const fromAcc = prev.find((a) => a.id === fromId);
      const toAcc = prev.find((a) => a.id === toId);
      if (!fromAcc || !toAcc) return prev;

      return prev.map((acc) => {
        if (acc.id === fromId) {
          return {
            ...acc,
            current_balance: Math.max(0, acc.current_balance - amount),
            updated_at: new Date().toISOString(),
          };
        }
        if (acc.id === toId) {
          return {
            ...acc,
            current_balance: acc.current_balance + amount,
            updated_at: new Date().toISOString(),
          };
        }
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
  };

  const updateCycleHours = (cycleId: string, hours: number) => {
    setCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) {
          const gross = Math.round(hours * c.hourly_rate * 100) / 100;
          return { ...c, hours_worked: hours, gross_income: gross };
        }
        return c;
      })
    );
  };

  const toggleExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_active: !e.is_active } : e))
    );
  };

  const updateExpenseAmount = (id: string, amount: number) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, default_amount: amount } : e))
    );
  };

  const addExpense = (expense: Omit<ExpenseCategory, 'id'>) => {
    const newExp: ExpenseCategory = {
      ...expense,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [...prev, newExp]);
  };

  const payDebtInstallment = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newPaid = Math.min(d.total_installments, d.installments_paid + 1);
          return {
            ...d,
            installments_paid: newPaid,
            is_completed: newPaid >= d.total_installments,
          };
        }
        return d;
      })
    );
  };

  const unpayDebtInstallment = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newPaid = Math.max(0, d.installments_paid - 1);
          return {
            ...d,
            installments_paid: newPaid,
            is_completed: false,
          };
        }
        return d;
      })
    );
  };

  const addDebt = (debt: Omit<DebtPlan, 'id' | 'installments_paid' | 'is_completed'>) => {
    const newDebt: DebtPlan = {
      ...debt,
      id: 'debt-' + Date.now(),
      installments_paid: 0,
      is_completed: false,
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
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

    // Calculate applicable fixed expenses for this cycle
    const applicableExpenses = expenses.filter((e) => {
      if (!e.is_active) return false;
      if (e.starts_at && e.starts_at > cycleDateStr) return false;
      return true;
    });
    const fixedExpensesTotal = applicableExpenses.reduce((sum, e) => sum + e.default_amount, 0);

    // Calculate applicable debts for this cycle date
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
        // e.g., Cricut on 14th, IA on 13th
        // If cycle covers around that time or monthly
        const cycleDay = new Date(cycleDateStr).getUTCDate();
        if (debt.fixed_day) {
          // If cycle date is within 7 days of fixed day or aligns
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
