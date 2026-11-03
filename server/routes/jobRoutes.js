const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// GET /api/jobs
router.get('/', protect, getJobs);

// GET /api/jobs/:id
router.get('/:id', protect, getJob);

// POST /api/jobs
router.post('/', protect, authorize('admin'), createJob);

// PUT /api/jobs/:id
router.put('/:id', protect, authorize('admin'), updateJob);

// DELETE /api/jobs/:id
router.delete('/:id', protect, authorize('admin'), deleteJob);

module.exports = router;
