import { Jimp } from 'jimp';
import path from 'path';

async function patch() {
  const imgPath = path.resolve('public/certificate-template.jpg');
  console.log('Loading image:', imgPath);
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Image dimensions: ${width}x${height}`);

  // The box and code text is roughly between X: 37% to 56% and Y: 85% to 98%
  const startX = Math.floor(width * 0.36);
  const endX = Math.floor(width * 0.58);
  const startY = Math.floor(height * 0.86);
  const endY = Math.floor(height * 0.98);

  // We can sample the background from the left (startX - 20) and right (endX + 20)
  for (let y = startY; y < endY; y++) {
    const leftColor = image.getPixelColor(startX - 20, y);
    const rightColor = image.getPixelColor(endX + 20, y);
    
    const rL = (leftColor >> 24) & 255;
    const gL = (leftColor >> 16) & 255;
    const bL = (leftColor >> 8) & 255;
    
    const rR = (rightColor >> 24) & 255;
    const gR = (rightColor >> 16) & 255;
    const bR = (rightColor >> 8) & 255;

    for (let x = startX; x < endX; x++) {
      const t = (x - startX) / (endX - startX);
      const r = Math.round(rL * (1 - t) + rR * t);
      const g = Math.round(gL * (1 - t) + gR * t);
      const b = Math.round(bL * (1 - t) + bR * t);
      const color = ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
      image.setPixelColor(color, x, y);
    }
  }

  await image.write(imgPath);
  console.log('Successfully patched certificate-template.jpg!');
}

patch().catch(console.error);
