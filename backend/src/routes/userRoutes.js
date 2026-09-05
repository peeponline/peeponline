const express = require('express');
const { updateProfile, changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/delete', deleteAccount);

module.exports = router;