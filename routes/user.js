const express = require('express');
const { verifyToken } = require('../utilities/verifyToken.js');
const {verifySalonRegistered, login, register, getUsers, getUserByEmail, updateUser, deleteUser, getUserBySalonId, registerSalon, getRegisteredSalon} = require('../controllers/User.js');
const { getSalonVerifiedByUser } = require('../controllers/User.js');

const router = express.Router();

// login
router.post('/login', login);

// registered salon
router.post('/register-salon', registerSalon);

// get list registered salon
router.get('/registered-salon', getRegisteredSalon);

router.put('/:id/verify-salon-registered', verifySalonRegistered);

// register
router.post('/register', register);

// Get all users
router.get('/', verifyToken ,getUsers);

// Get user by Email
router.get('/email/:email', verifyToken, getUserByEmail);

// Get user by salonId
router.get('/:salonId', getUserBySalonId);

// get list Salon registerd by UserId
router.get('/:ownerId/registerd-salon', getSalonVerifiedByUser);

// Update user by ID
router.put('/:id', verifyToken, updateUser);

// Delete user by ID
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
