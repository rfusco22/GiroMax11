-- Script 12: Add date_of_birth to users table
-- This allows user profile data to persist independently of KYC verification

-- Add date_of_birth column to users table
ALTER TABLE users 
ADD COLUMN date_of_birth DATE NULL AFTER country;

-- Add index for date_of_birth queries
ALTER TABLE users
ADD INDEX idx_date_of_birth (date_of_birth);
