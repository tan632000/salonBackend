const express = require('express');
const SalonController = require('../controllers/Salon.js');
const {getSalonByUserId, getSalons, createSalon, updateSalon, deleteSalon} = require('../controllers/Salon.js')

const router = express.Router();

// Get all salons
router.get('/', getSalons);

// Get salon by userId
router.get('/:ownerId', getSalonByUserId);

// Create new salon
router.post('/', createSalon);

// Update salon by ID
router.patch('/:id', updateSalon);

// Delete salon by ID
router.delete('/:id', deleteSalon);

module.exports = router;
