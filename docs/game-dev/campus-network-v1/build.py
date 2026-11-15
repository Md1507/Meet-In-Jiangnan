"""Build/check the proposed 20x15 campus blockouts; never edit runtime content.

python docs/game-dev/campus-network-v1/build.py
python docs/game-dev/campus-network-v1/build.py --check
"""
from collections import deque
from pathlib import Path
import csv
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parent
W, H = 20, 15
NAMES = {
    'dorm': 'Ký túc xá', 'gate': 'Cổng trường', 'library': 'Thư viện',
    'canteen': 'Nhà ăn', 'street': 'Phố dịch vụ sinh viên', 'garden': 'Vườn/Kênh',
}
# Every edge is an explicit, two-way corridor. Compass directions are local ports.
LINKS = [
    ('dorm', 'east', 'gate', 'west', 'outer', 'Đường tiếp cận ký túc–cổng'),
    ('gate', 'east', 'library', 'west', 'outer', 'Đường đón tiếp–khu học tập'),
    ('library', 'north', 'canteen', 'south', 'outer', 'Đường học tập–nhà ăn'),
    ('canteen', 'west', 'street', 'east', 'outer', 'Lối nhà ăn–dịch vụ'),
    ('street', 'west', 'garden', 'east', 'outer', 'Đường dạo ven kênh phía đông'),
    ('garden', 'south', 'dorm', 'north', 'outer', 'Lối cảnh quan–khu ở'),
    ('dorm', 'south', 'canteen', 'north', 'shortcut', 'Lối đi ăn sáng nội bộ'),
    ('gate', 'north', 'street', 'south', 'shortcut', 'Trục đón tiếp–dịch vụ'),
    ('library', 'east', 'garden', 'west', 'shortcut', 'Cửa sau thư viện–bờ kênh'),
    ('street', 'north', 'library', 'south', 'hub-spine', 'Trục dịch vụ–thư viện'),
]
OPPOSITE = {'north': 'south', 'south': 'north', 'east': 'west', 'west': 'east'}
STEP = {'north': (0, -1), 'south': (0, 1), 'east': (1, 0), 'west': (-1, 0)}
PORTS = {
    'west': [(0, 7), (0, 8)], 'east': [(19, 7), (19, 8)],
    'north': [(9, 0), (10, 0)], 'south': [(9, 14), (10, 14)],
}
LANDMARKS = {
    'dorm': [('D', 4, 3, 'Khối nhà ở'), ('R', 15, 3, 'Khối sinh hoạt'), ('s', 6, 5, 'Bảng chỉ đường gắn tường')],
    'gate': [('A', 3, 4, 'Nhà trực/đón tiếp'), ('I', 15, 4, 'Thông tin trường'), ('G', 7, 11, 'Trụ cổng phía trong'), ('s', 5, 5, 'Bảng khuôn viên')],
    'library': [('L', 4, 3, 'Khối thư viện'), ('Q', 15, 3, 'Cánh học tập'), ('s', 7, 5, 'Bảng chỉ đường gắn tường')],
    'canteen': [('C', 4, 3, 'Khối phục vụ'), ('H', 15, 3, 'Khối nhà ăn'), ('s', 7, 5, 'Bảng chỉ đường gắn tường')],
    'street': [('F', 4, 3, 'Quầy bánh bao/hàng thiết yếu'), ('P', 15, 3, 'Điểm nhận bưu kiện'), ('s', 7, 5, 'Bảng chỉ đường gắn tường')],
    'garden': [('T', 15, 3, 'Pavilion đọc/nghỉ'), ('s', 13, 5, 'Bảng chỉ đường gắn pavilion')],
}


def fill(grid, x1, y1, x2, y2, value):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            grid[y][x] = value


def inside(edge, x, y):
    dx, dy = STEP[OPPOSITE[edge]]
    return x + dx, y + dy


