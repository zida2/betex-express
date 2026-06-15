-- Migration to add 'client' role to enum_users_role
-- Run this script in your PostgreSQL database

-- Add 'client' value to the existing enum type
ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'client';

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
)
ORDER BY enumlabel;
