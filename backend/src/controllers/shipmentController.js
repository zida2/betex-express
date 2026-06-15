/**
 * Shipment Controller
 * Manages national/international shipments with admin pricing workflow
 */

const { Shipment, User, Driver } = require('../models');
const logger = require('../utils/logger');
const { generateShipmentTracking } = require('../utils/trackingGenerator');
const { Op } = require('sequelize');

/**
 * Create shipment request
 * POST /api/v1/shipments
 */
exports.createShipment = async (req, res) => {
  try {
    const {
      recipientName,
      recipientPhone,
      destinationAddress,
      destinationLat,
      destinationLng,
      packageDescription,
      packageValue,
      weight
    } = req.body;
    
    // Validate required fields
    if (!recipientName || !recipientPhone || !destinationAddress || !packageDescription || !packageValue) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, phone, destination, package description, and value are required'
      });
    }
    
    // Generate tracking number
    const trackingNumber = generateShipmentTracking();
    
    // Create shipment
    const shipment = await Shipment.create({
      clientId: req.user.id,
      trackingNumber,
      recipientName,
      recipientPhone,
      destinationAddress,
      destinationLat: destinationLat || null,
      destinationLng: destinationLng || null,
      packageDescription,
      packageValue: parseFloat(packageValue),
      weight: weight ? parseFloat(weight) : null,
      status: 'pending_pricing',
      paymentStatus: 'unpaid'
    });
    
    logger.info(`Shipment created: ${shipment.id} with tracking ${trackingNumber}`);
    
    res.status(201).json({
      success: true,
      message: 'Shipment request created successfully',
      data: shipment
    });
  } catch (error) {
    logger.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipment',
      error: error.message
    });
  }
};

/**
 * Get shipments
 * GET /api/v1/shipments
 */
exports.getShipments = async (req, res) => {
  try {
    const { status, clientId, paymentStatus, startDate, endDate } = req.query;
    
    const whereClause = {};
    
    // If not admin, only show own shipments
    if (req.user.role !== 'admin') {
      whereClause.clientId = req.user.id;
    } else if (clientId) {
      whereClause.clientId = clientId;
    }
    
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }
    
    const shipments = await Shipment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'Pricer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'name', 'phone', 'vehicleType']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: shipments
    });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
};

/**
 * Track shipment by tracking number
 * GET /api/v1/shipments/:trackingNumber
 */
exports.trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const shipment = await Shipment.findOne({
      where: { trackingNumber },
      include: [
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'name', 'phone', 'vehicleType']
        }
      ]
    });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Public tracking - hide sensitive info
    const trackingInfo = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      recipientName: shipment.recipientName,
      destinationAddress: shipment.destinationAddress,
      createdAt: shipment.createdAt,
      deliveredAt: shipment.deliveredAt,
      driver: shipment.Driver ? {
        name: shipment.Driver.name,
        phone: shipment.Driver.phone
      } : null
    };
    
    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    logger.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking shipment',
      error: error.message
    });
  }
};

/**
 * Set shipment pricing (Admin)
 * PUT /api/v1/shipments/:id/price
 */
exports.priceShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAmount, additionalFees, notes } = req.body;
    
    if (!shippingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Shipping amount is required'
      });
    }
    
    const shipment = await Shipment.findByPk(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    if (shipment.status !== 'pending_pricing') {
      return res.status(400).json({
        success: false,
        message: `Cannot price shipment with status: ${shipment.status}`
      });
    }
    
    // Set pricing
    shipment.shippingAmount = parseFloat(shippingAmount);
    shipment.additionalFees = additionalFees ? parseFloat(additionalFees) : 0;
    shipment.totalAmount = shipment.shippingAmount + shipment.additionalFees;
    shipment.status = 'awaiting_payment';
    shipment.pricedBy = req.user.id;
    shipment.pricedAt = new Date();
    if (notes) {
      shipment.adminNotes = notes;
    }
    
    await shipment.save();
    
    // Fetch complete shipment
    const updatedShipment = await Shipment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'Pricer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    logger.info(`Shipment ${id} priced by admin ${req.user.id}: ${shipment.totalAmount}`);
    
    // TODO: Send notification to client about pricing
    
    res.json({
      success: true,
      message: 'Shipment priced successfully',
      data: updatedShipment
    });
  } catch (error) {
    logger.error('Error pricing shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error pricing shipment',
      error: error.message
    });
  }
};

/**
 * Mark shipment as paid (Client)
 * PUT /api/v1/shipments/:id/pay
 */
exports.payShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;
    
    const shipment = await Shipment.findByPk(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Verify client owns this shipment
    if (req.user.role !== 'admin' && shipment.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this shipment'
      });
    }
    
    if (shipment.status !== 'awaiting_payment') {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for shipment with status: ${shipment.status}`
      });
    }
    
    // Mark as paid
    shipment.paymentStatus = 'paid';
    shipment.status = 'paid';
    shipment.paidAt = new Date();
    
    // Store payment info in notes
    if (paymentMethod || transactionId) {
      const paymentInfo = {
        paymentMethod,
        transactionId,
        paidAt: new Date()
      };
      shipment.adminNotes = (shipment.adminNotes || '') + '\nPayment: ' + JSON.stringify(paymentInfo);
    }
    
    await shipment.save();
    
    logger.info(`Shipment ${id} marked as paid`);
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: shipment
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

/**
 * Update shipment status (Admin)
 * PUT /api/v1/shipments/:id/status
 */
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, driverId } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const shipment = await Shipment.findByPk(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Update status
    shipment.status = status;
    if (notes) {
      shipment.adminNotes = (shipment.adminNotes || '') + '\n' + notes;
    }
    if (driverId) {
      shipment.driverId = driverId;
    }
    if (status === 'delivered') {
      shipment.deliveredAt = new Date();
    }
    
    await shipment.save();
    
    logger.info(`Shipment ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: 'Shipment status updated',
      data: shipment
    });
  } catch (error) {
    logger.error('Error updating shipment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipment status',
      error: error.message
    });
  }
};

/**
 * Cancel shipment
 * PUT /api/v1/shipments/:id/cancel
 */
exports.cancelShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const shipment = await Shipment.findByPk(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && shipment.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this shipment'
      });
    }
    
    // Can only cancel if not yet delivered
    if (shipment.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered shipment'
      });
    }
    
    shipment.status = 'cancelled';
    if (reason) {
      shipment.adminNotes = (shipment.adminNotes || '') + '\nCancellation reason: ' + reason;
    }
    
    // Refund if already paid
    if (shipment.paymentStatus === 'paid') {
      shipment.paymentStatus = 'refunded';
    }
    
    await shipment.save();
    
    logger.info(`Shipment ${id} cancelled`);
    
    res.json({
      success: true,
      message: 'Shipment cancelled',
      data: shipment
    });
  } catch (error) {
    logger.error('Error cancelling shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling shipment',
      error: error.message
    });
  }
};
