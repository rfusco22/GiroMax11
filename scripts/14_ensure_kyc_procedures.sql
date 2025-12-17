-- Script 14: Ensure KYC stored procedures exist
-- This script ensures the approve and reject procedures are created

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS approve_kyc_verification;
DROP PROCEDURE IF EXISTS reject_kyc_verification;

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
