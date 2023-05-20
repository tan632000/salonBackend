const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    age: Number,
    phoneNumber: Number,
    photo: String,
    isAdmin: {
        type: Boolean, 
        default: false 
    },
});

module.exports = mongoose.model("User", UserSchema);
