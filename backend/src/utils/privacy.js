const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Preserve order/accounting records where required, but remove identifying details
// and the link to the deleted customer account.
exports.eraseUserData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  await Order.updateMany(
    { user: userId },
    {
      $set: {
        user: null,
        shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        'paymentResult.email_address': '',
        notes: '',
      },
    },
    { runValidators: false }
  );
  await Cart.deleteMany({ user: userId });
  await User.deleteOne({ _id: userId });
  return user;
};
