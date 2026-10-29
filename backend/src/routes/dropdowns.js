const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const dropdownController = require('../controllers/dropdownController');

router.get('/countries', authenticate, dropdownController.getCountries);
router.post('/countries', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createCountry);

router.get('/cities', authenticate, dropdownController.getCities);
router.post('/cities', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createCity);

router.get('/areas', authenticate, dropdownController.getAreas);
router.post('/areas', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createArea);

router.get('/projects', authenticate, dropdownController.getProjects);
router.post('/projects', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createProject);

router.get('/phases', authenticate, dropdownController.getPhases);
router.post('/phases', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createPhase);

router.get('/unit-types', authenticate, dropdownController.getUnitTypes);
router.post('/unit-types', authenticate, authorize(['owner', 'admin', 'manager']), dropdownController.createUnitType);

module.exports = router;
