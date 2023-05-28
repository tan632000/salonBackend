const axios = require('axios');
const Location = require('../models/Location.js');

async function getSalons(req, res) {
  try {
    const locations = await Location.find({})
      .select('salonId latitude longitude')
      .populate({
        path: 'salonId',
        select: 'name address phone registered'
      })
      .exec();
    const salons = locations.map(location => ({
      _id: location.salonId._id,
      name: location.salonId.name,
      address: location.salonId.address,
      city: location.city,
      phone: location.salonId.phone,
      latitude: location.latitude,
      longitude: location.longitude,
      registered: location.salonId.registered
    }));
    // Sort the salons based on the "registered" field
    salons.sort((a, b) => {
      if (a.registered && !b.registered) {
        return -1;
      } else if (!a.registered && b.registered) {
        return 1;
      } else {
        return 0;
      }
    });
    res.json({ success: true, data: salons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


// Get all location near by
async function getSalonsNearby(req, res) {
  const { latitude, longitude } = req.params;
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "Invalid coordinates" });
  }
  const maxDistance = 10000; // 10 kilometers
  try {
    const locations = await Location.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance
        }
      }
    }).populate("salonId");
    const salons = locations.map((location) => {
      const { salonId, name, address, city } = location;
      const [longitude, latitude] = location.location.coordinates;
      return {
        _id: salonId._id,
        name,
        address,
        city,
        latitude,
        longitude
      };
    });
    res.json({ success: true, data: salons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get salons by name
async function getLocationBySalonName(req, res) {
  const { name } = req.body;
  try {
    let query = {};
    if (name) {
      query.name = { $regex: new RegExp(name, "i") };
    }
    const location = await Location.find(query);
    res.json({ success: true, data: location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function createLocation(req, res) {
  const { salonId, name, address, city, latitude, longitude } = req.body;
  
  try {
    const realLocation = await getRealPosition(latitude, longitude);

    if (!realLocation || !realLocation.includes(name)) {
      return res.json({ success: false, message: 'The location is not real' });
    }

    const location = new Location({
      salonId,
      name,
      address,
      city,
      latitude,
      longitude
    });

    await location.save();

    return res.json({ success: true, data: location });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getRealPosition(latitude, longitude) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length > 0) {
      const address = results[0].formatted_address;
      return address;
    } else {
      console.log('No results found.');
    }
  } catch (error) {
    console.error('Error retrieving address:', error);
  }
}

module.exports = {
  getSalons,
  getSalonsNearby,
  createLocation,
  getLocationBySalonName
}