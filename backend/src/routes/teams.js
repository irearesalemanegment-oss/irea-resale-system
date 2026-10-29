const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const teamController = require('../controllers/teamController');

router.get('/', authenticate, teamController.getAllTeams);
router.post('/', authenticate, authorize(['owner', 'admin']), teamController.createTeam);
router.put('/:id', authenticate, authorize(['owner', 'admin']), teamController.updateTeam);
router.post('/transfer', authenticate, authorize(['owner', 'admin']), teamController.transferEmployee);
router.get('/transfers/logs', authenticate, authorize(['owner', 'admin']), teamController.getTransferLogs);

module.exports = router;
