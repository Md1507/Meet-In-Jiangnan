export type Source = 'typed' | 'audio-asr' | 'edited-transcript';
const normalize = (text:string) => text.replace(/[\s，。！!,.？?]/g, '');
const waterPhrases = new Map([
  ['我要一杯热水', {pinyin:'Wǒ yào yì bēi rèshuǐ.', meaning:'Tôi muốn một cốc nước nóng.'}],
  ['给我一杯热水', {pinyin:'Gěi wǒ yì bēi rèshuǐ.', meaning:'Cho tôi một cốc nước nóng.'}],
  ['给我一杯热水谢谢', {pinyin:'Gěi wǒ yì bēi rèshuǐ, xièxie.', meaning:'Cho tôi một cốc nước nóng, cảm ơn.'}],
  ['来杯热水', {pinyin:'Lái bēi rèshuǐ.', meaning:'Cho một cốc nước nóng.'}],
  ['来杯热水吧', {pinyin:'Lái bēi rèshuǐ ba.', meaning:'Cho một cốc nước nóng nhé.'}],
  ['来一杯热水', {pinyin:'Lái yì bēi rèshuǐ.', meaning:'Cho một cốc nước nóng.'}],
  ['来一杯热水吧', {pinyin:'Lái yì bēi rèshuǐ ba.', meaning:'Cho một cốc nước nóng nhé.'}]
]);
export function describeWaterPhrase(text:string): {pinyin:string; meaning:string} | undefined {
  return waterPhrases.get(normalize(text));
}
export function evaluate(text: string): boolean {
  return describeWaterPhrase(text) !== undefined;
}
export function validProposal(value: unknown, text: string, active: boolean): boolean {
  if (!active || !evaluate(text) || !value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (Object.keys(p).sort().join(',') !== 'intent,slots' || p.intent !== 'order_water' || !p.slots || typeof p.slots !== 'object') return false;
  const s = p.slots as Record<string, unknown>;
  return Object.keys(s).sort().join(',') === 'amount,drink,temperature' && s.amount === 1 && s.drink === 'water' && s.temperature === 'hot';
}
