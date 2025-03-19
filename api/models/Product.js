const { Schema, model } = require('mongoose');

const Product = new Schema({
    name: { type: String, unique: true, required: true },
    minidesc: { type: String, required: true },
    desc: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String },
    is_rental: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true }
});

module.exports = model('Product', Product);