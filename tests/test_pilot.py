import copy
import unittest
from ml.data_quality import separate_pilot_rows, reject_excluded_labels
from ml.release import validate_publication_mode
from tests.test_training import rows


class SyntheticPilot(unittest.TestCase):
    def test_separation_preserves_original_labels_and_is_idempotent(self):
        original = rows('sentetik', 2) + rows('gercek', 2)
        before = copy.deepcopy(original)
        active, archive = separate_pilot_rows(original)
        self.assertEqual(original, before)
        self.assertEqual(active, rows('sentetik', 2))
        self.assertEqual(archive, rows('gercek', 2))
        self.assertEqual(separate_pilot_rows(active, archive), (active, archive))

    def test_archived_random_label_rows_cannot_reenter_training(self):
        excluded = {'excluded_session_ids': [rows('gercek', 2)[0]['oturum_id']]}
        reject_excluded_labels(rows('sentetik', 2), excluded)
        with self.assertRaises(ValueError):
            reject_excluded_labels(rows('gercek', 2), excluded)

    def test_pilot_publication_requires_explicit_mode_and_synthetic_only_data(self):
        config = {'metrics': {'balanced_accuracy': .8, 'support_recall': .8},
                  'evaluation_source': 'sentetik', 'publication_mode': 'synthetic_pilot',
                  'validated_on_real_data': False, 'release_eligible': False, 'real_sessions': 0}
        self.assertEqual(validate_publication_mode(rows('sentetik', 2), config, synthetic_pilot=True), 'synthetic_pilot')
        with self.assertRaises(ValueError):
            validate_publication_mode(rows('sentetik', 2), config)
        with self.assertRaises(ValueError):
            validate_publication_mode(rows('sentetik', 2) + rows('gercek', 2), config, synthetic_pilot=True)
        with self.assertRaises(ValueError):
            validate_publication_mode(rows('sentetik', 2), {**config, 'validated_on_real_data': True}, synthetic_pilot=True)

    def test_pilot_still_rejects_metrics_below_the_original_gate(self):
        config = {'metrics': {'balanced_accuracy': .5, 'support_recall': .8},
                  'evaluation_source': 'sentetik', 'publication_mode': 'synthetic_pilot',
                  'validated_on_real_data': False, 'release_eligible': False, 'real_sessions': 0}
        with self.assertRaises(ValueError):
            validate_publication_mode(rows('sentetik', 2), config, synthetic_pilot=True)

    def test_default_release_still_requires_real_validation(self):
        config = {'metrics': {'balanced_accuracy': .8, 'support_recall': .8},
                  'evaluation_source': 'gercek', 'publication_mode': 'real_validated',
                  'validated_on_real_data': True, 'release_eligible': True, 'real_sessions': 15}
        self.assertEqual(validate_publication_mode(rows('gercek', 15), config), 'real_validated')
        with self.assertRaises(ValueError):
            validate_publication_mode(rows('gercek', 14), config)


if __name__ == '__main__':
    unittest.main()
