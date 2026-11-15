"""Rebuild authored chapter data/assets. --download fetches pinned open assets.
Audio is local eSpeak-NG synthesis, NOT human speech or reviewed teaching audio.
Set PYTHONPATH to an espeakng-loader 0.2.4 installation when regenerating audio.
"""
import ctypes as ct
import hashlib
import json
import pathlib
import sys
import urllib.request
import urllib.parse
import wave
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
def write(name, value):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
def ref(name):
    return {'path': name, 'sha256': hashlib.sha256((ROOT / name).read_bytes()).hexdigest()}
def fetch(url, name):
    p = ROOT / name
    if p.exists(): return
    p.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(urllib.parse.quote(url,safe=':/'), timeout=120) as r: data = r.read()
    p.write_bytes(data)

# id, label, NPC, goal, required meaning components; positives and explicit negative.
SCENARIOS = [
('greeting','Chào hỏi','mentor','Chào thầy cô khi gặp mặt',['chào hỏi'],[
('老师好。','Lǎoshī hǎo.','Em chào thầy/cô.'),('老师，您好。','Lǎoshī, nín hǎo.','Em kính chào thầy/cô.'),('您好，老师。','Nín hǎo, lǎoshī.','Em chào thầy/cô.')],('老师再见。','Lǎoshī zàijiàn.','Em tạm biệt thầy/cô.')),
('introduction','Tự giới thiệu','roommate','Giới thiệu tên Tiểu Vũ',['tên','小雨'],[
('我叫小雨。','Wǒ jiào Xiǎoyǔ.','Tôi tên là Tiểu Vũ.'),('我的名字是小雨。','Wǒ de míngzi shì Xiǎoyǔ.','Tên của tôi là Tiểu Vũ.'),('你好，我是小雨。','Nǐ hǎo, wǒ shì Xiǎoyǔ.','Xin chào, tôi là Tiểu Vũ.')],('我不叫小雨。','Wǒ bù jiào Xiǎoyǔ.','Tôi không tên là Tiểu Vũ.')),
('repeat','Nhờ nhắc lại','mentor','Nhờ người đối diện nói lại',['nhắc lại'],[
('请再说一遍。','Qǐng zài shuō yí biàn.','Xin hãy nói lại một lần.'),('可以再说一遍吗？','Kěyǐ zài shuō yí biàn ma?','Có thể nói lại một lần không?'),('麻烦您再说一次。','Máfan nín zài shuō yí cì.','Phiền thầy/cô nói lại một lần.')],('请不要说了。','Qǐng bú yào shuō le.','Xin đừng nói nữa.')),
('checkin','Nhận phòng','officer','Báo đến làm thủ tục nhận phòng',['đến làm thủ tục','nhận phòng'],[
('我来办理入住。','Wǒ lái bànlǐ rùzhù.','Tôi đến làm thủ tục nhận phòng.'),('我要办理入住手续。','Wǒ yào bànlǐ rùzhù shǒuxù.','Tôi muốn làm thủ tục nhận phòng.'),('你好，我来办入住手续。','Nǐ hǎo, wǒ lái bàn rùzhù shǒuxù.','Xin chào, tôi đến làm thủ tục nhận phòng.')],('我不办理入住。','Wǒ bù bànlǐ rùzhù.','Tôi không làm thủ tục nhận phòng.')),
('room_problem','Báo vấn đề','roommate','Báo đèn trong phòng bị hỏng',['đèn','hỏng'],[
('房间的灯坏了。','Fángjiān de dēng huài le.','Đèn trong phòng bị hỏng rồi.'),('我的房间灯坏了。','Wǒ de fángjiān dēng huài le.','Đèn phòng tôi bị hỏng rồi.'),('房间里的灯不亮了。','Fángjiān lǐ de dēng bú liàng le.','Đèn trong phòng không sáng nữa.')],('房间的灯很好。','Fángjiān de dēng hěn hǎo.','Đèn trong phòng rất tốt.')),
('order_water','Gọi nước','seller','Gọi một cốc nước nóng',['một cốc','nước','nóng'],[
('我要一杯热水。','Wǒ yào yì bēi rèshuǐ.','Tôi muốn một cốc nước nóng.'),('给我一杯热水，谢谢。','Gěi wǒ yì bēi rèshuǐ, xièxie.','Cho tôi một cốc nước nóng, cảm ơn.'),('来杯热水吧。','Lái bēi rèshuǐ ba.','Cho một cốc nước nóng nhé.')],('我不要热水。','Wǒ bú yào rèshuǐ.','Tôi không muốn nước nóng.')),
('quantity','Chọn số lượng','shopkeeper','Mua hai cái bánh bao',['hai','bánh bao'],[
('我要两个包子。','Wǒ yào liǎng ge bāozi.','Tôi muốn hai cái bánh bao.'),('请给我两个包子。','Qǐng gěi wǒ liǎng ge bāozi.','Xin cho tôi hai cái bánh bao.'),('来两个包子，谢谢。','Lái liǎng ge bāozi, xièxie.','Cho hai cái bánh bao, cảm ơn.')],('我要一个包子。','Wǒ yào yí ge bāozi.','Tôi muốn một cái bánh bao.')),
('price','Hỏi giá','shopkeeper','Hỏi giá món đồ này',['hỏi giá','đồ này'],[
('这个多少钱？','Zhège duōshao qián?','Cái này bao nhiêu tiền?'),('请问，这个多少钱？','Qǐngwèn, zhège duōshao qián?','Xin hỏi, cái này bao nhiêu tiền?'),('这个的价格是多少？','Zhège de jiàgé shì duōshao?','Giá của cái này là bao nhiêu?')],('这个不要钱。','Zhège bú yào qián.','Cái này không mất tiền.')),
('directions','Hỏi đường','mentor','Hỏi thư viện ở đâu',['thư viện','ở đâu'],[
('图书馆在哪里？','Túshūguǎn zài nǎlǐ?','Thư viện ở đâu?'),('请问，图书馆在哪儿？','Qǐngwèn, túshūguǎn zài nǎr?','Xin hỏi, thư viện ở đâu?'),('请问，怎么去图书馆？','Qǐngwèn, zěnme qù túshūguǎn?','Xin hỏi, đi tới thư viện thế nào?')],('我不去图书馆。','Wǒ bú qù túshūguǎn.','Tôi không đi thư viện.')),
('schedule','Hỏi lịch','officer','Hỏi mấy giờ bắt đầu học',['mấy giờ','bắt đầu học'],[
('几点开始上课？','Jǐ diǎn kāishǐ shàngkè?','Mấy giờ bắt đầu học?'),('请问，几点上课？','Qǐngwèn, jǐ diǎn shàngkè?','Xin hỏi, mấy giờ vào học?'),('上课时间是几点？','Shàngkè shíjiān shì jǐ diǎn?','Giờ vào học là mấy giờ?')],('今天不上课。','Jīntiān bú shàngkè.','Hôm nay không học.')),
('parcel','Nhận bưu kiện','courier','Báo đến lấy bưu kiện',['đến lấy','bưu kiện'],[
('我来取快递。','Wǒ lái qǔ kuàidì.','Tôi đến lấy bưu kiện.'),('你好，我来拿快递。','Nǐ hǎo, wǒ lái ná kuàidì.','Xin chào, tôi đến nhận bưu kiện.'),('我要取我的快递。','Wǒ yào qǔ wǒ de kuàidì.','Tôi muốn lấy bưu kiện của mình.')],('我不要这个快递。','Wǒ bú yào zhège kuàidì.','Tôi không muốn bưu kiện này.')),
('invitation','Mời bạn','roommate','Mời bạn cùng ăn cơm ngày mai',['ngày mai','cùng nhau','ăn cơm'],[
('明天一起吃饭吧。','Míngtiān yìqǐ chīfàn ba.','Ngày mai cùng ăn cơm nhé.'),('明天我们一起吃饭，好吗？','Míngtiān wǒmen yìqǐ chīfàn, hǎo ma?','Ngày mai chúng ta cùng ăn cơm được không?'),('你明天愿意和我一起吃饭吗？','Nǐ míngtiān yuànyì hé wǒ yìqǐ chīfàn ma?','Ngày mai bạn có muốn ăn cơm cùng tôi không?')],('明天不要一起吃饭。','Míngtiān bú yào yìqǐ chīfàn.','Ngày mai đừng ăn cơm cùng nhau.'))]
SCENES = [('dorm','Ký túc xá','宿舍','Sùshè','#cda88b'),('gate','Cổng trường · Sinh viên','学生中心','Xuéshēng zhōngxīn','#91b8bc'),('library','Giảng đường · Thư viện','图书馆','Túshūguǎn','#a5b7cc'),('canteen','Nhà ăn','食堂','Shítáng','#d3b181'),('street','Phố cửa hàng · Bưu kiện','江南街','Jiāngnán jiē','#d5a59c'),('garden','Vườn ven kênh','水边花园','Shuǐbiān huāyuán','#8fb9a3')]
NPCS = [('mentor','Lín lǎoshī · 林老师','garden','#4e7769'),('roommate','Xiǎoyǔ · 小雨','dorm','#b87482'),('officer','Zhōu lǎoshī · 周老师','gate','#5b829a'),('seller','Wáng āyí · 王阿姨','canteen','#b67c46'),('shopkeeper','Ā Jié · 阿杰','street','#706d9e'),('courier','Liú shīfu · 刘师傅','street','#57977c')]
CHARACTERS = '你好我是学生人中国大小一二三口水日月来去'
NPC_SPEECH = [
('你好，欢迎来到学校。','Nǐ hǎo, huānyíng láidào xuéxiào.','Xin chào, chào mừng em đến trường.','欢迎你。','Huānyíng nǐ.','Chào mừng em.'),
('你叫什么名字？','Nǐ jiào shénme míngzi?','Bạn tên là gì?','很高兴认识你。','Hěn gāoxìng rènshi nǐ.','Rất vui được quen bạn.'),
('你听懂了吗？','Nǐ tīng dǒng le ma?','Em đã nghe hiểu chưa?','好的，我再说一遍。','Hǎo de, wǒ zài shuō yí biàn.','Được, thầy/cô nói lại một lần.'),
('你来办理什么手续？','Nǐ lái bànlǐ shénme shǒuxù?','Em đến làm thủ tục gì?','请给我看一下你的护照。','Qǐng gěi wǒ kàn yíxià nǐ de hùzhào.','Xin cho tôi xem hộ chiếu của em.'),
('你的房间有什么问题？','Nǐ de fángjiān yǒu shénme wèntí?','Phòng của bạn có vấn đề gì?','我帮你联系维修人员。','Wǒ bāng nǐ liánxì wéixiū rényuán.','Tôi giúp bạn liên hệ người sửa chữa.'),
('你想喝什么？','Nǐ xiǎng hē shénme?','Bạn muốn uống gì?','好的，一杯热水。','Hǎo de, yì bēi rèshuǐ.','Được, một cốc nước nóng.'),
('你要几个包子？','Nǐ yào jǐ ge bāozi?','Bạn muốn mấy cái bánh bao?','好的，两个包子。','Hǎo de, liǎng ge bāozi.','Được, hai cái bánh bao.'),
('你想问什么？','Nǐ xiǎng wèn shénme?','Bạn muốn hỏi gì?','这个十元。','Zhège shí yuán.','Cái này mười tệ.'),
('你要去哪里？','Nǐ yào qù nǎlǐ?','Em muốn đi đâu?','图书馆在教学楼旁边。','Túshūguǎn zài jiàoxuélóu pángbiān.','Thư viện ở cạnh tòa nhà giảng dạy.'),
('你想了解上课时间吗？','Nǐ xiǎng liǎojiě shàngkè shíjiān ma?','Em muốn biết giờ vào học phải không?','早上八点开始上课。','Zǎoshang bā diǎn kāishǐ shàngkè.','Bắt đầu học lúc tám giờ sáng.'),
('你来做什么？','Nǐ lái zuò shénme?','Bạn đến làm gì?','请出示取件码。','Qǐng chūshì qǔjiànmǎ.','Xin đưa mã lấy hàng.'),
('明天有什么安排？','Míngtiān yǒu shénme ānpái?','Ngày mai có dự định gì?','好啊，明天一起吃饭。','Hǎo a, míngtiān yìqǐ chīfàn.','Được đấy, ngày mai cùng ăn cơm.')]
KEYWORDS=['老师 lǎoshī · 好 hǎo','我叫 wǒ jiào · 小雨 Xiǎoyǔ','再说 zài shuō · 一遍 yí biàn','办理 bànlǐ · 入住 rùzhù','灯 dēng · 坏了 huài le','一杯 yì bēi · 热水 rèshuǐ','两个 liǎng ge · 包子 bāozi','这个 zhège · 多少钱 duōshao qián','图书馆 túshūguǎn · 哪里 nǎlǐ','几点 jǐ diǎn · 上课 shàngkè','取 qǔ · 快递 kuàidì','明天 míngtiān · 一起 yìqǐ · 吃饭 chīfàn']

