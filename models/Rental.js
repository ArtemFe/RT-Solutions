const { Schema, model } = require('mongoose');

const Rental = new Schema({
    user_id: [{ type: Number, ref: 'User', required: true }],
    product_id: [{ type: Number, ref: 'Product', required: true }],
    start_at: { type: Date, required: true },
    until_at: { type: Date, required: true }
});

module.exports = model('Rental', Rental);