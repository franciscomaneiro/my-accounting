-- ==============================================================================
-- Personal Cashflow & AI Budgeting PWA
-- Supabase / PostgreSQL Database Schema & Initial Seed Data
-- ==============================================================================

-- Habilitar extensión pgcrypto o uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cuentas y Balances
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- 'Principal', 'Subcuenta Hogar', 'Simple Earn'
    current_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USDT',
    purpose TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ciclos de Nómina (Quincenas exactas de 14 días)
CREATE TABLE IF NOT EXISTS payroll_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_date DATE NOT NULL, -- ej. 2026-10-30, 2026-11-13
    hours_worked NUMERIC(6,2) NOT NULL DEFAULT 80.00,
    hourly_rate NUMERIC(6,2) NOT NULL DEFAULT 8.10,
    gross_income NUMERIC(10,2) GENERATED ALWAYS AS (hours_worked * hourly_rate) STORED,
    status VARCHAR(20) DEFAULT 'planned' -- 'planned', 'active', 'closed'
);

-- 3. Categorías y Asignaciones Fijas
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    default_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    periodicity VARCHAR(20) NOT NULL, -- 'biweekly', 'monthly'
    target_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Compromisos y Cuotas (Deudas / Préstamos)
CREATE TABLE IF NOT EXISTS debt_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL, -- 'Cashea Los 777', 'Cricut Cuotas', 'Teléfono Fiado'
    total_amount NUMERIC(10,2) NOT NULL,
    installment_amount NUMERIC(10,2) NOT NULL,
    total_installments INT NOT NULL,
    installments_paid INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    frequency VARCHAR(20) DEFAULT 'biweekly', -- 'biweekly', 'monthly_fixed_day'
    fixed_day INT, -- ej. 14 para Cricut
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Transacciones y Movimientos
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE SET NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category VARCHAR(50),
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'income', 'expense', 'transfer'
    is_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_date ON payroll_cycles(cycle_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ==============================================================================
-- DATOS SEMILLA INICIALES (Contexto Financiero Inicial del Usuario)
-- ==============================================================================

-- Insertar Cuentas
INSERT INTO accounts (id, name, current_balance, currency, purpose)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Binance Principal', 75.28, 'USDT', 'Fondos líquidos de uso inmediato, ocio y gastos del día a día ($50 semanales + $25.28 libre)'),
  ('a0000000-0000-0000-0000-000000000002', 'Subcuenta Hogar', 167.50, 'USDT', 'Fondos blindados para compromisos ineludibles ($82.50 Alquiler 50%, $55 Bomba mamá, $30 Servicios)'),
  ('a0000000-0000-0000-0000-000000000003', 'Simple Earn', 308.93, 'USDT', 'Reserva de liquidez / ahorro con devengo y pote acumulativo de contingencia (Viaje playa 18 Dic)')
ON CONFLICT (id) DO NOTHING;

-- Insertar Ciclos de Nómina
INSERT INTO payroll_cycles (id, cycle_date, hours_worked, hourly_rate, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '2026-10-30', 56.00, 8.10, 'active'),
  ('c0000000-0000-0000-0000-000000000002', '2026-11-13', 80.00, 8.10, 'planned'),
  ('c0000000-0000-0000-0000-000000000003', '2026-11-27', 80.00, 8.10, 'planned'),
  ('c0000000-0000-0000-0000-000000000004', '2026-12-11', 80.00, 8.10, 'planned'),
  ('c0000000-0000-0000-0000-000000000005', '2026-12-25', 80.00, 8.10, 'planned')
ON CONFLICT (id) DO NOTHING;

-- Insertar Gastos Fijos Quincenales
INSERT INTO expense_categories (id, name, default_amount, periodicity, target_account_id, is_active)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Alquiler (50% Quincenal)', 82.50, 'biweekly', 'a0000000-0000-0000-0000-000000000002', TRUE),
  ('e0000000-0000-0000-0000-000000000002', 'Mercado', 160.00, 'biweekly', 'a0000000-0000-0000-0000-000000000001', TRUE),
  ('e0000000-0000-0000-0000-000000000003', 'Servicios / Internet', 25.00, 'biweekly', 'a0000000-0000-0000-0000-000000000002', TRUE),
  ('e0000000-0000-0000-0000-000000000004', 'Gasolina Corsa', 15.00, 'biweekly', 'a0000000-0000-0000-0000-000000000001', TRUE),
  ('e0000000-0000-0000-0000-000000000005', 'Arena de gatos', 15.00, 'biweekly', 'a0000000-0000-0000-0000-000000000001', TRUE),
  ('e0000000-0000-0000-0000-000000000006', 'Depilación pareja', 15.00, 'biweekly', 'a0000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insertar Deudas y Cuotas Vivas
INSERT INTO debt_plans (id, title, total_amount, installment_amount, total_installments, installments_paid, start_date, frequency, is_completed, notes)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Cashea (Los 777)', 115.29, 38.43, 3, 0, '2026-10-30', 'biweekly', FALSE, 'Cuotas de $38,43 los días 30 oct, 13 nov y 27 nov (finiquita el 27)'),
  ('d0000000-0000-0000-0000-000000000002', 'Cricut Cuotas', 159.20, 39.80, 4, 0, '2026-11-14', 'monthly_fixed_day', FALSE, 'Cuota fija mensual los 14 de cada mes (Noviembre a Febrero)'),
  ('d0000000-0000-0000-0000-000000000003', 'Teléfono Fiado (Restante)', 400.00, 100.00, 4, 0, '2026-11-27', 'biweekly', FALSE, 'Inicial $500 ($300 puente Simple Earn + $50 el 30 oct + $150 el 13 nov); luego $400 en cuotas de $100'),
  ('d0000000-0000-0000-0000-000000000004', 'Suscripción IA', 120.00, 20.00, 6, 0, '2026-11-13', 'monthly_fixed_day', FALSE, 'Suscripción mensual fija día 13')
ON CONFLICT (id) DO NOTHING;
