const express = require('express');
const { getRegisteredSalon } = require('../controllers/RegisteredSalon');

const router = express.Router();

router.get('/', getRegisteredSalon);

module.exports = router;