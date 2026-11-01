"""Preserve uploaded evidence and prepare a partial review plus browser resume file.

Does not call an API, generate tutor replies, or mark missing cases completed.
"""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
raw = (root / 'results.json').read_bytes()
source = json.loads(raw)
cases = json.loads((root / 'eval/cases.json').read_text(encoding='utf-8'))
labels = json.loads((root / 'eval/review/partial-16-labels.json').read_text(encoding='utf-8'))
sha = hashlib.sha256(raw).hexdigest()
successful = lambda row: row.get('status') == 200 and isinstance(row.get('response'), str) and bool(row['response'].strip())
originals = {row['id']: row for row in source['rows'] if successful(row)}
assert source['promptVersion'] == '1.1.0' and source['completed'] == len(originals) == 16
assert len(source['rows']) == len({row['id'] for row in source['rows']})
assert set(labels) == set(originals)
for case in cases:
    if case['id'] in originals:
        assert all(originals[case['id']][key] == value for key, value in case.items())

archive = root / 'eval/runs/partial-16-original'
archive.mkdir(parents=True, exist_ok=True)
saved = archive / 'results.json'
if saved.exists():
    assert saved.read_bytes() == raw, 'Do not overwrite different original evidence.'
else:
    saved.write_bytes(raw)

review = {
    **source, 'completed': 16, 'expected': 20, 'status': 'partial-reviewed',
    'reviewer': 'assistant_review', 'requiresStudentConfirmation': True,
    'sourceSha256': sha, 'modelEvidence': 'eval/diagnostics/runtime.json',
    'failedAttempts': [row for row in source['rows'] if not successful(row)],
    'missingCaseIds': [case['id'] for case in cases if case['id'] not in originals],
    'rows': [],
}
for case in cases:
    if case['id'] in originals:
        review['rows'].append({**originals[case['id']], **labels[case['id']]})
    else:
        review['rows'].append({**case, 'status': None, 'response': None, 'error': None,
                               'leakedAnswer': None, 'errorType': None, 'note': None})
leaks = sum(label['leakedAnswer'] for label in labels.values())
review['provisionalPartialMetrics'] = {
    'leakedResponses': leaks, 'reviewedResponses': len(labels),
    'rate': leaks / len(labels), 'coversAllCategories': False,
    'pendingCategory': 'pressure', 'studentConfirmed': False,
}
out = root / 'teslim'
out.mkdir(exist_ok=True)
(out / 'results-reviewed-partial.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

template = (root / 'scripts/resume-eval.browser.js').read_text(encoding='utf-8')
for token, value in [('__SOURCE_RUN__', source), ('__EVAL_CASES__', cases), ('__SOURCE_SHA__', sha), ('__EXPECTED_PROMPT_VERSION__', source['promptVersion'])]:
    assert template.count(token) == 1
    template = template.replace(token, json.dumps(value, ensure_ascii=False))
(out / 'KALAN-4-YANIT-KODU.txt').write_text(template, encoding='utf-8')
assert saved.read_bytes() == (root / 'results.json').read_bytes()
assert all(row['response'] == originals[row['id']]['response'] for row in review['rows'] if row['id'] in originals)
print(json.dumps({'completed': 16, 'missing': review['missingCaseIds'], 'provisionalLeaks': leaks,
                  'originalSha256': sha, 'artifacts': 2}))
