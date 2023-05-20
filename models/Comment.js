const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    stylistId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Stylist'
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Salon'
    },
    comment: String,
    stylistStars: Number,
    salonStars: Number,
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
