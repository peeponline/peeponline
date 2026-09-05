const express = require('express');
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.post('/initialize', initializePayment);
router.get('/verify', verifyPayment);

module.exports = router;