/**
 * Package Controller
 * Handle package management requests
 */

const packageService = require('../services/packageService');

/**
 * Create a new package
 * POST /api/v1/packages
 */
const createPackage = async (req, res, next) => {
  try {
    const package = await packageService.createPackage(req.body);
    res.status(201).json({
      success: true,
      data: package
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all packages
 * GET /api/v1/packages
 */
const getPackages = async (req, res, next) => {
  try {
    const result = await packageService.getPackages(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get package by ID
 * GET /api/v1/packages/:id
 */
const getPackageById = async (req, res, next) => {
  try {
    const package = await packageService.getPackageById(req.params.id);
    res.status(200).json({
      success: true,
      data: package
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update package
 * PUT /api/v1/packages/:id
 */
const updatePackage = async (req, res, next) => {
  try {
    const package = await packageService.updatePackage(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: package
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete package
 * DELETE /api/v1/packages/:id
 */
const deletePackage = async (req, res, next) => {
  try {
    const result = await packageService.deletePackage(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update package status
 * PATCH /api/v1/packages/:id/status
 */
const updatePackageStatus = async (req, res, next) => {
  try {
    const { status, notes, failureReason } = req.body;
    const package = await packageService.updatePackageStatus(
      req.params.id,
      status,
      notes,
      failureReason,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: package
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get package history
 * GET /api/v1/packages/:id/history
 */
const getPackageHistory = async (req, res, next) => {
  try {
    const history = await packageService.getPackageHistory(req.params.id);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  updatePackageStatus,
  getPackageHistory
};
