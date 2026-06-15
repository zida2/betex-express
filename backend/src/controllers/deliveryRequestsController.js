/**
 * Delivery Requests Controller
 * Handles all delivery request operations with automatic quartier detection
 */

const { DeliveryRequest, Zone, Driver, User } = require('../models');
const pricingService = require('../services/pricingService');
const { determinerQuartier, estDansOuagadougou } = require('../utils/ouagaQuartiers');
const logger = require('../utils/logger');

/**
 * POST /delivery-requests
 * Create new delivery request
 */
const createDeliveryRequest = async (req, res) => {
  try {
    const {
      senderName,
      senderPhone,
      senderAddress,
      senderLat,
      senderLng,
      receiverName,
      receiverPhone,
      receiverAddress,
      receiverLat,
      receiverLng,
      description,
      weight,
      packagePrice,
      isPaid,
      deliveryType,
      distanceKm,
      zoneId,
      scheduledDate,
      timeSlot
    } = req.body;

    // Validate required fields
    if (!senderName || !senderPhone || !receiverName || !receiverPhone) {
      return res.status(400).json({
        success: false,
        message: 'Sender and receiver information is required'
      });
    }

    if (!description || !weight || !packagePrice) {
      return res.status(400).json({
        success: false,
        message: 'Package details (description, weight, price) are required'
      });
    }

    if (!deliveryType || !['express', 'scheduled'].includes(deliveryType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery type is required (express or scheduled)'
      });
    }

    // Validate scheduled delivery required fields regardless of location
    if (deliveryType === 'scheduled') {
      if (!scheduledDate || !timeSlot) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date and time slot are required'
        });
      }
    }

    // Par défaut, pas de prix de livraison (sera défini par l'admin lors de l'approbation)
    let deliveryPrice = null;

    // Seulement calculer le prix si on a la localisation du destinataire ET (distance pour express)
    if (deliveryType === 'express' && distanceKm) {
      // Calculate express price if distance provided
      const pricingConfig = {
        basePrice: 500,
        pricePerKm: 250,
        minPrice: 500,
        maxPrice: 10000
      };

      deliveryPrice = pricingService.calculateExpressPrice(
        distanceKm,
        pricingConfig
      );
    } else if (deliveryType === 'scheduled' && receiverLat && receiverLng) {
      // Calculate scheduled price only if we have location
      // Get zones
      const zones = await Zone.findAll({ where: { isActive: true } });

      if (zones && zones.length > 0) {
        try {
          const zoneInfo = pricingService.calculateScheduledPrice(
            receiverLat,
            receiverLng,
            zones
          );
          deliveryPrice = zoneInfo.price;
        } catch (error) {
          // No zone found, prix laissé à null
          logger.warn(`No zone found for coordinates, price will be set by admin: ${error.message}`);
        }
      } else {
        // No zones configured, prix laissé à null
        logger.warn('No zones configured, price will be set by admin');
      }
    } else {
      logger.info('No recipient location provided, delivery price will be set by admin');
    }

    // Generate tracking number
    const trackingNumber = `BX${Date.now()}`;

    // Déterminer automatiquement le quartier du client (sender)
    let senderQuartier = null;
    let senderQuartierNom = null;
    let senderZone = null;

    if (senderLat && senderLng) {
      if (estDansOuagadougou(senderLat, senderLng)) {
        const quartierInfo = determinerQuartier(senderLat, senderLng);
        if (quartierInfo) {
          senderQuartier = quartierInfo.id;
          senderQuartierNom = quartierInfo.nom;
          senderZone = quartierInfo.zone;
          logger.info(`Client localisé: ${quartierInfo.nom}, ${quartierInfo.zone} (${quartierInfo.distance}m du centre)`);
        }
      }
    }

    // Déterminer le quartier du destinataire
    let receiverQuartier = null;
    let receiverQuartierNom = null;
    let receiverZone = null;

    if (receiverLat && receiverLng) {
      if (estDansOuagadougou(receiverLat, receiverLng)) {
        const quartierInfo = determinerQuartier(receiverLat, receiverLng);
        if (quartierInfo) {
          receiverQuartier = quartierInfo.id;
          receiverQuartierNom = quartierInfo.nom;
          receiverZone = quartierInfo.zone;
          logger.info(`Destinataire localisé: ${quartierInfo.nom}, ${quartierInfo.zone} (${quartierInfo.distance}m du centre)`);
        }
      }
    }

    // Create delivery request
  const delivery = await DeliveryRequest.create({
    trackingNumber: trackingNumber,
    senderName: senderName,
    senderPhone: senderPhone,
    senderAddress: senderAddress,
    senderLat: senderLat,
    senderLng: senderLng,
    senderQuartier: senderQuartierNom,
    senderZone: senderZone,
    receiverName: receiverName,
    receiverPhone: receiverPhone,
    receiverAddress: receiverAddress,
    receiverLat: receiverLat,
    receiverLng: receiverLng,
    receiverQuartier: receiverQuartierNom,
    receiverZone: receiverZone,
    description,
    weight,
    packagePrice: Math.round(Number(packagePrice)),
    isPaid: isPaid || false,
    deliveryType: deliveryType,
    deliveryPrice: deliveryPrice != null ? Math.round(Number(deliveryPrice)) : null,
    distanceKm: distanceKm || null,
    zoneId: deliveryType === 'scheduled' ? zoneId : null,
    scheduledDate: deliveryType === 'scheduled' ? scheduledDate : null,
    timeSlot: deliveryType === 'scheduled' ? timeSlot : null,
    status: 'pending_approval'
  });

    logger.info(
      `Delivery request created: ${trackingNumber} (${deliveryType}) - ${deliveryPrice} FCFA` +
      (senderQuartierNom ? ` - Client: ${senderQuartierNom}` : '') +
      (receiverQuartierNom ? ` - Dest: ${receiverQuartierNom}` : '')
    );

    return res.status(201).json({
      success: true,
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber,
        senderName: delivery.senderName,
        senderPhone: delivery.senderPhone,
        senderAddress: delivery.senderAddress,
        senderQuartier: delivery.senderQuartier,
        senderZone: delivery.senderZone,
        receiverName: delivery.receiverName,
        receiverPhone: delivery.receiverPhone,
        receiverAddress: delivery.receiverAddress,
        receiverQuartier: delivery.receiverQuartier,
        receiverZone: delivery.receiverZone,
        description: delivery.description,
        weight: delivery.weight,
        packagePrice: delivery.packagePrice,
        isPaid: delivery.isPaid,
        deliveryType: delivery.deliveryType,
        deliveryPrice: delivery.deliveryPrice,
        distanceKm: delivery.distanceKm,
        status: delivery.status,
        driverId: delivery.driverId,
        driverName: delivery.driverName,
        scheduledDate: delivery.scheduledDate,
        timeSlot: delivery.timeSlot,
        createdAt: delivery.createdAt,
        approvedAt: delivery.approvedAt
      }
    });
  } catch (error) {
    logger.error('Create delivery request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create delivery request',
      error: error.message
    });
  }
};

