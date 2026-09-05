const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  baseFee: { type: Number, required: true, min: 0, default: 0 },
  feePerKg: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
