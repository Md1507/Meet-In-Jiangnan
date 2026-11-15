import raw from '../content/ambient-dialogues.json' with {type:'json'};

export const ambientContent=raw;
export type AmbientNpc=typeof raw.npcs[number];
export type AmbientTurn=AmbientNpc['turns'][number];
export type ChatProgress=Record<string,number>;
export const ambientNpcById=new Map(raw.npcs.map(n=>[n.id,n]));
export const chatAudio=(id:string)=>`/audio/ambient/${id}.wav`;

// Whole answers, optional subject/politeness and common synonyms. Each question
// has its own intents: a negative preference is a valid answer, not a failure.
const place='(?:图书馆|食堂|宿舍|花园|校门|学校门口|商店|超市)';
const activity='(?:看书|读书|阅读|听音乐|听歌|散步|走走|玩游戏|打游戏|运动|跑步|打篮球|踢足球)';
const rules:Record<string,Record<string,RegExp>>={
  newcomer:{student:/^(?:(?:是的|对|是|嗯|对的)(?:我)?(?:是)?(?:新生|新来的学生)?|(?:我)?(?:是)?(?:新生|新来的学生)|(?:我)?(?:刚来|刚到)(?:这里|学校)?)$/,visitor:/^(?:不是(?:的)?(?:我)?(?:是来|来)?(?:找|看)(?:朋友|同学)|不是(?:的)?|(?:我)?(?:是来|来)?(?:找|看)(?:朋友|同学))$/},
  destination:{place:new RegExp('^(?:我)?(?:想要|想|要|准备|打算)?(?:去|到)?'+place+'(?:去)?(?:看看|看书|吃饭|休息|买东西|逛逛)?$'),unsure:/^(?:我)?(?:还)?(?:没想好|没决定|不知道(?:去哪[里儿])?)$/},
  neighborhood:{like:/^(?:我)?(?:很|挺|非常|特别)?(?:喜欢|喜爱)(?:这里|这儿)(?:的生活)?(?:很舒服)?$|^(?:我)?(?:很|挺)?(?:喜欢|习惯)(?:这里的生活)?$|^(?:这里|这儿)(?:很|挺)?(?:好|不错)$/,
    adjusting:/^(?:我)?(?:还)?(?:不|不太|不是很)(?:喜欢|习惯)(?:这里|这儿)?(?:的生活)?$|^(?:我)?(?:还)?没(?:有)?习惯(?:这里|这儿)?(?:的生活)?$/},
  hobby:{activity:new RegExp('^(?:我)?(?:(?:平时)?(?:很|比较|最)?喜欢|爱|常常|经常)?'+activity+'(?:(?:和|也|还)(?:喜欢)?'+activity+')*$'),none:/^(?:我)?(?:还)?(?:没|没有)(?:什么)?(?:爱好|特别的爱好)$|^(?:我)?不知道$/},
  busy:{busy:/^(?:我)?(?:今天)?(?:(?:很|太|有点|有一点)?忙|没(?:有)?空|没(?:有)?时间)(?:了)?$/,free:/^(?:我)?(?:今天)?(?:不(?:太)?忙|有空|有时间|没什么事)(?:了)?$/},
  sit:{yes:/^(?:好(?:的|啊|呀)?|行|可以|坐(?:一会[儿儿]?|一下)?|(?:我)?(?:想|要|愿意)(?:在这里)?坐(?:一会[儿儿]?|一下)?)(?:谢谢(?:您|你)?)?$/,no:/^(?:不(?:用|要|坐|了)(?:了)?|(?:我)?(?:不想|不愿意)(?:在这里)?坐(?:一会[儿儿]?|一下)?|(?:我)?(?:要|得)走了)(?:谢谢(?:您|你)?)?$/},
  purpose:{study:/^(?:我)?(?:是来|来)?(?:上课|学习|读书)(?:的)?$|^(?:我)?是(?:这里的)?学生$/,visit:/^(?:我)?(?:是来|来)?(?:找|看)(?:朋友|同学)(?:的)?$/,parcel:/^(?:我)?(?:是来|来)?(?:取|拿|领取)(?:一下)?(?:我的)?(?:快递|包裹)(?:的)?$/},
  card:{have:/^(?:我)?(?:已经)?(?:带了|带来了|带学生证了|带了学生证|有(?:学生证)?)(?:在这里|在这儿)?$/,missing:/^(?:我)?(?:还)?(?:没(?:有)?带(?:学生证)?|没(?:有)?(?:学生证)|忘(?:记)?带(?:学生证)?(?:了)?)(?:了)?$/}
};

export function interpretChat(turn:AmbientTurn,text:string){
  const normalized=text.normalize('NFKC').replace(/[\s\p{P}]/gu,'')
    .replace(/^(?:您好|你好)/,'').replace(/^(?:嗯|哦)(?=我)/,'')
    .replace(/(?:谢谢您|谢谢你|谢谢)$/,'').replace(/(?:呢|呀|啊|吧)$/,'')
    .replace(/^今天我/,'我今天')
    .replace(/不是很忙$/,'不太忙')
    .replace(/^学生证(?:我)?带了$/,'我带了学生证')
    .replace(/^好的(?:我)?坐(?:一会儿|一下)$/,'坐一下')
    .replace(/^不了(?:我)?(?:还)?(?:有课|要上课|得走了)$/,'不坐了')
    .replace(/^我来学校上课$/,'我来上课')
    .replace(/^(?:我)?不是(?:新生|新来的学生)$/,'不是')
    .replace(/^(?:我)?有学生证但是没带$/,'没带');
  if(text.length>500||!normalized)return undefined;
  // All clauses must be accounted for. Keyword overlap alone never accepts a
  // question or contradictory statement as this intent.
  const matches=turn.responses.filter(r=>rules[turn.id]?.[r.intent]?.test(normalized));
  return matches.length===1?matches[0]:undefined;
}

export function validChatProgress(value:unknown):value is ChatProgress{
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([id,turn])=>{
    const npc=ambientNpcById.get(id);return !!npc&&Number.isInteger(turn)&&turn>=0&&turn<=npc.turns.length;
  });
}

export function answerChat(progress:ChatProgress,npcId:string,turnId:string,text:string){
  const npc=ambientNpcById.get(npcId),index=progress[npcId]??0,turn=npc?.turns[index];
  if(!turn||turn.id!==turnId)return {accepted:false,reason:'Lượt trò chuyện đã thay đổi. Hãy mở lại cuộc trò chuyện.'};
  const response=interpretChat(turn,text);
  if(!response)return {accepted:false,reason:'Mình chưa hiểu rõ ý bạn. Bạn có thể nói ngắn hơn hoặc xem gợi ý rồi thử lại.'};
  progress[npcId]=index+1;
  return {accepted:true,reason:'NPC đã hiểu ý bạn.',response,complete:index+1===npc!.turns.length};
}
