const fs=require('fs');
const rows=JSON.parse(fs.readFileSync('output/hero-study/headline-ascii.json','utf8')).rows;
const logo=fs.readFileSync('public/blur-wordmark.svg','utf8');
const code=`
const made=[],changed=[];
const art=await figma.getNodeByIdAsync('9:54');
const ink=await figma.variables.getVariableByIdAsync('VariableID:9:12');
const black=await figma.variables.getVariableByIdAsync('VariableID:9:6');
const available=await figma.listAvailableFontsAsync();
const font=available.find(f=>f.fontName.family==='Courier Prime' && f.fontName.style==='Bold').fontName;
await figma.loadFontAsync(font);
const style=figma.createTextStyle();style.name='Blur / Artwork / ASCII field';style.fontName=font;style.fontSize=8.32;style.lineHeight={unit:'PIXELS',value:6.53};style.letterSpacing={unit:'PIXELS',value:0};
const t=figma.createText();made.push(t.id);art.appendChild(t);t.name='Every great innovation starts with a question. / editable glyph artwork';t.fontName=font;t.textAutoResize='NONE';t.characters=${JSON.stringify(rows.join('\n'))};await t.setTextStyleIdAsync(style.id);t.resize(1248,372);t.layoutPositioning='ABSOLUTE';t.x=39.7;t.y=362.75;t.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',ink)];
const host=await figma.getNodeByIdAsync('9:51');const logo=figma.createNodeFromSvg(${JSON.stringify(logo)});host.appendChild(logo);logo.name='Blur / original vector wordmark';logo.resize(88,51);logo.layoutSizingHorizontal='FILL';made.push(logo.id,...logo.findAll(()=>true).map(n=>n.id));
for(const n of logo.findAll(()=>true)){if('fills' in n && Array.isArray(n.fills))n.fills=n.fills.map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',black):p);}
const social=await figma.getNodeByIdAsync('9:64');
const insta=figma.createNodeFromSvg('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#111111" stroke="none"/></svg>');social.appendChild(insta);insta.name='Instagram / original SVG';made.push(insta.id,...insta.findAll(()=>true).map(n=>n.id));
const behance=figma.createNodeFromSvg('<svg width="26" height="26" viewBox="0 0 26 26" fill="#111111"><path d="M3 6h6c4 0 5 4 2 6 4 1 4 8-2 8H3zm3 3v3h3c2 0 2-3 0-3zm0 6v3h3c2 0 2-3 0-3zm10-8h7v2h-7zm-2 9c0-7 11-7 11 0v1h-8c0 3 4 3 5 1h3c-2 6-11 5-11-2zm3-1h5c0-3-5-3-5 0z"/></svg>');social.appendChild(behance);behance.name='Behance / editable vector icon';made.push(behance.id,...behance.findAll(()=>true).map(n=>n.id));
for(const n of [...insta.findAll(()=>true),...behance.findAll(()=>true)]){for(const prop of ['fills','strokes'])if(prop in n && Array.isArray(n[prop]))n[prop]=n[prop].map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',black):p);}
const hero=await figma.getNodeByIdAsync('9:49');let d='';for(let i=0;i<180;i++){const x=(i*197.31)%1323,y=(i*83.37)%1291;d+='M'+x.toFixed(2)+' '+y.toFixed(2)+'h.7v.7h-.7z';}
const grain=figma.createNodeFromSvg('<svg width="1323" height="1291" viewBox="0 0 1323 1291"><path d="'+d+'" fill="#171717" opacity=".28"/></svg>');hero.appendChild(grain);grain.name='Background / editable grain specks';grain.layoutPositioning='ABSOLUTE';grain.x=0;grain.y=0;made.push(grain.id,...grain.findAll(()=>true).map(n=>n.id));hero.insertChild(0,grain);
for(const n of grain.findAll(()=>true))if('fills' in n && Array.isArray(n.fills))n.fills=n.fills.map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',ink):p);
changed.push(art.id,host.id,social.id,hero.id);return {createdNodeIds:made,mutatedNodeIds:changed,artworkStyle:style.id,editableGlyphs:t.characters.length};`;
process.stdout.write(code);
