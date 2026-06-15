-- Create admin user
-- Email: admin@betex.com
-- Password: admin123

INSERT INTO users (
  id, 
  email, 
  "passwordHash", 
  role, 
  "firstName", 
  "lastName", 
  phone, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@betex.com',
  '$2a$10$puvIULvTL0sLHlSMVyNlOuX1cNmAg/8KNibDPILRE5Z4aL6I7rccy',
  'admin',
  'Admin',
  'BETEX',
  '+226 25 00 00 00',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify user created
SELECT id, email, role, "firstName", "lastName" FROM users WHERE email = 'admin@betex.com';
