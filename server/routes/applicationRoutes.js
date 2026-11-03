const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// POST /api/applications
router.post('/', protect, authorize('student'), applyForJob);

// GET /api/applications/my
router.get('/my', protect, authorize('student'), getMyApplications);

// GET /api/applications/job/:jobId
router.get('/job/:jobId', protect, authorize('admin'), getJobApplications);

// PUT /api/applications/:id
router.put('/:id', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
