const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { exportUnitsToCSV, exportUnitsToPDF } = require('../controllers/exportController');

const router = express.Router();

router.use(authenticateToken);

router.get('/units/csv', authorizeRoles('admin', 'manager', 'agent'), exportUnitsToCSV);
router.get('/units/pdf', authorizeRoles('admin', 'manager', 'agent'), exportUnitsToPDF);

module.exports = router;
