/**
 * Create Admin User Script
 * Quick script to create admin user for testing
 */

const bcrypt = require('bcryptjs');

// Simple hash function
async function createAdmin() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Copy this SQL and run it in your database:');
  console.log('');
  console.log(`INSERT INTO users (id, email, "passwordHash", role, "firstName", "lastName", phone, status, "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  gen_random_uuid(),`);
  console.log(`  'admin@betex.com',`);
  console.log(`  '${hashedPassword}',`);
  console.log(`  'admin',`);
  console.log(`  'Admin',`);
  console.log(`  'BETEX',`);
  console.log(`  '+226 25 00 00 00',`);
  console.log(`  'active',`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`);`);
  console.log('');
  console.log('OR use these credentials if user already exists:');
  console.log('Email: admin@betex.com');
  console.log('Password: admin123');
}

createAdmin();
