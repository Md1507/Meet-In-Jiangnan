import { inflateSync, deflateSync } from 'node:zlib';

// PNGs supplied here must first pass E1's validation and integrity checks.
export function decodePng(bytes) {
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const channels = bytes[25] === 6 ? 4 : bytes[25] === 2 ? 3 : 0;
  if (!channels || bytes[24] !== 8 || bytes[28] !== 0 || width * height > 16777216) throw Error('unsupported PNG');
  const chunks = []; let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    if (offset + 12 + length > bytes.length) throw Error('truncated PNG');
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const stride = width * channels, expected = (stride + 1) * height;
  const raw = inflateSync(Buffer.concat(chunks), {maxOutputLength: expected});
  if (raw.length !== expected) throw Error('invalid PNG data');
  const pixels = Buffer.alloc(width * height * 4); let previous = Buffer.alloc(stride), pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]; if (filter > 4) throw Error('invalid PNG filter');
    const row = Buffer.from(raw.subarray(pos, pos + stride)); pos += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? row[i - channels] : 0, b = previous[i], c = i >= channels ? previous[i - channels] : 0;
      const p = a + b - c, pa = Math.abs(p-a), pb = Math.abs(p-b), pc = Math.abs(p-c);
      const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a+b)/2) : pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      row[i] = (row[i] + predictor) & 255;
    }
    for (let x = 0; x < width; x++) { const from = x * channels, to = (y * width + x) * 4; row.copy(pixels, to, from, from + 3); pixels[to+3] = channels === 4 ? row[from+3] : 255; }
    previous = row;
  }
  return {width, height, pixels};
}

function chunk(type, data) {
  const content = Buffer.concat([Buffer.from(type), data]); let crc = 0xffffffff;
  for (const byte of content) { crc ^= byte; for (let i=0;i<8;i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  const length = Buffer.alloc(4), sum = Buffer.alloc(4); length.writeUInt32BE(data.length); sum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, content, sum]);
}
export function encodePng({width, height, pixels}) {
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height,4); header[8]=8; header[9]=6;
  const raw = Buffer.alloc((width*4+1)*height);
  for(let y=0;y<height;y++) pixels.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}

const layers = ['terrain','underlay','decoration','architecture','structure','props','foreground'];
const int = Number.isSafeInteger;
// Positions and anchors are integer art pixels; crop is in sheet pixels. Camera is in art pixels.
export function render({camera, scale, sprites}) {
  if (!camera || ![camera.x,camera.y,camera.width,camera.height,scale].every(int) || camera.width < 1 || camera.height < 1 || scale < 1 || camera.width*camera.height*scale*scale > 16777216 || !Array.isArray(sprites)) throw Error('invalid camera or scale');
  const width=camera.width*scale, height=camera.height*scale, pixels=Buffer.alloc(width*height*4);
  const sorted=sprites.map((s,index)=>({...s,index}));
  for(const s of sorted) {
    if (!layers.includes(s.layer) || !int(s.order) || ![s.x,s.y,s.anchor?.x,s.anchor?.y].every(int) || !s.image || !int(s.image.width) || !int(s.image.height) || !Buffer.isBuffer(s.image.pixels) || s.image.pixels.length !== s.image.width*s.image.height*4) throw Error('invalid sprite or layer');
    s.crop ??= {x:0,y:0,width:s.image.width,height:s.image.height};
    const c=s.crop;
    if (![c.x,c.y,c.width,c.height].every(int) || c.x<0 || c.y<0 || c.width<1 || c.height<1 || c.x+c.width>s.image.width || c.y+c.height>s.image.height) throw Error('invalid crop');
  }
  sorted.sort((a,b)=>layers.indexOf(a.layer)-layers.indexOf(b.layer) || a.order-b.order || a.index-b.index);
  for(const s of sorted) for(let sy=0;sy<s.crop.height;sy++) for(let sx=0;sx<s.crop.width;sx++) {
    const x=s.x-s.anchor.x+sx-camera.x, y=s.y-s.anchor.y+sy-camera.y;
    if(x<0 || y<0 || x>=camera.width || y>=camera.height) continue;
    const si=((s.crop.y+sy)*s.image.width+s.crop.x+sx)*4, sa=s.image.pixels[si+3]; if(!sa) continue;
    for(let dy=0;dy<scale;dy++) for(let dx=0;dx<scale;dx++) {
      const di=((y*scale+dy)*width+x*scale+dx)*4, da=pixels[di+3], alpha=sa*255+da*(255-sa);
      for(let c=0;c<3;c++) pixels[di+c]=Math.round((s.image.pixels[si+c]*sa*255+pixels[di+c]*da*(255-sa))/alpha);
      pixels[di+3]=Math.round(alpha/255);
    }
  }
  return {width,height,pixels};
}

