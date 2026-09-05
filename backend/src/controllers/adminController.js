const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const { sendAbandonedCartEmail } = require('../utils/email');

// =================== USER MANAGEMENT ===================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, address, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, address, phone },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAbandonedCarts = async (req, res) => {
  try {
    const hoursThreshold = Number(req.query.hours || 24);
    const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    const carts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { $lt: cutoff },
    })
      .populate('user', 'name email phone createdAt')
      .populate('items.product', 'name price images')
      .sort({ updatedAt: -1 });

    const formattedCarts = carts
      .filter((cart) => cart.user)
      .map((cart) => {
        const now = Date.now();
        const lastUpdated = new Date(cart.updatedAt).getTime();
        const hoursSinceUpdate = Math.max(0, Math.floor((now - lastUpdated) / (60 * 60 * 1000)));
        const itemCount = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        return {
          _id: cart._id,
          user: cart.user,
          items: cart.items || [],
          totalPrice: cart.totalPrice || 0,
          itemCount,
          updatedAt: cart.updatedAt,
          hoursSinceUpdate,
          isAbandoned: hoursSinceUpdate >= hoursThreshold,
        };
      });

    res.status(200).json({
      success: true,
      count: formattedCarts.length,
      data: formattedCarts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendAbandonedCartEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const cart = await Cart.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');

    if (!cart || !cart.user) {
      return res.status(404).json({ success: false, message: 'Cart not found for this user.' });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'This cart is empty.' });
    }

    await sendAbandonedCartEmail(cart.user, cart, subject, message);

    res.status(200).json({
      success: true,
      message: `Reminder email sent to ${cart.user.email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =================== CATEGORY MANAGEMENT ===================
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory } = req.body;
    const category = await Category.create({ name, description, image, parentCategory });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory', 'name');
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Optionally reassign products or prevent deletion if products exist
    const products = await Product.findOne({ category: req.params.id });
    if (products) {
      return res.status(400).json({
        success: false,
        message: 'Category has products. Reassign or delete them first.',
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =================== DASHBOARD STATISTICS ===================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Revenue (sum of all paid orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email');

    // Top 5 best-selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Orders by status (for pie chart)
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['processing', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        topProducts,
        ordersByStatus,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =================== ADVANCED ANALYTICS ===================
exports.getSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $match: { status: { $in: ['processing', 'shipped', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          totalSales: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: salesByCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Additional: export order data for CSV, manage inventory alerts, etc.