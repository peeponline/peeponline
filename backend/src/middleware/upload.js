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
    .resize({ width: Math.max(48, Math.round(width * 0.08)), withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let index = 3; index < logo.data.length; index += logo.info.channels) {
    logo.data[index] = Math.round(logo.data[index] * 0.38);
  }
  const logoBuffer = await sharp(logo.data, {
    raw: {
      width: logo.info.width,
      height: logo.info.height,
      channels: logo.info.channels,
    },
  }).png().toBuffer();
  const textSize = Math.max(10, Math.round(logo.info.height * 0.2));
  const textWidth = Math.round(textSize * 7.8);
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${logo.info.height}"><text x="0" y="${Math.round(logo.info.height / 2 + textSize * 0.35)}" fill="white" fill-opacity="0.72" stroke="#050D1A" stroke-opacity="0.55" stroke-width="0.8" paint-order="stroke" font-family="Arial, sans-serif" font-size="${textSize}" font-weight="600">peeponline.store</text></svg>`;

  return sharp({
    create: {
      width: logo.info.width + textWidth + 8,
      height: logo.info.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: logoBuffer, left: 0, top: 0 },
      { input: Buffer.from(textSvg), left: logo.info.width + 8, top: 0 },
    ])
    .png()
    .toBuffer();
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