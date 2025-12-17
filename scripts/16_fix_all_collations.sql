-- Fix all collation mismatches across the entire database
-- This script ensures all tables use utf8mb4_unicode_ci collation

-- Fix users table
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix kyc_verifications table
ALTER TABLE kyc_verifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix kyc_verification_history table
ALTER TABLE kyc_verification_history CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix phone_verification_logs table
ALTER TABLE phone_verification_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix accounts table if it exists
ALTER TABLE accounts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix transactions table if it exists
ALTER TABLE transactions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix verifications table if it exists
ALTER TABLE verifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix notifications table if it exists
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recreate procedures with proper collation handling
DROP PROCEDURE IF EXISTS approve_kyc_verification;
DROP PROCEDURE IF EXISTS reject_kyc_verification;

-- Recreate approve_kyc_verification with simpler collation handling
DELIMITER //

CREATE PROCEDURE approve_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_notes TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  
  SELECT user_id INTO v_user_id 
  FROM kyc_verifications 
  WHERE id = p_kyc_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'KYC verification not found or not pending';
  END IF;
  
  UPDATE kyc_verifications
  SET 
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_kyc_id;
  
  UPDATE users
  SET 
    kyc_status = 'approved',
    kyc_id = p_kyc_id,
    kyc_verified_at = NOW(),
    verified = TRUE,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  INSERT IGNORE INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
  VALUES (p_kyc_id, 'pending', 'approved', p_reviewed_by, p_notes, NOW());
  
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

-- Recreate reject_kyc_verification with simpler collation handling
DELIMITER //

CREATE PROCEDURE reject_kyc_verification(
  IN p_kyc_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_rejection_reason TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  
  SELECT user_id INTO v_user_id 
  FROM kyc_verifications 
  WHERE id = p_kyc_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'KYC verification not found or not pending';
  END IF;
  
  UPDATE kyc_verifications
  SET 
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_kyc_id;
  
  UPDATE users
  SET 
    kyc_status = 'rejected',
    kyc_id = p_kyc_id,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  INSERT IGNORE INTO kyc_verification_history (kyc_id, status_from, status_to, changed_by, reason, created_at)
  VALUES (p_kyc_id, 'pending', 'rejected', p_reviewed_by, p_rejection_reason, NOW());
  
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
