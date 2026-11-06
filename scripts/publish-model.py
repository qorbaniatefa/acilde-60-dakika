"""Explicit gated HF publication. Authenticate with `npm run login:hf` first."""
import argparse
import csv
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.contract import ROOT, POLICY_PATH
from ml.release import validate_browser_evidence, validate_publication_mode


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def publish(repo, synthetic_pilot=False):
    if not re.fullmatch(r'[\w-]+/[\w.-]+', repo):
        raise ValueError('Repo kullanici/model-adi biçiminde olmalı.')
    model_dir = ROOT / 'model'
    config = json.loads((model_dir / 'config.json').read_text(encoding='utf-8'))
    data_path = ROOT / 'data/oturumlar.csv'
    with data_path.open(encoding='utf-8-sig', newline='') as handle:
        rows = list(csv.DictReader(handle))
    publication_mode = validate_publication_mode(rows, config, synthetic_pilot=synthetic_pilot)
    if config['dataset_sha256'] != sha(data_path) or config['policy_sha256'] != sha(POLICY_PATH):
        raise ValueError('Veri/politika değişmiş veya yayın kapısı kapalı; yeniden eğitin.')
    if config['model_sha256'] != sha(model_dir / 'model.onnx'):
        raise ValueError('Model bütünlük hatası.')
    evidence = json.loads((ROOT / 'artifacts/primer-v2/browser-parity.json').read_text(encoding='utf-8'))
    validate_browser_evidence(evidence, config['model_sha256'])
    subprocess.run([sys.executable, 'tests/parite.py'], cwd=ROOT, check=True)
    # Retrain without replacing production files: metrics and ONNX bytes must repeat.
    with tempfile.TemporaryDirectory() as temp:
        subprocess.run([sys.executable, 'train.py', '--data', str(data_path), '--output', temp], cwd=ROOT, check=True)
        repeated = json.loads((Path(temp) / 'config.json').read_text(encoding='utf-8'))
        if repeated['metrics'] != config['metrics'] or repeated['model_sha256'] != config['model_sha256']:
            raise ValueError('Tekrarlanabilirlik kontrolü başarısız; ortam sürümlerini karşılaştırın.')
    from huggingface_hub import HfApi, hf_hub_download
    api = HfApi()  # token from HF auth storage/environment; never print credentials.
    api.create_repo(repo_id=repo, repo_type='model', private=False, exist_ok=True)
    if api.model_info(repo).private:
        raise ValueError('Repo public olmalı; mevcut private repo otomatik açılmaz.')
    commit = api.upload_folder(repo_id=repo, repo_type='model', folder_path=str(model_dir),
                               allow_patterns=['model.onnx', 'config.json', 'config.schema.json', 'README.md'],
                               commit_message=('Publish Primer v2 synthetic pilot; not validated on real users' if synthetic_pilot
                                               else 'Release Primer v2: real-data evaluated explanation-depth classifier'))
    revision = commit.oid
    if not re.fullmatch(r'[a-f0-9]{40}', revision):
        raise ValueError('HF tam commit SHA dönmedi.')
    downloaded = Path(hf_hub_download(repo_id=repo, filename='model.onnx', revision=revision, token=False, force_download=True))
    if sha(downloaded) != config['model_sha256']:
        raise ValueError('Yüklenen model ile yerel model eşleşmiyor.')
    release_path = ROOT / 'public/model-release.json'
    previous = json.loads(release_path.read_text(encoding='utf-8'))
    history = ROOT / 'artifacts/primer-v2'
    history.mkdir(parents=True, exist_ok=True)
    (history / 'previous-model-release.json').write_text(json.dumps(previous, indent=2) + '\n', encoding='utf-8')
    release = dict(source='huggingface', repo=repo, revision=revision, model_sha256=config['model_sha256'],
                   publication_mode=publication_mode, validated_on_real_data=config['validated_on_real_data'])
    release_path.write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')
    log = dict(release, model_url=f'https://huggingface.co/{repo}/resolve/{revision}/model.onnx',
               config_url=f'https://huggingface.co/{repo}/resolve/{revision}/config.json',
               public_download_without_login='verified_by_unauthenticated_download')
    (history / 'hf-release.json').write_text(json.dumps(log, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(log, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('repo')
    parser.add_argument('--synthetic-pilot', action='store_true', help='Explicit synthetic-only pilot publication; no real-user validation claim')
    args = parser.parse_args()
    try:
        publish(args.repo, synthetic_pilot=args.synthetic_pilot)
    except (ValueError, FileNotFoundError, ImportError) as error:
        print(f'Publication stopped: {error}', file=sys.stderr)
        sys.exit(1)
