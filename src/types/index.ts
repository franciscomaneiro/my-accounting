export type AccountType = 'principal' | 'hogar' | 'earn';

export interface Account {
  id: string;
  name: string;
  current_balance: number;
  currency: string;
  updated_at: string;
  purpose: string;
  icon?: string;
  color?: string;
}

export type CycleStatus = 'planned' | 'active' | 'closed';

export interface PayrollCycle {
  id: string;
  cycle_date: string; // YYYY-MM-DD
  hours_worked: number;
  hourly_rate: number;
  gross_income: number;
  status: CycleStatus;
}

export type ExpensePeriodicity = 'biweekly' | 'monthly';

export interface ExpenseCategory {
  id: string;
  name: string;
  default_amount: number;
  periodicity: ExpensePeriodicity;
  fixed_day?: number;
  target_account_id?: string;
  is_active: boolean;
  starts_at?: string; // Optional start date
  icon?: string;
  note?: string;
}

export type DebtFrequency = 'biweekly' | 'monthly_fixed_day';

export interface DebtPlan {
  id: string;
  title: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  installments_paid: number;
  start_date: string;
  frequency: DebtFrequency;
  fixed_day?: number;
  is_completed: boolean;
  notes?: string;
  specific_dates?: string[];
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  cycle_id?: string;
  account_id?: string;
  to_account_id?: string;
  category?: string;
  description: string;
  amount: number;
  type: TransactionType;
  is_settled: boolean;
  created_at: string;
}

export interface CashflowSummary {
  grossIncome: number;
  fixedExpensesTotal: number;
  debtInstallmentsTotal: number;
  totalOutflow: number;
  freePocket: number;
  weeklyFreePocket: number;
  safetyStatus: 'safe' | 'warning' | 'danger'; // safe: >= $40/wk, warning: $25-$39/wk, danger: < $25/wk
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  simulationImpact?: {
    pocketBefore: number;
    pocketAfter: number;
    weeklyBefore: number;
    weeklyAfter: number;
    recommendation: 'viable' | 'caution' | 'not_recommended';
  };
}