def synth_init():
    import espeakng_loader
    lib = ct.CDLL(espeakng_loader.get_library_path())
    lib.espeak_Initialize.argtypes=[ct.c_int,ct.c_int,ct.c_char_p,ct.c_int]
    rate=lib.espeak_Initialize(2,0,espeakng_loader.get_data_path().encode(),0)
    if rate <= 0: raise RuntimeError('eSpeak initialization failed')
    lib.espeak_SetVoiceByName.argtypes=[ct.c_char_p]
    if lib.espeak_SetVoiceByName(b'cmn') != 0: raise RuntimeError('Mandarin voice unavailable')
    lib.espeak_SetParameter(1,145,0)
    callback_type=ct.CFUNCTYPE(ct.c_int,ct.POINTER(ct.c_short),ct.c_int,ct.c_void_p)
    lib.espeak_Synth.argtypes=[ct.c_void_p,ct.c_size_t,ct.c_uint,ct.c_int,ct.c_uint,ct.c_uint,ct.c_void_p,ct.c_void_p]
    def synth(text,name):
        chunks=[]
        @callback_type
        def callback(samples,count,_events):
            if count: chunks.append(ct.string_at(samples,count*2))
            return 0
        lib.espeak_SetSynthCallback(callback)
        raw=text.encode('utf8')+b'\0'
        if lib.espeak_Synth(raw,len(raw),0,1,0,1,None,None) != 0: raise RuntimeError('eSpeak synthesis failed')
        with wave.open(str(ROOT/name),'wb') as out:
            out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate);out.writeframes(b''.join(chunks))
    return synth

