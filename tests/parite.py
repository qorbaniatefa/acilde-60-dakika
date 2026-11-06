"""Python ONNX oracle. python tests/parite.py [--generate]."""
import argparse
import hashlib
import json
import random
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, POLICY

FIXED = [[5, 0, 0, 0, 1, 1], [90, 18, 0, 0, 1, 0], [35, 4, 1, 0, 2, 0],
         [180, 60, 2, 6, 3, 0], [0, 0, 0, 0, 3, 1]]


def predict(model_dir, vectors):
    import numpy as np
    import onnxruntime as ort
    config = json.loads((model_dir / "config.json").read_text(encoding="utf-8"))
    blob = (model_dir / "model.onnx").read_bytes()
    if hashlib.sha256(blob).hexdigest() != config["model_sha256"]:
        raise ValueError("Model SHA256 uyuşmuyor.")
    session = ort.InferenceSession(blob, providers=["CPUExecutionProvider"])
    probabilities = session.run([config["output"]["probabilities"]],
                                {config["input"]["name"]: np.asarray(vectors, dtype=np.float32)})[0][:, 1]
    return config, [float(p) for p in probabilities]


def generate_references(model_dir):
    rng = random.Random(POLICY["seed"])
    vectors = [[round(rng.uniform(0, 180), 3), rng.randint(0, 60), rng.randint(0, 2),
                rng.randint(0, 6), rng.randint(1, 3), rng.randint(0, 1)] for _ in range(300)]
    config, probabilities = predict(model_dir, FIXED + vectors)
    for filename, inputs, expected in (("parite.json", FIXED, probabilities[:5]),
                                        ("parite-300.json", vectors, probabilities[5:])):
        data = {"oracle": "Python onnxruntime CPUExecutionProvider", "model_sha256": config["model_sha256"],
                "tolerance": .0001, "cases": [{"features": x, "p": p} for x, p in zip(inputs, expected)]}
        (ROOT / "tests" / filename).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        target = ROOT / "public/model" / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def verify(model_dir):
    for filename in ("parite.json", "parite-300.json"):
        data = json.loads((ROOT / "tests" / filename).read_text(encoding="utf-8"))
        config, actual = predict(model_dir, [case["features"] for case in data["cases"]])
        if data["model_sha256"] != config["model_sha256"]:
            raise ValueError("Referanslar farklı modele ait.")
        error = max(abs(case["p"] - p) for case, p in zip(data["cases"], actual))
        if not error < POLICY["parity_tolerance"]:
            raise ValueError(f"Oracle paritesi başarısız: {error}")
        print(f"{filename}: {len(actual)} girdi, max |delta|={error:.9g}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--generate", action="store_true")
    args = parser.parse_args()
    if args.generate:
        generate_references(ROOT / "model")
    verify(ROOT / "model")
