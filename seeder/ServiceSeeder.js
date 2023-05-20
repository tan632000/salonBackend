const mongoose = require('mongoose');
const casual = require('casual');
const Service = require('../models/Service');
const dotenv = require("dotenv");
dotenv.config();

async function createServices() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (let i = 0; i < 20; i++) {
      const service = new Service({
        name: casual.company_name,
        description: casual.description,
        price: casual.integer(100000, 10000000),
        duration: casual.double(1.0, 5.0),
        salonId: new mongoose.Types.ObjectId(),
      });

      await service.save();
    }

    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error(error);
  }
}

createServices();
