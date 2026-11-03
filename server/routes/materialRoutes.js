const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadMaterials: uploadMaterialsMiddleware } = require('../middleware/upload');
const {
  getMaterials,
  getMaterial,
  uploadMaterials: uploadMaterialsController,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
} = require('../controllers/materialController');

// GET /api/materials/download/:id  (must be before /:id to avoid conflict)
router.get('/download/:id', protect, downloadMaterial);

// GET /api/materials
router.get('/', protect, getMaterials);

// GET /api/materials/:id
router.get('/:id', protect, getMaterial);

// POST /api/materials
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadMaterialsMiddleware,
  uploadMaterialsController
);

// PUT /api/materials/:id
router.put('/:id', protect, authorize('admin'), updateMaterial);

// DELETE /api/materials/:id
router.delete('/:id', protect, authorize('admin'), deleteMaterial);

module.exports = router;
