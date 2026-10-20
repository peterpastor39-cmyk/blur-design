const fs = require('node:fs');
const sharp = require('sharp');
(async () => {
  const width = 250, height = 56;
  const {data, info} = await sharp('public/hero-headline.svg').resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const chars = '.:+*#R3@';
  const rows = [];
  for(let y=0;y<height;y++) {
    let row='';
    for(let x=0;x<width;x++) {
      const a=data[(y*width+x)*info.channels+3]/255;
      row += a>.13 ? chars[Math.min(chars.length-1,Math.floor(a*(chars.length-1)))] : ' ';
    }
    rows.push(row);
  }
  fs.writeFileSync('output/hero-study/headline-ascii.json',JSON.stringify({width,height,rows}));
  console.log(JSON.stringify({width,height,rows}));
})();