def make_maps():
    maps = {name: {'map_name': name, 'layout': [[0] * W for _ in range(H)], 'warps': []} for name in NAMES}
    for name, entry in maps.items():
        grid = entry['layout']
        fill(grid, 0, 0, 19, 0, 2)
        fill(grid, 0, 14, 19, 14, 2)
        fill(grid, 0, 0, 0, 14, 2)
        fill(grid, 19, 0, 19, 14, 2)
        # Canal belongs to the garden; two bridges are walkable road tiles.
        if name == 'garden':
            fill(grid, 5, 1, 6, 13, 3)
        # Functional building footprints, not decorative perspective illustrations.
        if name == 'gate':
            fill(grid, 2, 3, 5, 5, 2)
            fill(grid, 14, 3, 17, 5, 2)
            fill(grid, 7, 11, 7, 12, 2)
            fill(grid, 12, 11, 12, 12, 2)
        elif name == 'garden':
            fill(grid, 13, 2, 17, 5, 2)
        else:
            fill(grid, 2, 2, 7 if name != 'dorm' else 6, 5, 2)
            fill(grid, 12 if name != 'dorm' else 13, 2, 17, 5, 2)
        fill(grid, 8, 6, 11, 9, 1)  # legible decision space at the map center

    for a, side_a, b, side_b, _, _ in LINKS:
        for source, edge, target, target_edge in ((a, side_a, b, side_b), (b, side_b, a, side_a)):
            grid = maps[source]['layout']
            if edge == 'west': fill(grid, 1, 7, 9, 8, 1)
            if edge == 'east': fill(grid, 10, 7, 18, 8, 1)
            if edge == 'north': fill(grid, 9, 1, 10, 7, 1)
            if edge == 'south': fill(grid, 9, 8, 10, 13, 1)
            for (x, y), (tx, ty) in zip(PORTS[edge], PORTS[target_edge]):
                grid[y][x] = 9
                arrival_x, arrival_y = inside(target_edge, tx, ty)
                maps[source]['warps'].append({
                    'from_x': x, 'from_y': y, 'to_map': target,
                    'to_x': arrival_x, 'to_y': arrival_y,
                    'facing_direction': OPPOSITE[target_edge],
                })

    for name, entry in maps.items():
        grid = entry['layout']
        if name == 'garden':
            fill(grid, 3, 3, 10, 4, 1)  # secondary footbridge and a loop on west bank
            fill(grid, 3, 3, 3, 8, 1)
            fill(grid, 9, 3, 10, 7, 1)
            fill(grid, 10, 6, 15, 6, 1)  # pavilion threshold connects to both bridges
        elif name == 'gate':
            fill(grid, 4, 6, 15, 6, 1)
            fill(grid, 9, 9, 10, 12, 1)  # inner gate forecourt, no off-campus exit
        else:
            fill(grid, 4, 6, 15, 6, 1)
        if name == 'library':
            fill(grid, 3, 10, 5, 12, 3)  # quiet water court, no path crosses it
        if name == 'canteen':
            fill(grid, 11, 9, 18, 12, 1)  # eating/serving courtyard, distinct from through-route
            fill(grid, 13, 10, 14, 11, 2)
            fill(grid, 16, 10, 17, 11, 2)
        if name == 'street':
            fill(grid, 3, 10, 16, 10, 1)
            fill(grid, 3, 8, 3, 10, 1)
            fill(grid, 16, 8, 16, 10, 1)
            fill(grid, 3, 11, 6, 12, 2)  # bounded bicycle-storage footprint
    return list(maps.values())


def flood(grid, start, allowed):
    seen, queue = {start}, deque([start])
    while queue:
        x, y = queue.popleft()
        for dx, dy in STEP.values():
            nxt = x + dx, y + dy
            if 0 <= nxt[0] < W and 0 <= nxt[1] < H and nxt not in seen and grid[nxt[1]][nxt[0]] in allowed:
                seen.add(nxt)
                queue.append(nxt)
    return seen


def boundary(x, y):
    assert (x in (0, 19)) != (y in (0, 14)), 'warp must be on exactly one edge, not a corner'
    return 'west' if x == 0 else 'east' if x == 19 else 'north' if y == 0 else 'south'


def border(grid, edge):
    if edge == 'west': return [row[0] for row in grid]
    if edge == 'east': return [row[19] for row in grid]
    return grid[0 if edge == 'north' else 14]


