const mongoose = require('mongoose');
const casual = require('casual');
const Location = require('../models/Location');
const dotenv = require("dotenv");
dotenv.config();

async function createLocations() {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (let i = 0; i < 50; i++) {
      const location = new Location({
        name: casual.company_name,
        address: casual.address,
        city: 'Hà Nội',
        latitude: 21.016301610031057,
        longitude: 105.82332213977602,
        salonId: "641c2e036e8880ee8de4825c",
        location: {
          "type": "Point",
          "coordinates": [105.82332213977602, 21.016301610031057]
        }
      });

      await location.save();
    }

    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error(error);
  }
}

createLocations();
