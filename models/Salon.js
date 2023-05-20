const mongoose = require("mongoose");

const SalonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: {type: String},
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    city: String,
    registered: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Salon", SalonSchema);