def validate(maps):
    assert len(maps) == 6
    by_name = {m['map_name']: m for m in maps}
    assert set(by_name) == set(NAMES)
    indexes = {}
    neighbors = {}
    for m in maps:
        name, grid = m['map_name'], m['layout']
        assert set(m) == {'map_name', 'layout', 'warps'}, name
        assert len(grid) == H and all(len(row) == W for row in grid), name
        assert all(type(v) is int and v in (0, 1, 2, 3, 9) for row in grid for v in row), name
        assert grid[7][9] == 1, name
        walkable = {(x, y) for y in range(H) for x in range(W) if grid[y][x] in (0, 1, 9)}
        roads = {(x, y) for y in range(H) for x in range(W) if grid[y][x] in (1, 9)}
        assert flood(grid, (9, 7), {0, 1, 9}) == walkable, (name, 'isolated walkable island')
        assert flood(grid, (9, 7), {1, 9}) == roads, (name, 'road not connected to center')
        index = {}
        sides = {}
        for w in m['warps']:
            assert set(w) == {'from_x', 'from_y', 'to_map', 'to_x', 'to_y', 'facing_direction'}
            assert all(type(w[k]) is int for k in ('from_x', 'from_y', 'to_x', 'to_y'))
            x, y, tx, ty = (w[k] for k in ('from_x', 'from_y', 'to_x', 'to_y'))
            assert 0 <= x < W and 0 <= y < H and 0 <= tx < W and 0 <= ty < H
            assert grid[y][x] == 9 and (x, y) not in index, name
            edge = boundary(x, y)
            assert w['to_map'] in by_name and w['to_map'] != name
            assert edge not in sides or sides[edge] == w['to_map'], name
            sides[edge] = w['to_map']
            assert w['facing_direction'] == edge
            assert by_name[w['to_map']]['layout'][ty][tx] == 1, (name, 'unsafe arrival')
            index[x, y] = w
        assert set(index) == {(x, y) for y in range(H) for x in range(W) if grid[y][x] == 9}
        assert 3 <= len(sides) <= 4 and len(set(sides.values())) == len(sides)
        for edge, coords in PORTS.items():
            assert {p for p in coords if p in index} in (set(), set(coords)), (name, 'partial 2-tile port')
            assert all(v in (2, 9) for v in border(grid, edge)), (name, 'unregistered boundary opening')
        indexes[name], neighbors[name] = index, set(sides.values())

    for name, index in indexes.items():
        for (x, y), w in index.items():
            edge = boundary(x, y)
            dest = by_name[w['to_map']]
            dx, dy = STEP[edge]
            gate = w['to_x'] - dx, w['to_y'] - dy
            assert gate in indexes[dest['map_name']], (name, 'no reverse warp')
            reverse = indexes[dest['map_name']][gate]
            assert reverse['to_map'] == name
            assert (reverse['to_x'], reverse['to_y']) == inside(edge, x, y)
            assert boundary(*gate) == OPPOSITE[edge]
            assert border(by_name[name]['layout'], edge) == border(dest['layout'], OPPOSITE[edge]), (name, 'edge terrain mismatch')
            assert (y == gate[1]) if edge in ('east', 'west') else (x == gate[0]), (name, 'tangential coordinate mismatch')

    expected = {frozenset((a, b)) for a, _, b, _, _, _ in LINKS}
    actual = {frozenset((a, b)) for a in neighbors for b in neighbors[a]}
    assert actual == expected
    distances = {}
    for start in NAMES:
        dist, queue = {start: 0}, deque([start])
        while queue:
            current = queue.popleft()
            for nxt in neighbors[current]:
                if nxt not in dist:
                    dist[nxt] = dist[current] + 1
                    queue.append(nxt)
        assert len(dist) == 6
        distances[start] = dist
    diameter = max(max(d.values()) for d in distances.values())
    assert diameter == 2
    garden = by_name['garden']['layout']
    assert all(garden[y][x] == (1 if y in (3, 4, 7, 8) else 3) for y in range(1, 14) for x in (5, 6))
    return {
        'status': 'passed-data-validation-not-runtime-playtest',
        'maps': 6, 'width': W, 'height': H, 'two_way_connections': len(actual),
        'directed_warp_objects': sum(len(m['warps']) for m in maps),
        'distinct_neighbors': {name: len(neighbors[name]) for name in NAMES},
        'graph_diameter_map_transitions': diameter,
        'average_map_transitions_distinct_pair': sum(sum(d.values()) for d in distances.values()) / 30,
        'checks': ['exact JSON keys/types/dimensions/tile IDs', 'all grass/road/warp tiles reachable',
                   'road-only center-to-all-exits connectivity', 'all warp tiles registered exactly once',
                   'three or four distinct adjacent areas per map', 'two-tile ports and closed unused edges',
                   'complete paired-edge terrain equality and tangential coordinate matching',
                   'reciprocal warps and safe inward road arrivals', 'two garden bridges across canal'],
        'not_checked': ['runtime integration', 'actor bounds/tile pixel size', 'visual art', 'human playtest'],
    }


