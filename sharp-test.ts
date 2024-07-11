import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

(async () => {
  const RESIZE_WIDTH = 500;
  const RESIZE_HEIGHT = 500;
  const imageFilePaths = fs.readdirSync(path.join('original'));
  const data: string[][] = [['파일명', '변경 전 size', '변경 후 size', '변환률']];
  for (const filename of imageFilePaths) {
    const stats = fs.statSync(`original/${filename}`);
    const image = await sharp(`original/${filename}`);
    const [name, ext] = filename.split('.');
    const originalMetadata = await image.metadata();

    const resizeWidth =
      originalMetadata.width && originalMetadata.width > RESIZE_WIDTH ? RESIZE_WIDTH : originalMetadata.width;
    const resizeHeight =
      originalMetadata.height && originalMetadata.height > RESIZE_HEIGHT ? RESIZE_HEIGHT : originalMetadata.height;
    image
      .resize(resizeWidth, resizeHeight, { fit: 'contain' })
      .withMetadata()
      .toFormat('webp', { quality: 100 })
      .toFile(`dist/${name}.webp`, (err, info) => {
        const filename = name.replace('_', '');
        data.push([
          filename,
          stats.size.toString(),
          info.size.toString(),
          Math.floor(((stats.size - info.size) / stats.size) * 100).toString(),
        ]);
        console.log(`${name} ${stats.size} => ${info.size}`);
        console.log('=======================================================================');
      })
      .toBuffer();
  }
})();
