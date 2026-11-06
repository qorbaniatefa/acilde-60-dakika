import math
import unittest
from ml.release import validate_browser_evidence


class BrowserEvidence(unittest.TestCase):
    def test_missing_stale_nan_and_excessive_error_evidence_cannot_publish(self):
        model_hash = 'a' * 64
        good = {str(n): dict(count=n, model_sha256=model_hash, deltas=[0.] * n) for n in (5, 300)}
        validate_browser_evidence(good, model_hash)
        for bad in ({}, {**good, '5': {**good['5'], 'model_sha256': 'b' * 64}},
                    {**good, '5': {**good['5'], 'deltas': [math.nan] * 5}},
                    {**good, '5': {**good['5'], 'deltas': [.0001] * 5}}):
            with self.assertRaises(ValueError):
                validate_browser_evidence(bad, model_hash)


if __name__ == '__main__':
    unittest.main()
