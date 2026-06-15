/**
 * Scheduled Delivery Controller
 * Manages deliveries scheduled for future dates/times
 */

const { ScheduledDelivery, User, Driver } = require('../models');
const logger = require('../utils/logger');
const { generateScheduledTracking } = require('../utils/trackingGenerator');
const { Op } = require('sequelize');

/**
 * Create scheduled delivery
 * POST /api/v1/scheduled-deliveries
 */
exports.createScheduledDelivery = async (req, res) => {
  try {
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      scheduledDate,
      scheduledTimeSlot,
      specificTime,
      deliveryType,
      description,
      weight,
      price
    } = req.body;
    
    // Validate required fields
    if (!pickupAddress || !deliveryAddress || !scheduledDate || !scheduledTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Pickup address, delivery address, scheduled date, and time slot are required'
      });
    }
    
    // Validate date is in the future
    const scheduledDateObj = new Date(scheduledDate);
    if (scheduledDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }
    
    // Generate tracking number
    const trackingNumber = generateScheduledTracking();
    
    // Create scheduled delivery
    const scheduledDelivery = await ScheduledDelivery.create({
      clientId: req.user.id,
      trackingNumber,
      pickupAddress,
      pickupLat: pickupLat || null,
      pickupLng: pickupLng || null,
      deliveryAddress,
      deliveryLat: deliveryLat || null,
      deliveryLng: deliveryLng || null,
      scheduledDate: scheduledDateObj,
      scheduledTimeSlot,
      specificTime: specificTime || null,
      deliveryType: deliveryType || 'local',
      description: description || null,
      weight: weight ? parseFloat(weight) : null,
      price: price ? parseFloat(price) : 0,
      status: 'pending_approval'
    });
    
    logger.info(`Scheduled delivery created: ${scheduledDelivery.id} for ${scheduledDate}`);
    
    res.status(201).json({
      success: true,
      message: 'Scheduled delivery created successfully',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error creating scheduled delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating scheduled delivery',
      error: error.message
    });
  }
};

/**
 * Get scheduled deliveries
 * GET /api/v1/scheduled-deliveries
 */
exports.getScheduledDeliveries = async (req, res) => {
  try {
    const { date, status, clientId } = req.query;
    
    const whereClause = {};
    
    // If not admin, only show own deliveries
    if (req.user.role !== 'admin') {
      whereClause.clientId = req.user.id;
    } else if (clientId) {
      whereClause.clientId = clientId;
    }
    
    if (status) whereClause.status = status;
    
    if (date) {
      const searchDate = new Date(date);
      whereClause.scheduledDate = searchDate;
    }
    
    const scheduledDeliveries = await ScheduledDelivery.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'name', 'phone', 'vehicleType']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      order: [['scheduledDate', 'ASC'], ['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: scheduledDeliveries
    });
  } catch (error) {
    logger.error('Error fetching scheduled deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled deliveries',
      error: error.message
    });
  }
};

/**
 * Get scheduled delivery by ID
 * GET /api/v1/scheduled-deliveries/:id
 */
exports.getScheduledDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'name', 'phone', 'vehicleType']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && scheduledDelivery.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this delivery'
      });
    }
    
    res.json({
      success: true,
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error fetching scheduled delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled delivery',
      error: error.message
    });
  }
};

/**
 * Update scheduled delivery
 * PUT /api/v1/scheduled-deliveries/:id
 */