def export(maps):
    # One physical line per row for direct comparison with the ASCII drawings.
    objects = []
    for m in maps:
        rows = ',\n'.join('      ' + json.dumps(row, separators=(',', ':')) for row in m['layout'])
        warps = ',\n'.join('      ' + json.dumps(w, ensure_ascii=False) for w in m['warps'])
        objects.append('  {\n    "map_name": ' + json.dumps(m['map_name']) + ',\n    "layout": [\n' + rows + '\n    ],\n    "warps": [\n' + warps + '\n    ]\n  }')
    (ROOT / 'maps.json').write_text('[\n' + ',\n'.join(objects) + '\n]\n', encoding='utf-8')
    lines = ['# ASCII blockouts — Campus network v1', '',
             '`layout[y][x]`, X=0..19, Y=0..14; mỗi khung có đúng 20×15 ô.', '',
             '`.` cỏ (0), `:` đường (1), `#` khối cản (2), `~` nước (3).',
             '`N/E/S/W` là ô warp (9) tại cạnh tương ứng; `=` là đường cầu (1).',
             'Chữ landmark và `s` (bảng chỉ đường gắn tường) chỉ là chú giải art trên ô cản (2), không thêm Tile ID.', '']
    for m in maps:
        name = m['map_name']
        rows = [['.' if tile == 0 else ':' if tile == 1 else '#' if tile == 2 else '~' if tile == 3 else boundary(x, y)[0].upper() for x, tile in enumerate(row)] for y, row in enumerate(m['layout'])]
        if name == 'garden':
            for y in (3, 4, 7, 8):
                for x in (5, 6): rows[y][x] = '='
        for symbol, x, y, _ in LANDMARKS[name]:
            assert m['layout'][y][x] == 2
            rows[y][x] = symbol
        lines.extend([f'## {NAMES[name]} (`{name}`)', '', '```text', '   01234567890123456789'])
        lines.extend(f'{y:02d} ' + ''.join(row) for y, row in enumerate(rows))
        lines.extend(['```', '', 'Landmarks: ' + '; '.join(f'{symbol} ({x},{y}): {label}' for symbol, x, y, label in LANDMARKS[name]) + '.', ''])
        lines.extend(['| Cạnh | Tới khu |', '| --- | --- |'])
        for a, side_a, b, side_b, _, _ in LINKS:
            if name == a: lines.append(f'| {side_a} | {NAMES[b]} (`{b}`), cạnh {side_b} |')
            elif name == b: lines.append(f'| {side_b} | {NAMES[a]} (`{a}`), cạnh {side_a} |')
        lines.append('')
    (ROOT / 'ascii-maps.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    with (ROOT / 'warp-matrix.csv').open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(['connection', 'kind', 'a_map', 'a_edge', 'a_warp_cells', 'b_map', 'b_edge', 'b_warp_cells', 'a_to_b_arrivals', 'b_to_a_arrivals', 'purpose'])
        for number, (a, sa, b, sb, kind, purpose) in enumerate(LINKS, 1):
            writer.writerow([f'R{number:02}', kind, a, sa, json.dumps(PORTS[sa]), b, sb, json.dumps(PORTS[sb]), json.dumps([inside(sb, x, y) for x, y in PORTS[sb]]), json.dumps([inside(sa, x, y) for x, y in PORTS[sa]]), purpose])


if __name__ == '__main__':
    if sys.argv[1:] not in ([], ['--check']): raise SystemExit('Use build.py [--check]')
    data = json.loads((ROOT / 'maps.json').read_text(encoding='utf-8')) if '--check' in sys.argv else make_maps()
    report = validate(data)
    if '--check' not in sys.argv: export(data)
    report['maps_sha256'] = hashlib.sha256((ROOT / 'maps.json').read_bytes()).hexdigest()
    (ROOT / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
