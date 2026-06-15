/**
 * Create Admin via API
 */

const axios = require('axios');
const { User } = require('./src/models');
const authService = require('./src/services/authService');

async function createAdminUser() {
  try {
    // Check if admin exists
    const existing = await User.findOne({ where: { email: 'admin@betex.com' } });
    
    if (existing) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@betex.com');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await authService.hashPassword('admin123');
    
    await User.create({
      email: 'admin@betex.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'BETEX',
      phone: '+226 25 00 00 00',
      role: 'admin',
      status: 'active'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@betex.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('You can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
