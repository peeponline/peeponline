const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const fs = require('fs/promises');
const path = require('path');

const removeStoredImage = async (image) => {
  if (!image?.url) return;
  const filePath = path.join(__dirname, '../../uploads', image.url.replace(/^\/uploads\//, ''));
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

// ==================== HELPER: Filter & Pagination ====================
const getFilteredProducts = async (query) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    rating,
    isFeatured,
    tab,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (tab) filter.tab = tab;

  // Text search on name & description (indexed)
  if (keyword) {
    filter.$text = { $search: keyword };
  }

  // Category filter (by ID or slug)
  if (category) {
    const cat = await Category.findOne({ name: category });
    if (cat) filter.category = cat._id;
    else filter.category = category; // assume ID
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Rating (average rating >= value)
  if (rating) {
    filter.averageRating = { $gte: Number(rating) };
  }

  if (isFeatured === 'true') {
    filter.isFeatured = true;
  }

  // Pagination
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNum - 1) * pageSize;

  const sortOptions = sort.split(',').join(' '); // e.g. "price,-createdAt"

  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sortOptions)
    .skip(skip)
    .limit(pageSize);

  const total = await Product.countDocuments(filter);

  return {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize),
  };
};

// ==================== CRUD OPERATIONS ====================

// @desc    Get all products (with filters & pagination)
exports.getProducts = async (req, res) => {
  try {
    const result = await getFilteredProducts(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('ratings.user', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, tab, weightKg, stock, discount, isFeatured } = req.body;

    if (!name || !description || price === undefined || !category || !tab) {
      return res.status(400).json({ success: false, message: 'Name, description, price, tab, and category are required' });
    }

    // Validate category exists
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    const images = (req.files || []).map((file) => ({
      public_id: file.filename,
      url: `/uploads/products/${file.filename}`,
    }));

    const product = await Product.create({
      name,
      description,
      price,
      category,
      tab,
      weightKg: weightKg === '' || weightKg === undefined ? 0.5 : weightKg,
      stock: stock || 0,
      discount: discount || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    for (const file of req.files || []) await fs.unlink(file.path).catch(() => {});
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, description, price, category, tab, weightKg, stock, discount, isFeatured } = req.body;

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (tab !== undefined) product.tab = tab;
    if (weightKg !== undefined) product.weightKg = weightKg;
    if (category) {
      const cat = await Category.findById(category);
      if (!cat) return res.status(400).json({ success: false, message: 'Invalid category' });
      product.category = category;
    }
    if (stock !== undefined) product.stock = stock;
    if (discount !== undefined) product.discount = discount;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

    // Handle new images: if files are uploaded, replace existing ones
    if (req.files && req.files.length > 0) {
      for (const img of product.images) await removeStoredImage(img);
      // Set new images
      product.images = req.files.map(file => ({
        public_id: file.filename,
        url: `/uploads/products/${file.filename}`,
      }));
    }

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    for (const img of product.images) await removeStoredImage(img);

    await product.remove();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REVIEWS ====================

// @desc    Add a review (authenticated user)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const purchased = await Order.exists({
      user: req.user.id,
      status: { $in: ['processing', 'shipped', 'delivered'] },
      'items.product': productId,
    });
    if (!purchased) {
      return res.status(403).json({ success: false, message: 'Only customers who purchased this product can review it' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.ratings.find(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    product.ratings.push({
      user: req.user.id,
      rating: Number(rating),
      comment,
    });

    // Update average rating
    product.averageRating = product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length;

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviewEligibility = async (req, res) => {
  const purchased = await Order.exists({
    user: req.user.id,
    status: { $in: ['processing', 'shipped', 'delivered'] },
    'items.product': req.params.id,
  });
  res.status(200).json({ success: true, eligible: Boolean(purchased) });
};

// @desc    Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('ratings')
      .populate('ratings.user', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, count: product.ratings.length, data: product.ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};