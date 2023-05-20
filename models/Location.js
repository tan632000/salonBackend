const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  salonId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon' 
  },
  name: String,
  address: String,
  city: String,
  latitude: Number,
  longitude: Number,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
});

LocationSchema.index({ location: "2dsphere" });

LocationSchema.pre("save", function (next) {
  this.location = {
    type: "Point",
    coordinates: [this.longitude, this.latitude]
  };
  next();
});

module.exports = mongoose.model("Location", LocationSchema);
