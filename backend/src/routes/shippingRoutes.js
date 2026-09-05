const express = require('express');
const {
  getShippingZones,
  getAdminShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
} = require('../controllers/shippingController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();
router.get('/', getShippingZones);
router.use(protect, admin);
router.get('/admin', getAdminShippingZones);
router.post('/', createShippingZone);
router.put('/:id', updateShippingZone);
router.delete('/:id', deleteShippingZone);

module.exports = router;
