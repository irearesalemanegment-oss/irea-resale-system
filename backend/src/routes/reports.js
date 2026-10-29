const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
  getSalesReport, 
  getStatistics, 
  getPriceTrends, 
  getDeveloperPerformance 
} = require('../controllers/reportController');

const router = express.Router();

router.use(authenticateToken);

router.get('/sales', authorizeRoles('admin', 'manager'), getSalesReport);
router.get('/statistics', getStatistics);
router.get('/trends', authorizeRoles('admin', 'manager'), getPriceTrends);
router.get('/developer-performance', authorizeRoles('admin', 'manager'), getDeveloperPerformance);

module.exports = router;
