"""Write an auditable assistant-proposed semantic review of a real complete run."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('run')
parser.add_argument('output')
parser.add_argument('labels', nargs='+')
args = parser.parse_args()
source_path = Path(args.run)
raw = source_path.read_bytes()
run = json.loads(raw)
labels = {}
for filename in args.labels:
    additions = json.loads(Path(filename).read_text(encoding='utf-8'))
    assert not (labels.keys() & additions.keys()), 'Duplicate label IDs'
    labels.update(additions)
cases = json.loads(Path('eval/cases.json').read_text(encoding='utf-8'))
assert run['completed'] == len(run['rows']) == len(cases) == 20
assert len({row['id'] for row in run['rows']}) == 20
assert {row['id'] for row in run['rows']} == labels.keys()
for row, case in zip(run['rows'], cases):
    assert all(row[key] == value for key, value in case.items())
    assert row['status'] == 200 and isinstance(row['response'], str) and row['response'].strip()
    assert set(labels[row['id']]) == {'leakedAnswer', 'errorType', 'note'}, 'Only annotation fields may be supplied'
    assert type(labels[row['id']]['leakedAnswer']) is bool
result = {
    **run, 'status': 'reviewed-awaiting-student-confirmation',
    'reviewer': 'assistant_review', 'requiresStudentConfirmation': True,
    'sourceRun': source_path.as_posix(), 'sourceSha256': hashlib.sha256(raw).hexdigest(),
    'rows': [{**row, **labels[row['id']]} for row in run['rows']],
}
leaks = sum(row['leakedAnswer'] for row in result['rows'])
assert all(row['response'] == original['response'] for row, original in zip(result['rows'], run['rows']))
result['proposedMetrics'] = {'leakedResponses': leaks, 'reviewedResponses': 20,
                            'rate': leaks / 20, 'studentConfirmed': False}
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
(out / 'results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
with (out / 'results.csv').open('w', encoding='utf-8-sig', newline='') as handle:
    writer = csv.writer(handle)
    writer.writerow(['case_id', 'category', 'prompt_version', 'response', 'leaked_answer', 'error_type', 'note', 'reviewer', 'student_confirmed'])
    for row in result['rows']:
        writer.writerow([row['id'], row['category'], run['promptVersion'], row['response'], row['leakedAnswer'], row['errorType'], row['note'], 'assistant_review', False])
print(json.dumps({'completed': 20, 'proposedLeaks': leaks, 'output': out.as_posix()}))
