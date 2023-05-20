const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const Stylist = require('../models/Stylist.js');
const Comment = require("../models/Comment.js");

const getAverageStars = async function(stylistId) {
  const result = await Comment.aggregate([
    {
      $match: {
        stylistId: new mongoose.Types.ObjectId(stylistId)
      }
    },
    {
      $group: {
        _id: null,
        avgStylistStars: { $avg: "$stylistStars" }
      }
    }
  ]);

  return result[0];
};

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

async function getStylistBySalonId(req, res) {
  try {
    const salonId = req.params.salonId;
    const stylists = salonId === 'All' ? 
      await Stylist.find().populate('servicesOffered', 'name') 
      : 
      await Stylist.find({ salonId }).populate('servicesOffered', 'name');
    if (!stylists) {
      return res.status(404).json({ error: 'Stylists not found' });
    }
    const stylistData = await Promise.all(stylists.map(async stylist => {
      let avgStylistStars = await getAverageStars(stylist._id);
      return {
        id: stylist._id,
        name: stylist.name,
        photo: stylist.photo,
        email: stylist.email,
        phoneNumber: stylist.phoneNumber,
        servicesOffered: stylist.servicesOffered.map(service => service._id),
        servicesOfferedName: stylist.servicesOffered.map(service => service.name),
        avgStylistStars: avgStylistStars ? avgStylistStars.avgStylistStars : 5
      };
    }));
    res.status(200).json(stylistData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function getStylistByServiceId(req, res) {
  try {
    const serviceId = req.query.serviceId;
    const stylists = await Stylist.find({ servicesOffered: serviceId })
      .select('_id phoneNumber photo name');
    const stylistData = await Promise.all(stylists.map(async stylist => {
      let avgStylistStars = await getAverageStars(stylist._id);
      return {
        _id: stylist._id,
        name: stylist.name,
        photo: stylist.photo,
        phoneNumber: stylist.phoneNumber,
        avgStylistStars: avgStylistStars ? avgStylistStars.avgStylistStars : 5
      };
    }));
    res.status(200).json(stylistData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createStylist(req, res) {
  const { salonId, name, photo, email, phoneNumber, servicesOffered } = req.body;

  const stylist = new Stylist({
    salonId,
    name,
    photo,
    email,
    phoneNumber,
    servicesOffered
  });

  try {
    await stylist.save();
    console.log(`stylist created: ${stylist}`);
    return res.status(201).json({
      stylist
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function editStylist(req, res) {
  const id = req.params.id;
  const update = req.body;
  try {
    // Check if the ID is a valid MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send('Invalid ID');
    }
    // Find and update the stylist by ID
    const stylist = await Stylist.findByIdAndUpdate(id, update, { new: true });
    if (!stylist) {
      return res.status(404).send('Stylist not found');
    }
    res.send(stylist);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

async function deleteStylist(req, res) {
  const { id } = req.params;
  const stylist = await Stylist.findByIdAndDelete(id);
  if (!stylist) {
    return res.status(404).send({ message: 'Stylist not found' });
  }
  res.send({ message: 'Stylist deleted successfully' });
}
module.exports = {
  getStylistBySalonId,
  createStylist,
  editStylist,
  deleteStylist,
  getStylistByServiceId
}