/**
 * GET /delivery-requests
 * Get all delivery requests with filters
 * - Admins can see all requests
 * - Clients can only see their own requests (filtered by phone)
 */
const getDeliveryRequests = async (req, res) => {
  try {
    const { status, deliveryType, driverId, receiverPhone, senderPhone, page = 1, limit = 20 } = req.query;
    const { Op } = require('sequelize');

    let where = {};

    // If user is client, filter to show only their requests
    if (req.user.role === 'client') {
      const userPhone = req.user.phone;
      if (receiverPhone) {
        where.receiverPhone = receiverPhone;
      } else if (senderPhone) {
        where.senderPhone = senderPhone;
      } else if (userPhone) {
        // Filter by user's phone as either sender or receiver
        where[Op.or] = [
          { senderPhone: userPhone },
          { receiverPhone: userPhone }
        ];
      }
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (deliveryType && deliveryType !== 'all') {
      where.deliveryType = deliveryType;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await DeliveryRequest.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const formattedRequests = rows.map(req => ({
      id: req.id,
      trackingNumber: req.trackingNumber,
      senderName: req.senderName,
      senderPhone: req.senderPhone,
      senderAddress: req.senderAddress,
      senderQuartier: req.senderQuartier,
      senderZone: req.senderZone,
      receiverName: req.receiverName,
      receiverPhone: req.receiverPhone,
      receiverAddress: req.receiverAddress,
      receiverQuartier: req.receiverQuartier,
      receiverZone: req.receiverZone,
      description: req.description,
      weight: req.weight,
      packagePrice: req.packagePrice,
      isPaid: req.isPaid,
      deliveryType: req.deliveryType,
      deliveryPrice: req.deliveryPrice,
      distanceKm: req.distanceKm,
      status: req.status,
      driverId: req.driverId,
      driverName: req.driverName,
      scheduledDate: req.scheduledDate,
      timeSlot: req.timeSlot,
      createdAt: req.createdAt,
      approvedAt: req.approvedAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedRequests,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Get delivery requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get delivery requests',
      error: error.message
    });
  }
};

/**
 * GET /delivery-requests/:id
 * Get single delivery request
 */
const getDeliveryRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await DeliveryRequest.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber,
        senderName: delivery.senderName,
        senderPhone: delivery.senderPhone,
        senderAddress: delivery.senderAddress,
        senderLat: delivery.senderLat,
        senderLng: delivery.senderLng,
        receiverName: delivery.receiverName,
        receiverPhone: delivery.receiverPhone,
        receiverAddress: delivery.receiverAddress,
        receiverLat: delivery.receiverLat,
        receiverLng: delivery.receiverLng,
        description: delivery.description,
        weight: delivery.weight,
        packagePrice: delivery.packagePrice,
        isPaid: delivery.isPaid,
        deliveryType: delivery.deliveryType,
        deliveryPrice: delivery.deliveryPrice,
        distanceKm: delivery.distanceKm,
        status: delivery.status,
        driverId: delivery.driverId,
        driverName: delivery.driverName,
        scheduledDate: delivery.scheduledDate,
        timeSlot: delivery.timeSlot,
        adminNotes: delivery.adminNotes,
        rejectionReason: delivery.rejectionReason,
        createdAt: delivery.createdAt,
        approvedAt: delivery.approvedAt,
        rejectedAt: delivery.rejectedAt,
        deliveredAt: delivery.deliveredAt
      }
    });
  } catch (error) {
    logger.error('Get delivery request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get delivery request',
      error: error.message
    });
  }
};

