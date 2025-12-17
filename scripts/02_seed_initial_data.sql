-- Insertar datos iniciales para GirosMax
-- NOTA: Las contraseñas deben ser hasheadas con bcrypt en producción

-- Usuario de Gerencia (rol: gerencia)
-- Email: gerencia@girosmax.com / Password: gerencia123
INSERT INTO users (id, email, password_hash, name, role, verified, country) VALUES
('gerencia-001', 'gerencia@girosmax.com', '$2b$10$YourBcryptHashHere', 'Director General', 'gerencia', TRUE, 'MX');

-- Usuarios Administradores (rol: administrador)
-- Pueden administrar múltiples países
INSERT INTO users (id, email, password_hash, name, role, verified, country) VALUES
('admin-001', 'admin@girosmax.com', '$2b$10$YourBcryptHashHere', 'Admin Principal', 'administrador', TRUE, 'MX'),
('admin-002', 'admin.colombia@girosmax.com', '$2b$10$YourBcryptHashHere', 'Admin Colombia', 'administrador', TRUE, 'CO'),
('admin-003', 'admin.chile@girosmax.com', '$2b$10$YourBcryptHashHere', 'Admin Chile', 'administrador', TRUE, 'CL');

-- Asignación de países a administradores por gerencia
-- Admin 001 administra México, Colombia y Perú
INSERT INTO admin_country_assignments (admin_id, country_code, assigned_by) VALUES
('admin-001', 'MX', 'gerencia-001'),
('admin-001', 'CO', 'gerencia-001'),
('admin-001', 'PE', 'gerencia-001');

-- Admin 002 administra Colombia y Venezuela
INSERT INTO admin_country_assignments (admin_id, country_code, assigned_by) VALUES
('admin-002', 'CO', 'gerencia-001'),
('admin-002', 'VE', 'gerencia-001');

-- Admin 003 administra Chile y Perú
INSERT INTO admin_country_assignments (admin_id, country_code, assigned_by) VALUES
('admin-003', 'CL', 'gerencia-001'),
('admin-003', 'PE', 'gerencia-001');

-- Usuario Cliente Demo (rol: cliente)
-- Email: cliente@girosmax.com / Password: cliente123
INSERT INTO users (id, email, password_hash, name, phone, country, nationality, residence_country, document_type, document_number, role, verified) VALUES
('cliente-001', 'cliente@girosmax.com', '$2b$10$YourBcryptHashHere', 'Juan Pérez', '+52 55 1234 5678', 'MX', 'MX', 'MX', 'INE', '1234567890', 'cliente', TRUE);

-- Cuentas bancarias de ejemplo para el cliente
INSERT INTO user_bank_accounts (user_id, bank_name, account_holder, account_number, account_type, currency, country, is_default, is_verified) VALUES
('cliente-001', 'BBVA México', 'Juan Pérez', '0123456789', 'checking', 'MXN', 'MX', TRUE, TRUE),
('cliente-001', 'Santander', 'Juan Pérez', '9876543210', 'savings', 'MXN', 'MX', FALSE, TRUE);

-- Márgenes iniciales por moneda
INSERT INTO currency_margins (currency_code, margin_percent, updated_by) VALUES
('USD', 0.50, 'admin-001'),
('COP', 1.20, 'admin-001'),
('PEN', 1.00, 'admin-001'),
('CLP', 0.80, 'admin-001'),
('VES', 2.50, 'admin-001'),
('PAB', 0.30, 'admin-001'),
('EUR', 0.50, 'admin-001'),
('MXN', 0.90, 'admin-001');

-- Billeteras iniciales para usuario demo
INSERT INTO wallets (user_id, currency_code, balance, available_balance) VALUES
('cliente-001', 'MXN', 20000.00, 20000.00),
('cliente-001', 'USD', 1000.00, 1000.00);

-- Configuración del sistema
INSERT INTO system_config (config_key, config_value, description, updated_by) VALUES
('maintenance_mode', 'false', 'Activar/desactivar modo mantenimiento', 'admin-001'),
('max_transaction_amount', '50000', 'Monto máximo por transacción en USD', 'gerencia-001'),
('min_transaction_amount', '10', 'Monto mínimo por transacción en USD', 'gerencia-001'),
('transaction_fee_percent', '0.1', 'Comisión por transacción (%)', 'gerencia-001'),
('kyc_required', 'true', 'Requiere verificación KYC', 'gerencia-001'),
('email_notifications', 'true', 'Enviar notificaciones por email', 'admin-001');

-- Transacción de ejemplo con estados de validación y pago manual
INSERT INTO transactions (
  id, user_id, type, status, gateway_status, from_currency, to_currency, 
  from_amount, to_amount, exchange_rate, fee, reference,
  sender_name, sender_country, recipient_name, recipient_bank, recipient_account, recipient_country,
  assigned_admin_id, created_at, validated_at, paid_at, completed_at
) VALUES (
  'txn-demo-001',
  'cliente-001',
  'exchange',
  'completed',
  'approved',
  'MXN',
  'USD',
  20000.00,
  1000.00,
  0.05,
  10.00,
  'REF202501150001',
  'Juan Pérez',
  'MX',
  'María García',
  'Bank of America',
  '****5678',
  'US',
  'admin-001',
  DATE_SUB(NOW(), INTERVAL 2 DAY),
  DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 10 MINUTE,
  DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 20 MINUTE,
  DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 30 MINUTE
);

-- Transacción pendiente de validación
INSERT INTO transactions (
  id, user_id, type, status, from_currency, to_currency, 
  from_amount, to_amount, exchange_rate, fee, reference,
  sender_name, sender_country, recipient_name, recipient_bank, recipient_account, recipient_country,
  created_at
) VALUES (
  'txn-pending-001',
  'cliente-001',
  'exchange',
  'pending_validation',
  'MXN',
  'COP',
  15000.00,
  750000.00,
  50.00,
  7.50,
  'REF202501150002',
  'Juan Pérez',
  'MX',
  'Carlos López',
  'Bancolombia',
  '****1234',
  'CO',
  NOW() - INTERVAL 1 HOUR
);

-- Notificación de ejemplo
INSERT INTO notifications (
  user_id, title, message, type, is_read, related_transaction_id
) VALUES (
  'cliente-001',
  'Transacción completada',
  'Tu cambio de MXN 20,000 a USD 1,000 se ha completado exitosamente.',
  'success',
  FALSE,
  'txn-demo-001'
);

-- Registro de auditoría
INSERT INTO audit_log (
  user_id, action, entity_type, entity_id, 
  new_values, ip_address
) VALUES (
  'admin-001',
  'UPDATE_MARGIN',
  'currency_margins',
  'USD',
  '{"margin_percent": 0.50}',
  '192.168.1.100'
);
