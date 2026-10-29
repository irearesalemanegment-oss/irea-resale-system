const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const auditController = require('../controllers/auditController');

router.get('/', authenticate, authorize(['owner', 'admin']), auditController.getAuditLogs);

module.exports = router;
