// Candidates require contextual inspection. A lexical occurrence is not a verified analysis.
export function grammarCandidates(text) {
  const rules = [
    [/会|能|想|要/gu,'possible-modal',170,'A.1.1.2; lexical/polysemy ambiguity'],
    [/哪里|多少|什么|怎么|哪/gu,'possible-interrogative',170,'A.1.1.3; embedded uses need context'],
    [/吗|还是/gu,'possible-question',178,'A.1.7; 还是 may be declarative'],
    [/[一二两三四五六七八九十几多这那每][杯本个]/gu,'possible-quantity-classifier',174,'A.1.3.4; quantity/modifier candidate']
  ];
  return rules.flatMap(([pattern,feature,printedPage,basis]) => [...text.matchAll(pattern)].map(m => ({feature,token:m[0],offset:m.index,printedPage,pdfPage:printedPage+6,basis,status:'heuristic-candidate-unverified'})));
}
