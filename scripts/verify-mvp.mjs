import { spawnSync } from 'node:child_process';
import { validateMvp } from './mvp-evidence.mjs';
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const check = spawnSync(command, ['run','verify:m0-m1'], {stdio:'inherit', shell:process.platform === 'win32'});
if (check.status !== 0) { console.error('Kiểm tra kỹ thuật M0/M1 chưa qua.'); process.exitCode=1; }
const errors = validateMvp(process.cwd());
for (const error of errors) console.error(`MVP chưa đạt: ${error}`);
if (errors.length) process.exitCode = 1;
