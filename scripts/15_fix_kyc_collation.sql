-- Fix collation issues in KYC verification procedures
-- This ensures all string comparisons use the same collation

DROP PROCEDURE IF EXISTS approve_kyc_verification;
DROP PROCEDURE IF EXISTS reject_kyc_verification;

-- Recreate approve_kyc_verification with explicit collation handling
DELIMITER //

CREATE PROCEDURE approve_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_notes TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  DECLARE v_first_name VARCHAR(255);
  DECLARE v_last_name VARCHAR(255);
  DECLARE v_date_of_birth DATE;
  DECLARE v_nationality VARCHAR(3);
  DECLARE v_residence_country VARCHAR(3);
  DECLARE v_document_type VARCHAR(50);
  DECLARE v_document_number VARCHAR(100);
  DECLARE v_phone_number VARCHAR(50);
  DECLARE v_current_status VARCHAR(20);
  
  -- Obtener los datos del KYC
  SELECT 
    user_id, first_name, last_name, date_of_birth, 
    nationality, residence_country, document_type, 
    document_number, phone_number, status
  INTO 
    v_user_id, v_first_name, v_last_name, v_date_of_birth,
    v_nationality, v_residence_country, v_document_type,
    v_document_number, v_phone_number, v_current_status
  FROM kyc_verifications 
  WHERE id = p_kyc_id;
  
  -- Verificar que el KYC existe
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'KYC verification not found';
  END IF;
  
  -- Verificar que el estado es pending (usando CAST para evitar problemas de collation)
  IF CAST(v_current_status AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci != 
     CAST('pending' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Only pending verifications can be approved';
  END IF;
  
  -- Actualizar la verificación KYC
  UPDATE kyc_verifications
  SET 
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_kyc_id;
  
  -- Actualizar el usuario con los datos verificados del KYC
  UPDATE users
  SET 
    kyc_status = 'approved',
    kyc_id = p_kyc_id,
    kyc_verified_at = NOW(),
    verified = TRUE,
    name = CONCAT(v_first_name, ' ', v_last_name),
    phone = v_phone_number,
    country = v_residence_country,
    date_of_birth = v_date_of_birth,
    nationality = v_nationality,
    residence_country = v_residence_country,
    document_type = v_document_type,
    document_number = v_document_number,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Registrar en el historial (si existe la tabla)
  INSERT IGNORE INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
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

-- Recreate reject_kyc_verification with explicit collation handling
DELIMITER //

CREATE PROCEDURE reject_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_rejection_reason TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  DECLARE v_current_status VARCHAR(20);
  
  -- Obtener el user_id y el estado actual
  SELECT user_id, status INTO v_user_id, v_current_status
  FROM kyc_verifications 
  WHERE id = p_kyc_id;
  
  -- Verificar que el KYC existe
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'KYC verification not found';
  END IF;
  
  -- Verificar que el estado es pending (usando CAST para evitar problemas de collation)
  IF CAST(v_current_status AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci != 
     CAST('pending' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Only pending verifications can be rejected';
  END IF;
  
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
  
  -- Registrar en el historial (si existe la tabla)
  INSERT IGNORE INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
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
