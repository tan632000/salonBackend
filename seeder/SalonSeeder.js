const mongoose = require('mongoose');
const casual = require('casual');
const Salon = require('../models/Salon');
const dotenv = require("dotenv");
dotenv.config();

async function createSalons() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (let i = 0; i < 50; i++) {
      const salon = new Salon({
        name: casual.company_name,
        address: casual.address,
        phone: casual.phone,
        email: casual.email,
        website: casual.url,
        ownerId: new mongoose.Types.ObjectId(),
      });

      await salon.save();
    }

    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error(error);
  }
}

createSalons();
