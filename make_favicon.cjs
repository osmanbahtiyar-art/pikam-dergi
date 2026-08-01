const fs = require('fs');
const path = require('path');

const emblemPath = path.join(__dirname, 'public', 'pikam_blue_emblem.png');
const emblemBase64 = fs.readFileSync(emblemPath).toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${emblemBase64}" width="512" height="512" />
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), svgContent);
console.log('✅ public/favicon.svg successfully updated with PİKAM emblem logo!');
