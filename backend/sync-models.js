
require('dotenv').config();
const { sequelize, Driver, GPSPosition, Expense } = require('./src/models');

async function syncModels() {
  try {
    console.log('Synchronizing models...');
    
    await Driver.sync({ alter: true });
    console.log('Driver model synced successfully');
    
    await GPSPosition.sync({ alter: true });
    console.log('GPSPosition model synced successfully');
    
    await Expense.sync({ alter: true });
    console.log('Expense model synced successfully');
    
    console.log('All models synchronized!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing models:', error);
    process.exit(1);
  }
}

syncModels();
