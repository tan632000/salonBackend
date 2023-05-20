const express = require('express');

const router = express.Router();

const { getSalonsNearby, createLocation, getLocationBySalonName, getSalons } = require('../controllers/Location.js')

// get all salon
router.get('/', getSalons);

// Get all salons near by
router.get('/:latitude/:longitude', getSalonsNearby);

// Create location
router.post('/', createLocation);

// Get all salons by name
// router.get('/', getLocationBySalonName);

module.exports = router