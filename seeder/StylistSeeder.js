const mongoose = require('mongoose');
const casual = require('casual');
const Stylist = require('../models/Stylist');
const dotenv = require("dotenv");
dotenv.config();

async function createStylists() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (let i = 0; i < 20; i++) {
      const stylist = new Stylist({
        salonId: new mongoose.Types.ObjectId(),
        name: casual.name,
        photo: '',
        phoneNumber: casual.phone,
        email: casual.email,
        servicesOffered: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      });

      await stylist.save();
      console.log(`Stylist ${i + 1} created`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error(error);
  }
}

createStylists();
