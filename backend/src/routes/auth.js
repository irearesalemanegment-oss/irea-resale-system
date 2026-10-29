const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { register, login, getProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;