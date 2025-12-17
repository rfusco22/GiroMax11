-- Script para crear un usuario de Gerencia
-- Este script crea un usuario con rol 'gerencia' para acceder al panel de administración

-- IMPORTANTE: Cambia el email y la contraseña antes de ejecutar este script

-- Usuario de Gerencia
-- Email: gerencia@girosmax.com
-- Password: GirosMax2024! (debe ser cambiado después del primer inicio de sesión)
-- Hash generado con bcrypt rounds=10

INSERT INTO users (
  id, 
  email, 
  password_hash, 
  name, 
  phone, 
  country, 
  role, 
  verified, 
  created_at
) VALUES (
  UUID(),
  'gerencia@girosmax.com',
  '$2a$10$YourHashedPasswordHere', -- IMPORTANTE: Reemplazar con el hash real
  'Usuario Gerencia',
  '+1234567890',
  'US',
  'gerencia',
  TRUE,
  CURRENT_TIMESTAMP
);

-- Crear usuario de prueba para gerencia (para desarrollo)
-- Email: admin@girosmax.com
-- Password: admin123
-- Hash: $2a$10$rBV2xDYW6Zz8YvLGX0.LOuXH1kWLZ9qVZYGRGzGzF3qJYvYGVZYGe

INSERT INTO users (
  id, 
  email, 
  password_hash, 
  name, 
  phone, 
  country, 
  role, 
  verified, 
  created_at
) VALUES (
  'gerencia-admin-001',
  'admin@girosmax.com',
  '$2a$10$rBV2xDYW6Zz8YvLGX0.LOuXH1kWLZ9qVZYGRGzGzF3qJYvYGVZYGe',
  'Administrador Principal',
  '+5930999999999',
  'EC',
  'gerencia',
  TRUE,
  CURRENT_TIMESTAMP
);

-- Verificar que el usuario fue creado correctamente
SELECT id, email, name, role, verified, created_at 
FROM users 
WHERE role = 'gerencia';
