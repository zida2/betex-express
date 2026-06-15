const { sequelize } = require('./src/config/database');
const Announcement = require('./src/models/Announcement');

async function syncAnnouncement() {
  try {
    console.log('Syncing Announcement model...');
    await sequelize.authenticate();
    console.log('Database connection successful');
    await Announcement.sync({ alter: true });
    console.log('✅ Announcement model synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing model:', error);
    process.exit(1);
  }
}

syncAnnouncement();
