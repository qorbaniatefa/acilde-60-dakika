"""Deterministic synthetic pilot. Never substitutes real player evidence."""
import csv
import math
import random
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, COLUMNS, POLICY


def generate():
    rng = random.Random(POLICY["seed"])
    generated = []
    for session in range(180):
        sid = str(uuid.uuid5(uuid.NAMESPACE_URL, f"primer-v2-synthetic-42-{session}"))
        experience = rng.randint(0, 1)
        mistakes, hints = 0, 0
        for scene in (1, 2, 3):
            wait = round(rng.uniform(2, 140), 2)
            edits = rng.randint(0, 24)
            score = -.9 + .047 * wait + .13 * edits + .8 * mistakes + .15 * hints - 1.1 * experience - 2.5
            # Independent fixed-seed Bernoulli labels: imperfect noisy simulation.
            label = int(rng.random() < 1 / (1 + math.exp(-score)))
            generated.append(dict(zip(COLUMNS, [sid, "sentetik", wait, edits, mistakes, hints, scene, experience, label])))
            mistakes += int(rng.random() < .25)
            hints = min(6, hints + int(rng.random() < .3))
    target = ROOT / "data/oturumlar.csv"
    existing = []
    if target.exists():
        with target.open(encoding="utf-8-sig", newline="") as handle:
            existing = [r for r in csv.DictReader(handle) if r.get("kaynak") == "gercek"]
    target.parent.mkdir(exist_ok=True)
    with target.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(existing + generated)
    print(f"synthetic_rows={len(generated)}, preserved_real_rows={len(existing)}")


if __name__ == "__main__":
    generate()
