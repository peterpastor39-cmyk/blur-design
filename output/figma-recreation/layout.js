const created=[];
const mark=n=>{created.push(n.id);return n;};
const collections=await figma.variables.getLocalVariableCollectionsAsync();
if(collections.some(c=>c.name==='Blur / Foundations')) throw new Error('Recreation already started; inspect before retry.');
const c=figma.variables.createVariableCollection('Blur / Foundations');c.renameMode(c.modes[0].modeId,'Default');
const mode=c.modes[0].modeId, tokens={};
function variable(name,type,value,scopes){const v=figma.variables.createVariable(name,c,type);v.scopes=scopes;v.setValueForMode(mode,value);tokens[name]=v;return v;}
for(const [name,hex,alpha] of [['surface/light','#ffffff',1],['surface/dark','#0b0b0b',1],['surface/card','#121212',1],['text/ink','#111111',1],['text/white','#ffffff',1],['text/muted','#8a8a8a',1],['text/on-dark-muted','#ffffff',.55],['text/project-description','#ffffff',.72],['border/subtle','#ffffff',.22],['artwork/ink','#171717',1]]){
 const s=hex.slice(1);variable('color/'+name,'COLOR',{r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255,a:alpha},['ALL_FILLS','STROKE_COLOR']);
}
for(const n of [0,2,6,8,10,12,14,16,17,18,20,22,24,25,28,30,32,35,40,44,48,56,64,80,96,110,120,140,155,160]) variable('space/'+n,'FLOAT',n,['GAP']);
for(const n of [1,6,30,999])variable('radius/'+n,'FLOAT',n,['CORNER_RADIUS']);
function fill(n,key){n.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',tokens['color/'+key])];}
function gap(n,k,v){n.setBoundVariable(k,tokens['space/'+v]);}
function al(name,dir,w,h,bg){const n=mark(figma.createAutoLayout(dir));n.name=name;n.resize(w,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.fills=[];if(bg)fill(n,bg);gap(n,'itemSpacing',0);return n;}
function child(p,n,fillWidth=true){p.appendChild(n);if(fillWidth)n.layoutSizingHorizontal='FILL';return n;}
function img(p,name,hash,w,h){const n=al(name,'VERTICAL',w,h);n.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];p.appendChild(n);return n;}
const W=1322.667,H=1291.333;
const section=mark(figma.createSection());section.name='Blur — localhost homepage / Editable recreation / 21 Oct 2026';section.x=1750;section.y=100;section.resizeWithoutConstraints(3450,6300);
const page=al('Homepage / Desktop / '+W+'px','VERTICAL',W,5637.23,'surface/light');section.appendChild(page);page.x=80;page.y=100;page.primaryAxisSizingMode='AUTO';
const hero=child(page,al('01 / Hero — project wheel','VERTICAL',W,H,'surface/light'));hero.clipsContent=true;hero.placeholder=true;
const nav=child(hero,al('Navigation / fixed in browser','HORIZONTAL',W-88,51),false);nav.layoutPositioning='ABSOLUTE';nav.x=44;nav.y=25;nav.primaryAxisAlignItems='SPACE_BETWEEN';nav.counterAxisAlignItems='CENTER';
const logo=al('Blur / editable wordmark','VERTICAL',88,51);nav.appendChild(logo);
const links=al('Navigation links','HORIZONTAL',281,30);nav.appendChild(links);gap(links,'itemSpacing',32);links.counterAxisAlignItems='CENTER';links.primaryAxisSizingMode='AUTO';
const cta=al('Start a project / pill','HORIZONTAL',140,36,'text/ink');nav.appendChild(cta);cta.cornerRadius=30;gap(cta,'paddingLeft',17);gap(cta,'paddingRight',17);gap(cta,'paddingTop',10);gap(cta,'paddingBottom',10);gap(cta,'itemSpacing',18);cta.counterAxisAlignItems='CENTER';
const art=child(hero,al('Hero artwork / static editable glyph field','VERTICAL',W,1091.333),false);art.layoutPositioning='ABSOLUTE';art.x=0;art.y=90;
const wheel=child(hero,al('Project wheel / settled pose','VERTICAL',W,H),false);wheel.layoutPositioning='ABSOLUTE';wheel.x=0;wheel.y=0;
const hashes={tendr:'f36fe7dd727c46f62da39a9f26cd5567f53d8070',billboard:'3cc30ae067288881c93e3fb5769811af88815ead',mark:'68ef2c25ffc398acd8e0b41175fe766ff8b38a68',cards:'3b0b2f8b1191ec40bd53b5df1daf7a9bad66eb91',knox:'da489ff50ff1fe575ed200c2c2b21302684a1263',dashboard:'8907b1bacc771d97b4b5cf44ec72e0d83d9b3216'};
for(const [key,x,y,w,h] of [['cards',665,412,97,74],['knox',483,413,93,75],['mark',870,454,53,119],['billboard',908,546,121,198],['dashboard',363,551,152,197],['tendr',588,629,312,213]]){const n=img(wheel,'Wheel image / '+key,hashes[key],w,h);n.layoutPositioning='ABSOLUTE';n.x=x;n.y=y;}
const mobile=al('Wheel image / sonar-mobile','VERTICAL',38,121);wheel.appendChild(mobile);mobile.layoutPositioning='ABSOLUTE';mobile.x=380;mobile.y=457;
const meta=child(hero,al('Hero metadata','HORIZONTAL',W-88,26),false);meta.layoutPositioning='ABSOLUTE';meta.x=44;meta.y=H-61;meta.primaryAxisAlignItems='SPACE_BETWEEN';
const social=al('Social links','HORIZONTAL',70,26);meta.appendChild(social);gap(social,'itemSpacing',18);
const clock=al('Manila time / static sample','HORIZONTAL',130,26);meta.appendChild(clock);gap(clock,'itemSpacing',10);
const story=child(page,al('02 / About Blur — opening scroll state','VERTICAL',W,1652.906,'surface/light'));story.placeholder=true;gap(story,'paddingLeft',44);gap(story,'paddingRight',44);gap(story,'paddingTop',155);gap(story,'itemSpacing',40);
const slogan=child(story,al('Studio introduction','VERTICAL',W-88,101));
const storyImage=img(story,'Studio reel / Tendr — first slide',hashes.tendr,W-88,951);storyImage.layoutSizingHorizontal='FILL';
const work=child(page,al('03 / Selected work','VERTICAL',W,909.958,'surface/dark'));work.placeholder=true;gap(work,'itemSpacing',2);
const tileIds=[];
for(let row=0;row<2;row++){const r=child(work,al('Work grid / row '+(row+1),'HORIZONTAL',W,453.979));gap(r,'itemSpacing',2);for(let col=0;col<2;col++){const i=row*2+col;const key=['dashboard','billboard','knox','tendr'][i];const card=img(r,'Project / '+['Sonar','Billboard','Knox Locker','Tendr'][i],hashes[key],(W-2)/2,453.979);card.layoutSizingHorizontal='FILL';card.clipsContent=true;tileIds.push(card.id);const shade=al('Image readability gradient','VERTICAL',card.width,250);card.appendChild(shade);shade.layoutPositioning='ABSOLUTE';shade.x=0;shade.y=204;shade.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{r:0,g:0,b:0,a:0}},{position:1,color:{r:0,g:0,b:0,a:.8}}]}];const badge=al('Project number','HORIZONTAL',80,20);card.appendChild(badge);badge.layoutPositioning='ABSOLUTE';badge.x=28;badge.y=24;const info=al('Project information','VERTICAL',card.width-56,90);card.appendChild(info);info.layoutPositioning='ABSOLUTE';info.x=28;info.y=card.height-114;gap(info,'itemSpacing',8);info.primaryAxisSizingMode='AUTO';const titleRow=child(info,al('Title and discipline','HORIZONTAL',info.width,40));titleRow.primaryAxisAlignItems='SPACE_BETWEEN';titleRow.counterAxisAlignItems='END'==='END'?'MAX':'MAX';titleRow.primaryAxisSizingMode='FIXED';}}
const why=child(page,al('04 / Why Blur','HORIZONTAL',W,341.604,'surface/dark'));why.placeholder=true;gap(why,'paddingLeft',44);gap(why,'paddingRight',44);gap(why,'paddingTop',160);gap(why,'paddingBottom',40);why.counterAxisAlignItems='MAX';why.primaryAxisAlignItems='SPACE_BETWEEN';gap(why,'itemSpacing',80);
const whyTitle=al('Every idea starts as a blur.','VERTICAL',582,142);why.appendChild(whyTitle);const whyBody=al('Why Blur / studio narrative','VERTICAL',582,140);why.appendChild(whyBody);
const more=child(page,al('05 / More work','HORIZONTAL',W,721.427,'surface/dark'));more.placeholder=true;gap(more,'paddingLeft',44);gap(more,'paddingTop',48);gap(more,'paddingBottom',120);gap(more,'itemSpacing',32);more.clipsContent=true;
const moreIds=[];
for(let i=0;i<4;i++){const card=al('More work / '+['Sonar identity','Sonar mobile','Sonar mark','See all work'][i],'VERTICAL',348,520);more.appendChild(card);card.primaryAxisSizingMode='AUTO';gap(card,'itemSpacing',14);if(i%2){gap(card,'paddingTop',120);}const number=child(card,al('Project count','HORIZONTAL',348,16));const image=al('Project media / '+i,'VERTICAL',348,[435,261,464,261][i],i===3?'surface/card':undefined);card.appendChild(image);image.clipsContent=true;if(i===0)image.fills=[{type:'IMAGE',imageHash:hashes.cards,scaleMode:'FILL'}];if(i===2)image.fills=[{type:'IMAGE',imageHash:hashes.mark,scaleMode:'FILL'}];moreIds.push(card.id);}
const services=child(page,al('06 / How we work','HORIZONTAL',W,720,'surface/dark'));services.placeholder=true;gap(services,'paddingTop',140);gap(services,'paddingBottom',140);gap(services,'paddingLeft',44);gap(services,'paddingRight',44);gap(services,'itemSpacing',80);
const intro=al('Small team / introduction','VERTICAL',582,330);services.appendChild(intro);gap(intro,'itemSpacing',28);intro.primaryAxisSizingMode='AUTO';
const list=al('Services list','VERTICAL',582,440);services.appendChild(list);
for(const name of ['Brand identity','Product design','Brand systems','Websites & decks']){const row=child(list,al('Service / '+name,'HORIZONTAL',582,110));row.primaryAxisAlignItems='SPACE_BETWEEN';row.counterAxisAlignItems='CENTER';row.strokes=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',tokens['color/border/subtle'])];row.strokeWeight=1;row.strokeTopWeight=0;row.strokeLeftWeight=0;row.strokeRightWeight=0;row.strokeBottomWeight=1;}
const endState=al('Scroll story / settled state — copy revealed','HORIZONTAL',W,H,'surface/dark');section.appendChild(endState);endState.x=1550;endState.y=100;endState.placeholder=true;gap(endState,'paddingLeft',44);gap(endState,'paddingRight',44);gap(endState,'itemSpacing',80);endState.counterAxisAlignItems='CENTER';
const endCopy=al('Studio positioning','VERTICAL',502,650);endState.appendChild(endCopy);endCopy.primaryAxisSizingMode='AUTO';const endImage=img(endState,'Studio reel / settled crop',hashes.tendr,688,430);
return {createdNodeIds:created,section:section.id,page:page.id,hero:hero.id,nav:nav.id,logo:logo.id,links:links.id,cta:cta.id,art:art.id,wheel:wheel.id,mobile:mobile.id,meta:meta.id,social:social.id,clock:clock.id,story:story.id,slogan:slogan.id,work:work.id,tileIds,why:why.id,whyTitle:whyTitle.id,whyBody:whyBody.id,more:more.id,moreIds,services:services.id,intro:intro.id,list:list.id,endState:endState.id,endCopy:endCopy.id,collection:c.id,tokens:Object.fromEntries(Object.entries(tokens).map(([k,v])=>[k,v.id]))};
