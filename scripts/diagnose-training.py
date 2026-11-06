"""Compare data sources on training-only grouped folds; never tune on holdout."""
import csv
import json
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, FEATURES, POLICY, split_sessions

os.environ.setdefault('OMP_NUM_THREADS', '1')
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import balanced_accuracy_score, recall_score, confusion_matrix
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

with (ROOT / 'data/oturumlar.csv').open(encoding='utf-8-sig', newline='') as stream:
    rows = list(csv.DictReader(stream))
development, untouched_holdout, source = split_sessions(rows)
real = [r for r in development if r['kaynak'] == 'gercek']
synthetic = [r for r in development if r['kaynak'] == 'sentetik']
if len({row['oturum_id'] for row in real}) < 3:
    print(json.dumps({'status': 'insufficient_valid_real_training_sessions',
                      'active_mode': 'synthetic_pilot', 'final_holdout_evaluated': False,
                      'note': 'Random-label human sessions are archived and not used for training.'}, indent=2))
    sys.exit(0)
def xy(part):
    return (np.asarray([[float(r[f]) for f in FEATURES] for r in part], dtype=np.float32),
            np.asarray([int(r['destek_istegi']) for r in part]))

results = {}
groups = np.asarray([r['oturum_id'] for r in real])
folds = list(GroupKFold(n_splits=3).split(np.zeros(len(real)), groups=groups))
for strategy in ('mixed_unweighted', 'real_only'):
    measured = []
    for training_indices, validation_indices in folds:
        fold_training = [real[i] for i in training_indices]
        if strategy == 'mixed_unweighted':
            fold_training += synthetic
        validation = [real[i] for i in validation_indices]
        x_train, y_train = xy(fold_training)
        x_val, y_val = xy(validation)
        if set(y_val) != {0, 1} or set(y_train) != {0, 1}:
            measured.append({'valid': False, 'reason': 'both classes required'})
            continue
        model = make_pipeline(StandardScaler(), LogisticRegression(solver='liblinear', random_state=POLICY['seed'], max_iter=2000, class_weight='balanced'))
        model.fit(x_train, y_train)
        predicted = (model.predict_proba(x_val)[:, 1] >= POLICY['probability_threshold']).astype(int)
        measured.append({'valid': True, 'balanced_accuracy': float(balanced_accuracy_score(y_val, predicted)),
                         'support_recall': float(recall_score(y_val, predicted)),
                         'confusion_matrix': confusion_matrix(y_val, predicted, labels=[0, 1]).tolist()})
    values = [m['balanced_accuracy'] for m in measured if m['valid']]
    results[strategy] = {'folds': measured, 'mean_balanced_accuracy': float(np.mean(values)) if values else None}
report = {'evaluation': 'training-only grouped cross-validation', 'final_holdout_evaluated': False,
          'real_training_rows': len(real), 'synthetic_training_rows': len(synthetic),
          'final_holdout_rows_reserved': len(untouched_holdout), 'strategies': results,
          'note': 'Exploratory diagnosis, not a passing release evaluation. No model or label is modified.'}
destination = ROOT / 'artifacts/primer-v2/training-diagnosis.json'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
