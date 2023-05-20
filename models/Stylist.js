const mongoose = require("mongoose");

const StylistSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Salon' 
    },
    name: { 
        type: String, 
        required: true 
    },
    photo: { 
        type: String, 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phoneNumber: String,
    servicesOffered: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Service'
        },
    ]
});

module.exports = mongoose.model("Stylist", StylistSchema);
