"""Sample simultaneous RSS sums, not sum of per-process peaks or GPU VRAM."""
import sys, time, json
sys.path.insert(0, sys.argv[2])
import psutil
root = psutil.Process(int(sys.argv[1]))
while True:
    started = time.monotonic()
    try:
        processes = [root] + root.children(recursive=True)
        values, errors = [], []
        for process in processes:
            try:
                values.append({'pid': process.pid, 'rssBytes': process.memory_info().rss})
            except (psutil.NoSuchProcess, psutil.AccessDenied) as error:
                errors.append({'pid': process.pid, 'error': str(error)})
        complete = len(values) == len(processes) and any(p['pid'] == root.pid for p in values)
        print(json.dumps({'at': time.time(), 'expectedPids': [p.pid for p in processes], 'processes': values,
                          'rssBytes': sum(p['rssBytes'] for p in values) if complete else None,
                          'observedRssBytes': sum(p['rssBytes'] for p in values) if values else None,
                          'errors': errors}), flush=True)
    except (psutil.NoSuchProcess, psutil.AccessDenied) as error:
        print(json.dumps({'error': str(error)}), flush=True)
        break
    time.sleep(max(0, .1 - (time.monotonic() - started)))
