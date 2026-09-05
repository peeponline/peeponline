const test = require('node:test');
const assert = require('node:assert/strict');

const emailUtils = require('../src/utils/email');
const User = require('../src/models/User');
const controller = require('../src/controllers/userController');

test('profile updated email helper exists and can send a confirmation email in development mode', async () => {
  assert.equal(typeof emailUtils.sendProfileUpdatedEmail, 'function');

  await assert.doesNotReject(async () => {
    await emailUtils.sendProfileUpdatedEmail({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });
  });
});

test('updateProfile rejects blank required values when saving a profile update', async () => {
  const originalFindById = User.findById;
  const existingUser = {
    _id: 'user-123',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+233 501234567',
    address: {
      street: '123 Main Road',
      city: 'Accra',
      state: 'Greater Accra Region',
      zipCode: 'GA-001',
      country: 'Ghana'
    },
    save: async function () {
      return this;
    }
  };

  User.findById = async () => existingUser;

  const req = {
    user: { id: 'user-123' },
    body: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  await controller.updateProfile(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(String(res.payload.message), /required|blank|cannot be empty|fill/i);

  User.findById = originalFindById;
});
