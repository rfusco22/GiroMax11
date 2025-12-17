-- Vistas y procedimientos almacenados para reportes
-- Versión corregida para MySQL en Railway

-- Eliminar vistas si existen (MySQL no soporta CREATE OR REPLACE VIEW)
DROP VIEW IF EXISTS v_user_transaction_summary;
DROP VIEW IF EXISTS v_user_wallets;
DROP VIEW IF EXISTS v_recent_activity;
DROP VIEW IF EXISTS v_margin_history;

-- Vista para resumen de transacciones por usuario
CREATE VIEW v_user_transaction_summary AS
SELECT 
  u.id AS user_id,
  u.name,
  u.email,
  u.role,
  COUNT(t.id) AS total_transactions,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_transactions,
  SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_transactions,
  SUM(CASE WHEN t.status = 'failed' THEN 1 ELSE 0 END) AS failed_transactions,
  SUM(CASE WHEN t.status = 'completed' THEN t.from_amount ELSE 0 END) AS total_volume_usd,
  SUM(CASE WHEN t.status = 'completed' THEN t.fee ELSE 0 END) AS total_fees,
  MAX(t.created_at) AS last_transaction_date
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name, u.email, u.role;

-- Vista para distribución de monedas por usuario
CREATE VIEW v_user_wallets AS
SELECT 
  u.id AS user_id,
  u.name,
  u.email,
  w.currency_code,
  w.balance,
  w.available_balance,
  w.updated_at AS last_updated
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE w.balance > 0 OR w.id IS NULL
ORDER BY u.id, w.balance DESC;

-- Vista para actividad reciente (últimas 24 horas)
CREATE VIEW v_recent_activity AS
SELECT 
  t.id,
  t.user_id,
  u.name AS user_name,
  u.email,
  t.type,
  t.status,
  t.from_currency,
  t.to_currency,
  t.from_amount,
  t.to_amount,
  t.exchange_rate,
  t.fee,
  t.reference,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY t.created_at DESC;

-- Vista para márgenes con historial de cambios
CREATE VIEW v_margin_history AS
SELECT 
  cm.currency_code,
  cm.margin_percent,
  cm.last_updated,
  u.name AS updated_by_name,
  u.email AS updated_by_email
FROM currency_margins cm
LEFT JOIN users u ON cm.updated_by = u.id
ORDER BY cm.last_updated DESC;

-- Eliminar procedimientos si existen
DROP PROCEDURE IF EXISTS sp_get_monthly_stats;
DROP PROCEDURE IF EXISTS sp_create_transaction;

-- Procedimiento: Obtener estadísticas del mes actual
DELIMITER //
CREATE PROCEDURE sp_get_monthly_stats(IN p_user_id VARCHAR(36))
BEGIN
  SELECT 
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
    SUM(CASE WHEN status = 'completed' THEN from_amount ELSE 0 END) AS total_volume,
    SUM(CASE WHEN status = 'completed' THEN fee ELSE 0 END) AS total_fees,
    AVG(CASE WHEN status = 'completed' THEN exchange_rate ELSE NULL END) AS avg_rate
  FROM transactions
  WHERE user_id = p_user_id
    AND MONTH(created_at) = MONTH(CURRENT_DATE())
    AND YEAR(created_at) = YEAR(CURRENT_DATE());
END //
DELIMITER ;

-- Procedimiento: Crear nueva transacción
DELIMITER //
CREATE PROCEDURE sp_create_transaction(
  IN p_id VARCHAR(36),
  IN p_user_id VARCHAR(36),
  IN p_type VARCHAR(20),
  IN p_from_currency VARCHAR(3),
  IN p_to_currency VARCHAR(3),
  IN p_from_amount DECIMAL(15,2),
  IN p_to_amount DECIMAL(15,2),
  IN p_exchange_rate DECIMAL(15,6),
  IN p_fee DECIMAL(15,2),
  IN p_reference VARCHAR(100)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  
  -- Insertar transacción
  INSERT INTO transactions (
    id, user_id, type, status, from_currency, to_currency,
    from_amount, to_amount, exchange_rate, fee, reference
  ) VALUES (
    p_id, p_user_id, p_type, 'pending', p_from_currency, p_to_currency,
    p_from_amount, p_to_amount, p_exchange_rate, p_fee, p_reference
  );
  
  -- Crear notificación
  INSERT INTO notifications (user_id, title, message, type, related_transaction_id)
  VALUES (
    p_user_id,
    'Nueva transacción creada',
    CONCAT('Tu ', p_type, ' de ', p_from_currency, ' ', p_from_amount, ' a ', p_to_currency, ' ha sido creada.'),
    'info',
    p_id
  );
  
  -- Registrar en auditoría
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_user_id,
    'CREATE_TRANSACTION',
    'transactions',
    p_id,
    JSON_OBJECT(
      'type', p_type,
      'from_currency', p_from_currency,
      'to_currency', p_to_currency,
      'from_amount', p_from_amount,
      'to_amount', p_to_amount
    )
  );
  
  COMMIT;
END //
DELIMITER ;
