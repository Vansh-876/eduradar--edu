const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isLoggedIn } = require('../middleware.js');

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('users/notifications', { notifications });
  } catch (err) {
    req.flash('error', 'Could not load notifications');
    res.redirect('back');
  }
});

router.post('/:id/read', isLoggedIn, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.post('/mark-all-read', isLoggedIn, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.redirect('/notifications');
  } catch (err) {
    req.flash('error', 'Could not mark all read');
    res.redirect('/notifications');
  }
});

module.exports = router;
