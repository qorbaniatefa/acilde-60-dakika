"""Pure checks for browser-generated parity evidence."""
import math
from .contract import validate_rows, check_metrics, release_ready
from .data_quality import reject_excluded_labels


def validate_publication_mode(rows, config, synthetic_pilot=False):
    validate_rows(rows)
    reject_excluded_labels(rows)
    check_metrics(config['metrics'])
    if synthetic_pilot:
        if (any(row['kaynak'] != 'sentetik' for row in rows)
                or config.get('evaluation_source') != 'sentetik'
                or config.get('publication_mode') != 'synthetic_pilot'
                or config.get('validated_on_real_data') is not False
                or config.get('release_eligible') is not False
                or config.get('real_sessions') != 0):
            raise ValueError('Açık pilot yayını yalnız sentetik veri ve gerçek doğrulama iddiası olmayan config kabul eder.')
        return 'synthetic_pilot'
    release_ready(rows, config['metrics'], config['evaluation_source'])
    if (not config.get('release_eligible') or config.get('validated_on_real_data') is not True
            or config.get('publication_mode') != 'real_validated'):
        raise ValueError('Gerçek veri yayın kapısı kapalı.')
    return 'real_validated'


def validate_browser_evidence(evidence, model_hash):
    for count in (5, 300):
        entry = evidence.get(str(count), {})
        deltas = entry.get('deltas', [])
        if entry.get('model_sha256') != model_hash or entry.get('count') != count or len(deltas) != count:
            raise ValueError(f"{count} girdilik tarayıcı parite kanıtı eksik veya eski modele ait.")
        if any(not math.isfinite(d) or not 0 <= d < .0001 for d in deltas):
            raise ValueError("Tarayıcı parite farkı tolerans dışında.")
