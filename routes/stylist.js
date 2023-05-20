const express = require('express');
const router = express.Router();

const { getStylistBySalonId, createStylist, editStylist, deleteStylist, getStylistByServiceId } = require('../controllers/Stylist.js');

router.get('/:salonId', getStylistBySalonId);

router.get('/', getStylistByServiceId);

router.post('/', createStylist);

router.put('/:id', editStylist);

router.delete('/:id', deleteStylist);

module.exports = router;
