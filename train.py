"""One command: python train.py. Never publishes; metrics gate precedes writes."""
import argparse
import csv
import hashlib
import importlib.metadata
import json
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path
from ml.contract import ROOT, POLICY, POLICY_PATH, FEATURES, split_sessions, check_metrics, validate_rows
from ml.data_quality import reject_excluded_labels, quality_policy


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def train(data_path, output):
    # Single-thread CPU inference; dependency versions and Python recorded below.
    os.environ.setdefault("OMP_NUM_THREADS", "1")
    import numpy as np
    import onnxruntime as ort
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import balanced_accuracy_score, recall_score, confusion_matrix
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    from onnx.utils import Extractor

    with data_path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    reject_excluded_labels(rows)
    train_rows, test_rows, evaluation_source = split_sessions(rows)
    def xy(part):
        return (np.asarray([[float(r[f]) for f in FEATURES] for r in part], dtype=np.float32),
                np.asarray([int(r["destek_istegi"]) for r in part]))
    x_train, y_train = xy(train_rows)
    x_test, y_test = xy(test_rows)
    classifier = LogisticRegression(solver="liblinear", random_state=POLICY["seed"], max_iter=2000, class_weight="balanced")
    model = make_pipeline(StandardScaler(), classifier)
    model.fit(x_train, y_train)
    probabilities = model.predict_proba(x_test)[:, 1]
    predicted = (probabilities >= POLICY["probability_threshold"]).astype(int)
    metrics = {"balanced_accuracy": float(balanced_accuracy_score(y_test, predicted)),
               "support_recall": float(recall_score(y_test, predicted)),
               "confusion_matrix": confusion_matrix(y_test, predicted, labels=[0, 1]).tolist()}
    check_metrics(metrics)
    # Disable ML-specific operators; use portable tensor operators for browser WASM.
    graph = convert_sklearn(model, name='primer-explanation-depth-v2', initial_types=[("features", FloatTensorType([None, len(FEATURES)]))],
                            options={id(classifier): {"zipmap": False}, StandardScaler: {"div": "div"}},
                            black_op={"LinearClassifier", "Scaler", "Normalizer"}, target_opset=17)
    graph = Extractor(graph).extract_model(["features"], [graph.graph.output[1].name])
    if any(node.domain not in ('', 'ai.onnx') for node in graph.graph.node):
        raise ValueError('Tarayıcı için yalnız standart ONNX tensör operatörleri kullanılmalı.')
    # Extractor keeps imports from the discarded label branch. Prune and order
    # them so salted set iteration cannot change artifact bytes across processes.
    used_domains = {node.domain for node in graph.graph.node}
    imports = sorted((item for item in graph.opset_import if item.domain in used_domains), key=lambda item: item.domain)
    del graph.opset_import[:]
    graph.opset_import.extend(imports)
    graph.graph.name = 'primer-explanation-depth-v2'
    blob = graph.SerializeToString(deterministic=True)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 1
    session = ort.InferenceSession(blob, sess_options=options, providers=["CPUExecutionProvider"])
    probability_output = session.get_outputs()[0].name
    # Include all rows + 300 independent bounded vectors, not only held-out rows.
    rng = np.random.default_rng(POLICY["seed"])
    random_inputs = np.column_stack([rng.uniform(f["minimum"], f["maximum"], 300) for f in POLICY["features"]]).astype(np.float32)
    all_x = np.concatenate([xy(rows)[0], random_inputs])
    oracle = session.run([probability_output], {"features": all_x})[0][:, 1]
    deviation = float(np.max(np.abs(model.predict_proba(all_x)[:, 1] - oracle)))
    if not deviation < POLICY["parity_tolerance"]:
        raise ValueError(f"sklearn/ONNX farkı fazla: {deviation}")
    acceptance = np.asarray([[5, 0, 0, 0, 1, 1], [90, 18, 0, 0, 1, 0]], dtype=np.float32)
    acceptance_p = session.run([probability_output], {"features": acceptance})[0][:, 1]
    if not acceptance_p[0] < .5 <= acceptance_p[1]:
        raise ValueError("Spec kabul örnekleri geçmedi; eşik değiştirmeyin.")
    groups = validate_rows(rows)
    real_count = sum(g[0]["kaynak"] == "gercek" for g in groups.values())
    pilot = evaluation_source == 'sentetik'
    contract = {
        "schema_version": "2.0.0", "model_version": "2.0.0-pilot" if pilot else "2.0.0", "task": "primer-explanation-depth",
        "publication_mode": "synthetic_pilot" if pilot else "real_validated",
        "validated_on_real_data": not pilot,
        "excluded_random_label_sessions": quality_policy().get('excluded_sessions', 0),
        "features": POLICY["features"], "class_labels": ["kisa_anlatim", "derin_anlatim"],
        "positive_class_index": 1, "probability_threshold": .5, "parity_tolerance": .0001,
        "input": {"name": "features", "dtype": "float32", "shape": [1, 6]},
        "output": {"probabilities": probability_output}, "metrics": metrics,
        "evaluation_source": evaluation_source, "real_sessions": real_count,
        "synthetic_sessions": len(groups) - real_count,
        "release_eligible": real_count >= 15 and evaluation_source == "gercek",
        "split": {"method": "seeded_session_shuffle_25_percent", "seed": POLICY["seed"],
                  "train_sessions": sorted({r["oturum_id"] for r in train_rows}),
                  "test_sessions": sorted({r["oturum_id"] for r in test_rows}),
                  "train_rows": len(train_rows), "test_rows": len(test_rows)},
        "sklearn_onnx_max_absolute_error": deviation,
        "model_sha256": hashlib.sha256(blob).hexdigest(), "dataset_sha256": digest(data_path),
        "policy_sha256": digest(POLICY_PATH),
        "environment": {"python": sys.version.split()[0], **{p: importlib.metadata.version(p) for p in
                        ("numpy", "scipy", "scikit-learn", "skl2onnx", "onnx", "onnxruntime")}}
    }
    # No output touched before all validation passes. Each file is replaced atomically.
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as temporary:
        staging = Path(temporary)
        (staging / "model.onnx").write_bytes(blob)
        (staging / "config.json").write_text(json.dumps(contract, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        for name in ("model.onnx", "config.json"):
            os.replace(staging / name, output / name)
    if output.resolve() == (ROOT / "model").resolve():
        card_path = ROOT / 'model/README.md'
        card = card_path.read_text(encoding='utf-8')
        report = ('<!-- GENERATED:START -->\n'
                  f'**Eğitildi.** Eval kaynağı: `{evaluation_source}`; gerçek oturum: {real_count}.\n\n'
                  f'- Balanced accuracy: {metrics["balanced_accuracy"]:.8f} (kabul ≥0.75)\n'
                  f'- Destek recall: {metrics["support_recall"]:.8f} (kabul ≥0.70)\n'
                  f'- sklearn/ONNX max |delta|: {deviation:.9g} (<1e-4)\n'
                  f'- Confusion matrix [0,1]: `{metrics["confusion_matrix"]}`\n'
                  f'- Varsayılan gerçek veri yayın kapısı: {contract["release_eligible"]}\n'
                  f'- Yayın türü: `{contract["publication_mode"]}`; gerçek kullanıcı doğrulaması: {contract["validated_on_real_data"]}\n'
                  f'- Model SHA256: `{contract["model_sha256"]}`\n\n'
                  'Pilot yalnız açık --synthetic-pilot seçimiyle, değişmeyen eval/parite kapılarından sonra yayınlanabilir.\n'
                  'Tarayıcı paritesi ayrı Cypress koşusu gerektirir.\n<!-- GENERATED:END -->')
        card_path.write_text(re.sub(r'<!-- GENERATED:START -->.*?<!-- GENERATED:END -->', report, card, flags=re.S), encoding='utf-8')
        public = ROOT / "public/model"
        public.mkdir(parents=True, exist_ok=True)
        for name in ("model.onnx", "config.json"):
            shutil.copyfile(output / name, public / name)
        from tests.parite import generate_references
        generate_references(output)
        release_path = ROOT / 'public/model-release.json'
        manifest = json.loads(release_path.read_text(encoding='utf-8'))
        if manifest['source'] == 'local':
            manifest.update(status='real_candidate' if contract['release_eligible'] else 'synthetic_pilot', model_sha256=contract['model_sha256'])
            release_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({"metrics": metrics, "evaluation_source": evaluation_source,
                      "real_sessions": real_count, "release_eligible": contract["release_eligible"],
                      "publication_mode": contract["publication_mode"],
                      "model_version": contract["model_version"],
                      "validated_on_real_data": contract["validated_on_real_data"],
                      "model_sha256": contract["model_sha256"],
                      "max_absolute_error": deviation}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=ROOT / "data/oturumlar.csv")
    parser.add_argument("--output", type=Path, default=ROOT / "model")
    args = parser.parse_args()
    try:
        train(args.data, args.output)
    except (ValueError, ImportError) as error:
        print(f"EĞİTİM DURDU: {error}", file=sys.stderr)
        sys.exit(1)
