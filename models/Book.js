const mongoose = require('mongoose')
const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a book title'],
        maxlength: 90,
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name'],
        maxlength: 50,
    },
    price: {
        type: Number,
    },
    genres: {
        type: String,
        enum: ['fiction', 'non-fiction', 'childrens', 'sports'],
        default: 'non-fiction',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    }
}, { timestamps: true })

module.exports = mongoose.model('Book', BookSchema)