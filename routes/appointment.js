const express = require('express');
const { 
  getAppointmentsByUserId, 
  createAppointment, 
  updateAppointment, 
  getAppointments, 
  getAppointmentsByTimeAndSalon, 
  getAppointmentPerTimeSelect, 
  getTotalRevenue, 
  getTopServices, 
  getStatisticByAge, 
  getStatisticByCity 
} = require('../controllers/Appointment.js');

const router = express.Router();

// Get all appointments of salon by day, month, year
router.get('/:salonId/:year/:month/:day', getAppointmentsByTimeAndSalon);

// Get all appointments of salon
router.get('/:salonId', getAppointments);

// Get all appointments of userId
router.get('/:userId/user', getAppointmentsByUserId);

// Get appointment per time select
router.get('/:salonId/appointments-per-time-slot', getAppointmentPerTimeSelect);

// Get all Revengue
router.get('/:salonId/total', getTotalRevenue);

// Get top Services use most
router.get('/:salonId/top-services', getTopServices);

// Get statistic by age
router.get('/:salonId/customers-by-age', getStatisticByAge);

// Get statistic by place
router.get('/:salonId/customers-by-city', getStatisticByCity);

// Create new appointment
router.post('/', createAppointment);

// Update appointment status
router.patch('/:id/:status', updateAppointment);

module.exports = router;
