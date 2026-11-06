"""Keep known random preference labels out of supervised training."""
import json
from .contract import ROOT, validate_rows


def quality_policy():
    filename = ROOT / 'data/etiket_kalitesi.json'
    return json.loads(filename.read_text(encoding='utf-8')) if filename.exists() else {}


def reject_excluded_labels(rows, policy=None):
    policy = quality_policy() if policy is None else policy
    excluded = set(policy.get('excluded_session_ids', []))
    found = {row['oturum_id'] for row in rows} & excluded
    if found:
        raise ValueError(f'{len(found)} oturumun tercih etiketleri rastgele olarak bildirilmiş; eğitim/yayın verisine alınamaz.')


def separate_pilot_rows(rows, archived=None):
    validate_rows(rows)
    archive = {}  # Deduplicate by session and scene without changing labels/source.
    for row in archived or []:
        if row['kaynak'] != 'gercek':
            raise ValueError('Rastgele insan etiketleri arşivinde yalnız gerçek davranış satırları olmalı.')
        archive[(row['oturum_id'], str(row['sahne_no']))] = row
    active = []
    for row in rows:
        if row['kaynak'] == 'sentetik':
            active.append(row)
        else:
            key = row['oturum_id'], str(row['sahne_no'])
            if key in archive and archive[key] != row:
                raise ValueError('Arşivde çelişkili oturum/sahne etiketi var.')
            archive[key] = row
    if not active:
        raise ValueError('Pilot için sentetik eğitim satırı yok.')
    validate_rows(active)
    archived_rows = list(archive.values())
    if archived_rows:
        validate_rows(archived_rows)
    return active, archived_rows
