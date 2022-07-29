const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
        // valid number/ decimal        // price: {number, mandatory, valid number/decimal},
    },
    currencyId: {
        type: String,
        required: true,
        // default: "INR",
        trim: true
    },
    currencyFormat: {
        type: String,
        required: true,
        // default: "₹",
        trim: true
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: true // s3 link
    },
    style: {
        type: String,
        trim: true
    },
    availableSizes: [{
        type: String,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
        trim: true,
        uppercase: true
    }],
    installments: {
        type: Number
    },
    deletedAt: Date,

    isDeleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })


module.exports = mongoose.model('Product', productSchema)
