/**
 * Generates Expo/App Store icons from assets/app.png (1024×1024, square crop).
 */
import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');
const src = join(assetsDir, 'app.png');

const meta = await sharp(src).metadata();
const cropSize = Math.min(meta.width, meta.height);
const left = Math.floor((meta.width - cropSize) / 2);
const top = Math.floor((meta.height - cropSize) / 2);

const square = sharp(src).extract({
  left,
  top,
  width: cropSize,
  height: cropSize,
});

// App Store / Expo icon: 1024×1024, opaque (black matches logo canvas).
await square
  .clone()
  .resize(1024, 1024, { fit: 'cover' })
  .flatten({ background: '#000000' })
  .png({ compressionLevel: 9 })
  .toFile(join(assetsDir, 'icon.png'));

// Android adaptive foreground (same 1024 asset; black background in app.json).
await square
  .clone()
  .resize(1024, 1024, { fit: 'cover' })
  .flatten({ background: '#000000' })
  .png({ compressionLevel: 9 })
  .toFile(join(assetsDir, 'adaptive-icon.png'));

await square
  .clone()
  .resize(48, 48)
  .flatten({ background: '#000000' })
  .png()
  .toFile(join(assetsDir, 'favicon.png'));

console.log('Generated icon.png, adaptive-icon.png, favicon.png from app.png');
