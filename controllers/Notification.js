// controllers/notificationController.js
const Notification = require('../models/Notification');

// Create Notification (API)
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    const notification = new Notification({
      userId,
      message,
      type,
    });

    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Notifications for a User (API)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read (API)
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Render Notifications Page (EJS view)
exports.renderNotificationsPage = async (req, res) => {
  try {
    if (!req.user) {
      req.flash('error', 'You must be logged in');
      return res.redirect('/login');
    }

    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.render('notifications/index', {
      notifications,
      activePage: 'notifications',
      currentUser: req.user,
    });
  } catch (error) {
    req.flash('error', 'Failed to load notifications');
    res.redirect('/');
  }
};
