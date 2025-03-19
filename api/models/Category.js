const { Schema, model } = require('mongoose');

const Category = new Schema({
    name: { type: String, unique: true, required: true },
    product_id: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

module.exports = model('Category', Category);