import sharp from 'sharp';
import fs from 'fs/promises';

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif']);
const MAX_DIMENSION = 8000;

export async function processAndStoreImage(inputPath, outputPath) {
  const metadata = await sharp(inputPath).metadata();

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    await fs.unlink(inputPath).catch(() => {});
    throw new Error('Unsupported or invalid image format');
  }

  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    await fs.unlink(inputPath).catch(() => {});
    throw new Error('Image dimensions too large');
  }

  await sharp(inputPath).rotate().toFile(outputPath);
  await fs.unlink(inputPath).catch(() => {});

  const finalMeta = await sharp(outputPath).metadata();

  return {
    width: finalMeta.width,
    height: finalMeta.height,
    format: finalMeta.format,
  };
}
