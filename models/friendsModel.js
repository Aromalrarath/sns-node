const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    source_user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    target_user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    is_accepted:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date
    },
})

module.exports = mongoose.model("Friend", friendSchema);