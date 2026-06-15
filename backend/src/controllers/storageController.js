/**
 * Storage Service Controller
 * Manages client storage service requests and approvals
 */

const { ClientStorage, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Request storage service (Client)
 * POST /api/v1/storage/request
 */
exports.requestStorage = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { notes } = req.body;
    
    // Check if client already has a storage request
    const existingRequest = await ClientStorage.findOne({
      where: { clientId }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `Storage service already ${existingRequest.status}`,
        data: existingRequest
      });
    }
    
    // Create new storage request
    const storageRequest = await ClientStorage.create({
      clientId,
      status: 'requested',
      notes,
      requestedAt: new Date()
    });
    
    logger.info(`Storage request created for client ${clientId}`);
    
    res.status(201).json({
      success: true,
      message: 'Storage service request submitted successfully',
      data: storageRequest
    });
  } catch (error) {
    logger.error('Error requesting storage service:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting storage request',
      error: error.message
    });
  }
};

/**
 * Get all storage requests (Admin)
 * GET /api/v1/storage/requests
 */
exports.getStorageRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    const requests = await ClientStorage.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      order: [['requestedAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    logger.error('Error fetching storage requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage requests',
      error: error.message
    });
  }
};

/**
 * Get client's own storage service status
 * GET /api/v1/storage/my-storage
 */
exports.getMyStorage = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const storage = await ClientStorage.findOne({
      where: { clientId },
      include: [
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!storage) {
      return res.json({
        success: true,
        data: null,
        message: 'No storage service requested'
      });
    }
    
    res.json({
      success: true,
      data: storage
    });
  } catch (error) {
    logger.error('Error fetching storage service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage service',
      error: error.message
    });
  }
};

/**
 * Approve storage request (Admin)
 * PUT /api/v1/storage/requests/:id/approve
 */
exports.approveStorageRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const storageRequest = await ClientStorage.findByPk(id);
    
    if (!storageRequest) {
      return res.status(404).json({
        success: false,
        message: 'Storage request not found'
      });
    }
    
    if (storageRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve storage request with status: ${storageRequest.status}`
      });
    }
    
    // Approve the request
    storageRequest.status = 'active';
    storageRequest.approvedBy = req.user.id;
    storageRequest.approvedAt = new Date();
    if (notes) {
      storageRequest.notes = notes;
    }
    
    await storageRequest.save();
    
    // Fetch complete data with relations
    const updatedRequest = await ClientStorage.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    logger.info(`Storage request ${id} approved by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Storage service approved successfully',
      data: updatedRequest
    });
  } catch (error) {
    logger.error('Error approving storage request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving storage request',
      error: error.message
    });
  }
};

/**
 * Reject storage request (Admin)
 * PUT /api/v1/storage/requests/:id/reject
 */
exports.rejectStorageRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const storageRequest = await ClientStorage.findByPk(id);
    
    if (!storageRequest) {
      return res.status(404).json({
        success: false,
        message: 'Storage request not found'
      });
    }
    
    if (storageRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject storage request with status: ${storageRequest.status}`
      });
    }
    
    // Update to terminated status (rejected)
    storageRequest.status = 'terminated';
    if (notes) {
      storageRequest.notes = notes;
    }
    
    await storageRequest.save();
    
    logger.info(`Storage request ${id} rejected by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Storage service request rejected',
      data: storageRequest
    });
  } catch (error) {
    logger.error('Error rejecting storage request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting storage request',
      error: error.message
    });
  }
};

/**
 * Suspend storage service (Admin)
 * PUT /api/v1/storage/requests/:id/suspend
 */
exports.suspendStorage = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const storageRequest = await ClientStorage.findByPk(id);
    
    if (!storageRequest) {
      return res.status(404).json({
        success: false,
        message: 'Storage service not found'
      });
    }
    
    if (storageRequest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only suspend active storage services'
      });
    }
    
    storageRequest.status = 'suspended';
    if (notes) {
      storageRequest.notes = notes;
    }
    
    await storageRequest.save();
    
    logger.info(`Storage service ${id} suspended by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Storage service suspended',
      data: storageRequest
    });
  } catch (error) {
    logger.error('Error suspending storage service:', error);
    res.status(500).json({
      success: false,
      message: 'Error suspending storage service',
      error: error.message
    });
  }
};

/**
 * Reactivate storage service (Admin)
 * PUT /api/v1/storage/requests/:id/reactivate
 */
exports.reactivateStorage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storageRequest = await ClientStorage.findByPk(id);
    
    if (!storageRequest) {
      return res.status(404).json({
        success: false,
        message: 'Storage service not found'
      });
    }
    
    if (storageRequest.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Can only reactivate suspended storage services'
      });
    }
    
    storageRequest.status = 'active';
    await storageRequest.save();
    
    logger.info(`Storage service ${id} reactivated by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Storage service reactivated',
      data: storageRequest
    });
  } catch (error) {
    logger.error('Error reactivating storage service:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating storage service',
      error: error.message
    });
  }
};
