const mongoose = require('mongoose');
const casual = require('casual');
const Appointment = require('../models/Appointment');
const dotenv = require("dotenv");
const formattedDate = require('../utilities/randomTime');
dotenv.config();

async function createAppointments() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (let i = 0; i < 50; i++) {
      const appointment = new Appointment({
        time: "2023-03-23T10:00:00",
        note: casual.description,
        duration: casual.double(1.0, 5.0),
        status: casual.integer(1, 3),
        salonId: new mongoose.Types.ObjectId(),
        stylistId: new mongoose.Types.ObjectId(),
        serviceId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
      });

      await appointment.save();
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

createAppointments();
