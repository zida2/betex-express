/**
 * Delivery Requests Controller
 * Handles delivery request endpoints
 */

const deliveryRequestService = require('../services/deliveryRequestService');
const { logger } = require('../utils/logger');

class DeliveryRequestsController {
  // Create a new delivery request (client portal)
  async create(req, res) {
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
        packagePrice
      } = req.body;

      // Validation
      if (!senderName || !senderPhone || !receiverName || !receiverPhone) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: sender/receiver name and phone'
        });
      }

      const request = await deliveryRequestService.createDeliveryRequest({
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
        packagePrice
      });

      logger.info(`Delivery request created: ${request.id}`);

      res.status(201).json({
        success: true,
        message: 'Delivery request created successfully',
        data: request
      });
    } catch (error) {
      logger.error('Create delivery request error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all delivery requests (admin)
  async getAll(req, res) {
    try {
      const { status, driverId } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (driverId) filters.driverId = driverId;

      const requests = await deliveryRequestService.getDeliveryRequests(filters);

      res.status(200).json({
        success: true,
        message: 'Delivery requests retrieved successfully',
        data: requests
      });
    } catch (error) {
      logger.error('Get delivery requests error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single delivery request
  async getById(req, res) {
    try {
      const { id } = req.params;
      const request = await deliveryRequestService.getDeliveryRequestById(id);

      res.status(200).json({
        success: true,
        message: 'Delivery request retrieved successfully',
        data: request
      });
    } catch (error) {
      logger.error('Get delivery request error:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Approve delivery request and assign driver
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { deliveryPrice, driverId, adminNotes } = req.body;

      // Validation
      if (!deliveryPrice || !driverId) {
        return res.status(400).json({
          success: false,
          message: 'Delivery price and driver ID are required'
        });
      }

      const request = await deliveryRequestService.approveDeliveryRequest(id, {
        deliveryPrice,
        driverId,
        adminNotes
      });

      logger.info(`Delivery request approved and assigned to driver: ${driverId}`);

      res.status(200).json({
        success: true,
        message: 'Delivery request approved successfully',
        data: request
      });
    } catch (error) {
      logger.error('Approve delivery request error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reject delivery request
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const request = await deliveryRequestService.rejectDeliveryRequest(id, rejectionReason);

      logger.info(`Delivery request rejected: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Delivery request rejected successfully',
        data: request
      });
    } catch (error) {
      logger.error('Reject delivery request error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Send message to client
  async sendMessageToClient(req, res) {
    try {
      const { id } = req.params;
      const { clientMessage, messageType = 'whatsapp' } = req.body;

      if (!clientMessage) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const result = await deliveryRequestService.sendMessageToClient(id, clientMessage, messageType);

      logger.info(`Message sent to client for request: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: result
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get available drivers
  async getAvailableDrivers(req, res) {
    try {
      const drivers = await deliveryRequestService.getAvailableDrivers();

      res.status(200).json({
        success: true,
        message: 'Available drivers retrieved successfully',
        data: drivers
      });
    } catch (error) {
      logger.error('Get available drivers error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update delivery request status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const request = await deliveryRequestService.updateStatus(id, status);

      logger.info(`Delivery request status updated: ${id} -> ${status}`);

      res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: request
      });
    } catch (error) {
      logger.error('Update status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DeliveryRequestsController();
