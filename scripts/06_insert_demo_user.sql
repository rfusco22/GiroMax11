-- Insert demo user for testing
-- Password: demo123 (hashed with bcrypt)

-- Check if demo user already exists, delete if present
DELETE FROM users WHERE email = 'demo@girosmax.com';
DELETE FROM users WHERE email = 'admin@girosmax.com';

-- Changed 'password' to 'password_hash' and added id field to match schema
-- Insert demo user with bcrypt hashed password for "demo123"
INSERT INTO users (id, email, password_hash, name, phone, country, role, verified, created_at)
VALUES (
  UUID(),
  'demo@girosmax.com',
  '$2a$10$YQ98PzqCvVgHIBkq5YHHAu5T5wXZ7H0KMmrfH.3.6gqk8wXxK7hgm',
  'Usuario Demo',
  '+1 555 123 4567',
  'US',
  'cliente',
  true,
  NOW()
);

-- Added admin user for testing admin features
-- Insert admin user with same password "demo123"
INSERT INTO users (id, email, password_hash, name, phone, country, role, verified, created_at)
VALUES (
  UUID(),
  'admin@girosmax.com',
  '$2a$10$YQ98PzqCvVgHIBkq5YHHAu5T5wXZ7H0KMmrfH.3.6gqk8wXxK7hgm',
  'Administrador Demo',
  '+1 555 987 6543',
  'US',
  'administrador',
  true,
  NOW()
);

-- Verify insertion
SELECT id, email, name, role, verified FROM users WHERE email IN ('demo@girosmax.com', 'admin@girosmax.com');
