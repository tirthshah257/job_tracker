const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadLogo } = require('../middleware/upload');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');

// GET /api/companies
router.get('/', protect, getCompanies);

// GET /api/companies/:id
router.get('/:id', protect, getCompany);

// POST /api/companies
router.post('/', protect, authorize('admin'), uploadLogo, createCompany);

// PUT /api/companies/:id
router.put('/:id', protect, authorize('admin'), uploadLogo, updateCompany);

// DELETE /api/companies/:id
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
