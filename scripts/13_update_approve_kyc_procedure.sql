-- Script 13: Update approve_kyc_verification procedure to copy KYC data to users table
-- When KYC is approved, copy the verified data to the users table

-- Drop existing procedure
DROP PROCEDURE IF EXISTS approve_kyc_verification;

-- Recreate procedure with user data updates
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
  
  -- Obtener los datos del KYC
  SELECT 
    user_id, first_name, last_name, date_of_birth, 
    nationality, residence_country, document_type, 
    document_number, phone_number
  INTO 
    v_user_id, v_first_name, v_last_name, v_date_of_birth,
    v_nationality, v_residence_country, v_document_type,
    v_document_number, v_phone_number
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
  
  -- Actualizar el usuario con los datos verificados del KYC
  UPDATE users
  SET 
    kyc_status = 'approved',
    kyc_id = p_kyc_id,
    kyc_verified_at = NOW(),
    verified = TRUE,
    name = CONCAT(v_first_name, ' ', v_last_name),
    phone = CONCAT(v_nationality, ':', v_phone_number),
    country = v_residence_country,
    date_of_birth = v_date_of_birth,
    nationality = v_nationality,
    residence_country = v_residence_country,
    document_type = v_document_type,
    document_number = v_document_number,
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
