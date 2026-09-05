const Order = require('../models/Order');

const paystackRequest = async (endpoint, options = {}) => {
  const response = await fetch(`https://api.paystack.co${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.status) throw new Error(data.message || 'Paystack request failed');
  return data.data;
};

exports.initializePayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(500).json({ success: false, message: 'Paystack is not configured' });
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const payment = await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: req.user.email,
        amount: Math.round(order.totalPrice * 100),
        reference: order._id.toString(),
        callback_url: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5173/order-success',
        metadata: { orderId: order._id.toString() },
      }),
    });
    order.paymentResult = { id: payment.reference, status: 'initialized' };
    await order.save();
    res.status(200).json({ success: true, data: { authorizationUrl: payment.authorization_url, reference: payment.reference } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const reference = req.query.reference;
    if (!reference) return res.status(400).json({ success: false, message: 'Payment reference is required' });
    const payment = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
    const order = await Order.findOne({ _id: payment.metadata?.orderId || reference, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (payment.status !== 'success' || Number(payment.amount) !== Math.round(order.totalPrice * 100)) return res.status(400).json({ success: false, message: 'Payment could not be verified' });
    order.status = 'processing';
    order.paidAt = new Date();
    order.paymentResult = { id: payment.reference, status: payment.status, update_time: payment.paid_at, email_address: payment.customer?.email };
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};