/**
 * POST /delivery-requests/:id/approve
 * Admin approve delivery request
 */
const approveDeliveryRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, adminNotes, deliveryPrice } = req.body;

    const delivery = await DeliveryRequest.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found'
      });
    }

    if (delivery.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${delivery.status}`
      });
    }

    // Update delivery
    const updateData = {
      status: 'approved',
      driverId: driverId || null,
      adminNotes: adminNotes || null,
      approvedAt: new Date()
    };

    // Update delivery price if provided
    if (deliveryPrice) {
      updateData.deliveryPrice = deliveryPrice;
    }

    await delivery.update(updateData);

    logger.info(`Delivery request approved: ${delivery.trackingNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Delivery request approved',
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        approvedAt: delivery.approvedAt
      }
    });
  } catch (error) {
    logger.error('Approve delivery request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve delivery request',
      error: error.message
    });
  }
};

/**
 * POST /delivery-requests/:id/reject
 * Admin reject delivery request
 */
const rejectDeliveryRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const delivery = await DeliveryRequest.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found'
      });
    }

    if (delivery.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${delivery.status}`
      });
    }

    // Update delivery
    await delivery.update({
      status: 'rejected',
      rejectionReason: rejectionReason,
      rejectedAt: new Date()
    });

    logger.info(
      `Delivery request rejected: ${delivery.trackingNumber} - Reason: ${rejectionReason}`
    );

    return res.status(200).json({
      success: true,
      message: 'Delivery request rejected',
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        rejectionReason: delivery.rejectionReason,
        rejectedAt: delivery.rejectedAt
      }
    });
  } catch (error) {
    logger.error('Reject delivery request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject delivery request',
      error: error.message
    });
  }
};

/**
 * POST /delivery-requests/:id/location-token
 * Save location token for a delivery request
 */
const saveLocationToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const delivery = await DeliveryRequest.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery request not found'
      });
    }

    await delivery.update({
      locationToken: token,
      locationTokenCreatedAt: new Date()
    });

    logger.info(`Location token saved for delivery: ${delivery.trackingNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Location token saved successfully'
    });
  } catch (error) {
    logger.error('Save location token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save location token',
      error: error.message
    });
  }
};

/**
 * GET /delivery-requests/location/:token
 * Get delivery info by location token
 */
const getDeliveryByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const delivery = await DeliveryRequest.findOne({
      where: { locationToken: token }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if token is older than 7 days
    const tokenAge = Date.now() - new Date(delivery.locationTokenCreatedAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (tokenAge > sevenDays) {
      return res.status(404).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: delivery.id,
        senderName: delivery.senderName,
        senderPhone: delivery.senderPhone,
        receiverName: delivery.receiverName,
        receiverPhone: delivery.receiverPhone,
        description: delivery.description,
        weight: delivery.weight,
        packagePrice: delivery.packagePrice,
        deliveryPrice: delivery.deliveryPrice,
        deliveryType: delivery.deliveryType,
        status: delivery.status,
        receiverLat: delivery.receiverLat,
        receiverLng: delivery.receiverLng
      }
    });
  } catch (error) {
    logger.error('Get delivery by token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get delivery information',
      error: error.message
    });
  }
};

/**
 * POST /delivery-requests/location/:token
 * Save receiver location from shared link
 */
const saveReceiverLocation = async (req, res) => {
  try {
    const { token } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const delivery = await DeliveryRequest.findOne({
      where: { locationToken: token }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Update receiver location
    await delivery.update({
      receiverLat: latitude,
      receiverLng: longitude,
      locationSharedAt: new Date()
    });

    logger.info(
      `Receiver location saved for delivery: ${delivery.trackingNumber} (${latitude}, ${longitude})`
    );

    return res.status(200).json({
      success: true,
      message: 'Location saved successfully',
      data: {
        id: delivery.id,
        trackingNumber: delivery.trackingNumber
      }
    });
  } catch (error) {
    logger.error('Save receiver location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save location',
      error: error.message
    });
  }
};

module.exports = {
  createDeliveryRequest,
  getDeliveryRequests,
  getDeliveryRequest,
  approveDeliveryRequest,
  rejectDeliveryRequest,
  saveLocationToken,
  getDeliveryByToken,
  saveReceiverLocation
};
