const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getProductReviews,
  getReviewEligibility,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id/review-eligibility', protect, getReviewEligibility);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Admin routes
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Authenticated user routes
router.post('/:id/reviews', protect, addReview);

module.exports = router;