-- Script para actualizar esquema existente (ejecutar solo si la base de datos ya existe)
-- Nota: Este script está comentado para evitar errores en instalaciones nuevas
-- Solo descomenta y ejecuta las líneas necesarias si estás actualizando una base existente

-- Ejemplo de cómo agregar columnas de forma segura:
-- Primero verifica si la columna existe, luego agrégala si es necesario

-- Para agregar nationality si no existe:
-- ALTER TABLE users ADD COLUMN nationality VARCHAR(3);

-- Para agregar residence_country si no existe:
-- ALTER TABLE users ADD COLUMN residence_country VARCHAR(3);

-- Para actualizar enum de status en transactions:
-- ALTER TABLE transactions 
-- MODIFY COLUMN status ENUM('pending_validation', 'pending_payment', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending_validation';

-- IMPORTANTE: Las columnas nationality, residence_country, gateway_status, sender_name, etc.
-- ya están incluidas en el script 01_create_database.sql actualizado
-- Solo usa este script si estás migrando desde una versión anterior del esquema

-- Agregar nuevas columnas a users si no existen
-- ALTER TABLE users 
-- ADD COLUMN nationality VARCHAR(3),
-- ADD COLUMN residence_country VARCHAR(3);

-- Actualizar enum de status en transactions
-- ALTER TABLE transactions 
-- MODIFY COLUMN status ENUM('pending_validation', 'pending_payment', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending_validation';

-- Agregar nuevas columnas a transactions
-- ALTER TABLE transactions
-- ADD COLUMN gateway_status VARCHAR(50),
-- ADD COLUMN sender_name VARCHAR(255),
-- ADD COLUMN sender_country VARCHAR(3),
-- ADD COLUMN sender_bank_account_id INT,
-- ADD COLUMN assigned_admin_id VARCHAR(36),
-- ADD COLUMN payment_proof_url TEXT,
-- ADD COLUMN validated_at TIMESTAMP NULL,
-- ADD COLUMN paid_at TIMESTAMP NULL;

-- Agregar claves foráneas si no existen
-- ALTER TABLE transactions
-- ADD CONSTRAINT fk_sender_bank_account
-- FOREIGN KEY (sender_bank_account_id) REFERENCES user_bank_accounts(id) ON DELETE SET NULL,
-- ADD CONSTRAINT fk_assigned_admin
-- FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL;
