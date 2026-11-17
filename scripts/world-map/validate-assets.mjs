import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadAssets } from './asset-loader.mjs';

export function main(args) {
  const [rootArg, manifestPath, referencePath] = args;
  if (!rootArg || !manifestPath || !referencePath || args.length !== 3) throw Error('usage: node validate-assets.mjs ROOT MANIFEST.json REFERENCE.json');
  const root = path.resolve(rootArg);
  const input = name => { if (path.isAbsolute(name) || name.split(/[\\/]/).includes('..')) throw Error('input must be relative to root'); const base = realpathSync(root), file = realpathSync(path.join(root,name)), rel = path.relative(base,file); if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw Error('input outside root'); return JSON.parse(readFileSync(file)); };
  const result = loadAssets({root,manifest:input(manifestPath),reference:input(referencePath)});
  const {entries, ...report} = result;
  console.log(JSON.stringify({...report, ids:Object.keys(entries)}, null, 2));
  return result.status === 'ready' ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
