"""Preserve the user's random-label sessions, then select synthetic training data."""
import csv
import hashlib
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, COLUMNS, validate_rows
from ml.data_quality import separate_pilot_rows


def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


def write_csv(path, rows):
    temporary = path.with_suffix(path.suffix + '.tmp')
    with temporary.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=COLUMNS, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)
    temporary.replace(path)


def prepare():
    data = ROOT / 'data/oturumlar.csv'
    archive = ROOT / 'data/arsiv/tek-oyuncu-rastgele-etiketler.csv'
    rows = read_csv(data)
    archived = read_csv(archive) if archive.exists() else []
    active, excluded = separate_pilot_rows(rows, archived)
    archive.parent.mkdir(parents=True, exist_ok=True)
    before_sha = hashlib.sha256(data.read_bytes()).hexdigest()
    backup = archive.parent / 'oturumlar-karisik-2026-11-06.csv'
    if any(row['kaynak'] == 'gercek' for row in rows) and not backup.exists():
        backup.write_bytes(data.read_bytes())
    # Archive and provenance are saved before changing active training data.
    write_csv(archive, excluded)
    excluded_ids = sorted({row['oturum_id'] for row in excluded})
    provenance = {
        'date': '2026-11-06', 'active_mode': 'synthetic_pilot',
        'reason': 'User stated that one person played all sessions and selected preference labels randomly.',
        'participant_count_reported': 1, 'label_quality': 'invalid_random_preference_labels',
        'behavior_source_preserved': 'gercek', 'labels_modified': False,
        'archive': archive.relative_to(ROOT).as_posix(),
        'excluded_sessions': len(excluded_ids), 'excluded_rows': len(excluded),
        'excluded_session_ids': excluded_ids,
        'active_rows': len(active), 'active_source': 'sentetik',
        'archive_sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
    }
    (ROOT / 'data/etiket_kalitesi.json').write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')
    write_csv(data, active)
    validate_rows(read_csv(data))
    print(json.dumps({'active_synthetic_rows': len(active), 'archived_random_label_rows': len(excluded),
                      'archived_sessions': len(excluded_ids), 'input_sha256': before_sha,
                      'active_sha256': hashlib.sha256(data.read_bytes()).hexdigest()}, indent=2))


if __name__ == '__main__':
    prepare()
