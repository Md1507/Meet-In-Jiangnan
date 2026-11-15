// Segmental comparison only: tones require separate language review.
export function normalizePinyin(value) {
  return value.toLowerCase().replace(/u:/g,'ü').normalize('NFD')
    .replace(/u\u0308/g,'v').replace(/[\u0300-\u036f]/g,'')
    .replace(/[1-5\s'’.,!?，。！？-]/g,'');
}
export function comparePinyin(expected, words) {
  expected=normalizePinyin(expected);
  let candidates=[''];
  for (const word of words) {
    if (!word.entries) return 'mismatch-or-ambiguous-segmentation';
    candidates=[...new Set(candidates.flatMap(prefix=>word.entries.map(e=>prefix+normalizePinyin(e.pinyin))))].filter(x=>expected.startsWith(x)).slice(0,500);
  }
  return candidates.includes(expected)?'segmental-match-tones-unchecked':'mismatch-or-ambiguous-segmentation';
}
