import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeWaterPhrase, evaluate, validProposal } from '../src/game/intent.ts';
test('journal pinyin covers every supported variant without adding missing words',()=>{
  const variants=[
    ['我要一杯热水。','Wǒ yào yì bēi rèshuǐ.'],
    ['给我一杯热水。','Gěi wǒ yì bēi rèshuǐ.'],
    ['给我一杯热水，谢谢。','Gěi wǒ yì bēi rèshuǐ, xièxie.'],
    ['来杯热水。','Lái bēi rèshuǐ.'],['来杯热水吧。','Lái bēi rèshuǐ ba.'],
    ['来一杯热水。','Lái yì bēi rèshuǐ.'],['来一杯热水吧。','Lái yì bēi rèshuǐ ba.']
  ];
  for(const [text,pinyin] of variants){assert.equal(evaluate(text),true);assert.equal(describeWaterPhrase(text)?.pinyin,pinyin);}
  assert.doesNotMatch(describeWaterPhrase('给我一杯热水。')!.meaning,/cảm ơn/);
  assert.match(describeWaterPhrase('给我一杯热水，谢谢。')!.meaning,/cảm ơn/);
  assert.equal(describeWaterPhrase('  来 一 杯 热 水 吧！ '),describeWaterPhrase('来一杯热水吧。'));
  assert.equal(describeWaterPhrase('我不要热水。'),undefined);
  assert.equal(describeWaterPhrase('toString'),undefined);
});
for (const text of ['我要一杯热水。','给我一杯热水，谢谢。','来杯热水吧。']) test(`accept ${text}`,()=>assert.equal(evaluate(text),true));
for (const text of ['我不要热水。','我要一杯冷水。','我要两杯热水。','我要一杯热茶。']) test(`reject ${text}`,()=>assert.equal(evaluate(text),false));
test('proposal requires schema, scene and matching user input',()=>{const p={intent:'order_water',slots:{amount:1,drink:'water',temperature:'hot'}};assert.equal(validProposal(p,'我要一杯热水。',true),true);assert.equal(validProposal(p,'我不要热水。',true),false);assert.equal(validProposal(p,'我要一杯热水。',false),false);assert.equal(validProposal({...p, reward:true},'我要一杯热水。',true),false);});
