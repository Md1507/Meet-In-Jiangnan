"""Create small synthetic E1 inputs; approvals here are fixture data only."""
import hashlib, json, struct, zlib
from pathlib import Path
root = Path(__file__).parent
def write(name, data):
    p = root / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    return hashlib.sha256(data).hexdigest()
def js(v): return json.dumps(v, separators=(',', ':')).encode()
def chunk(t, b): return struct.pack('>I',len(b))+t+b+struct.pack('>I',zlib.crc32(t+b))
png = b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',2,1,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(bytes([0,255,0,0,255,0,0,255,128])))+chunk(b'IEND',b'')
digest = write('public/art/sheet.png',png)
inputs = {}
for name, data in [('maps.json',js([{'map_name':'street','layout':[[0]*10 for _ in range(10)]}])),('ascii-maps.md',b'fixture only')]:
    inputs[name]={'path':name,'sha256':write(name,data)}
source={k:v['sha256'] for k,v in inputs.items()}
contract={'sourceInputs':source,**{k:{'status':'approved','evidence':'synthetic fixture only','sourceInputs':source} for k in ['scale','layout','camera','clearance']}}
c6=write('c6.json',js(contract))
a={'id':'sheet','path':'public/art/sheet.png','sha256':digest,'status':'production','category':'props','maps':['street'],'nativeDimensions':{'width':2,'height':1},'gridFootprint':{'width':1,'height':1},'anchor':{'x':0,'y':1},'collision':{'kind':'none'},'layer':'props','renderOrder':0,'interaction':{'kind':'none'},'variants':[],'source':'synthetic fixture','license':'fixture','bytes':len(png),'placement':'fixture','sourceStatus':'available','runtimeStatus':'pending','previewStatus':'pending'}
manifest={'assets':[a],'sourceInputs':source,'c6':{'path':'c6.json','sha256':c6,'expectedSha256':c6}}
fields=['path','sha256','nativeDimensions','gridFootprint','anchor','layer','renderOrder','collision','interaction','variants','source','license','maps','placement']
placement={'id':'sheet','map':'street','x':1,'y':1,'unit':'tile',**{k:a[k] for k in ['path','anchor','layer','renderOrder','gridFootprint','collision','interaction','variants']}}
ref={'provenance':'synthetic fixture only','inputs':inputs,'unit':'tile','maps':{'street':{'width':10,'height':10}},'assets':{'sheet':{**{k:a[k] for k in fields},'alpha':'transparent'}},'placements':[placement]}
scene={'camera':{'x':0,'y':0,'width':1,'height':1},'scale':2,'bindings':{'red':{'sheet':'sheet','crop':{'x':0,'y':0,'width':1,'height':1}},'blue':{'sheet':'sheet','crop':{'x':1,'y':0,'width':1,'height':1}}},'placements':[{'id':'red','layer':'terrain','order':0,'x':0,'y':0,'anchor':{'x':0,'y':0}},{'id':'blue','layer':'props','order':0,'x':1,'y':1,'anchor':{'x':1,'y':1}}]}
for name, value in [('manifest.json',manifest),('reference.json',ref),('scene.json',scene)]: write(name,js(value))