// QA geometry is supplied in art-pixel coordinates and never enters the clean render.
// A small built-in bitmap font makes the PNG itself self-describing, without OS fonts.
const font={
 '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
 A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],J:['001','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],Q:['010','101','101','111','011'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],Z:['111','001','010','100','111'],
 ' ':['000','000','000','000','000'],'-':['000','000','111','000','000'],'_':['000','000','000','000','111'],'.':['000','000','000','000','010'],':':['000','010','000','010','000'],'/':['001','001','010','100','100']
};
export function renderOverlay(image, camera, scale, overlays) {
  const colors={world:[255,255,255,255],display:[0,255,255,255],footprint:[255,255,0,255],warp:[255,0,255,255],actor:[255,0,0,255],collision:[255,128,0,255],interaction:[0,255,0,255],terrain:[128,255,128,255],grid:[128,128,255,255]};
  if (!Array.isArray(overlays)) throw Error('invalid overlays');
  if(overlays.length>1000) throw Error('too many overlays');
  const captions=overlays.map((o,i)=>`${i+1} ${o.type} ${o.label}`.toUpperCase());
  if(captions.some(s=>s.length>128 || [...s].some(c=>!font[c]))) throw Error('overlay label must use ASCII letters, digits or .:/_-');
  const width=Math.max(image.width, ...captions.map(s=>s.length*4+2)), height=image.height+overlays.length*7;
  if(width*height>16777216) throw Error('overlay size limit');
  const result={width,height,pixels:Buffer.alloc(width*height*4)}, labels=[];
  for(let y=0;y<image.height;y++) image.pixels.copy(result.pixels,y*width*4,y*image.width*4,(y+1)*image.width*4);
  const put=(x,y,color)=>{if(x>=0&&y>=0&&x<result.width&&y<result.height) result.pixels.set(color,(y*result.width+x)*4);};
  const text=(s,x,y,color,clipWidth=width,clipHeight=height)=>{for(const [i,c] of [...s].entries()) for(let row=0;row<5;row++) for(let col=0;col<3;col++) if(font[c][row][col]==='1' && x+i*4+col<clipWidth && y+row<clipHeight) put(x+i*4+col,y+row,color);};
  for(const [index,o] of overlays.entries()) {
    if (!Object.hasOwn(colors,o.type) || typeof o.label !== 'string' || !o.label.trim() || ![o.x,o.y,o.width,o.height].every(int) || o.width<1 || o.height<1) throw Error('invalid overlay');
    const left=(o.x-camera.x)*scale, top=(o.y-camera.y)*scale, right=left+o.width*scale-1, bottom=top+o.height*scale-1;
    for(let x=Math.max(0,left);x<=Math.min(image.width-1,right);x++){if(top>=0&&top<image.height) put(x,top,colors[o.type]);if(bottom>=0&&bottom<image.height) put(x,bottom,colors[o.type]);}
    for(let y=Math.max(0,top);y<=Math.min(image.height-1,bottom);y++){if(left>=0&&left<image.width) put(left,y,colors[o.type]);if(right>=0&&right<image.width) put(right,y,colors[o.type]);}
    const visibleLeft=Math.max(0,left), visibleTop=Math.max(0,top), visibleRight=Math.min(image.width-1,right), visibleBottom=Math.min(image.height-1,bottom);
    if(visibleLeft<=visibleRight && visibleTop<=visibleBottom) text(String(index+1),visibleLeft,visibleTop,colors[o.type],visibleRight+1,visibleBottom+1);
    text(captions[index],1,image.height+index*7+1,colors[o.type]);
    labels.push({number:index+1,type:o.type,label:o.label,x:left,y:top,color:colors[o.type]});
  }
  return {image:result,labels};
}
