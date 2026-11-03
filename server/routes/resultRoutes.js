const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getResults,
  createResult,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');

// GET /api/results
router.get('/', protect, getResults);

// POST /api/results
router.post('/', protect, authorize('admin'), createResult);

// PUT /api/results/:id
router.put('/:id', protect, authorize('admin'), updateResult);

// DELETE /api/results/:id
router.delete('/:id', protect, authorize('admin'), deleteResult);

module.exports = router;
