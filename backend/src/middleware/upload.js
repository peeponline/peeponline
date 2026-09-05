const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { productUploadDirectory } = require('../config/uploads');

fs.mkdirSync(productUploadDirectory, { recursive: true });
const watermarkPath = path.resolve(process.env.WATERMARK_PATH || path.join(__dirname, '../../../frontend/public/logo.png'));

const createWatermark = async (width) => {
  try {
    await fsPromises.access(watermarkPath);
  } catch (error) {
    return null;
  }

  const logo = await sharp(watermarkPath)
    .trim()
    .resize({ width: Math.max(64, Math.round(width * 0.12)), withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  const logoData = logo.data.toString('base64');
  const textSize = Math.max(10, Math.round(logo.info.height * 0.2));
  const textWidth = Math.round(textSize * 7.8);
  const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${logo.info.width + textWidth + 8}" height="${logo.info.height}"><g opacity="0.32"><image href="data:image/png;base64,${logoData}" width="${logo.info.width}" height="${logo.info.height}"/><text x="${logo.info.width + 8}" y="${Math.round(logo.info.height / 2 + textSize * 0.35)}" fill="white" font-family="Arial, sans-serif" font-size="${textSize}" font-weight="600">peeponline.store</text></g></svg>`;

  return sharp(Buffer.from(watermarkSvg)).png().toBuffer();
};

const processUploadedImages = async (files) => {
  for (const file of files) {
    const resized = await sharp(file.path)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
    const watermark = await createWatermark(resized.info.width);
    const processed = await sharp(resized.data)
      .composite(watermark ? [{ input: watermark, gravity: 'southwest' }] : [])
      .webp({ quality: 90, effort: 4 })
      .toBuffer();
    const outputPath = path.join(path.dirname(file.path), `${path.basename(file.path, path.extname(file.path))}.webp`);

    await fsPromises.writeFile(outputPath, processed);
    if (outputPath !== file.path) await fsPromises.unlink(file.path);
    file.path = outputPath;
    file.filename = path.basename(outputPath);
    file.mimetype = 'image/webp';
    file.size = processed.length;
  }
};

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

module.exports = { upload, productUploadDirectory, processUploadedImages };