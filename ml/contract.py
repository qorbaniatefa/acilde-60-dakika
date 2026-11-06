"""Dependency-free, shared validation. Policy is written before training."""
import json
import math
import random
import uuid
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "model-policy.json"
POLICY = json.loads(POLICY_PATH.read_text(encoding="utf-8"))
FEATURES = [f["name"] for f in POLICY["features"]]
COLUMNS = ["oturum_id", "kaynak", *FEATURES, "destek_istegi"]


def validate_rows(rows):
    if not rows:
        raise ValueError("Veri boş.")
    groups = defaultdict(list)
    for row in rows:
        if set(row) != set(COLUMNS):
            raise ValueError("CSV sütunları sözleşmeyle eşleşmiyor; ek kişisel alanlar yasak.")
        if row["kaynak"] not in ("gercek", "sentetik"):
            raise ValueError("kaynak: gercek | sentetik olmalı.")
        try:
            sid = uuid.UUID(str(row["oturum_id"]))
        except ValueError as error:
            raise ValueError("Oturum kimliği UUID olmalı; kişisel kimlik yasak.") from error
        if str(sid) != str(row["oturum_id"]) or sid.version != (4 if row['kaynak'] == 'gercek' else 5):
            raise ValueError("Gerçek oturum UUIDv4, sentetik oturum UUIDv5 olmalı.")
        for feature in POLICY["features"]:
            value = float(row[feature["name"]])
            if not math.isfinite(value) or not feature["minimum"] <= value <= feature["maximum"]:
                raise ValueError(f"Özellik aralık dışında: {feature['name']}")
            if feature["name"] != "bekleme_sn" and not value.is_integer():
                raise ValueError("Sayaçlar tam sayı olmalı.")
        if str(row["destek_istegi"]) not in ("0", "1"):
            raise ValueError("Etiket 0 veya 1 olmalı.")
        groups[str(row["oturum_id"])].append(row)
    for group in groups.values():
        if len(group) != 3 or sorted(int(r["sahne_no"]) for r in group) != [1, 2, 3]:
            raise ValueError("Her oturum tam olarak 1, 2, 3 sahnelerini içermeli.")
        if len({r["kaynak"] for r in group}) != 1:
            raise ValueError("Bir oturum birden çok kaynaktan oluşamaz.")
    return groups


def split_sessions(rows):
    groups = validate_rows(rows)
    real = sorted(k for k, g in groups.items() if g[0]["kaynak"] == "gercek")
    source = "gercek" if len(real) >= POLICY["minimum_real_sessions_to_publish"] else "sentetik"
    eligible = real if source == "gercek" else sorted(k for k, g in groups.items() if g[0]["kaynak"] == "sentetik")
    if len(eligible) < 8:
        raise ValueError("Oturum bazlı eval için en az 8 uygun oturum gerekli.")
    random.Random(POLICY["seed"]).shuffle(eligible)
    held_out = set(eligible[:max(2, math.ceil(len(eligible) * .25))])
    train = [r for r in rows if r["oturum_id"] not in held_out]
    test = [r for r in rows if r["oturum_id"] in held_out]
    for part in (train, test):
        if {int(r["destek_istegi"]) for r in part} != {0, 1}:
            raise ValueError("Eğitim ve testte iki sınıf da bulunmalı; eşik değiştirmeyin, veri toplayın.")
    return train, test, source


def check_metrics(metrics):
    for key, floor in (("balanced_accuracy", POLICY["minimum_balanced_accuracy"]),
                       ("support_recall", POLICY["minimum_support_recall"])):
        value = float(metrics[key])
        if not math.isfinite(value) or value < floor:
            raise ValueError(f"Eval kapısı kapalı: {key}={value}, kabul eşiği={floor}.")


def release_ready(rows, metrics, evaluation_source):
    groups = validate_rows(rows)
    real_count = sum(g[0]["kaynak"] == "gercek" for g in groups.values())
    check_metrics(metrics)
    if real_count < POLICY["minimum_real_sessions_to_publish"] or evaluation_source != "gercek":
        raise ValueError(f"Yayın engelli: {real_count}/15 gerçek oturum; gerçek holdout değerlendirmesi gerekli.")
    return real_count
