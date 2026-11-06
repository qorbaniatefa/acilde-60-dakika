"""Exercise the real training CLI: a rejected candidate must preserve artifacts."""
import csv
import importlib.util
import os
import random
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(all(importlib.util.find_spec(m) for m in ('sklearn', 'onnxruntime', 'skl2onnx')),
                     'ML dependencies not installed')
class TrainingIntegration(unittest.TestCase):
    def test_low_quality_candidate_leaves_previous_artifacts_untouched(self):
        with (ROOT / 'data/oturumlar.csv').open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
        generator = random.Random(991)
        for row in rows:
            row['destek_istegi'] = str(generator.randint(0, 1))
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            data = directory / 'low-quality.csv'
            with data.open('w', encoding='utf-8', newline='') as stream:
                writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows(rows)
            output = directory / 'model'
            output.mkdir()
            for name in ('model.onnx', 'config.json'):
                (output / name).write_bytes(b'previous-accepted-artifact')
            result = subprocess.run([sys.executable, str(ROOT / 'train.py'), '--data', str(data), '--output', str(output)],
                                    cwd=ROOT, capture_output=True, text=True, encoding='utf-8',
                                    env={**os.environ, 'PYTHONIOENCODING': 'utf-8'}, timeout=90)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Eval kapısı kapalı', result.stderr)
            for name in ('model.onnx', 'config.json'):
                self.assertEqual((output / name).read_bytes(), b'previous-accepted-artifact')


if __name__ == '__main__':
    unittest.main()
