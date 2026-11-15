"""Fetch a small, unchanged, attributed Mandarin ASR smoke set, not the game corpus."""
import hashlib
import json
import pathlib
import tarfile
import urllib.request
import struct

REVISION = '70bb2e84b976b7e960aa89f1c648e09c59f894dd'
BASE = f'https://huggingface.co/datasets/google/fleurs/resolve/{REVISION}/data/cmn_hans_cn'
OUT = pathlib.Path(__file__).resolve().parents[1] / 'tests/fixtures/fleurs'
OUT.mkdir(parents=True, exist_ok=True)
rows = {}
with urllib.request.urlopen(BASE + '/dev.tsv', timeout=60) as response:
    for line in response.read().decode('utf-8').splitlines():
        row = line.split('\t')
        if len(row) == 7 and 48000 <= int(row[5]) <= 128000:
            rows[row[1]] = row
samples = []
with urllib.request.urlopen(BASE + '/audio/dev.tar.gz', timeout=120) as response:
    with tarfile.open(fileobj=response, mode='r|gz') as archive:
        for member in archive:
            name = pathlib.PurePosixPath(member.name).name
            if not member.isfile() or name not in rows:
                continue
            data = archive.extractfile(member).read()
            # FLEURS WAV uses IEEE float (format 3), unsupported by Python wave.
            offset, duration, rate, channels = 12, 0, 0, 0
            while offset + 8 <= len(data):
                chunk, size = struct.unpack_from('<4sI', data, offset)
                if chunk == b'fmt ':
                    encoding, channels, rate, byte_rate = struct.unpack_from('<HHII', data, offset + 8)
                if chunk == b'data':
                    duration = size / byte_rate
                    break
                offset += 8 + size + (size % 2)
            if rate != 16000 or channels != 1:
                continue
            if not 3 <= duration <= 8:
                continue
            (OUT / name).write_bytes(data)
            row = rows[name]
            samples.append(dict(file=name, text=row[2], seconds=duration,
                                gender=row[6], sha256=hashlib.sha256(data).hexdigest()))
            if len(samples) == 40:
                break
if len(samples) != 40:
    raise RuntimeError(f'Expected 40 qualifying recordings, got {len(samples)}')
manifest = dict(dataset='google/fleurs', config='cmn_hans_cn', split='dev',
                revision=REVISION, license='CC-BY-4.0', attribution='Google FLEURS contributors',
                source='https://huggingface.co/datasets/google/fleurs',
                archive=BASE + '/audio/dev.tar.gz', modifications='None; original WAV and transcript',
                purpose='ASR smoke only; not the 24/8/8 game intent evaluation corpus; speaker IDs unavailable',
                samples=samples)
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with urllib.request.urlopen('https://creativecommons.org/licenses/by/4.0/legalcode.txt', timeout=60) as response:
    (OUT / 'LICENSE-CC-BY-4.0.txt').write_bytes(response.read())
print(f'Fetched {len(samples)} original Mandarin recordings with transcripts to {OUT}', flush=True)
