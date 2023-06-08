const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Salon = require('../models/Salon.js');
const RegisterSalon = require('../models/RegisteredSalon.js');
const Appointment = require('../models/Appointment.js');
const RegisteredSalon = require('../models/RegisteredSalon.js');

// Register function
const register = async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the user
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_t4amcTjl6mlINwgVOssm2EyjBiiSUHteJ-wPKZA&s',
      isAdmin: false,
      age: req.body.age
    });
    const savedUser = await user.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Return the token
    res.status(201).json({
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        photo: savedUser.photo,
        isAdmin: savedUser.isAdmin,
        age: savedUser.age
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login function
const login = async (req, res) => {
  try {
    // Check if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token
    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photo: user.photo,
        isAdmin: user.isAdmin,
        age: user.age
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Users
async function getUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
};

// Get User by Email
async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// get user by salonId
async function getUserBySalonId(req, res) {
  try {
    let salonId = req.params.salonId;
    let appointments;
    if (salonId === 'All' || salonId === null || salonId === undefined) {
      appointments = await Appointment.find()
        .populate('service')
        .populate('user', '-password')
        .sort('time');
    } else {
      appointments = await Appointment.find({ salonId: req.params.salonId })
        .populate('service')
        .populate('user', '-password')
        .sort('time');
    }
    
    const users = {};
    
    // Group appointments by user
    appointments.forEach(appointment => {
      if (!users[appointment.userId]) {
        users[appointment.userId] = {
          user: appointment.user,
          appointments: [],
          totalAmount: 0
        };
      }
      const amount = appointment.service.price;
      users[appointment.userId].appointments.push({
        time: appointment.time,
        service: appointment.service,
        amount: amount,
        status: appointment.status,
        _id: appointment._id
      });
      users[appointment.userId].totalAmount += amount;
    });
    
    // Convert user object into array
    const result = Object.values(users);
    
    res.send(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};


// Update User
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, age, phoneNumber, photo } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, age: parseInt(age), phoneNumber: parseInt(phoneNumber), photo },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete User
async function deleteUser(id) {
  try {
    const user = await User.findByIdAndRemove(id);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// register salon
async function registerSalon(req, res) {
  try {
    const existingRegistered = await RegisterSalon.findOne({ salonId: req.body.salonId });
    if (existingRegistered) {
      return res.status(409).json({ message: 'Salon already registered' });
    }
    const registeredSalon = new RegisterSalon({
      salonId: req.body.salonId,
      userId: req.body.userId,
      paymentProof: req.body.paymentProof
    });
    const savedRegistered = await registeredSalon.save();
    res.send({
      message: 'Register Salon Successfully',
      savedRegistered
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getRegisteredSalon(req, res) {
  try {
    const registeredSalons = await RegisterSalon.find()
      .populate('userId', '_id firstName lastName email photo phoneNumber')
      .populate('salonId', '_id name address phone');

    res.json(registeredSalons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function verifySalonRegistered(req, res) {
  try {
    if (req.params.id === "null") {
      return res.send({
        message: "Lam on nhap dung salon"
      })
    }
    const registeredSalon = await RegisterSalon.findByIdAndUpdate(
      { _id: req.params.id },
      { verified: req.body.verified },
      { new: true }
    );
    const verifiedSalon = await Salon.findByIdAndUpdate(
      { _id: registeredSalon.salonId },
      { registered: registeredSalon.verified },
      { new: true }
    );
    res.json({
      message: 'Verified Salon Register Successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getSalonVerifiedByUser(req, res) {
  try {
    const ownerId = req.params.ownerId;
    const registeredSalon = await RegisteredSalon.findOne({ownerId})
      .populate('salonId', 'name address phone');
    if (!registeredSalon) {
      return res.status(404).json({ message: 'You have not registered any salons' });
    }
    res.json(registeredSalon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUsers,
  getUserByEmail,
  updateUser,
  deleteUser,
  login,
  register,
  getUserBySalonId,
  registerSalon,
  getRegisteredSalon,
  verifySalonRegistered,
  getSalonVerifiedByUser
};
