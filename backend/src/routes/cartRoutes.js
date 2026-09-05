const express = require('express');
const { getCart, addToCart, removeFromCart, updateCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.route('/')
  .get(getCart)
  .delete(clearCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);

module.exports = router;