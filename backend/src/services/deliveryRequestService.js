/**
 * Delivery Request Service
 * Handles business logic for delivery requests
 */

const { DeliveryRequest, Driver } = require('../models');

class DeliveryRequestService {
  // Create a new delivery request from client
  async createDeliveryRequest(data) {
    try {
      const request = await DeliveryRequest.create({
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        senderAddress: data.senderAddress,
        senderLat: data.senderLat,
        senderLng: data.senderLng,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        receiverLat: data.receiverLat,
        receiverLng: data.receiverLng,
        description: data.description,
        weight: data.weight,
        packagePrice: data.packagePrice,
        status: 'pending_approval'
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to create delivery request: ${error.message}`);
    }
  }

  // Get all delivery requests with filters
  async getDeliveryRequests(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.driverId) {
        where.driverId = filters.driverId;
      }

      const requests = await DeliveryRequest.findAll({
        where,
        include: [
          {
            model: Driver,
            as: 'driver',
            attributes: ['id', 'name', 'phone', 'email', 'status', 'vehicleType']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return requests;
    } catch (error) {
      throw new Error(`Failed to get delivery requests: ${error.message}`);
    }
  }

  // Get single delivery request
  async getDeliveryRequestById(id) {
    try {
      const request = await DeliveryRequest.findByPk(id, {
        include: [
          {
            model: Driver,
            as: 'driver',
            attributes: ['id', 'name', 'phone', 'email', 'status', 'vehicleType', 'currentLat', 'currentLng']
          }
        ]
      });

      if (!request) {
        throw new Error('Delivery request not found');
      }

      return request;
    } catch (error) {
      throw new Error(`Failed to get delivery request: ${error.message}`);
    }
  }

  // Approve and assign delivery request
  async approveDeliveryRequest(id, adminData) {
    try {
      const request = await DeliveryRequest.findByPk(id);
      
      if (!request) {
        throw new Error('Delivery request not found');
      }

      if (request.status !== 'pending_approval') {
        throw new Error('Only pending requests can be approved');
      }

      // Get driver information
      const driver = await Driver.findByPk(adminData.driverId);
      if (!driver) {
        throw new Error('Driver not found');
      }

      // Update request
      await request.update({
        deliveryPrice: adminData.deliveryPrice,
        adminNotes: adminData.adminNotes || '',
        driverId: adminData.driverId,
        driverName: driver.name,
        driverPhone: driver.phone,
        status: 'approved',
        approvedAt: new Date()
      });

      return request;
    } catch (error) {
      throw new Error(`Failed to approve delivery request: ${error.message}`);
    }
  }

  // Reject delivery request
  async rejectDeliveryRequest(id, rejectionReason) {
    try {
      const request = await DeliveryRequest.findByPk(id);
      
      if (!request) {
        throw new Error('Delivery request not found');
      }

      if (request.status !== 'pending_approval') {
        throw new Error('Only pending requests can be rejected');
      }

      await request.update({
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date()
      });

      return request;
    } catch (error) {
      throw new Error(`Failed to reject delivery request: ${error.message}`);
    }
  }

  // Send message to client
  async sendMessageToClient(id, clientMessage, messageType = 'whatsapp') {
    try {
      const request = await DeliveryRequest.findByPk(id);
      
      if (!request) {
        throw new Error('Delivery request not found');
      }

      await request.update({
        clientMessage: clientMessage,
        messageType: messageType,
        messageSentAt: new Date()
      });

      // In production, this would send via WhatsApp/SMS/Email
      // For now, we'll just return the link for manual sending
      const whatsappLink = this.generateWhatsAppLink(request.receiverPhone, clientMessage);
      
      return {
        request,
        whatsappLink: whatsappLink
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Generate WhatsApp link
  generateWhatsAppLink(phoneNumber, message) {
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  // Update delivery request status
  async updateStatus(id, status) {
    try {
      const request = await DeliveryRequest.findByPk(id);
      
      if (!request) {
        throw new Error('Delivery request not found');
      }

      await request.update({ status });
      return request;
    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  // Get available drivers for assignment
  async getAvailableDrivers() {
    try {
      const drivers = await Driver.findAll({
        where: {
          status: ['available', 'active']
        },
        attributes: ['id', 'name', 'phone', 'vehicleType', 'vehiclePlate', 'status', 'rating', 'currentLat', 'currentLng'],
        order: [['name', 'ASC']]
      });

      return drivers;
    } catch (error) {
      throw new Error(`Failed to get available drivers: ${error.message}`);
    }
  }
}

module.exports = new DeliveryRequestService();
