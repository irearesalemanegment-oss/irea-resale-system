const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { 
  getAllCompounds, 
  getCompoundById, 
  createCompound, 
  updateCompound, 
  deleteCompound 
} = require('../controllers/compoundController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllCompounds);
router.get('/:id', getCompoundById);

router.post('/', authorizeRoles('admin', 'manager'), validate(schemas.compound), createCompound);
router.put('/:id', authorizeRoles('admin', 'manager'), validate(schemas.compound), updateCompound);
router.delete('/:id', authorizeRoles('admin'), deleteCompound);

module.exports = router;