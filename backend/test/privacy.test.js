const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');
const { eraseUserData } = require('../src/utils/privacy');
const sharp = require('sharp');
const { getWatermarkColor } = require('../src/middleware/upload');

test('watermark switches to a contrasting color for light and dark images', async () => {
  const lightImage = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#ffffff' } }).png().toBuffer();
  const darkImage = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#101010' } }).png().toBuffer();

  assert.equal(await getWatermarkColor(lightImage, 100, 100), '#07111f');
  assert.equal(await getWatermarkColor(darkImage, 100, 100), '#ffffff');
});

test('eraseUserData detaches retained orders and removes cart and account', async () => {
  const originals = {
    findById: User.findById,
    deleteOne: User.deleteOne,
    deleteMany: Cart.deleteMany,
    updateMany: Order.updateMany,
  };
  const calls = [];
  const user = { _id: 'user-1' };

  User.findById = async () => user;
  Order.updateMany = async (...args) => calls.push(['orders', ...args]);
  Cart.deleteMany = async (...args) => calls.push(['cart', ...args]);
  User.deleteOne = async (...args) => calls.push(['user', ...args]);

  try {
    assert.equal(await eraseUserData('user-1'), user);
    assert.deepEqual(calls.map(([name]) => name), ['orders', 'cart', 'user']);
    assert.equal(calls[0][2].$set.user, null);
    assert.equal(calls[0][2].$set['paymentResult.email_address'], '');
    assert.equal(calls[0][3].runValidators, false);
    assert.deepEqual(calls[1][1], { user: 'user-1' });
    assert.deepEqual(calls[2][1], { _id: 'user-1' });
  } finally {
    User.findById = originals.findById;
    User.deleteOne = originals.deleteOne;
    Cart.deleteMany = originals.deleteMany;
    Order.updateMany = originals.updateMany;
  }
});

test('eraseUserData does not erase other records when the account is missing', async () => {
  const originalFindById = User.findById;
  User.findById = async () => null;

  try {
    assert.equal(await eraseUserData('missing-user'), null);
  } finally {
    User.findById = originalFindById;
  }
});
