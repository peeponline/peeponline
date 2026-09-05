const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const ShippingZone = require('../models/ShippingZone');

// @desc    Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, shippingDestination, paymentMethod = 'paystack', notes } = req.body;

    if (!shippingAddress || !shippingDestination || paymentMethod !== 'paystack') {
      return res.status(400).json({ success: false, message: 'Shipping address, destination, and Paystack payment are required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock availability and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }
      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      });
    }

    const shippingZone = await ShippingZone.findOne({ _id: shippingDestination, isActive: true });
    if (!shippingZone) return res.status(400).json({ success: false, message: 'Invalid shipping destination' });
    const subtotal = cart.totalPrice;
    const totalWeightKg = cart.items.reduce((total, item) => total + Number(item.product.weightKg || 0) * item.quantity, 0);
    const shippingPrice = shippingZone.baseFee + totalWeightKg * shippingZone.feePerKg;

    // Create the pending order with the server-calculated amount.
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      shippingDestination: shippingZone.name,
      paymentMethod: 'paystack',
      totalPrice: subtotal + shippingPrice,
      shippingPrice,
      totalWeightKg,
      notes: notes || '',
      paidAt: null
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user's orders
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { user: req.user.id };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user can only view own order unless admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user is owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending orders' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
