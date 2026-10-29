const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { 
  getAllDevelopers, 
  getDeveloperById, 
  createDeveloper, 
  updateDeveloper, 
  deleteDeveloper 
} = require('../controllers/developerController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all developers (all authenticated users)
router.get('/', getAllDevelopers);
router.get('/:id', getDeveloperById);

// Create developer (admin, manager)
router.post('/', authorizeRoles('admin', 'manager'), validate(schemas.developer), createDeveloper);

// Update developer (admin, manager)
router.put('/:id', authorizeRoles('admin', 'manager'), validate(schemas.developer), updateDeveloper);

// Delete developer (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteDeveloper);

module.exports = router;