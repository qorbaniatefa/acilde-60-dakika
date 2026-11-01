"""Build a delivery archive of selected sources and verified video evidence."""
import hashlib
import json
import os
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
names = [
    '.env.example', '.gitignore', 'package.json', 'package-lock.json',
    'index.html', 'metadata.json', 'server.ts', 'tsconfig.json',
    'vite.config.ts', 'vitest.config.ts', 'cypress.config.ts',
    'README.md', 'spec.md', 'DESIGN.md', 'results.json',
    'teslim/results.json', 'teslim/SON-ADIMLAR.md',
    'artifacts/cypress/videos/adventure.cy.ts.mp4',
    'artifacts/demo/acilde-60-dakika.mp4',
]
files = {root / name for name in names}
for directory in ['src', 'server', 'public', 'api', 'postman', 'scripts', 'cypress', 'docs', 'eval', 'stitch_acilde_60_dakika']:
    files.update(file for file in (root / directory).rglob('*') if file.is_file()
                 and not ({'node_modules', '.review-tools', '.git', '__pycache__'} & set(file.relative_to(root).parts)))
files.update((root / 'test').glob('*.test.ts'))
files.update(root.glob('*.pptx'))
files.update(root / name for name in ['odev.webp', 'odev2.png'])
for file in files:
    assert file.is_file() and file.resolve().is_relative_to(root)
    assert not file.name.startswith('.env') or file.name == '.env.example'
    assert not ({'images', 'labels'} & set(file.relative_to(root).parts)) or 'stitch_acilde_60_dakika' in file.parts
manifest = [{'path': file.relative_to(root).as_posix(), 'bytes': file.stat().st_size,
             'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
            for file in sorted(files)]
manifest_path = root / 'teslim/SOURCE-MANIFEST.json'
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
files.add(manifest_path)
destination = root / 'teslim/acilde-60-dakika-guncel-kaynak.zip'
temporary = destination.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(files):
        archive.write(file, file.relative_to(root).as_posix())
with zipfile.ZipFile(temporary) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == {item['path'] for item in manifest} | {'teslim/SOURCE-MANIFEST.json'}
    for item in manifest:
        assert hashlib.sha256(archive.read(item['path'])).hexdigest() == item['sha256']
    result = json.loads(archive.read('teslim/results.json'))
    assert result['completed'] == len(result['rows']) == 20
    assert result['promptVersion'] == '1.2.0'
    if not result['requiresStudentConfirmation']:
        assert result['status'] == 'reviewed-approved-by-delegated-assistant'
        assert result['approval']['status'] == 'approved'
        assert result['approval']['approvedBy'] == 'assistant_review'
        assert result['approval']['authority'] == 'explicit_user_delegation'
        assert result['approval']['sourceSha256'] == result['sourceSha256']
    assert archive.read('server/geminiTutorPrompt.ts').decode('utf-8-sig') == archive.read('eval/prompts/1.2.0.txt').decode('utf-8-sig')
    demo = json.loads(archive.read('docs/checks/2026-11-01-demo/verification.json'))
    assert demo['status'] == 'verified' and 59 <= demo['durationSeconds'] <= 61
    assert hashlib.sha256(archive.read(demo['path'])).hexdigest() == demo['sha256']
    cypress = json.loads(archive.read('docs/checks/2026-11-01-cypress.json'))
    assert cypress['passing'] == cypress['tests'] == 12 and cypress['failing'] == 0
    assert hashlib.sha256(archive.read(cypress['video']['path'])).hexdigest() == cypress['video']['sha256']
os.replace(temporary, destination)
print(json.dumps({'files': len(files), 'bytes': destination.stat().st_size,
                  'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(), 'results': '20 real replies, prompt 1.2.0'}))
