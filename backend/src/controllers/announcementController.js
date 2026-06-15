/**
 * Announcement Controller
 * Handles CRUD operations for announcements
 */

const { Announcement, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Get all announcements (admin only)
 * GET /api/v1/announcements
 */
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    logger.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

/**
 * Get active announcements (clients)
 * GET /api/v1/announcements/active
 */
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    logger.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active announcements',
      error: error.message
    });
  }
};

/**
 * Create a new announcement (admin only)
 * POST /api/v1/announcements
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Build announcement data
    const announcementData = {
      title,
      content,
      type: type || 'info',
      isActive: isActive !== undefined ? isActive : true,
      sentBy: req.user.sub
    };

    // Add image URL if uploaded
    if (req.files && req.files.image && req.files.image[0]) {
      announcementData.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
    } else if (req.body.imageUrl) {
      announcementData.imageUrl = req.body.imageUrl;
    }

    // Add video URL if uploaded
    if (req.files && req.files.video && req.files.video[0]) {
      announcementData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    } else if (req.body.videoUrl) {
      announcementData.videoUrl = req.body.videoUrl;
    }

    const announcement = await Announcement.create(announcementData);

    // Fetch the created announcement with sender info
    const newAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: newAnnouncement
    });
  } catch (error) {
    logger.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

/**
 * Update an announcement (admin only)
 * PUT /api/v1/announcements/:id
 */
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, isActive } = req.body;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Build update data
    const updateData = {
      title: title || announcement.title,
      content: content || announcement.content,
      type: type || announcement.type,
      isActive: isActive !== undefined ? isActive : announcement.isActive
    };

    // Update image URL if uploaded
    if (req.files && req.files.image && req.files.image[0]) {
      updateData.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
    } else if (req.body.imageUrl !== undefined) {
      updateData.imageUrl = req.body.imageUrl;
    }

    // Update video URL if uploaded
    if (req.files && req.files.video && req.files.video[0]) {
      updateData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    } else if (req.body.videoUrl !== undefined) {
      updateData.videoUrl = req.body.videoUrl;
    }

    await announcement.update(updateData);

    // Fetch the updated announcement with sender info
    const updatedAnnouncement = await Announcement.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedAnnouncement
    });
  } catch (error) {
    logger.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

/**
 * Delete an announcement (admin only)
 * DELETE /api/v1/announcements/:id
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.destroy();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};
