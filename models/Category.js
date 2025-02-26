const { Schema, model } = require('mongoose');

const Category = new Schema({
    name: { type: String, unique: true, required: true },
    desc: { type: String, required: true },
    product_id: [{ type: Number, ref: 'Product' }]
});

module.exports = model('Category', Category);