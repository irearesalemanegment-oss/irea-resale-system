const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getAllUnits, 
  getPublicUnits,
  getPublicUnitById,
  createUnit
} = require('../controllers/unitController');

const router = express.Router();

// Public routes
router.get('/public', getPublicUnits);
router.get('/public/:id', getPublicUnitById);

// Protected routes
router.get('/', authenticate, getAllUnits);
router.post('/', authenticate, authorize(['owner', 'admin', 'manager', 'supervisor', 'employee']), createUnit);

module.exports = router;
