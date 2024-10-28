// models/hoot.js

const { type } = require('express/lib/response');
const mongoose = require('mongoose'); //import the mongoose npm package


/// create the commentsSchema
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const hootSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        //enums are always string and can ONLY be 1 of whats listed below
        enum: ["News", "Sports", "Games", "Movies", "Music", "Television"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [commentSchema]
}, { timestamps: true });

const Hoot = mongoose.model('Hoot', hootSchema);

module.exports = Hoot;



