/**
 * Route Controller
 * Handles HTTP requests for route management
 */

const routeService = require('../services/routeService');
const logger = require('../utils/logger');

/**
 * Create a new route
 */
const createRoute = async (req, res, next) => {
  try {
    const route = await routeService.createRoute(req.body);
    logger.info(`Route created: ${route.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all routes with filtering
 */
const getRoutes = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      phase: req.query.phase,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await routeService.getRoutes(filters);
    
    res.status(200).json({
      success: true,
      data: result.routes,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get route by ID
 */
const getRouteById = async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update route status
 */
const updateRouteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const route = await routeService.updateRouteStatus(req.params.id, status);
    
    logger.info(`Route ${req.params.id} status updated to ${status}`);
    
    res.status(200).json({
      success: true,
      message: 'Route status updated successfully',
      data: route
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete route
 */
const deleteRoute = async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    await route.destroy();
    
    logger.info(`Route deleted: ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRouteById,
  updateRouteStatus,
  deleteRoute
};
