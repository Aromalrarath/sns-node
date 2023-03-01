const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    // title: {
    //     type: String,
    //     required: [true, "Please Enter product Name"],
    //     trim: true,
    // },
    description: {
        type: String,
        required: [true, "Please Enter post Description"],
    },
    location: {
        type: String,
        required: false
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    numOfComments: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            }
        },
    ],
    numOfLikes: {
        type: Number,
        default: 0,
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            like:{
                type:Boolean,
                required:true
            }
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
    }
});

module.exports = mongoose.model("Post", postSchema);