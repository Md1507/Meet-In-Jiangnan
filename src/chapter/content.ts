import raw from '../content/mvp.json' with {type:'json'};
export const content = raw;
export const scenarioById = new Map(content.scenarios.map(s => [s.id,s]));
export const utteranceById = new Map(content.utterances.map(u => [u.id,u]));
export const sceneById = new Map(content.scenes.map(s => [s.id,s]));
export const normalize = (text:string) => text.normalize('NFKC').replace(/[\s\p{P}]/gu,'');
// Bounded, compositional grammars. Anchors prevent a valid clause hidden inside
// a negation, quotation or contradictory second clause from granting progress.
const waterServing='(?:一?杯热的?水|热的?水一杯)';
const waterRecipient='(?:给我(?:来|倒|拿)?|帮我(?:倒|拿))';
const waterRequest='(?:我(?:要|需要|点|喝|想(?:要|喝|点|来)?)|来|'+waterRecipient+')';
// Explicit request frames keep the one-cup/hot/water slots and the whole-clause
// guard. This composes verbs, modal requests and noun-first counter orders;
// it does not admit arbitrary text around an otherwise valid noun phrase.
const waterOrder=new RegExp('^(?:'+[
  waterRequest+waterServing,
  '(?:您|你)?(?:能|可以|能不能|可不可以)'+waterRecipient+waterServing+'吗?',
  '倒'+waterServing+'(?:给我)?',
  '(?:一杯热的?水|热的?水一杯)',
].join('|')+')(?:就好|就行|就可以)?$');
const grammars:Record<string,RegExp>={
  greeting:/^(老师(您|你)?(好|早上好|下午好)|(您|你)(好|早上好|下午好)老师)$/,
  introduction:/^(我叫|我是|我的名字(叫|是))小雨$/,
  repeat:/^(再说(一遍|一次)|((您|你)?(能|可以)|能不能|可不可以)(再说(一遍|一次)|重复(一遍|一次))吗?)$/,
  checkin:/^我(来|要|想|想要)(办|办理)(一下)?入住(手续)?$/,
  room_problem:/^(我(的)?)?房间(里)?的?灯(坏了|不亮了|不能亮了)$/,
  order_water:waterOrder,
  quantity:/^(我(要|想买|想要)|给我|帮我买|来)(两|二)个包子$/,
  price:/^这个(要多少钱|多少钱|的?价格(是)?多少|卖多少钱)$/,
  directions:/^(图书馆(在)?(哪里|哪儿)|怎么(去|到)图书馆|去图书馆怎么走)$/,
  schedule:/^(几点(开始)?上课|什么时候(开始)?上课|上课(的)?时间(是)?(几点|什么时候))$/,
  parcel:/^我(来|要|想|想要)(取|拿|领取)(一下)?(我(的)?)?(快递|包裹)$/,
  invitation:/^((明天(我们)?|我们明天)(一起|一块)(去)?吃饭|你明天(愿意|想)(和我|跟我)(一起)?吃饭吗)$/
};
function core(text:string){return normalize(text).replace(/^(你好|您好)/,'').replace(/^(请问|麻烦您|麻烦你|麻烦|请)/,'').replace(/(谢谢您|谢谢你|谢谢|好吗|好不好|可以吗|吧)$/,'');}
function requestCore(scenario:string,text:string){
  const sentence=core(text);
  // A counter address can precede politeness, e.g. 老板，麻烦给我… .
  return scenario==='order_water'?sentence.replace(/^(老板|阿姨|师傅|服务员)/,'').replace(/^(劳驾)?(请问|麻烦您|麻烦你|麻烦|请)?/,''):sentence;
}
export function interpret(scenario:string,text:string) {
  const definition=scenarioById.get(scenario);
  if(!definition)return {accepted:false,reason:'Tình huống không tồn tại.'};
  const phrase=definition.positive.map(id=>utteranceById.get(id)!).find(u=>normalize(u.text)===normalize(text));
  if(phrase)return {accepted:true,phrase,reason:'Đã truyền đạt đúng yêu cầu.'};
  if(grammars[scenario]?.test(requestCore(scenario,text)))return {accepted:true,phrase:utteranceById.get(definition.positive[0])!,reason:'Đã truyền đạt đủ ý. Sổ tay lưu một cách nói mẫu tương đương.'};
  return {accepted:false,reason:`Chưa xác nhận đúng ý. Cần diễn đạt: ${definition.components.join(' · ')}. Hãy dùng gợi ý hoặc thử một cách nói khác.`};
}
export function validScenarioProposal(value:unknown,scenario:string,text:string):boolean {
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const p=value as Record<string,unknown>;
  return Object.keys(p).sort().join(',')==='accepted,intent'&&p.accepted===true&&p.intent===scenario&&interpret(scenario,text).accepted;
}
