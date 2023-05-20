const express = require('express');
const {getAllServices, getTotalServices, getServiceBySalonId, createService, updateService, deleteService} = require('../controllers/Service.js')

const router = express.Router();

// Get all services
router.get('/', getAllServices)

// Get count services
router.get('/count', getTotalServices);

// Get service by ID
router.get('/:salonId', getServiceBySalonId);

// Create new service
router.post('/', createService);

// Update service by ID
router.put('/:salonId', updateService);
// Delete service by ID
router.delete('/:id', deleteService);

module.exports = router;
