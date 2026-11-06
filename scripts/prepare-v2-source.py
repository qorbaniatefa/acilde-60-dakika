"""Prepare reviewable source entries, excluding inaccessible/new binary artifacts."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
names = {
    '.gitignore', 'package.json', 'model-policy.json', 'spec.md', 'README.md', 'RELEASE.md',
    'SINAV_TASARIMI.md', 'requirements-ml.txt', 'train.py', 'cypress.config.ts',
    'model/README.md', 'model/config.schema.json', 'tests/parite.json', 'public/model-release.json',
    'docs/ODEV7-TESLIM.md', 'docs/primer-v2-progress.md', 'docs/primer-v2-demo.md',
    'docs/primer-v1-README.md', 'docs/GITHUB-V2-BRANCH.md',
    'docs/superpowers/plans/2026-11-04-primer-v2.md',
    'artifacts/primer-v2/training-result.json',
}
for directory, patterns in [('src', ['*.ts', '*.tsx']), ('ml', ['*.py']), ('data', ['*.csv', '*.md', '*.json']),
                            ('test', ['*.test.ts']), ('tests', ['*.py']), ('scripts', ['*.mjs', '*.py', '*.cjs']),
                            ('cypress', ['*.ts'])]:
    for pattern in patterns:
        names.update(p.relative_to(root).as_posix() for p in (root / directory).rglob(pattern)
                     if not {'node_modules', '__pycache__'} & set(p.parts))
entries = []
for name in sorted(names):
    entries.append(dict(path=name, mode='100644', type='blob', content=(root / name).read_text(encoding='utf-8-sig')))
target = root / '.review-tools/v2-source-entries.json'
target.write_text(json.dumps(entries, ensure_ascii=False), encoding='utf-8')
print(json.dumps({'files': len(entries), 'bytes': target.stat().st_size, 'output': str(target)}))
