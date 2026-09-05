const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllOrders,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getDashboardStats,
  getSalesByCategory,
  getAbandonedCarts,
  sendAbandonedCartEmail,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.get('/abandoned-carts', getAbandonedCarts);
router.post('/abandoned-carts/:id/email', sendAbandonedCartEmail);

// Category management
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);
router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics/sales-by-category', getSalesByCategory);

module.exports = router;