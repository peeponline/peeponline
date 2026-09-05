const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.route('/')
  .get(getOrders)
  .post(createOrder);
router.get('/:id', getOrderById);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;