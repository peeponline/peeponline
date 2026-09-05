const path = require('path');

const uploadsDirectory = path.resolve(
  process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads')
);
const productUploadDirectory = path.join(uploadsDirectory, 'products');

module.exports = { uploadsDirectory, productUploadDirectory };