/**
 * Revenue Calculation Service
 * Handles daily and monthly profit/revenue calculations
 */

const logger = require('../utils/logger');

/**
 * Calculate daily revenue and profit for a specific driver
 * @param {object} options - { driverId, date, deliveries, fuelCost, salaryAmount }
 * @returns {object} Daily metrics
 */
const calculateDailyMetrics = (options = {}) => {
  const {
    driverId = null,
    date = new Date(),
    deliveries = [],
    fuelCost = 2000, // FCFA
    salaryAmount = 0 // Not included in daily calc
  } = options;

  // Calculate total revenue from all deliveries
  const totalRevenue = deliveries.reduce((sum, delivery) => {
    if (delivery.status === 'completed' || delivery.status === 'approved') {
      return sum + (delivery.deliveryPrice || 0);
    }
    return sum;
  }, 0);

  // Daily expenses (fuel only)
  const dailyExpenses = fuelCost;

  // Daily profit
  const dailyProfit = totalRevenue - dailyExpenses;

  logger.info(`Daily metrics for ${driverId} on ${date}:
    Total Revenue: ${totalRevenue} FCFA
    Daily Expenses (Fuel): ${dailyExpenses} FCFA
    Daily Profit: ${dailyProfit} FCFA
    Deliveries: ${deliveries.length}`);

  return {
    date: new Date(date),
    driverId,
    totalDeliveries: deliveries.length,
    totalRevenue,
    dailyExpenses,
    dailyProfit,
    percentageProfit: totalRevenue > 0 ? (dailyProfit / totalRevenue) * 100 : 0,
    status: dailyProfit >= 0 ? 'profitable' : 'loss'
  };
};

/**
 * Calculate company daily metrics (aggregate all drivers)
 * @param {array} drivers - Array of driver daily metrics
 * @returns {object} Aggregated daily metrics
 */
const calculateCompanyDailyMetrics = (drivers = []) => {
  const totalRevenue = drivers.reduce(
    (sum, driver) => sum + driver.totalRevenue,
    0
  );
  const totalExpenses = drivers.reduce(
    (sum, driver) => sum + driver.dailyExpenses,
    0
  );
  const totalProfit = totalRevenue - totalExpenses;
  const totalDeliveries = drivers.reduce(
    (sum, driver) => sum + driver.totalDeliveries,
    0
  );

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalDeliveries,
    numberOfDrivers: drivers.length,
    averageRevenuePerDriver: drivers.length > 0 ? totalRevenue / drivers.length : 0,
    averageProfitPerDriver: drivers.length > 0 ? totalProfit / drivers.length : 0,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  };
};

/**
 * Calculate monthly metrics for a driver
 * @param {object} options - { driverId, year, month, dailyMetrics, salaryAmount }
 * @returns {object} Monthly metrics
 */
const calculateMonthlyMetrics = (options = {}) => {
  const {
    driverId = null,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    dailyMetrics = [],
    salaryAmount = 60000 // FCFA
  } = options;

  // Sum all daily metrics
  const totalRevenue = dailyMetrics.reduce(
    (sum, daily) => sum + daily.totalRevenue,
    0
  );
  const totalExpenses = dailyMetrics.reduce(
    (sum, daily) => sum + daily.dailyExpenses,
    0
  );
  const totalDeliveries = dailyMetrics.reduce(
    (sum, daily) => sum + daily.totalDeliveries,
    0
  );

  // Monthly salary is paid separately (not deducted from daily profit)
  const profitBeforeSalary = totalRevenue - totalExpenses;
  const profitAfterSalary = profitBeforeSalary - salaryAmount;
  const totalCost = totalExpenses + salaryAmount;

  logger.info(`Monthly metrics for ${driverId} (${month}/${year}):
    Total Revenue: ${totalRevenue} FCFA
    Daily Expenses (Fuel): ${totalExpenses} FCFA
    Monthly Salary: ${salaryAmount} FCFA
    Total Cost: ${totalCost} FCFA
    Profit (before salary): ${profitBeforeSalary} FCFA
    Profit (after salary): ${profitAfterSalary} FCFA
    Total Deliveries: ${totalDeliveries}`);

  return {
    month,
    year,
    driverId,
    totalRevenue,
    fuelExpenses: totalExpenses,
    monthlySalary: salaryAmount,
    totalCosts: totalCost,
    profitBeforeSalary,
    profitAfterSalary,
    totalDeliveries,
    averageDeliveriesPerDay:
      dailyMetrics.length > 0 ? totalDeliveries / dailyMetrics.length : 0,
    daysActive: dailyMetrics.length,
    profitMargin: totalRevenue > 0 ? (profitAfterSalary / totalRevenue) * 100 : 0
  };
};

