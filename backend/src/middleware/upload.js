const multer = require('multer');
const fs = require('fs');
const path = require('path');

const productUploadDirectory = path.join(__dirname, '../../uploads/products');
fs.mkdirSync(productUploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, productUploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, extension).replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
    callback(null, `${Date.now()}-${safeName || 'product'}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) callback(null, true);
    else callback(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
  },
});

module.exports = { upload, productUploadDirectory };