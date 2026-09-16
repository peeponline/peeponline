const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { productUploadDirectory } = require('../config/uploads');

fs.mkdirSync(productUploadDirectory, { recursive: true });
const watermarkPath = path.resolve(process.env.WATERMARK_PATH || path.join(__dirname, '../../../frontend/public/logo.png'));

const watermarkGlyphs = {
  '.': ['00000', '00000', '00000', '00000', '00000', '00100', '00100'],
  e: ['00000', '01110', '10001', '11111', '10000', '10001', '01110'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  l: ['01100', '00100', '00100', '00100', '00100', '00100', '01110'],
  n: ['00000', '11110', '10001', '10001', '10001', '10001', '10001'],
  o: ['00000', '01110', '10001', '10001', '10001', '10001', '01110'],
  p: ['00000', '11110', '10001', '10001', '11110', '10000', '10000'],
  r: ['00000', '10110', '11001', '10000', '10000', '10000', '10000'],
  s: ['00000', '01111', '10000', '01110', '00001', '11110', '00000'],
  t: ['00100', '11111', '00100', '00100', '00100', '00101', '00010'],
};
const DETAIL_IMAGE_WIDTH = 2400;
const DETAIL_IMAGE_HEIGHT = 1800;
const THUMBNAIL_IMAGE_WIDTH = 640;
const THUMBNAIL_IMAGE_HEIGHT = 480;

const createWatermarkText = (text, unit) => {
  const rectangles = [];
  [...text].forEach((character, characterIndex) => {
    const glyph = watermarkGlyphs[character];
    if (!glyph) return;

    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel === '1') {
          rectangles.push(`<rect x="${(characterIndex * 6 + columnIndex) * unit}" y="${rowIndex * unit}" width="${unit}" height="${unit}"/>`);
        }
      });
    });
  });

  return rectangles.join('');
};

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
  const leftMargin = Math.max(12, Math.round(width * 0.02));
  const bottomMargin = Math.max(8, Math.round(width * 0.015));
  const textSize = Math.max(10, Math.round(logo.info.height * 0.78));
  const textUnit = Math.max(1, Math.round(textSize / 7));
  const watermarkText = 'peeponline.store';
  const textWidth = watermarkText.length * 6 * textUnit;
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${logo.info.height}"><g fill="white" fill-opacity="0.72">${createWatermarkText(watermarkText, textUnit)}</g></svg>`;

  return sharp({
    create: {
      width: leftMargin + logo.info.width + textWidth + 8,
      height: logo.info.height + bottomMargin,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: logoBuffer, left: leftMargin, top: 0 },
      { input: Buffer.from(textSvg), left: leftMargin + logo.info.width + 8, top: 0 },
    ])
    .png()
    .toBuffer();
};

const processUploadedImages = async (files) => {
  for (const file of files) {
    const basePath = path.join(path.dirname(file.path), path.basename(file.path, path.extname(file.path)));
    const createVariant = async (suffix, width, height, quality, fit, background, addWatermark) => {
      const resized = await sharp(file.path)
        .rotate()
        .resize({
          width,
          height,
          fit,
          withoutEnlargement: true,
          ...(background ? { background } : {}),
        })
        .toBuffer({ resolveWithObject: true });
      const watermark = addWatermark ? await createWatermark(resized.info.width) : null;
      return {
        path: `${basePath}-${suffix}.webp`,
        buffer: await sharp(resized.data)
          .composite(watermark ? [{ input: watermark, gravity: 'southwest' }] : [])
          .webp(quality === 100 ? { lossless: true, effort: 4 } : { quality, effort: 4 })
          .toBuffer(),
      };
    };

    const detail = await createVariant('detail', DETAIL_IMAGE_WIDTH, DETAIL_IMAGE_HEIGHT, 100, 'inside', undefined, true);
    const thumbnail = await createVariant(
      'thumb',
      THUMBNAIL_IMAGE_WIDTH,
      THUMBNAIL_IMAGE_HEIGHT,
      86,
      'contain',
      { r: 13, g: 24, b: 43, alpha: 1 },
      false,
    );
    await Promise.all([
      fsPromises.writeFile(detail.path, detail.buffer),
      fsPromises.writeFile(thumbnail.path, thumbnail.buffer),
    ]);
    await fsPromises.unlink(file.path);
    file.path = detail.path;
    file.filename = path.basename(detail.path);
    file.detailFilename = path.basename(detail.path);
    file.thumbnailFilename = path.basename(thumbnail.path);
    file.mimetype = 'image/webp';
    file.size = detail.buffer.length;
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