def art(index, color):
    # Vector-native original 240x135 pixel grid; no borrowed tiles or sprites.
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 240 135" shape-rendering="crispEdges"><rect width="240" height="135" fill="{color}"/>']
    def rect(x,y,w,h,c): parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>')
    for y in range(0,135,8):
        for x in range(0,240,8):
            if (x//8+y//8)%3==0:rect(x,y,2,1,'#ffffff20')
    rect(0,83,240,20,'#e2d9ba');rect(112,0,16,135,'#e2d9ba')
    for x in (16,156):
        rect(x,20,68,50,'#ebe7d4');rect(x-4,16,76,9,'#435e60' if index>3 else '#496e83');rect(x-8,12,84,5,'#344b53')
        for wx in (x+8,x+28,x+48):rect(wx,30,12,15,'#719ca5');rect(wx+2,32,3,10,'#a9d3d7')
        rect(x+27,51,14,19,'#826d53')
    for x,y in [(12,110),(216,110),(92,24),(224,5)]:rect(x+3,y+9,3,9,'#805e45');rect(x-2,y,14,12,'#477b63');rect(x,y-3,10,6,'#669a71')
    if index==0:
        for x in (26,46,66):rect(x,50,10,4,'#9b7b5d')
    if index==1:rect(96,20,48,9,'#577c8d');rect(104,15,32,4,'#a3c0bc');rect(134,65,5,12,'#2c4a54')
    if index==2:
        for x in range(23,80,10):rect(x,52,4,8,'#866d64')
    if index==3:
        for x in (28,170):rect(x,112,28,6,'#9c704b');rect(x+3,107,3,3,'#fff3cf');rect(x+22,107,3,3,'#fff3cf')
    if index==4:
        for x in (20,160):rect(x,25,60,6,'#a4574e');rect(x+1,65,4,12,'#a14f43');rect(x+12,65,4,12,'#e2c477')
        rect(185,111,18,12,'#af8157');rect(190,112,2,10,'#d8b988')
    if index==5:
        rect(0,105,240,24,'#649eac');rect(107,100,26,32,'#b9b19a')
        for x in range(3,240,19):rect(x,115+(x%3),10,1,'#94c5c7')
        rect(25,52,40,4,'#98634e');rect(28,40,3,13,'#8a6352');rect(59,40,3,13,'#8a6352');rect(20,35,50,6,'#415e59')
    parts.append('</svg>');return ''.join(parts)

def main():
    write('public/licenses/chapter-original.txt','Hẹn ở Giang Nam — original chapter text and vector pixel art, 2026.\nCC0-1.0 dedication for these newly generated assets. Draft language: human review pending.\nAudio: local eSpeak-NG Mandarin formant synthesis of this text; not human recordings.\nEngine source/license: https://github.com/espeak-ng/espeak-ng (GPL-3.0-or-later); engine is a build tool, not bundled in the game.\n')
    license=ref('public/licenses/chapter-original.txt')
    scenes=[]
    for i,(id,name,zh,pinyin,color) in enumerate(SCENES):
        write(f'public/art/{id}.svg',art(i,color))
        scenes.append(dict(id=id,name=name,zh=zh,pinyin=pinyin,exits=[SCENES[(i-1)%6][0],SCENES[(i+1)%6][0]],art=ref(f'public/art/{id}.svg'),license=license,colliders=[[64,64,336,280],[624,64,896,280]],spawn={'x':480,'y':380}))
    if '--download' in sys.argv:
        for char in CHARACTERS:fetch(f'https://raw.githubusercontent.com/chanind/hanzi-writer-data/68d10a4b21150cae5e1ebbd223eed289cf32d90c/data/{char}.json',f'public/hanzi/{char}.json')
        fetch('https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Sans/LICENSE','public/licenses/noto-OFL.txt')
    synth=None
    utterances=[];scenarios=[]
    (ROOT/'public/audio').mkdir(parents=True,exist_ok=True)
    for scene_index,(id,label,npc,goal,components,positive,negative) in enumerate(SCENARIOS):
        ids=[]
        for n,(text,pinyin,meaning) in enumerate(positive+[negative]):
            uid=f'{id}-{n}'; name=f'public/audio/{uid}.wav'
            if not (ROOT/name).exists():
                if not synth:synth=synth_init()
                synth(text,name)
            ids.append(uid)
            utterances.append(dict(id=uid,text=text,pinyin=pinyin,meaningVi=meaning,context=goal,audio=ref(name),license=license,audioKind='synthetic-espeak-ng',reviewStatus='pending-human'))
        prompt=NPC_SPEECH[scene_index]
        for suffix,values in [('prompt',prompt[:3]),('reply',prompt[3:])]:
            uid=f'{id}-{suffix}';name=f'public/audio/{uid}.wav';text,pinyin,meaning=values
            if not (ROOT/name).exists():
                if not synth:synth=synth_init()
                synth(text,name)
            utterances.append(dict(id=uid,text=text,pinyin=pinyin,meaningVi=meaning,context=goal,audio=ref(name),license=license,audioKind='synthetic-espeak-ng',reviewStatus='pending-human'))
        scenarios.append(dict(id=id,label=label,npc=npc,goal=goal,components=components,positive=ids[:3],negative=ids[3:],prompt=f'{id}-prompt',reply=f'{id}-reply',hints=[goal,KEYWORDS[scene_index],positive[0][0]+' · '+positive[0][1]]))
    quests=[]
    story=[('arrival','Ngày đầu nhập học',1,'officer',['greeting','introduction','checkin']),('breakfast','Bữa sáng tự gọi',2,'seller',['order_water']),('classroom','Tìm lớp và hỏi lịch',3,'mentor',['directions','schedule']),('shopping','Mua đồ cùng bạn',4,'shopkeeper',['price','quantity']),('delivery','Nhận bưu kiện',5,'courier',['parcel']),('welcome','Lời mời ngày đón bạn',7,'roommate',['invitation'])]
    for i,(id,title,day,npc,steps) in enumerate(story):quests.append(dict(id=id,title=title,day=day,npc=npc,scenario=steps[0],steps=steps,requires=[story[i-1][0]] if i else [],reward=1))
    activities=[dict(id=id,label=label,scene=scene,condition='Mỗi hoạt động một lần mỗi ngày',scenario=scenario) for id,label,scene,scenario in [('eat','Ăn ở nhà ăn','canteen','order_water'),('chat','Trò chuyện bạn cùng phòng','dorm','introduction'),('errand','Mua đồ giúp bạn','street','quantity'),('review','Ôn cùng mentor','garden','repeat')]]
    events=[dict(id=id,label=label,scene=scene,condition=f'Từ ngày {day}, {scene}; sau nhiệm vụ {required}; seed/cooldown theo ngày',minDay=day,requires=[required],scenario=scenario,npc=npc) for id,label,scene,day,scenario,required,npc in [('rain','Mưa ven kênh: hỏi đường có mái che','garden',2,'directions','arrival','mentor'),('soldout','Hết món: gọi nước nóng thay thế','canteen',2,'order_water','arrival','seller'),('favor','Bạn nhờ mua hai bánh bao','street',3,'quantity','breakfast','roommate'),('wrong_notice','Thông báo nhầm: xác nhận bưu kiện','street',5,'parcel','shopping','courier')]]
    lessons=[dict(id=f'lesson-{i+1}',title=label,scenario=id) for i,(id,label,*_) in enumerate([s for s in SCENARIOS if s[0] not in ['greeting','repeat']])]
    chars=[dict(id=char,character=char,data=ref(f'public/hanzi/{char}.json'),license=ref('public/licenses/ARPHICPL.txt')) for char in CHARACTERS]
    schedules={'mentor':['library','garden','dorm'],'roommate':['dorm','garden','dorm'],'officer':['gate','library','gate'],'seller':['canteen']*3,'shopkeeper':['street']*3,'courier':['street','gate','street']}
    data=dict(schemaVersion=1,year=2026,days=7,startScene='gate',endingQuest='welcome',reviewStatus='pending-human',scenes=scenes,npcs=[dict(id=id,name=name,scene=scene,role='mentor' if id=='mentor' else 'resident',color=color,schedule=schedules[id]) for id,name,scene,color in NPCS],quests=quests,activities=activities,events=events,scenarios=scenarios,utterances=utterances,sentenceLessons=lessons,characters=chars)
    write('src/content/mvp.json',data)
    # Ship only the glyphs used by this chapter and Latin/Vietnamese/pinyin.
    # Rename the modified font family; retain OFL and upstream attribution.
    from fontTools import subset
    font_path=ROOT/'public/fonts/NotoSansCJKsc-Regular.otf'
    font_source=pathlib.Path(tempfile.gettempdir())/'jiangnan-NotoSansCJKsc-f8d1575.otf'
    fetch('https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf',str(font_source))
    font=subset.load_font(str(font_source),subset.Options())
    text=json.dumps(data,ensure_ascii=False)+''.join(p.read_text(encoding='utf8') for p in (ROOT/'src').rglob('*.ts'))
    options=subset.Options();subsetter=subset.Subsetter(options=options)
    subsetter.populate(unicodes=set(range(0x20,0x250))|set(range(0x1e00,0x1f00))|set(map(ord,text)));subsetter.subset(font)
    for record in font['name'].names:
        if record.nameID in (1,4,6):record.string='JiangnanSC-Regular'.encode(record.getEncoding())
    subset.save_font(font,str(font_path),options)
    write('public/licenses/chapter-sources.json',{'original':license,'hanzi':{'repo':'chanind/hanzi-writer-data','revision':'68d10a4b21150cae5e1ebbd223eed289cf32d90c','license':'Arphic Public License','characters':CHARACTERS},'font':{'repo':'notofonts/noto-cjk','revision':'f8d157532fbfaeda587e826d4cd5b21a49186f7c','license':'SIL OFL-1.1'},'audio':{'tool':'espeakng-loader 0.2.4 / eSpeak-NG','kind':'local synthetic Mandarin, human review pending'}})
    print(f'Chapter: {len(scenes)} scenes, {len(quests)} quests, {len(scenarios)} scenarios, {len(utterances)} WAV, {len(lessons)} lessons, {len(chars)} characters. HUMAN REVIEW PENDING.')

if __name__=='__main__':main()

