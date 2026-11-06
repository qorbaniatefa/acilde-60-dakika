"""Merge consented CSV exports without overwriting or duplicating sessions."""
import csv
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, COLUMNS, validate_rows
from ml.data_quality import reject_excluded_labels


def merge(paths):
    target = ROOT / "data/oturumlar.csv"
    by_key = {}
    for path in [target, *paths]:
        with path.open(encoding="utf-8-sig", newline="") as handle:
            incoming = list(csv.DictReader(handle))
        validate_rows(incoming)
        reject_excluded_labels(incoming)
        for row in incoming:
            key = row["oturum_id"], row["sahne_no"]
            if key in by_key and by_key[key] != row:
                raise ValueError("Aynı oturum/sahne için çelişkili satırlar var.")
            by_key[key] = row
    rows = list(by_key.values())
    groups = validate_rows(rows)
    temporary = target.with_suffix(".csv.tmp")
    with temporary.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    temporary.replace(target)
    print(f"sessions={len(groups)}, real_sessions={sum(g[0]['kaynak'] == 'gercek' for g in groups.values())}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python scripts/merge-data.py export1.csv [export2.csv ...]")
    merge([Path(p) for p in sys.argv[1:]])
