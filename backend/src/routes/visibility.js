const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const visibilityController = require('../controllers/visibilityController');

router.post('/request', authenticate, authorize(['manager', 'supervisor']), visibilityController.requestVisibility);
router.get('/pending', authenticate, authorize(['owner', 'admin']), visibilityController.getPendingRequests);
router.put('/:id/approve', authenticate, authorize(['owner', 'admin']), visibilityController.approveRequest);
router.put('/:id/reject', authenticate, authorize(['owner', 'admin']), visibilityController.rejectRequest);
router.get('/check/:unit_id', authenticate, visibilityController.checkAccess);

module.exports = router;
