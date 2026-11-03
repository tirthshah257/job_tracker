const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

// GET /api/announcements
router.get('/', protect, getAnnouncements);

// POST /api/announcements
router.post('/', protect, authorize('admin'), createAnnouncement);

// PUT /api/announcements/:id
router.put('/:id', protect, authorize('admin'), updateAnnouncement);

// DELETE /api/announcements/:id
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
