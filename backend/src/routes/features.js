const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  upload,
  uploadUnitImages,
  getUnitImages,
  deleteUnitImage,
  requestPhoneAccess,
  getPhoneAccessRequests,
  approvePhoneAccess,
  rejectPhoneAccess,
  hasPhoneAccess,
} = require('../controllers/featureController');

const router = express.Router();

router.use(authenticateToken);

// Image routes
router.post('/units/:id/images', upload.array('images', 10), uploadUnitImages);
router.get('/units/:id/images', getUnitImages);
router.delete('/images/:id', deleteUnitImage);

// Phone access routes
router.post('/units/:id/request-phone', requestPhoneAccess);
router.get('/units/:id/phone-access', hasPhoneAccess);
router.get('/phone-requests', authorizeRoles('admin', 'manager'), getPhoneAccessRequests);
router.put('/phone-requests/:id/approve', authorizeRoles('admin', 'manager'), approvePhoneAccess);
router.put('/phone-requests/:id/reject', authorizeRoles('admin', 'manager'), rejectPhoneAccess);

module.exports = router;
