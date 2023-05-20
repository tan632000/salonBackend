const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Salon' 
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    images: [
        {
          type: String,
        }
    ]
});

module.exports = mongoose.model("Service", ServiceSchema);
