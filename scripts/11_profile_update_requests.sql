-- Script 11: Profile Update Requests System
-- Allows users to request profile updates that require management approval

CREATE TABLE IF NOT EXISTS profile_update_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  
  -- Updated profile data
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(3),
  residence_country VARCHAR(3),
  document_type VARCHAR(50),
  document_number VARCHAR(100),
  
  -- Request status
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  
  -- Review information
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored procedure to approve profile update request
DELIMITER //

CREATE PROCEDURE approve_profile_update(
  IN p_request_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_notes TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  DECLARE v_kyc_id VARCHAR(36);
  DECLARE v_first_name VARCHAR(255);
  DECLARE v_last_name VARCHAR(255);
  DECLARE v_phone VARCHAR(50);
  DECLARE v_date_of_birth DATE;
  DECLARE v_nationality VARCHAR(3);
  DECLARE v_residence_country VARCHAR(3);
  DECLARE v_document_type VARCHAR(50);
  DECLARE v_document_number VARCHAR(100);
  
  -- Get request data
  SELECT user_id, first_name, last_name, phone, date_of_birth, 
         nationality, residence_country, document_type, document_number
  INTO v_user_id, v_first_name, v_last_name, v_phone, v_date_of_birth,
       v_nationality, v_residence_country, v_document_type, v_document_number
  FROM profile_update_requests
  WHERE id = p_request_id;
  
  -- Get user's KYC ID
  SELECT kyc_id INTO v_kyc_id FROM users WHERE id = v_user_id;
  
  -- Update KYC verification record
  UPDATE kyc_verifications
  SET 
    first_name = v_first_name,
    last_name = v_last_name,
    phone_number = v_phone,
    date_of_birth = v_date_of_birth,
    nationality = v_nationality,
    residence_country = v_residence_country,
    document_type = v_document_type,
    document_number = v_document_number,
    updated_at = NOW()
  WHERE id = v_kyc_id;
  
  -- Update user name
  UPDATE users
  SET 
    name = CONCAT(v_first_name, ' ', v_last_name),
    phone = v_phone,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Mark request as approved
  UPDATE profile_update_requests
  SET 
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, type, created_at)
  VALUES (
    v_user_id,
    'Actualización de Perfil Aprobada',
    'Tu solicitud de actualización de perfil ha sido aprobada.',
    'success',
    NOW()
  );
  
END //

DELIMITER ;

-- Stored procedure to reject profile update request
DELIMITER //

CREATE PROCEDURE reject_profile_update(
  IN p_request_id VARCHAR(36),
  IN p_reviewed_by VARCHAR(36),
  IN p_rejection_reason TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(36);
  
  -- Get user ID
  SELECT user_id INTO v_user_id
  FROM profile_update_requests
  WHERE id = p_request_id;
  
  -- Mark request as rejected
  UPDATE profile_update_requests
  SET 
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, type, created_at)
  VALUES (
    v_user_id,
    'Actualización de Perfil Rechazada',
    CONCAT('Tu solicitud de actualización de perfil ha sido rechazada. Motivo: ', p_rejection_reason),
    'error',
    NOW()
  );
  
END //

DELIMITER ;
