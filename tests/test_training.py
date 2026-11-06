"""Dependency-free checks of the evaluation and release gates."""
import unittest
import uuid
from ml.contract import check_metrics, split_sessions, validate_rows, release_ready


def rows(source="sentetik", count=20):
    return [dict(oturum_id=str(uuid.UUID(int=n + 1, version=4 if source == 'gercek' else 5)), kaynak=source, sahne_no=scene,
                 bekleme_sn=10, duzenleme_sayisi=0, onceki_yanlis=0,
                 onceki_ipucu=0, deneyim=0, destek_istegi=n % 2)
            for n in range(count) for scene in (1, 2, 3)]


class Gates(unittest.TestCase):
    def test_metrics_under_threshold_stop(self):
        with self.assertRaises(ValueError):
            check_metrics({"balanced_accuracy": .74, "support_recall": .9})
        with self.assertRaises(ValueError):
            check_metrics({"balanced_accuracy": .9, "support_recall": .69})
        check_metrics({"balanced_accuracy": .75, "support_recall": .7})

    def test_no_session_leaks_and_repeatable(self):
        data = rows()
        train, test, source = split_sessions(data)
        self.assertFalse({r["oturum_id"] for r in train} & {r["oturum_id"] for r in test})
        self.assertEqual((train, test, source), split_sessions(data))

    def test_real_holdout_when_available(self):
        train, test, source = split_sessions(rows() + rows("gercek", 16))
        self.assertEqual(source, "gercek")
        self.assertTrue(all(r["kaynak"] == "gercek" for r in test))
        self.assertTrue(any(r["kaynak"] == "sentetik" for r in train))

    def test_incomplete_or_mixed_sessions_rejected(self):
        for data in (rows()[:-1], rows() + [rows()[0]]):
            with self.assertRaises(ValueError):
                validate_rows(data)
        data = rows()
        data[0]["kaynak"] = "gercek"
        with self.assertRaises(ValueError):
            validate_rows(data)

    def test_only_real_validated_model_can_publish(self):
        with self.assertRaises(ValueError):
            release_ready(rows(), {"balanced_accuracy": .9, "support_recall": .9}, "sentetik")
        release_ready(rows("gercek", 15), {"balanced_accuracy": .9, "support_recall": .9}, "gercek")

    def test_unknown_columns_and_out_of_range_rejected(self):
        data = rows()
        data[0]["email"] = "not-permitted"
        with self.assertRaises(ValueError):
            validate_rows(data)

    def test_personal_identifier_is_rejected_before_config_export(self):
        data = rows()
        for row in data[:3]:
            row['oturum_id'] = 'person@example.org'
        with self.assertRaises(ValueError):
            validate_rows(data)
        data = rows()
        data[0]["bekleme_sn"] = float("nan")
        with self.assertRaises(ValueError):
            validate_rows(data)


if __name__ == "__main__":
    unittest.main()
