-- Índices adicionales para optimización de consultas

-- Índices compuestos para transacciones
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_at DESC);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_users_role_verified ON users(role, verified);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Índice full-text para búsqueda de transacciones
CREATE FULLTEXT INDEX idx_transactions_search ON transactions(reference, recipient_name, notes);

-- Índice para reportes de gerencia
CREATE INDEX idx_transactions_report ON transactions(status, created_at, from_currency, to_currency);

-- Constraint para validar balances positivos
ALTER TABLE wallets ADD CONSTRAINT chk_balance_positive CHECK (balance >= 0);
ALTER TABLE wallets ADD CONSTRAINT chk_available_balance_positive CHECK (available_balance >= 0);

-- Constraint para validar montos de transacción positivos
ALTER TABLE transactions ADD CONSTRAINT chk_from_amount_positive CHECK (from_amount > 0);
ALTER TABLE transactions ADD CONSTRAINT chk_to_amount_positive CHECK (to_amount > 0);
ALTER TABLE transactions ADD CONSTRAINT chk_exchange_rate_positive CHECK (exchange_rate > 0);

-- Constraint para validar márgenes entre 0 y 10%
ALTER TABLE currency_margins ADD CONSTRAINT chk_margin_range CHECK (margin_percent >= 0 AND margin_percent <= 10);
