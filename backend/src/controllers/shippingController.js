const ShippingZone = require('../models/ShippingZone');

exports.getShippingZones = async (_req, res) => {
  try {
    const zones = await ShippingZone.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminShippingZones = async (_req, res) => {
  try {
    const zones = await ShippingZone.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createShippingZone = async (req, res) => {
  try {
    const { name, baseFee, feePerKg } = req.body;
    const zone = await ShippingZone.create({ name, baseFee, feePerKg });
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.code === 11000 ? 'That destination already exists' : error.message });
  }
};

exports.updateShippingZone = async (req, res) => {
  try {
    const zone = await ShippingZone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ success: false, message: 'Shipping destination not found' });
    res.status(200).json({ success: true, data: zone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteShippingZone = async (req, res) => {
  try {
    const zone = await ShippingZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: 'Shipping destination not found' });
    res.status(200).json({ success: true, message: 'Shipping destination deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
