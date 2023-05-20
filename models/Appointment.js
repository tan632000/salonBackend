const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  salonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon' 
  },
  stylistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stylist' 
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service' 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  time: String,
  note: String,
  duration: Number,
  status: Number
});

AppointmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

AppointmentSchema.virtual('stylist', {
  ref: 'Stylist',
  localField: 'stylistId',
  foreignField: '_id',
  justOne: true
});

AppointmentSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true
});

AppointmentSchema.set('toObject', { virtuals: true });
AppointmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
