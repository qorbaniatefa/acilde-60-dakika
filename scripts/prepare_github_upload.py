"""Copy reviewed V2 sources into the existing, clean V1 Git checkout. Never push."""
import hashlib
import json
import os
from pathlib import Path
import subprocess

ROOT_FILES = {
    '.env.example', '.gitignore', 'package.json', 'package-lock.json', 'index.html',
    'metadata.json', 'server.ts', 'tsconfig.json', 'vite.config.ts', 'vitest.config.ts',
    'cypress.config.ts', 'README.md', 'spec.md', 'DESIGN.md', 'RELEASE.md',
    'SINAV_TASARIMI.md', 'requirements-ml.txt', 'model-policy.json', 'train.py',
}
SOURCE_DIRS = {'.github', 'src', 'server', 'public', 'api', 'postman', 'scripts',
               'cypress', 'docs', 'eval', 'stitch_acilde_60_dakika', 'ml', 'model',
               'data', 'tests'}
EXCLUDED = {'.git', '.venv', 'node_modules', '.review-tools', '__pycache__'}


def select_files(root: Path):
    root = root.resolve()
    candidates = [root / name for name in sorted(ROOT_FILES) if (root / name).is_file()]
    for name in sorted(SOURCE_DIRS | {'test', 'artifacts'}):
        directory = root / name
        if not directory.is_dir():
            continue
        for current, directories, filenames in os.walk(directory, followlinks=False):
            directories[:] = sorted(d for d in directories
                                    if d.lower() not in EXCLUDED and not (Path(current) / d).is_symlink())
            for filename in sorted(filenames):
                path = Path(current) / filename
                if name == 'test' and (path.parent != directory or not filename.endswith('.test.ts')):
                    continue
                if name == 'artifacts' and path.suffix.lower() not in {'.json', '.mp4', '.ass'}:
                    continue
                candidates.append(path)
    for path in candidates:
        relative = path.relative_to(root)
        if any(p.lower() in EXCLUDED or (p.lower().startswith('.env') and p != '.env.example')
               for p in relative.parts):
            continue
        if path.suffix.lower() in {'.pyc', '.tmp', '.log'} or path.is_symlink():
            continue
        if not path.resolve().is_relative_to(root):
            raise ValueError(f'Workspace disinda kaynak: {relative}')
        yield path


def git(target: Path, *arguments):
    return subprocess.check_output(['git', '-C', str(target), *arguments], text=True).strip()


def sha256(path: Path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    root = Path(__file__).resolve().parents[1]
    target = (root / 'teslim' / 'github-yukleme').resolve()
    if not target.is_relative_to(root) or not (target / '.git').is_dir():
        raise ValueError('Beklenen teslim/github-yukleme Git deposu bulunamadi.')
    if Path(git(target, 'rev-parse', '--show-toplevel')).resolve() != target:
        raise ValueError('Git depo koku hedefle uyusmuyor.')
    if git(target, 'status', '--porcelain'):
        raise ValueError('Hedef depoda kaydedilmemis degisiklik var. Once git status ile inceleyin.')
    if git(target, 'branch', '--show-current') != 'main':
        raise ValueError('Hedef depo main dalinda olmali.')
    selected = list(select_files(root))
    required = {'model/model.onnx', 'model/config.json', 'public/model-release.json',
                'public/ort/manifest.json', 'public/ort/ort-wasm-simd-threaded.wasm',
                '.github/workflows/pages.yml'}
    names = {path.relative_to(root).as_posix() for path in selected}
    if not required <= names:
        raise ValueError(f'Eksik kaynak: {sorted(required - names)}')
    # Complete every source read and destination check before touching the checkout.
    manifest = []
    for path in selected:
        relative = path.relative_to(root)
        destination = target / relative
        if not destination.resolve().is_relative_to(target):
            raise ValueError(f'Hedef depo disina cikiyor: {relative}')
        if path.stat().st_size >= 100 * 1024 * 1024:
            raise ValueError(f'GitHub dosya boyutu siniri: {relative}')
        manifest.append({'path': relative.as_posix(), 'bytes': path.stat().st_size,
                         'sha256': sha256(path)})
    for item in manifest:
        source = root / item['path']
        destination = target / item['path']
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_name(destination.name + '.upload.tmp')
        with source.open('rb') as incoming, temporary.open('wb') as outgoing:
            while chunk := incoming.read(1024 * 1024):
                outgoing.write(chunk)
        if sha256(temporary) != item['sha256']:
            temporary.unlink()
            raise ValueError(f'Kopyalama hash hatasi: {item["path"]}')
        os.replace(temporary, destination)
    record = target / 'teslim' / 'V2-SOURCE-MANIFEST.json'
    record.parent.mkdir(parents=True, exist_ok=True)
    record.write_text(json.dumps({'files': manifest}, indent=2) + '\n', encoding='utf-8')
    print(f'{len(manifest)} dosya hash kontroluyle hazirlandi.')
    print(f'Hedef: {target}')
    print('Dal: main. Commit veya push yapilmadi.')
    print('Depo: https://github.com/qorbaniatefa/acilde-60-dakika')


if __name__ == '__main__':
    main()
