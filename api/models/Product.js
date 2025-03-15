const { Schema, model } = require('mongoose');

const Product = new Schema({
    name: { type: String, unique: true, required: true },
    desc: { type: String, required: true },
    price: { type: Number, required: true },
    is_rental: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true } 
});

module.exports = model('Product', Product);