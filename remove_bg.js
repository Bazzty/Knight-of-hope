const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function run() {
  const image = await loadImage('public/assets/test2.png');
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  
  const bgR = data[0], bgG = data[1], bgB = data[2];
  
  for(let i = 0; i < data.length; i += 4) {
    if(Math.abs(data[i] - bgR) < 20 && Math.abs(data[i+1] - bgG) < 20 && Math.abs(data[i+2] - bgB) < 20) {
      data[i+3] = 0;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('public/assets/test2_transparent.png', buffer);
  console.log('Done!');
}
run();
