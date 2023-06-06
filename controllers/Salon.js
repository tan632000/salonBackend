const mongoose = require("mongoose");
const Comment = require('../models/Comment.js');
const Salon = require('../models/Salon.js');

const getAverageStars = async function(salonId) {
  const result = await Comment.aggregate([
    {
      $match: {
        salonId: new mongoose.Types.ObjectId(salonId)
      }
    },
    {
      $group: {
        _id: null,
        avgSalonStars: { $avg: "$salonStars" }
      }
    }
  ]);

  return result[0];
};

// Get salon by userId
async function getSalonByUserId(req, res) {
  const ownerId = req.params.ownerId;
  try {
    if (ownerId === "null" || ownerId === null || ownerId === undefined) {
      return res.status(404).send("Salon not found");
    }
    const salon = await Salon.findOne({ ownerId });
    if (!salon) {
      return res.status(404).send("Salon not found");
    }

    const avgStars = await getAverageStars(salon._id);
    const comments = await Comment.find({ salonId: salon._id });

    res.send({ salon, avgStars, comments });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Create a new salon
async function createSalon(salonData) {
  const salon = new Salon(salonData);
  try {
    await salon.save();
    return salon;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get all salons
async function getSalons(req, res) {
  try {
    const salons = await Salon.find();
    res.send({ salons });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Update salon
async function updateSalon (id, salonData) {
  try {
    const salon = await Salon.findByIdAndUpdate(id, salonData, { new: true });
    return salon;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete salon
async function deleteSalon(id) {
  try {
    const salon = await Salon.findByIdAndRemove(id);
    return salon;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getSalons,
  createSalon,
  updateSalon,
  deleteSalon,
  getSalonByUserId
};
