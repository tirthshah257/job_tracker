const express = require('express');
const router = express.Router();
const { uploadResume } = require('../middleware/upload');
const {
  register,
  login,
  getMe,
  updateProfile,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', uploadResume, registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/me
router.get('/me', protect, getMe);

// GET /api/auth/profile
router.get('/profile', protect, getMe);

// PUT /api/auth/profile
router.put('/profile', protect, uploadResume, updateProfile);

module.exports = router;
