-- Script 07: KYC (Know Your Customer) Verification System
-- Adds comprehensive identity verification with document uploads and admin approval

-- Tabla principal de verificaciones KYC
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  
  -- Estado de verificación
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  
  -- Información personal
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(3) NOT NULL,
  residence_country VARCHAR(3) NOT NULL,
  
  -- Documentos de identidad
  document_type ENUM('cedula', 'dni', 'pasaporte', 'licencia') NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  
  -- Selfie para verificación
  selfie_url TEXT,
  selfie_with_document_url TEXT,
  
  -- Verificación telefónica
  phone_number VARCHAR(50) NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verification_code VARCHAR(6),
  phone_verification_expires_at TIMESTAMP NULL,
  phone_verification_attempts INT DEFAULT 0,
  phone_verified_at TIMESTAMP NULL,
  
  -- Información de aprobación/rechazo
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_reviewed_by (reviewed_by),
  INDEX idx_phone_number (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar campos KYC al usuario
ALTER TABLE users 
ADD COLUMN kyc_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
ADD COLUMN kyc_id VARCHAR(36) NULL,
ADD COLUMN kyc_verified_at TIMESTAMP NULL,
ADD INDEX idx_kyc_status (kyc_status),
ADD CONSTRAINT fk_users_kyc FOREIGN KEY (kyc_id) REFERENCES kyc_verifications(id) ON DELETE SET NULL;

-- Tabla de historial de intentos de verificación
CREATE TABLE IF NOT EXISTS kyc_verification_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kyc_id VARCHAR(36) NOT NULL,
  status_from ENUM('pending', 'approved', 'rejected', 'expired'),
  status_to ENUM('pending', 'approved', 'rejected', 'expired'),
  changed_by VARCHAR(36),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (kyc_id) REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_kyc_id (kyc_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs de verificación telefónica
CREATE TABLE IF NOT EXISTS phone_verification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kyc_id VARCHAR(36) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  method ENUM('sms', 'whatsapp') NOT NULL,
  status ENUM('sent', 'verified', 'failed', 'expired') DEFAULT 'sent',
  attempts INT DEFAULT 1,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  FOREIGN KEY (kyc_id) REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  
  INDEX idx_kyc_id (kyc_id),
  INDEX idx_phone_number (phone_number),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para gerencia: resumen de KYC pendientes
CREATE OR REPLACE VIEW v_pending_kyc_verifications AS
SELECT 
  k.id,
  k.user_id,
  u.email,
  u.name,
  k.first_name,
  k.last_name,
  k.nationality,
  k.residence_country,
  k.document_type,
  k.document_number,
  k.phone_number,
  k.phone_verified,
  k.status,
  k.created_at,
  DATEDIFF(NOW(), k.created_at) as days_pending
FROM kyc_verifications k
JOIN users u ON k.user_id = u.id
WHERE k.status = 'pending'
ORDER BY k.created_at ASC;

-- Vista para estadísticas de KYC
CREATE OR REPLACE VIEW v_kyc_statistics AS
SELECT 
  COUNT(*) as total_verifications,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
  SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
  AVG(CASE 
    WHEN status IN ('approved', 'rejected') AND reviewed_at IS NOT NULL 
    THEN TIMESTAMPDIFF(HOUR, created_at, reviewed_at) 
    ELSE NULL 
  END) as avg_review_hours
FROM kyc_verifications;

-- Procedimiento para aprobar KYC
DELIMITER //

CREATE PROCEDURE approve_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_notes TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  
  -- Obtener el user_id
  SELECT user_id INTO v_user_id 
  FROM kyc_verifications 
  WHERE id = p_kyc_id;
  
  -- Actualizar la verificación KYC
  UPDATE kyc_verifications
  SET 
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_kyc_id;
  
  -- Actualizar el usuario
  UPDATE users
  SET 
    kyc_status = 'approved',
    kyc_id = p_kyc_id,
    kyc_verified_at = NOW(),
    verified = TRUE,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Registrar en el historial
  INSERT INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
  VALUES (p_kyc_id, 'pending', 'approved', p_reviewed_by, p_notes, NOW());
  
  -- Crear notificación para el usuario
  INSERT INTO notifications (user_id, title, message, type, created_at)
  VALUES (
    v_user_id,
    'Verificación Aprobada',
    'Tu cuenta ha sido verificada exitosamente. Ahora puedes realizar transacciones.',
    'success',
    NOW()
  );
  
END //

DELIMITER ;

-- Procedimiento para rechazar KYC
DELIMITER //

CREATE PROCEDURE reject_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_rejection_reason TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  
  -- Obtener el user_id
  SELECT user_id INTO v_user_id 
  FROM kyc_verifications 
  WHERE id = p_kyc_id;
  
  -- Actualizar la verificación KYC
  UPDATE kyc_verifications
  SET 
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_kyc_id;
  
  -- Actualizar el usuario
  UPDATE users
  SET 
    kyc_status = 'rejected',
    kyc_id = p_kyc_id,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Registrar en el historial
  INSERT INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
  VALUES (p_kyc_id, 'pending', 'rejected', p_reviewed_by, p_rejection_reason, NOW());
  
  -- Crear notificación para el usuario
  INSERT INTO notifications (user_id, title, message, type, created_at)
  VALUES (
    v_user_id,
    'Verificación Rechazada',
    CONCAT('Tu verificación ha sido rechazada. Motivo: ', p_rejection_reason),
    'error',
    NOW()
  );
  
END //

DELIMITER ;
