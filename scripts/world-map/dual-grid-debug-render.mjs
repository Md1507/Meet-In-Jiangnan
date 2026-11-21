import fs from 'node:fs';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';

export const hash = b => createHash('sha256').update(b).digest('hex');
const crc = b => { let c=0xffffffff; for (const v of b) { c^=v; for(let i=0;i<8;i++) c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0; };
const chunk = (type,data) => { const t=Buffer.from(type), n=Buffer.alloc(4), c=Buffer.alloc(4); n.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t,data]))); return Buffer.concat([n,t,data,c]); };
export function encodePng(width,height,pixels) {
  if (![width,height].every(x=>Number.isSafeInteger(x)&&x>0) || pixels.length!==width*height*4) throw Error('invalid image');
  const head=Buffer.alloc(13); head.writeUInt32BE(width); head.writeUInt32BE(height,4); head[8]=8; head[9]=6;
  const rows=Buffer.alloc((width*4+1)*height); for(let y=0;y<height;y++) Buffer.from(pixels.buffer,pixels.byteOffset+y*width*4,width*4).copy(rows,y*(width*4+1)+1);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
export function decodePng(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) throw Error('invalid atlas PNG signature');
  let p=8, width, height, parts=[], end=false;
  while(p+12<=bytes.length) { const n=bytes.readUInt32BE(p), type=bytes.toString('ascii',p+4,p+8), data=bytes.subarray(p+8,p+8+n); if(p+12+n>bytes.length || crc(bytes.subarray(p+4,p+8+n))!==bytes.readUInt32BE(p+8+n)) throw Error('corrupt atlas PNG');
    if(type==='IHDR') { width=data.readUInt32BE(0); height=data.readUInt32BE(4); if(data[8]!==8||data[9]!==6||data[12]!==0) throw Error('unsupported atlas PNG'); } if(type==='IDAT') parts.push(data); p+=12+n; if(type==='IEND'){end=true; break;} }
  if(!end || p!==bytes.length || !width || !height || !parts.length) throw Error('incomplete atlas PNG');
  const raw=zlib.inflateSync(Buffer.concat(parts)), stride=width*4+1; if(raw.length!==stride*height) throw Error('invalid atlas pixels'); const pixels=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++){ if(raw[y*stride]!==0) throw Error('unsupported PNG filter'); raw.copy(pixels,y*width*4,y*stride+1,(y+1)*stride); } return {width,height,pixels};
}
export function fixtureAtlas() {
  const pixels=Buffer.alloc(256*16*4), mapping=Array.from({length:16},(_,mask)=>({mask,x:mask*16,y:0,width:16,height:16}));
  for(let mask=0;mask<16;mask++) for(let y=0;y<16;y++) for(let x=0;x<16;x++) { const bit=y<8?(x<8?1:2):(x<8?8:4); const i=(y*256+mask*16+x)*4; pixels[i]=pixels[i+1]=pixels[i+2]=255; pixels[i+3]=(mask&bit)?255:0; }
  return {png:encodePng(256,16,pixels),mapping};
}
const colors={grass:[94,132,84],road:[177,150,103],water:[70,123,160],obstacle_macro:[94,83,85]};
export function renderDisplay(display, atlasBytes, mapping, zoom=1) {
  if(!Number.isSafeInteger(zoom)||zoom<1) throw Error('zoom must be a positive integer');
  if(!display?.layers || !display.layers.grass || !display.underlay || !display.layers[display.underlay]) throw Error('missing underlay');
  const atlas=decodePng(atlasBytes); if(!Array.isArray(mapping)||mapping.length!==16 || new Set(mapping.map(m=>m.mask)).size!==16) throw Error('missing atlas mapping');
  for(let mask=0;mask<16;mask++){const m=mapping.find(x=>x.mask===mask); if(!m||![m.x,m.y,m.width,m.height].every(Number.isSafeInteger)||m.width!==16||m.height!==16||m.x<0||m.y<0||m.x+16>atlas.width||m.y+16>atlas.height) throw Error(`invalid atlas mapping ${mask}`);}
  const w=640,h=480,pixels=Buffer.alloc(w*h*4); const put=(x,y,c)=>{if(x>=0&&x<w&&y>=0&&y<h){const i=(y*w+x)*4; pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];pixels[i+3]=255;}};
  for(const [material,layer] of Object.entries(display.layers)) { if(!colors[material] || layer.length!==31) throw Error('invalid layer'); for(let v=0;v<31;v++){if(layer[v].length!==41) throw Error('invalid display width'); for(let u=0;u<41;u++){const c=layer[v][u]; if(c.u!==u||c.v!==v||c.x!==u*16-8||c.y!==v*16-8||!Number.isInteger(c.mask)||c.mask<0||c.mask>15) throw Error(`invalid display cell ${u},${v}`); const m=mapping.find(t=>t.mask===c.mask); for(let y=0;y<16;y++) for(let x=0;x<16;x++){const ai=((m.y+y)*atlas.width+m.x+x)*4;if(atlas.pixels[ai+3]) put(c.x+x,c.y+y,colors[material].map((n,i)=>Math.round(n*atlas.pixels[ai+i]/255)));}}}}
  for(let i=3;i<pixels.length;i+=4) if(pixels[i]!==255) throw Error(`missing underlay coverage at pixel ${((i-3)/4)%w},${Math.floor((i-3)/4/w)}`);
  const macro=(p,kind)=>{if(!p || !Number.isSafeInteger(p.x)||!Number.isSafeInteger(p.y)||p.x<0||p.x>=20||p.y<0||p.y>=15) throw Error(`invalid ${kind} macro coordinate`);};
  for(const [kind,records] of [['port',display.ports],['arrival',display.arrivals],['bridge',display.bridges]]) for(const p of records) macro(p,kind);
  // Rails occupy declared edges; the deck remains continuous across cells.
  for(const record of display.bridgeContracts || []) for(const cell of record.cells) {
    macro(cell,'bridge contract');
    if(cell.status!=='logical') continue;
    if(cell.underlay!=='water'||cell.overlay!=='bridge'||!['horizontal','vertical'].includes(cell.axis)) throw Error(`missing bridge underlay at ${cell.x},${cell.y}`);
    if(!Array.isArray(cell.rails) || cell.rails.some(r=>!['north','south','east','west'].includes(r))) throw Error('invalid bridge rails');
    for(let y=0;y<32;y++) for(let x=0;x<32;x++) {
      const rail=(cell.rails.includes('north')&&y<4)||(cell.rails.includes('south')&&y>=28)||(cell.rails.includes('west')&&x<4)||(cell.rails.includes('east')&&x>=28);
      put(cell.x*32+x,cell.y*32+y,rail?[100,65,42]:[155,109,68]);
    }
  }
  // Sparse alternating lines preserve visibility of terrain and distinct grid systems.
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if((x%32===0||y%32===0)&&((x+y)%8<4)) put(x,y,[255,255,255]); else if(((x+8)%16===0||(y+8)%16===0)&&((x+y)%8<3)) put(x,y,[60,40,220]); }
  const mark=(x,y,color)=>{if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)) throw Error('fractional overlay'); for(let d=-4;d<=4;d++){put(x+d,y,color);put(x,y+d,color);}};
  for(let y=0;y<15;y++) for(let x=0;x<20;x++) if(display.blocked[y][x]) for(let d=4;d<28;d++) {put(x*32+d,y*32+d,[235,45,45]);}
  for(const p of display.ports) mark(p.x*32+16,p.y*32+16,[255,230,0]);
  for(const p of display.arrivals) mark(p.x*32+16,p.y*32+16,[0,255,255]);
  for(const p of display.bridges) mark(p.x*32+16,p.y*32+16,[255,0,220]);
  // Compact, embedded legend; colours are also described in the index documentation.
  const glyph={Y:['101','101','010','010','010'],V:['101','101','101','101','010'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],B:['110','101','110','101','110'],U:['101','101','101','101','111'],G:['111','100','101','101','111'],W:['101','101','101','111','101'],O:['111','101','101','101','111'],R:['110','101','110','101','101'],L:['100','100','100','100','111'],I:['111','010','010','010','111'],S:['111','100','111','001','111'],P:['110','101','110','100','100'],A:['010','101','111','101','101'],T:['111','010','010','010','010'],C:['111','100','100','100','111'],N:['101','111','111','111','101'],' ':['000','000','000','000','000']};
  const legend=[['DEBUG', [255,255,255]],['WORLD',[255,255,255]],['DISPLAY',[100,80,255]],['COLLISION',[235,45,45]],['PORT',[255,230,0]],['ARRIVAL',[0,255,255]],['BRIDGE',[255,0,220]]];
  let lx=2; for(const [word,color] of legend){for(const letter of word){const g=glyph[letter]; for(let yy=0;yy<5;yy++)for(let xx=0;xx<3;xx++) if(g[yy][xx]==='1') put(lx+xx,2+yy,color); lx+=4;} lx+=5;}
  if(zoom===1) return encodePng(w,h,pixels);
  const out=Buffer.alloc(w*zoom*h*zoom*4); for(let y=0;y<h*zoom;y++) for(let x=0;x<w*zoom;x++) pixels.copy(out,(y*w*zoom+x)*4,(Math.floor(y/zoom)*w+Math.floor(x/zoom))*4,(Math.floor(y/zoom)*w+Math.floor(x/zoom))*4+4); return encodePng(w*zoom,h*zoom,out);
}
export function readChecked(path,expected) { const b=fs.readFileSync(path); if(hash(b)!==expected) throw Error(`hash mismatch: ${path}`); return b; }



