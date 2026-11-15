import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.dependencies['@huggingface/transformers']='4.3.2'; pkg.dependencies['hanzi-writer']='3.7.3'; pkg.devDependencies.playwright='1.65.0';
pkg.scripts['test:unit'] += ' && node --experimental-strip-types tests/intent.test.ts';
pkg.scripts['test:browser']='node scripts/browser-check.mjs';
pkg.scripts['verify:m0-m1']='npm run typecheck && npm run build && npm run test:unit && npm run test:browser';
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));const installed=JSON.parse(fs.readFileSync('node_modules/.package-lock.json','utf8'));Object.assign(lock.packages,installed.packages); lock.packages[''].dependencies=pkg.dependencies;lock.packages[''].devDependencies=pkg.devDependencies;
fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\n');