/**
 * Calculate company monthly metrics (aggregate all drivers)
 * @param {array} drivers - Array of driver monthly metrics
 * @returns {object} Aggregated monthly metrics
 */
const calculateCompanyMonthlyMetrics = (drivers = []) => {
  const totalRevenue = drivers.reduce(
    (sum, driver) => sum + driver.totalRevenue,
    0
  );
  const totalFuelExpenses = drivers.reduce(
    (sum, driver) => sum + driver.fuelExpenses,
    0
  );
  const totalSalaries = drivers.reduce(
    (sum, driver) => sum + driver.monthlySalary,
    0
  );
  const totalExpenses = totalFuelExpenses + totalSalaries;
  const totalProfit = totalRevenue - totalExpenses;
  const totalDeliveries = drivers.reduce(
    (sum, driver) => sum + driver.totalDeliveries,
    0
  );

  return {
    totalRevenue,
    fuelExpenses: totalFuelExpenses,
    salaryExpenses: totalSalaries,
    totalExpenses,
    totalProfit,
    totalDeliveries,
    numberOfDrivers: drivers.length,
    averageRevenuePerDriver:
      drivers.length > 0 ? totalRevenue / drivers.length : 0,
    averageSalaryPerDriver:
      drivers.length > 0 ? totalSalaries / drivers.length : 0,
    averageProfitPerDriver:
      drivers.length > 0 ? totalProfit / drivers.length : 0,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  };
};

/**
 * Generate revenue breakdown by delivery type
 * @param {array} deliveries - Array of delivery objects
 * @returns {object} Revenue breakdown
 */
const generateRevenueBreakdown = (deliveries = []) => {
  const expressDeliveries = deliveries.filter(d => d.deliveryType === 'express');
  const scheduledDeliveries = deliveries.filter(
    d => d.deliveryType === 'scheduled'
  );

  const expressRevenue = expressDeliveries.reduce(
    (sum, d) => sum + (d.deliveryPrice || 0),
    0
  );
  const scheduledRevenue = scheduledDeliveries.reduce(
    (sum, d) => sum + (d.deliveryPrice || 0),
    0
  );
  const totalRevenue = expressRevenue + scheduledRevenue;

  return {
    totalRevenue,
    byType: {
      express: {
        count: expressDeliveries.length,
        revenue: expressRevenue,
        percentage:
          totalRevenue > 0 ? (expressRevenue / totalRevenue) * 100 : 0
      },
      scheduled: {
        count: scheduledDeliveries.length,
        revenue: scheduledRevenue,
        percentage:
          totalRevenue > 0 ? (scheduledRevenue / totalRevenue) * 100 : 0
      }
    }
  };
};

/**
 * Calculate driver success rate and quality metrics
 * @param {object} driver - Driver object with delivery stats
 * @returns {object} Quality metrics
 */
const calculateQualityMetrics = (driver = {}) => {
  const {
    totalDeliveries = 0,
    successfulDeliveries = 0,
    failedDeliveries = 0,
    rating = 0
  } = driver;

  const successRate =
    totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
  const failureRate =
    totalDeliveries > 0 ? (failedDeliveries / totalDeliveries) * 100 : 0;

  let performanceLevel = 'pending'; // Not enough data
  if (totalDeliveries >= 10) {
    if (successRate >= 98 && rating >= 4.8) {
      performanceLevel = 'excellent';
    } else if (successRate >= 95 && rating >= 4.5) {
      performanceLevel = 'good';
    } else if (successRate >= 90 && rating >= 4.0) {
      performanceLevel = 'satisfactory';
    } else {
      performanceLevel = 'needs_improvement';
    }
  }

  return {
    totalDeliveries,
    successfulDeliveries,
    failedDeliveries,
    successRate: Math.round(successRate * 100) / 100,
    failureRate: Math.round(failureRate * 100) / 100,
    rating: Math.round(rating * 100) / 100,
    performanceLevel,
    recommendedAction:
      performanceLevel === 'excellent'
        ? 'Bonus candidate'
        : performanceLevel === 'needs_improvement'
        ? 'Training required'
        : 'No action needed'
  };
};

module.exports = {
  calculateDailyMetrics,
  calculateCompanyDailyMetrics,
  calculateMonthlyMetrics,
  calculateCompanyMonthlyMetrics,
  generateRevenueBreakdown,
  calculateQualityMetrics
};