exports.updateScheduledDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      scheduledDate,
      scheduledTimeSlot,
      specificTime,
      pickupAddress,
      deliveryAddress,
      description,
      weight
    } = req.body;
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id);
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin') {
      if (scheduledDelivery.clientId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this delivery'
        });
      }
      
      // Clients can only update pending deliveries
      if (scheduledDelivery.status !== 'pending_approval') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update delivery after approval'
        });
      }
    }
    
    // Update fields
    if (scheduledDate) {
      const newDate = new Date(scheduledDate);
      if (newDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }
      scheduledDelivery.scheduledDate = newDate;
    }
    if (scheduledTimeSlot) scheduledDelivery.scheduledTimeSlot = scheduledTimeSlot;
    if (specificTime !== undefined) scheduledDelivery.specificTime = specificTime;
    if (pickupAddress) scheduledDelivery.pickupAddress = pickupAddress;
    if (deliveryAddress) scheduledDelivery.deliveryAddress = deliveryAddress;
    if (description !== undefined) scheduledDelivery.description = description;
    if (weight !== undefined) scheduledDelivery.weight = weight ? parseFloat(weight) : null;
    
    await scheduledDelivery.save();
    
    logger.info(`Scheduled delivery ${id} updated`);
    
    res.json({
      success: true,
      message: 'Scheduled delivery updated successfully',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error updating scheduled delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating scheduled delivery',
      error: error.message
    });
  }
};

/**
 * Approve scheduled delivery (Admin)
 * PUT /api/v1/scheduled-deliveries/:id/approve
 */
exports.approveScheduledDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, notes } = req.body;
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id);
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    if (scheduledDelivery.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve pending deliveries'
      });
    }
    
    scheduledDelivery.status = 'approved';
    scheduledDelivery.approvedBy = req.user.id;
    scheduledDelivery.approvedAt = new Date();
    if (price !== undefined) scheduledDelivery.price = parseFloat(price);
    if (notes) scheduledDelivery.adminNotes = notes;
    
    await scheduledDelivery.save();
    
    logger.info(`Scheduled delivery ${id} approved by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Scheduled delivery approved',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error approving scheduled delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving scheduled delivery',
      error: error.message
    });
  }
};

/**
 * Assign driver to scheduled delivery (Admin)
 * PUT /api/v1/scheduled-deliveries/:id/assign
 */
exports.assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id);
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    // Verify driver exists
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    scheduledDelivery.driverId = driverId;
    scheduledDelivery.status = 'scheduled';
    
    await scheduledDelivery.save();
    
    logger.info(`Driver ${driverId} assigned to scheduled delivery ${id}`);
    
    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error assigning driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning driver',
      error: error.message
    });
  }
};

/**
 * Update delivery status (Admin/Driver)
 * PUT /api/v1/scheduled-deliveries/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id);
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    // Check authorization for drivers
    if (req.user.role === 'driver') {
      if (!scheduledDelivery.driverId || scheduledDelivery.driverId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not assigned to this delivery'
        });
      }
    }
    
    scheduledDelivery.status = status;
    if (notes) {
      scheduledDelivery.adminNotes = (scheduledDelivery.adminNotes || '') + '\n' + notes;
    }
    if (status === 'completed') {
      scheduledDelivery.completedAt = new Date();
    }
    
    await scheduledDelivery.save();
    
    logger.info(`Scheduled delivery ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * Cancel scheduled delivery
 * PUT /api/v1/scheduled-deliveries/:id/cancel
 */
exports.cancelScheduledDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const scheduledDelivery = await ScheduledDelivery.findByPk(id);
    
    if (!scheduledDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled delivery not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && scheduledDelivery.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this delivery'
      });
    }
    
    // Cannot cancel completed deliveries
    if (scheduledDelivery.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed delivery'
      });
    }
    
    scheduledDelivery.status = 'cancelled';
    if (reason) {
      scheduledDelivery.adminNotes = (scheduledDelivery.adminNotes || '') + '\nCancellation: ' + reason;
    }
    
    await scheduledDelivery.save();
    
    logger.info(`Scheduled delivery ${id} cancelled`);
    
    res.json({
      success: true,
      message: 'Scheduled delivery cancelled',
      data: scheduledDelivery
    });
  } catch (error) {
    logger.error('Error cancelling scheduled delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling scheduled delivery',
      error: error.message
    });
  }
};
